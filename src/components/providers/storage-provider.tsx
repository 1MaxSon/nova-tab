import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { Shortcut, WeatheCity } from "@/lib/types";

type StorageData = {
	shortcuts: Shortcut[];
	wallpaper: object;
	weatherCity: WeatheCity | null;
};

type StorageProviderContextType = {
	storage: StorageData | object;
	saveShortcuts: (s: Shortcut[]) => void;
	saveWallpaper: (w: object) => void;
	saveWeatherCity: (c: WeatheCity) => void;
};

const StorageContext = createContext<StorageProviderContextType | null>(null);

const useStorage = () => {
	return useContext(StorageContext)!;
};

async function loadData(): Promise<StorageData | object> {
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

const StorageProvider = ({ children }: { children: ReactNode }) => {
	const useChrome = typeof chrome !== "undefined" && chrome?.storage?.local;

	const saveShortcuts: StorageProviderContextType["saveShortcuts"] =
		useCallback(
			(s: Shortcut[]) => {
				useChrome
					? chrome.storage.local.set({ shortcuts: s })
					: localStorage.setItem("nova_shortcuts", JSON.stringify(s));
			},
			[useChrome],
		);

	const saveWallpaper: StorageProviderContextType["saveWallpaper"] =
		useCallback(
			(w: object) => {
				useChrome
					? chrome.storage.local.set({ wallpaper: w })
					: localStorage.setItem("nova_wallpaper", JSON.stringify(w));
			},
			[useChrome],
		);

	const saveWeatherCity: StorageProviderContextType["saveWeatherCity"] =
		useCallback(
			(c: WeatheCity) => {
				useChrome
					? chrome.storage.local.set({ weatherCity: c })
					: localStorage.setItem("nova_weather_city", JSON.stringify(c));
			},
			[useChrome],
		);

	const [storageData, setStorageData] = useState<StorageProviderContextType>({
		storage: {},
		saveShortcuts,
		saveWallpaper,
		saveWeatherCity,
	});

	useEffect(() => {
		const loadStorageData = async () => {
			const storageData = await loadData();
			setStorageData((prev) => ({
				...prev,
				storage: storageData,
			}));
		};
		loadStorageData();
	}, []);

	return (
		<StorageContext.Provider value={storageData}>
			{children}
		</StorageContext.Provider>
	);
};

export { StorageProvider, useStorage };
