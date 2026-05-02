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
	loadData,
	type StorageData,
	saveShortcuts,
	saveWeatherCity,
} from "@/lib/storage";
import type { ShortcutData, WeatherCity } from "@/lib/types";

type StorageProviderContextType = {
	storage: StorageData;
	setShortcuts: Dispatch<SetStateAction<ShortcutData[]>>;
	setWeatherCity: Dispatch<SetStateAction<WeatherCity | null>>;
};

const StorageContext = createContext<StorageProviderContextType | null>(null);

const useStorage = () => {
	return useContext(StorageContext)!;
};

const StorageProvider = ({ children }: { children: ReactNode }) => {
	const isDataLoaded = useRef(false);

	const [shortcuts, setShortcuts] = useState<ShortcutData[]>([]);

	const [weatherCity, setWeatherCity] = useState<WeatherCity | null>(null);

	useEffect(() => {
		const loadStorageData = async () => {
			const data = await loadData();
			setShortcuts(data.shortcuts);
			setWeatherCity(data.weatherCity);
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
		},
		setShortcuts,
		setWeatherCity,
	};

	useEffect(() => {
		if (!isDataLoaded.current) return;

		if (weatherCity) saveWeatherCity(weatherCity);
	}, [weatherCity]);

	useEffect(() => {
		if (!isDataLoaded.current) return;

		saveShortcuts(shortcuts);
	}, [shortcuts]);

	return (
		<StorageContext.Provider value={storageData}>
			{children}
		</StorageContext.Provider>
	);
};

export { StorageProvider, useStorage };
