import { Language } from "@/lib/i18n";
import type { ShortcutData } from "@/lib/types";

export const getDefaultLanguage = (): Language => {
  if (typeof navigator === "undefined") return "en";
  const browserLanguage = navigator.language.toLowerCase();
  return browserLanguage.startsWith("ru")
    ? "ru"
    : browserLanguage.startsWith("es")
      ? "es"
      : browserLanguage.startsWith("de")
        ? "de"
        : "en";
};

export const isDev = process.env.NODE_ENV === "development";

export function domainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export const getContrastYIQ = (hexcolor: string) => {
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
};

export function generatePreviousId(shortcuts: ShortcutData[]) {
  const ids: number[] = [];

  shortcuts.forEach((s) => {
    ids.push(s.id);

    if (s.type === "group") {
      ids.push(...s.items.map((item) => item.id));
    }
  });

  return Math.max(0, ...ids) + 1;
}

export function getTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
