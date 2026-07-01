import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import {
  domainFromUrl,
  extractIconPalette,
  generatePreviousId,
  getContrastYIQ,
  parseFavicon,
} from "@/lib/helpers";
import { loadData, saveIcon } from "@/lib/storage";
import type { ShortcutType } from "@/lib/types";
import type { Coords } from "@/lib/types/open-meteo";
import type { SavedIcon, WeatherProvider } from "@/lib/storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildYandexUrl(coords: Coords) {
  const { latitude, longitude } = coords;

  return `https://yandex.ru/pogoda/?lat=${latitude}&lon=${longitude}`;
}

export function buildGoogleWeatherUrl(cityName: string, coords: Coords) {
  const query = cityName
    ? `weather ${cityName}`
    : `weather ${coords.latitude},${coords.longitude}`;

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

export type CreateShortcutInput = PickTyped<ShortcutType, "url"> &
  Partial<OmitTyped<ShortcutType, "url">>;

export async function fetchFaviconBlob(
  url: string,
  options: { faviconErrorMessage?: string } = {},
): Promise<
  | { iconUrl: string | null; iconBlob?: Blob; iconFormat: SavedIcon["format"] }
  | undefined
> {
  const faviconErrorMessage =
    options.faviconErrorMessage ?? "Failed to fetch favicon";

  const result = await parseFavicon(url);
  if (!result) {
    alert(faviconErrorMessage);
    return;
  }

  const { url: iconUrl, format: iconFormat } = result;

  if (import.meta.env.DEV) {
    console.log(`Fetched favicon url: ${iconUrl}`);
  }

  let iconBlob: Blob | undefined;

  if (!iconUrl) alert(faviconErrorMessage);
  else {
    try {
      const res = await fetch(iconUrl);

      if (res.status !== 200) alert(faviconErrorMessage);
      iconBlob = await res.blob();
    } catch {
      alert(faviconErrorMessage);
    }
  }

  return { iconUrl, iconBlob, iconFormat };
}

export async function createShortcut(
  data: CreateShortcutInput,
  options: { faviconErrorMessage?: string } = {},
): Promise<ShortcutType | undefined> {
  const { url, name, accentColor, mutedColor } = data;
  const result = await fetchFaviconBlob(url, options);

  if (!result) return;

  const { iconBlob, iconUrl, iconFormat } = result;

  const { shortcuts } = await loadData();

  const previousShortcutId = generatePreviousId(shortcuts);

  const fallbackName = domainFromUrl(url);
  const resolvedName =
    name && name.trim() !== ""
      ? name
      : fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

  if (iconBlob) {
    saveIcon({ id: previousShortcutId, blob: iconBlob, format: iconFormat });
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
