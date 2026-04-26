import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
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
