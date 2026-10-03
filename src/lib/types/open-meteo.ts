import type { WEATHER_CODES } from "@/lib/constants";

export type Latitude = number;
export type Longitude = number;

export type Coords = {
	latitude: Latitude;
	longitude: Longitude;
};

export type ForecastData = {
	current: {
		interval: number;
    temperature_2m: number;
    apparent_temperature: number;
		time: string;
		weather_code: keyof typeof WEATHER_CODES;
		wind_direction_10m: number;
		wind_speed_10m: number;
	};
	current_units: {
		interval: string;
    temperature_2m: "°C" | "°F";
    apparent_temperature: "°C" | "°F";
		time: string;
		weather_code: string;
		wind_direction_10m: string;
		wind_speed_10m: string;
	};
	elevation: number;
	generationtime_ms: number;
	latitude: Latitude;
	longitude: Longitude;
	timezone: string;
	timezone_abbreviation: string;
	utc_offset_seconds: number;
};
