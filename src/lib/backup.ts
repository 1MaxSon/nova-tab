import type { WeatherCity } from "@/lib/types";
import {
	loadData,
	normalizeSettingsData,
	normalizeShortcutData,
	normalizeWallpaperData,
	saveSettings,
	saveShortcuts,
	saveWallpaper,
	saveWeatherCity,
	type SettingsData,
	type StorageData,
	type WallpaperData,
} from "@/lib/storage";

type BackupFile = StorageData & {
	version: 1;
	exportedAt: string;
};

type BackupPayload = {
	shortcuts: unknown;
	wallpaper: unknown;
	weatherCity: unknown;
	settings: unknown;
};

const BACKUP_FILE_NAME = "nova-backup.json";

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return Boolean(value) && typeof value === "object";
};

const normalizeWeatherCity = (input: unknown): WeatherCity | null => {
	if (input === null || input === undefined) return null;
	if (!isRecord(input)) return null;

	const { name, lat, lon } = input;
	if (
		typeof name !== "string" ||
		typeof lat !== "number" ||
		typeof lon !== "number"
	) {
		return null;
	}

	return { name, lat, lon };
};

const readBackupFile = async (file: File): Promise<BackupPayload> => {
	const text = await file.text();
	const parsed: unknown = JSON.parse(text);

	if (!isRecord(parsed)) {
		throw new Error("Некорректный файл резервной копии");
	}

	return {
		shortcuts: parsed.shortcuts,
		wallpaper: parsed.wallpaper,
		weatherCity: parsed.weatherCity,
		settings: parsed.settings,
	};
};

async function exportData(): Promise<void> {
	const data = await loadData();
	const backup: BackupFile = {
		version: 1,
		exportedAt: new Date().toISOString(),
		...data,
	};

	const blob = new Blob([JSON.stringify(backup, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = BACKUP_FILE_NAME;
	link.style.display = "none";
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

async function importData(file: File): Promise<void> {
	const payload = await readBackupFile(file);
	const shortcuts = normalizeShortcutData(payload.shortcuts);
	const wallpaper: WallpaperData = normalizeWallpaperData(payload.wallpaper);
	const weatherCity = normalizeWeatherCity(payload.weatherCity);
	const settings: SettingsData = normalizeSettingsData(payload.settings);

	await Promise.all([
		saveShortcuts(shortcuts),
		saveWallpaper(wallpaper),
		saveWeatherCity(weatherCity),
		saveSettings(settings),
	]);

	window.location.reload();
}

export { exportData, importData };
