import type { Latitude, Longitude } from "@/lib/types/open-meteo";

export type Shortcut = {
	id: number;
	type: "shortcut";
	name: string;
	url: string;
	accentColor: string;
	mutedColor: string;
};

export type ShortcutGroup = {
	id: number;
	type: "group";
	name: string;
	accentColor: string;
	mutedColor: string;
	items: Shortcut[];
};

export type ShortcutData = Shortcut | ShortcutGroup;

export type WeatheCity = { name: string; lat: Latitude; lon: Longitude };
