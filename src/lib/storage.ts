import { type IDBPDatabase, openDB } from "idb";
import type { ShortcutData, WeatherCity } from "@/lib/types";

export type WallpaperData =
	| {
			type: "preset";
			id: string;
	  }
	| {
			type: "custom";
			updatedAt: number;
	  };

export type Language = "en" | "ru";

const getDefaultLanguage = (): Language => {
	if (typeof navigator === "undefined") return "en";
	return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
};

export type SettingsData = {
	language: Language;
	transparentAddShortcut: boolean;
	transparentChangeGeo: boolean;
	theme: string;
};

export type StorageData = {
	shortcuts: ShortcutData[];
	wallpaper: WallpaperData;
	weatherCity: WeatherCity | null;
	settings: SettingsData;
};

export const DEFAULT_STORAGE_DATA: StorageData = {
	shortcuts: [],
	wallpaper: {
		type: "preset",
		id: "nova",
	},
	weatherCity: null,
	settings: {
		language: getDefaultLanguage(),
		transparentAddShortcut: false,
		transparentChangeGeo: false,
		theme: "nova",
	},
};

const useChrome = typeof chrome !== "undefined" && chrome?.storage?.local;

function saveShortcuts(s: ShortcutData[]) {
	useChrome
		? chrome.storage.local.set({ shortcuts: s })
		: localStorage.setItem("nova_shortcuts", JSON.stringify(s));
}

function saveWallpaper(w: WallpaperData) {
	useChrome
		? chrome.storage.local.set({ wallpaper: w })
		: localStorage.setItem("nova_wallpaper", JSON.stringify(w));
}

function normalizeWallpaperData(input: unknown): WallpaperData {
	if (!input || typeof input !== "object") return DEFAULT_STORAGE_DATA.wallpaper;

	const raw = input as Partial<WallpaperData>;
	if (raw.type === "custom" && typeof raw.updatedAt === "number") {
		return raw as WallpaperData;
	}

	if (raw.type === "preset" && typeof raw.id === "string") {
		return raw as WallpaperData;
	}

	return DEFAULT_STORAGE_DATA.wallpaper;
}

function saveWeatherCity(c: WeatherCity) {
	useChrome
		? chrome.storage.local.set({ weatherCity: c })
		: localStorage.setItem("nova_weather_city", JSON.stringify(c));
}

function saveSettings(settings: SettingsData) {
	useChrome
		? chrome.storage.local.set({ settings })
		: localStorage.setItem("settings", JSON.stringify(settings));
}

function normalizeSettingsData(input: unknown): SettingsData {
	if (!input || typeof input !== "object") return DEFAULT_STORAGE_DATA.settings;
	const raw = input as Partial<SettingsData>;

	return {
		...DEFAULT_STORAGE_DATA.settings,
		...raw,
		language: raw.language === "ru" ? "ru" : "en",
	};
}

function normalizeShortcutData(input: unknown): ShortcutData[] {
	if (!Array.isArray(input)) return [];

	return input
		.map((item): ShortcutData | null => {
			if (!item || typeof item !== "object") return null;
			const raw = item as Record<string, unknown>;
			if (raw.type === "group") {
				return {
					...(raw as object),
					type: "group",
				} as ShortcutData;
			}
			if (Array.isArray(raw.items)) {
				return {
					...(raw as object),
					type: "group",
				} as ShortcutData;
			}

			return {
				...(raw as object),
				type: "shortcut",
			} as ShortcutData;
		})
		.filter(Boolean) as ShortcutData[];
}

async function loadData(): Promise<StorageData> {
	if (typeof chrome !== "undefined" && chrome.storage?.local) {
		return new Promise((resolve) => {
			chrome.storage.local.get(Object.keys(DEFAULT_STORAGE_DATA), (result) => {
				resolve({
					...DEFAULT_STORAGE_DATA,
					...result,
					shortcuts: normalizeShortcutData(result.shortcuts),
					wallpaper: normalizeWallpaperData(result.wallpaper),
					settings: normalizeSettingsData(result.settings),
				} as StorageData);
			});
		});
	}

	throw new Error("The app is not running in the chrome-extension environment");
}

const ICONS_DB_NAME = "IconCacheDB";
const ICONS_STORE_NAME = "icons";
const WALLPAPER_STORE_NAME = "wallpaper";
const CUSTOM_WALLPAPER_KEY = "custom";

type SavedIcon = {
	id: number;
	blob: Blob;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
	if (!dbPromise) {
		dbPromise = openDB(ICONS_DB_NAME, 2, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(ICONS_STORE_NAME)) {
					db.createObjectStore(ICONS_STORE_NAME);
				}
				if (!db.objectStoreNames.contains(WALLPAPER_STORE_NAME)) {
					db.createObjectStore(WALLPAPER_STORE_NAME);
				}
			},
		});
	}
	return dbPromise;
};

const getIcons = async () => {
	const db = await getDB();
	const icons = await db.getAll(ICONS_STORE_NAME);
	return icons.filter((p): p is SavedIcon => {
		return (
			"id" in p &&
			typeof p.id === "number" &&
			"blob" in p &&
			p.blob instanceof Blob
		);
	});
};

const saveIcon = async (data: SavedIcon) => {
	const { id, blob } = data;
	const db = await getDB();
	await db.put(ICONS_STORE_NAME, { id, blob }, id);
};

const deleteIcon = async (id: number) => {
	const db = await getDB();

	db.delete(ICONS_STORE_NAME, id);
};

const getIconById = async (id: number): Promise<SavedIcon | null> => {
	const db = await getDB();
	return await db.get(ICONS_STORE_NAME, id);
};

const getCustomWallpaper = async (): Promise<Blob | null> => {
	const db = await getDB();
	const wallpaper = await db.get(WALLPAPER_STORE_NAME, CUSTOM_WALLPAPER_KEY);
	return wallpaper instanceof Blob ? wallpaper : null;
};

const saveCustomWallpaper = async (blob: Blob) => {
	const db = await getDB();
	await db.put(WALLPAPER_STORE_NAME, blob, CUSTOM_WALLPAPER_KEY);
};

export {
	deleteIcon,
	getCustomWallpaper,
	getIconById as getIconByName,
	getIcons,
	loadData,
	saveCustomWallpaper,
	saveIcon,
	saveSettings,
	saveShortcuts,
	saveWallpaper,
	saveWeatherCity,
};
