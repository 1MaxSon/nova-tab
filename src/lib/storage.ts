import { type IDBPDatabase, openDB } from "idb";
import type { Shortcut, WeatheCity } from "@/lib/types";

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

async function loadData(): Promise<
	| {
			shortcuts: Shortcut[];
			wallpaper: object;
			weatherCity: WeatheCity | null;
	  }
	| object
> {
	return new Promise((resolve) => {
		if (typeof chrome !== "undefined") {
			chrome.storage.local.get(
				["shortcuts", "wallpaper", "weatherCity"],
				resolve,
			);
		} else {
			try {
				resolve({
					shortcuts: JSON.parse(
						localStorage.getItem("nova_shortcuts") || "[]",
					) as Shortcut[],
					wallpaper: JSON.parse(
						localStorage.getItem("nova_wallpaper") || "null",
					),
					weatherCity: JSON.parse(
						localStorage.getItem("nova_weather_city") || "null",
					) as WeatheCity | null,
				});
			} catch {
				resolve({});
			}
		}
	});
}

const ICONS_DB_NAME = "IconCacheDB";
const ICONS_STORE_NAME = "icons";

type SavedIcon = {
	name: string;
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

const saveIcon = async (name: string, iconBlob: Blob) => {
	const db = await getDB();
	await db.put(ICONS_STORE_NAME, { name, blob: iconBlob }, name);
};

const getIcons = async () => {
	const db = await getDB();
	const icons = await db.getAll(ICONS_STORE_NAME);
	return icons.filter((p): p is SavedIcon => {
		return (
			"name" in p &&
			typeof p.name === "string" &&
			"blob" in p &&
			p.blob instanceof Blob
		);
	});
};

const getIconByName = async (name: string): Promise<SavedIcon> => {
	const db = await getDB();
	return await db.get(ICONS_STORE_NAME, name);
};

export {
	getIconByName,
	getIcons,
	loadData,
	saveIcon,
	saveShortcuts,
	saveWallpaper,
	saveWeatherCity,
};
