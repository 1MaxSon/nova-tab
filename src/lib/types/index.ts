import type { Latitude, Longitude } from "@/lib/types/open-meteo";

export type Shortcut = { name: string; url: string; group?: string };
export type WeatheCity = { name: string; lat: Latitude; lon: Longitude };
