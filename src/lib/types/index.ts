import type { Latitude, Longitude } from "@/lib/types/open-meteo";

export type ShortcutType = {
	id: number;
	type: "shortcut";
	name: string;
	url: string;
	accentColor: string;
	mutedColor: string;
	groupId?: number;
};

export type ShortcutGroupType = {
	id: number;
	type: "group";
	name: string;
	items: Required<ShortcutType>[];
};

export type ShortcutData = ShortcutType | ShortcutGroupType;

export type WeatherCity = { name: string; lat: Latitude; lon: Longitude };

export type ThemeColors = Record<string, string>;

export type GradientWallpaperData = {
  from: string;
  to: string;
  angle: number;
};

export type UserTheme = {
  id: string;
  name: string;
  wallpaperType: "photo" | "gradient";
  wallpaperData: string | GradientWallpaperData;
  colors: ThemeColors;
};
