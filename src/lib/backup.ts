import {
  getIcons,
  normalizeSettingsData,
  normalizeShortcutData,
  saveIcon,
  storage,
  StorageData,
} from "@/lib/storage";
import type { WeatherCity } from "@/lib/types";
import JSZip from "jszip";

type BackupFile = StorageData & {
  version: 1;
  exportedAt: string;
};

type IconManifest = {
  id: number;
  type: string;
};

type BackupPayload = {
  shortcuts: unknown;
  wallpaper: unknown;
  weatherCity: unknown;
  settings: unknown;
  icons: IconManifest[];
};

const BACKUP_FILE_NAME = "nova-backup.zip";
const DATA_FILE_NAME = "data.json";
const ICONS_FILE_NAME = "icons.json";
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

const parseDataBackupPayload = (text: string): Omit<BackupPayload, "icons"> => {
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

const parseIconsBackupPayload = (
  text: string,
): Pick<BackupPayload, "icons"> => {
  try {
    const parsed = JSON.parse(text) as IconManifest[];

    return {
      icons: parsed,
    };
  } catch {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }
};

const readBackupData = async (
  zip: JSZip,
): Promise<Omit<BackupPayload, "icons">> => {
  const dataFile = zip.file(DATA_FILE_NAME);

  if (!dataFile) {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }

  const dataText = await dataFile.async("text");
  const backupData = parseDataBackupPayload(dataText);

  return {
    ...backupData,
  };
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
  const iconsFile = zip.file(ICONS_FILE_NAME);

  if (!iconsFile) {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }

  const iconsText = await iconsFile.async("text");
  const iconsFolder = zip.folder(ICONS_DIR_NAME);

  const iconsData = parseIconsBackupPayload(iconsText);

  if (!iconsFolder) return;

  const restoreTasks: Promise<void>[] = [];

  iconsFolder.forEach((relativePath, iconFile) => {
    if (iconFile.dir) return;

    const id = getIconId(relativePath);

    if (id === null) return;

    restoreTasks.push(
      iconFile.async("arraybuffer").then((buffer) => {
        const iconData = iconsData.icons.filter((p) => p.id === id).pop();
        if (!iconData) return;

        const resolvedBlob = new Blob([buffer], { type: iconData.type });

        return saveIcon({ id, blob: resolvedBlob });
      }),
    );
  });

  await Promise.all(restoreTasks);
};

async function exportData(): Promise<void> {
  const zip = new JSZip();
  const data = storage;
  const backup: BackupFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };

  zip.file(DATA_FILE_NAME, JSON.stringify(backup, null, 2));

  const iconsFolder = zip.folder(ICONS_DIR_NAME);
  const icons = await getIcons();

  const iconManifest: IconManifest[] = [];

  for (const icon of icons) {
    iconsFolder?.file(`${icon.id}`, icon.blob);

    iconManifest.push({
      id: icon.id,
      type: icon.blob.type,
    });
  }

  zip.file(ICONS_FILE_NAME, JSON.stringify(iconManifest, null, 2));

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
  const weatherCity = normalizeWeatherCity(payload.weatherCity);
  const settings = normalizeSettingsData(payload.settings);

  await restoreIcons(zip);
  storage.settings = settings;
  storage.shortcuts = shortcuts;
  storage.weatherCity = weatherCity;

  window.location.reload();
}

export { exportData, importData, INVALID_BACKUP_FILE_ERROR };
