import { type IDBPDatabase, openDB } from "idb";
import type { Shortcut, WeatheCity } from "@/lib/types";

export type StorageData = {
	shortcuts: Shortcut[];
	wallpaper: object;
	weatherCity: WeatheCity | null;
};

const DEFAULT_STORAGE_DATA: StorageData = {
	shortcuts: [],
	wallpaper: {},
	weatherCity: null,
};

const useChrome = typeof chrome !== "undefined" && chrome?.storage?.local;

function saveShortcuts(s: Shortcut[]) {
	useChrome
		? chrome.storage.local.set({ shortcuts: s })
		: localStorage.setItem("nova_shortcuts", JSON.stringify(s));
}
function saveWallpaper(w: object) {
	useChrome
		? chrome.storage.local.set({ wallpaper: w })
		: localStorage.setItem("nova_wallpaper", JSON.stringify(w));
}

function saveWeatherCity(c: WeatheCity) {
	useChrome
		? chrome.storage.local.set({ weatherCity: c })
		: localStorage.setItem("nova_weather_city", JSON.stringify(c));
}

async function loadData(): Promise<StorageData> {
	if (typeof chrome !== "undefined" && chrome.storage?.local) {
		return new Promise((resolve) => {
			chrome.storage.local.get(Object.keys(DEFAULT_STORAGE_DATA), (result) => {
				resolve({ ...DEFAULT_STORAGE_DATA, ...result } as StorageData);
			});
		});
	}

	throw new Error("The app is not running in the chrome-extension environment");
}

const ICONS_DB_NAME = "IconCacheDB";
const ICONS_STORE_NAME = "icons";

type SavedIcon = {
	id: number;
	blob: Blob;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
	if (!dbPromise) {
		dbPromise = openDB(ICONS_DB_NAME, 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains(ICONS_STORE_NAME)) {
					db.createObjectStore(ICONS_STORE_NAME);
				}
			},
		});
	}
	return dbPromise;
};

const saveIcon = async (data: SavedIcon) => {
	const { id, blob } = data;
	const db = await getDB();
	await db.put(ICONS_STORE_NAME, { id, blob }, id);
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

const deleteIcon = async (id: number) => {
	const db = await getDB();

	db.delete(ICONS_STORE_NAME, id);
};

const getIconById = async (id: number): Promise<SavedIcon> => {
	const db = await getDB();
	return await db.get(ICONS_STORE_NAME, id);
};

export {
	deleteIcon,
	getIconById as getIconByName,
	getIcons,
	loadData,
	saveIcon,
	saveShortcuts,
	saveWallpaper,
	saveWeatherCity,
};
