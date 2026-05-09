import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	DEFAULT_STORAGE_DATA,
	getCustomWallpaper,
	loadData,
	type SettingsData,
	type StorageData,
	type WallpaperData,
	saveSettings,
	saveShortcuts,
	saveWallpaper,
	saveWeatherCity,
} from "@/lib/storage";
import { THEMES } from "@/lib/constants";
import type { ShortcutData, WeatherCity } from "@/lib/types";

type StorageProviderContextType = {
	storage: StorageData;
	customWallpaperUrl: string | null;
	setShortcuts: Dispatch<SetStateAction<ShortcutData[]>>;
	setWallpaper: Dispatch<SetStateAction<WallpaperData>>;
	setWeatherCity: Dispatch<SetStateAction<WeatherCity | null>>;
	setSettings: Dispatch<SetStateAction<SettingsData>>;
};

const StorageContext = createContext<StorageProviderContextType | null>(null);

const useStorage = () => {
	return useContext(StorageContext)!;
};

// Get cached data from sessionStorage for instant rendering
const getCachedData = (): StorageData | null => {
	try {
		const cached = sessionStorage.getItem("nova_storage_cache");
		return cached ? JSON.parse(cached) : null;
	} catch {
		return null;
	}
};

// Cache data in sessionStorage for subsequent loads
const setCachedData = (data: StorageData) => {
	try {
		sessionStorage.setItem("nova_storage_cache", JSON.stringify(data));
	} catch {
		// Silent fail if storage is unavailable
	}
};

const StorageProvider = ({ children }: { children: ReactNode }) => {
	const isDataLoaded = useRef(false);

	// Use cached data for instant render
	const cachedData = getCachedData();
	const [shortcuts, setShortcuts] = useState<ShortcutData[]>(
		cachedData?.shortcuts || [],
	);

	const [weatherCity, setWeatherCity] = useState<WeatherCity | null>(
		cachedData?.weatherCity || null,
	);

	const [wallpaper, setWallpaper] = useState<WallpaperData>(
		cachedData?.wallpaper || DEFAULT_STORAGE_DATA.wallpaper,
	);

	const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string | null>(
		null,
	);

	const [settings, setSettings] = useState<SettingsData>(
		cachedData?.settings
			? {
					...DEFAULT_STORAGE_DATA.settings,
					...cachedData.settings,
				}
			: DEFAULT_STORAGE_DATA.settings,
	);

	useEffect(() => {
		const loadStorageData = async () => {
			const data = await loadData();
			setShortcuts(data.shortcuts);
			setWeatherCity(data.weatherCity);
			setWallpaper(data.wallpaper);
			setSettings(data.settings);
			setCachedData(data);
			isDataLoaded.current = true;
		};

		if (!isDataLoaded.current) {
			loadStorageData();
		}
	}, []);

	const storageData: StorageProviderContextType = {
		storage: {
			shortcuts,
			weatherCity,
			wallpaper,
			settings,
		},
		customWallpaperUrl,
		setShortcuts,
		setWallpaper,
		setWeatherCity,
		setSettings,
	};

	useEffect(() => {
		if (!isDataLoaded.current) return;

		if (weatherCity) saveWeatherCity(weatherCity);
	}, [weatherCity]);

	useEffect(() => {
		if (wallpaper.type !== "custom") {
			setCustomWallpaperUrl(null);
			return;
		}

		let objectUrl: string | null = null;
		let ignore = false;

		getCustomWallpaper().then((blob) => {
			if (!blob || ignore) return;

			objectUrl = URL.createObjectURL(blob);
			setCustomWallpaperUrl(objectUrl);
		});

		return () => {
			ignore = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [wallpaper]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: no update on storage change
	useEffect(() => {
		if (!isDataLoaded.current) return;

		saveShortcuts(shortcuts);
		// Update cache whenever shortcuts change
		setCachedData({
			...storageData.storage,
			shortcuts,
		});
	}, [shortcuts]);

	useEffect(() => {
		if (!isDataLoaded.current) return;

		if (settings) saveSettings(settings);
	}, [settings]);

	useEffect(() => {
		const theme =
			THEMES.find((item) => item.id === settings.theme) ?? THEMES[0];

		for (const [key, value] of Object.entries(theme.colors)) {
			document.documentElement.style.setProperty(`--${key}`, value);
		}
	}, [settings.theme]);

	useEffect(() => {
		if (!isDataLoaded.current) return;

		saveWallpaper(wallpaper);
		setCachedData({
			shortcuts,
			weatherCity,
			wallpaper,
			settings,
		});
	}, [wallpaper, shortcuts, weatherCity, settings]);

	return (
		<StorageContext.Provider value={storageData}>
			{children}
		</StorageContext.Provider>
	);
};

export { StorageProvider, useStorage };
