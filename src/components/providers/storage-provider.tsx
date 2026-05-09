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
	loadData,
	type SettingsData,
	type StorageData,
	saveSettings,
	saveShortcuts,
	saveWeatherCity,
} from "@/lib/storage";
import type { ShortcutData, WeatherCity } from "@/lib/types";

type StorageProviderContextType = {
	storage: StorageData;
	setShortcuts: Dispatch<SetStateAction<ShortcutData[]>>;
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

	const [settings, setSettings] = useState<SettingsData>(
		cachedData?.settings || DEFAULT_STORAGE_DATA.settings,
	);

	useEffect(() => {
		const loadStorageData = async () => {
			const data = await loadData();
			setShortcuts(data.shortcuts);
			setWeatherCity(data.weatherCity);
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
			wallpaper: {},
			settings,
		},
		setShortcuts,
		setWeatherCity,
		setSettings,
	};

	useEffect(() => {
		if (!isDataLoaded.current) return;

		if (weatherCity) saveWeatherCity(weatherCity);
	}, [weatherCity]);

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

	return (
		<StorageContext.Provider value={storageData}>
			{children}
		</StorageContext.Provider>
	);
};

export { StorageProvider, useStorage };
