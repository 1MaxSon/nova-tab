import type { Latitude, Longitude } from "@/lib/types/open-meteo";

export type Shortcut = {
	id: number;
	name: string;
	url: string;
	group?: string;
	accentColor: string;
	mutedColor: string;
};
export type WeatheCity = { name: string; lat: Latitude; lon: Longitude };
