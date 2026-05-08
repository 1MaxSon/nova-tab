import { type ClassValue, clsx } from "clsx";

import { twMerge } from "tailwind-merge";
import {
	domainFromUrl,
	extractIconPalette,
	generatePreviousId,
	getContrastYIQ,
	getFaviconDisplay,
} from "@/lib/helpers";
import { loadData, saveIcon } from "@/lib/storage";
import type { ShortcutType } from "@/lib/types";
import type { Coords } from "@/lib/types/open-meteo";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function buildYandexUrl(coords: Coords) {
	const { latitude, longitude } = coords;

	return `https://yandex.ru/pogoda/?lat=${latitude}&lon=${longitude}`;
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

export async function createShortcut(
	data: CreateShortcutInput,
): Promise<ShortcutType> {
	const { url, name, accentColor, mutedColor } = data;
	const iconUrl = await getFaviconDisplay(url);

	if (import.meta.env.DEV) {
		console.log(`Fetched favicon url: ${iconUrl}`);
	}

	let iconBlob: Blob | undefined;

	if (!iconUrl) alert("Failed to fetch favicon");
	else {
		try {
			const res = await fetch(iconUrl);

			if (res.status !== 200) alert("Failed to fetch favicon");
			iconBlob = await res.blob();
		} catch {
			alert("Failed to fetch favicon");
		}
	}

	const { shortcuts } = await loadData();

	const previousShortcutId = generatePreviousId(shortcuts);

	const fallbackName = domainFromUrl(url);
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
