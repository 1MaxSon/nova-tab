import JSZip from "jszip";

import {
  normalizeSettingsData,
  normalizeShortcutData,
  storage,
} from "@/lib/storage";
import { BackupService, INVALID_BACKUP_FILE_ERROR } from "../types";
import { isRecord } from "../utils";
import { getAllImages, saveImage } from "@/lib/utils/img-idb";
import type { Latitude, Longitude } from "@/lib/types/open-meteo";

const DATA_FILE_NAME = "data.json";
const ICONS_FILE_NAME = "icons.json";
const ICONS_DIR_NAME = "icons";

type IconManifestV1 = {
  id: string;
  type: string;
};

type WeatherCityV2 = { name: string; lat: Latitude; lon: Longitude };

type BackupDataV2 = {
  shortcuts: unknown;
  weatherCity: unknown;
  settings: unknown;
  icons: IconManifestV1[];
};

export const backupV2: BackupService<2> = {
  version: 2,

  async exportBackup(zip) {
    const { isLoaded, ...data } = storage;

    const iconsFolder = zip.folder(ICONS_DIR_NAME);
    const icons = await getAllImages();

    const iconManifest: IconManifestV1[] = [];

    for (const icon of icons) {
      iconsFolder?.file(`${icon.id}`, icon.blob);

      iconManifest.push({
        id: icon.id,
        type: icon.blob.type,
      });
    }

    const backup: Omit<BackupDataV2, "icons"> = data;

    zip.file(DATA_FILE_NAME, JSON.stringify(backup, null, 2));

    zip.file(ICONS_FILE_NAME, JSON.stringify(iconManifest, null, 2));

    return zip;
  },
  async importBackup(zip) {
    const payload = await readBackupData(zip);
    const shortcuts = normalizeShortcutData(payload.shortcuts);
    const weatherCity = normalizeWeatherCity(payload.weatherCity);
    const settings = normalizeSettingsData(payload.settings);

    await restoreIcons(zip);
    storage.settings = settings;
    storage.shortcuts = shortcuts;
    storage.weatherCity = weatherCity;
  },
};

function normalizeWeatherCity(input: unknown): WeatherCityV2 | null {
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
}

function parseDataBackupPayload(text: string): Omit<BackupDataV2, "icons"> {
  try {
    const parsed: unknown = JSON.parse(text);

    if (!isRecord(parsed)) {
      throw new Error(INVALID_BACKUP_FILE_ERROR);
    }

    return {
      shortcuts: parsed.shortcuts,
      weatherCity: parsed.weatherCity,
      settings: parsed.settings,
    };
  } catch {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }
}

function parseIconsBackupPayload(text: string): Pick<BackupDataV2, "icons"> {
  try {
    const parsed = JSON.parse(text) as IconManifestV1[];

    return {
      icons: parsed,
    };
  } catch {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }
}

async function readBackupData(
  zip: JSZip,
): Promise<Omit<BackupDataV2, "icons">> {
  const dataFile = zip.file(DATA_FILE_NAME);

  if (!dataFile) {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }

  const dataText = await dataFile.async("text");
  const backupData = parseDataBackupPayload(dataText);

  return {
    ...backupData,
  };
}

function getIconId(path: string): string | null {
  const pathParts = path.split("/");
  const fileName = pathParts[pathParts.length - 1];
  if (!fileName) return null;

  const extensionIndex = fileName.lastIndexOf(".");
  const idText =
    extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);

  return idText;
}

async function restoreIcons(zip: JSZip) {
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

        return saveImage({ id, blob: resolvedBlob });
      }),
    );
  });

  await Promise.all(restoreTasks);
}
