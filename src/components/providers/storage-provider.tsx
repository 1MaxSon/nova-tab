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

const StorageProvider = ({ children }: { children: ReactNode }) => {
	const isDataLoaded = useRef(false);

	const [shortcuts, setShortcuts] = useState<ShortcutData[]>([]);

	const [weatherCity, setWeatherCity] = useState<WeatherCity | null>(null);

	const [settings, setSettings] = useState<SettingsData>(
		DEFAULT_STORAGE_DATA.settings,
	);

	useEffect(() => {
		const loadStorageData = async () => {
			const data = await loadData();
			setShortcuts(data.shortcuts);
			setWeatherCity(data.weatherCity);
			setSettings(data.settings);
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

	useEffect(() => {
		if (!isDataLoaded.current) return;

		saveShortcuts(shortcuts);
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
