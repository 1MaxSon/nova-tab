import JSZip from "jszip";
import {
	getCustomWallpaper,
	getIcons,
	loadData,
	normalizeSettingsData,
	normalizeShortcutData,
	normalizeWallpaperData,
	saveCustomWallpaper,
	saveIcon,
	saveSettings,
	saveShortcuts,
	saveWallpaper,
	saveWeatherCity,
	type SettingsData,
	type StorageData,
	type WallpaperData,
} from "@/lib/storage";
import type { WeatherCity } from "@/lib/types";

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

const BACKUP_FILE_NAME = "nova-backup.zip";
const DATA_FILE_NAME = "data.json";
const WALLPAPER_FILE_NAME = "wallpaper.jpg";
const ICONS_DIR_NAME = "icons";
const INVALID_BACKUP_FILE_ERROR = "INVALID_BACKUP_FILE";

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

const downloadBlob = (blob: Blob, fileName: string) => {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = fileName;
	link.style.display = "none";
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
};

const parseBackupPayload = (text: string): BackupPayload => {
	try {
		const parsed: unknown = JSON.parse(text);

		if (!isRecord(parsed)) {
			throw new Error(INVALID_BACKUP_FILE_ERROR);
		}

		return {
			shortcuts: parsed.shortcuts,
			wallpaper: parsed.wallpaper,
			weatherCity: parsed.weatherCity,
			settings: parsed.settings,
		};
	} catch {
		throw new Error(INVALID_BACKUP_FILE_ERROR);
	}
};

const readBackupData = async (zip: JSZip): Promise<BackupPayload> => {
	const dataFile = zip.file(DATA_FILE_NAME);

	if (!dataFile) {
		throw new Error(INVALID_BACKUP_FILE_ERROR);
	}

	const text = await dataFile.async("text");
	return parseBackupPayload(text);
};

const restoreWallpaper = async (zip: JSZip) => {
	const wallpaperFile = zip.file(WALLPAPER_FILE_NAME);

	if (!wallpaperFile) return;

	const blob = await wallpaperFile.async("blob");
	await saveCustomWallpaper(blob);
};

const getIconId = (path: string): number | null => {
	const pathParts = path.split("/");
	const fileName = pathParts[pathParts.length - 1];
	if (!fileName) return null;

	const extensionIndex = fileName.lastIndexOf(".");
	const idText =
		extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
	const id = Number(idText);

	return Number.isInteger(id) ? id : null;
};

const restoreIcons = async (zip: JSZip) => {
	const iconsFolder = zip.folder(ICONS_DIR_NAME);
	if (!iconsFolder) return;

	const restoreTasks: Promise<void>[] = [];

	iconsFolder.forEach((relativePath, iconFile) => {
		if (iconFile.dir) return;

		const id = getIconId(relativePath);
		if (id === null) return;

		restoreTasks.push(
			iconFile.async("blob").then((blob) => saveIcon({ id, blob })),
		);
	});

	await Promise.all(restoreTasks);
};

async function exportData(): Promise<void> {
	const zip = new JSZip();
	const data = await loadData();
	const backup: BackupFile = {
		version: 1,
		exportedAt: new Date().toISOString(),
		...data,
	};

	zip.file(DATA_FILE_NAME, JSON.stringify(backup, null, 2));

	if (data.wallpaper.type === "custom") {
		const wallpaper = await getCustomWallpaper();
		if (wallpaper) {
			zip.file(WALLPAPER_FILE_NAME, wallpaper);
		}
	}

	const iconsFolder = zip.folder(ICONS_DIR_NAME);
	const icons = await getIcons();

	for (const icon of icons) {
		iconsFolder?.file(`${icon.id}.png`, icon.blob);
	}

	const blob = await zip.generateAsync({
		type: "blob",
		mimeType: "application/zip",
	});
	downloadBlob(blob, BACKUP_FILE_NAME);
}

async function importData(file: File): Promise<void> {
	let zip: JSZip;

	try {
		zip = await JSZip.loadAsync(file);
	} catch {
		throw new Error(INVALID_BACKUP_FILE_ERROR);
	}

	const payload = await readBackupData(zip);
	const shortcuts = normalizeShortcutData(payload.shortcuts);
	const wallpaper: WallpaperData = normalizeWallpaperData(payload.wallpaper);
	const weatherCity = normalizeWeatherCity(payload.weatherCity);
	const settings: SettingsData = normalizeSettingsData(payload.settings);

	await Promise.all([restoreWallpaper(zip), restoreIcons(zip)]);
	await Promise.all([
		saveShortcuts(shortcuts),
		saveWallpaper(wallpaper),
		saveWeatherCity(weatherCity),
		saveSettings(settings),
	]);

	window.location.reload();
}

export { exportData, importData, INVALID_BACKUP_FILE_ERROR };
