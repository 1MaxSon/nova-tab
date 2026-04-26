import type { WEATHER_CODES } from "@/lib/constants";

export type Latitude = number;
export type Longitude = number;

export type Coords = {
	latitude: Latitude;
	longitude: Longitude;
};

export type GeocodedEntry = {
	id: string;
	name: string;
	latitude: Latitude;
	longitude: Longitude;
	elevation: number;
	timezone: string;
	feature_code: string;
	country_code: string;
	country: string;
	country_id: number;
	population: number;
	postcodes: string[];
	admin1?: string;
	admin2?: string;
	admin3?: string;
	admin4?: string;
	admin1_id?: number;
	admin2_id?: number;
	admin3_id?: number;
	admin4_id?: number;
};

export type GeocodingData = {
	results?: GeocodedEntry[];
	generationtime_ms?: number;
};

export type ForecastData = {
	current_weather: {
		interval: number;
		is_day: 0 | 1 | "";
		temperature: number;
		time: Date;
		weathercode: keyof typeof WEATHER_CODES;
		winddirection: number;
		windspeed: number;
	};
	current_weather_units: {
		interval: string;
		is_day: 0 | 1 | "";
		temperature: "°C" | "°F";
		time: string;
		weathercode: string;
		winddirection: string;
		windspeed: string;
	};
	elevation: number;
	generationtime_ms: number;
	latitude: Latitude;
	longitude: Longitude;
	timezone: string;
	timezone_abbreviation: string;
	utc_offset_seconds: number;
};
