import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import {
	domainFromUrl,
	extractIconPalette,
	getContrastYIQ,
	getFaviconDisplay,
} from "@/lib/helpers";
import { loadData, saveIcon } from "@/lib/storage";
import type { Shortcut } from "@/lib/types";
import type { Coords } from "@/lib/types/open-meteo";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function buildYandexUrl(coords: Coords) {
	const { latitude, longitude } = coords;

	return `https://yandex.ru/pogoda/?ll=${longitude.toFixed(4)},${latitude.toFixed(4)}&z=12`;
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

export type CreateShortcutInput = PickTyped<Shortcut, "url"> &
	Partial<OmitTyped<Shortcut, "url">>;

export async function createShortcut(
	data: CreateShortcutInput,
): Promise<Shortcut> {
	const { url, name, accentColor, mutedColor } = data;
	const iconUrl = getFaviconDisplay(url);
	const res = await fetch(iconUrl);
	const iconBlob = await res.blob();

	const { shortcuts } = await loadData();

	const previousShortcutId = Math.max(0, ...shortcuts.map((s) => s.id)) + 1;

	const fallbackName = domainFromUrl(url);
	const resolvedName =
		name && name.trim() !== ""
			? name
			: fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

	saveIcon({ id: previousShortcutId, blob: iconBlob });

	const iconPalette = await extractIconPalette(iconUrl);

	const resolvedAccent = accentColor?.trim()
		? accentColor
		: (iconPalette.DarkMuted?.hex ?? "#1a1a1a");

	const resolvedText = mutedColor?.trim()
		? mutedColor
		: (iconPalette.LightVibrant?.hex ?? getContrastYIQ(resolvedAccent));

	return {
		id: previousShortcutId,
		type: "shortcut",
		name: resolvedName,
		accentColor: resolvedAccent,
		mutedColor: resolvedText,
		url: url,
	};
}
