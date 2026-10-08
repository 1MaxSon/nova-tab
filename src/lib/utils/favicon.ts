import { domainFromUrl } from "@/lib/helpers";
import { t } from "@/lib/i18n";

export type ParseFaviconResult = {
  url: string;
  title: string;
};

export type FetchFaviconBlobResult = {
  iconUrl: string | null;
  iconBlob?: Blob;
  title: string;
};

export async function parseFavicon(
  url: string,
): Promise<ParseFaviconResult | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    const doc = new DOMParser().parseFromString(html, "text/html");
    const docOgMetaTitle = doc.querySelector('meta[property="og:title"]') as
      | HTMLMetaElement
      | undefined;
    const docTitle = docOgMetaTitle ? docOgMetaTitle.content : doc.title;

    const links = Array.from(
      doc.querySelectorAll<HTMLLinkElement>("link[rel]"),
    );

    const icons = links
      .map((link) => ({
        rel: link.rel.toLowerCase(),
        href: link.getAttribute("href"),
        type: link.getAttribute("type")?.toLowerCase() ?? "",
        sizes: link.getAttribute("sizes") ?? "",
      }))
      .filter((icon) => {
        if (!icon.href) {
          return false;
        }

        return (
          icon.rel.includes("icon") || icon.rel.includes("apple-touch-icon")
        );
      });

    const filteredIcons = icons.filter((icon) => {
      const href = icon.href?.toLowerCase() ?? "";

      return (
        !href.includes("safari-pinned-tab") && !icon.rel.includes("mask-icon")
      );
    });

    const svgIcon = filteredIcons.find((icon) => {
      const href = icon.href?.toLowerCase() ?? "";

      return (
        icon.type.includes("svg") ||
        (href.endsWith(".svg") &&
          !href.includes("apple") &&
          !href.includes("mask"))
      );
    });

    if (svgIcon?.href) {
      const faviconUrl = new URL(svgIcon.href, url).href;

      return { url: faviconUrl, title: docTitle };
    }

    const bestIcon = filteredIcons
      .map((icon) => {
        const match = icon.sizes.match(/^(\d+)x(\d+)$/i);

        return {
          ...icon,
          size: match ? Number(match[1]) : 0,
        };
      })
      .sort((a, b) => b.size - a.size)[0];

    if (bestIcon?.href) {
      const resolvedUrl = new URL(bestIcon.href, url).href;

      return {
        url: resolvedUrl,
        title: docTitle,
      };
    }

    return {
      url: `https://icons.duckduckgo.com/ip3/${domainFromUrl(url)}.ico`,
      title: docTitle,
    };
  } catch {
    return {
      url: `https://icons.duckduckgo.com/ip3/${domainFromUrl(url)}.ico`,
      title: domainFromUrl(url),
    };
  }
}

export async function fetchFaviconBlob(
  url: string,
): Promise<FetchFaviconBlobResult | undefined> {
  const faviconErrorMessage = t("shortcut.faviconError");

  const parseFaviconResult = await parseFavicon(url);

  if (!parseFaviconResult) {
    alert(faviconErrorMessage);
    return;
  }

  let iconUrl: string = parseFaviconResult.url;
  const siteTitle = parseFaviconResult.title;

  if (!iconUrl) {
    alert(faviconErrorMessage);
    return;
  }

  let iconBlob: Blob | undefined;

  try {
    let res = await fetch(iconUrl);

    if (!res.ok) {
      throw new Error();
    }

    iconBlob = await res.blob();
  } catch {
    iconUrl = `https://icons.duckduckgo.com/ip3/${domainFromUrl(url)}.ico`;

    const fallbackRes = await fetch(iconUrl);

    if (!fallbackRes.ok) {
      alert(faviconErrorMessage);
      return;
    }

    iconBlob = await fallbackRes.blob();
  }

  return { iconUrl, iconBlob, title: siteTitle };
}
