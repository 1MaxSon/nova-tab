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
	storage: StorageData;
	saveShortcuts: (s: Shortcut[]) => void;
	saveWallpaper: (w: object) => void;
	saveWeatherCity: (c: WeatheCity) => void;
};

const StorageContext = createContext<StorageProviderContextType | null>(null);

const useStorage = () => {
	return useContext(StorageContext)!;
};

const DEFAULT_STORAGE_DATA: StorageData = {
	shortcuts: [],
	wallpaper: {},
	weatherCity: null,
};

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

const StorageProvider = ({ children }: { children: ReactNode }) => {
	const useChrome = typeof chrome !== "undefined" && chrome?.storage?.local;

	const saveShortcuts = useCallback(
		(s: Shortcut[]) => {
			if (useChrome) {
				chrome.storage.local.set({ shortcuts: s });
			} else {
				localStorage.setItem("nova_shortcuts", JSON.stringify(s));
			}

			setStorageData((prev) => ({
				...prev,
				storage: {
					...prev.storage,
					shortcuts: s,
				},
			}));
		},
		[useChrome],
	);

	const saveWallpaper: StorageProviderContextType["saveWallpaper"] =
		useCallback(
			(w: object) => {
				useChrome
					? chrome.storage.local.set({ wallpaper: w })
					: localStorage.setItem("nova_wallpaper", JSON.stringify(w));
				setStorageData((prev) => ({
					...prev,
					storage: {
						...prev.storage,
						wallpaper: w,
					},
				}));
			},
			[useChrome],
		);

	const saveWeatherCity: StorageProviderContextType["saveWeatherCity"] =
		useCallback(
			(wc: WeatheCity) => {
				useChrome
					? chrome.storage.local.set({ weatherCity: wc })
					: localStorage.setItem("nova_weather_city", JSON.stringify(wc));
				setStorageData((prev) => ({
					...prev,
					storage: {
						...prev.storage,
						weatherCity: wc,
					},
				}));
			},
			[useChrome],
		);

	const [storageData, setStorageData] = useState<StorageProviderContextType>({
		storage: DEFAULT_STORAGE_DATA,
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
