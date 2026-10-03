import { type ClassValue, clsx } from "clsx";

import {
  domainFromUrl,
  generatePreviousId,
  getContrastYIQ,
  parseFavicon,
} from "@/lib/helpers";
import { t } from "@/lib/i18n";
import type { WeatherProvider } from "@/lib/storage";
import { saveIcon, storage } from "@/lib/storage";
import type { ShortcutType } from "@/lib/types";
import type { Coords } from "@/lib/types/open-meteo";
import { extractIconPalette } from "@/lib/vibrant";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildYandexUrl(coords: Coords) {
  const { latitude, longitude } = coords;

  return `https://yandex.ru/pogoda/?lat=${latitude}&lon=${longitude}`;
}

export function buildGoogleWeatherUrl(cityName: string, coords: Coords) {
  const weatherIn = t("weather.provider.searchQuery");
  const query = cityName
    ? `${weatherIn} ${cityName}`
    : `${weatherIn} ${coords.latitude},${coords.longitude}`;

  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function buildWeatherProviderUrl(
  provider: WeatherProvider,
  cityName: string,
  coords: Coords,
) {
  if (provider === "yandex") return buildYandexUrl(coords);
  if (provider === "wttr")
    return `https://wttr.in/${coords.latitude},${coords.longitude}`;

  return buildGoogleWeatherUrl(cityName, coords);
}

export async function getCityName(coords: Coords) {
  const { latitude, longitude } = coords;

  const r = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
    { headers: { "Accept-Language": "ru" } },
  );
  const d = await r.json();

  const cityName =
    d.address?.city || d.address?.town || d.address?.village || "";
  return cityName;
}

export type CreateShortcutInput = Pick<ShortcutType, "url"> &
  Omit<ShortcutType, "url" | "id" | "type">;

export async function fetchFaviconBlob(url: string): Promise<
  | {
      iconUrl: string | null;
      iconBlob?: Blob;
      title: string;
    }
  | undefined
> {
  const faviconErrorMessage = t("shortcut.faviconError");

  const result = await parseFavicon(url);

  if (!result) {
    alert(faviconErrorMessage);
    return;
  }

  const { url: iconUrl, title } = result;

  if (import.meta.env.DEV) {
    console.log(`Fetched favicon url: ${iconUrl}`);
  }

  let iconBlob: Blob | undefined;

  if (!iconUrl) alert(faviconErrorMessage);
  else {
    try {
      let res = await fetch(iconUrl);

      if (res.status !== 200) {
        const fallbackRes = await fetch(
          `https://icons.duckduckgo.com/ip3/${domainFromUrl(url)}.ico`,
        );

        if (fallbackRes.status !== 200) {
          alert(faviconErrorMessage);
          return;
        }

        res = fallbackRes;
      }

      iconBlob = await res.blob();
    } catch {
      alert(faviconErrorMessage);
    }
  }

  return { iconUrl, iconBlob, title };
}

export async function createShortcut(
  data: CreateShortcutInput,
): Promise<ShortcutType | undefined> {
  const { url, name, accentColor, mutedColor } = data;
  const result = await fetchFaviconBlob(url);

  if (!result) return;

  const { iconBlob, iconUrl, title } = result;

  const { shortcuts } = storage;

  const previousShortcutId = generatePreviousId(shortcuts);

  const fallbackName = title;
  const resolvedName =
    name && name.trim() !== ""
      ? name
      : fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

  if (iconBlob) {
    saveIcon({ id: previousShortcutId, blob: iconBlob });
  }

  const iconPalette = iconUrl ? await extractIconPalette(iconUrl) : undefined;

  const resolvedAccent = accentColor?.trim()
    ? accentColor
    : (iconPalette?.DarkMuted?.hex ?? "#1a1a1a");

  const resolvedText = mutedColor?.trim()
    ? mutedColor
    : (iconPalette?.LightVibrant?.hex ?? getContrastYIQ(resolvedAccent));

  return {
    id: previousShortcutId,
    type: "shortcut",
    name: resolvedName,
    accentColor: resolvedAccent,
    mutedColor: resolvedText,
    url: url,
  };
}
