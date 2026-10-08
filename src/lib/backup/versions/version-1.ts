import { BackupService, INVALID_BACKUP_FILE_ERROR } from "@/lib/backup/types";
import { isRecord } from "@/lib/backup/utils";
import { storage } from "@/lib/storage";
import type { Latitude, Longitude } from "@/lib/types/open-meteo";
import { getAllImages } from "@/lib/utils/img-idb";
import JSZip from "jszip";

export const DATA_FILE_NAME_V1 = "data.json";
export const ICONS_FILE_NAME_V1 = "icons.json";
export const ICONS_DIR_NAME_V1 = "icons";

export type IconManifestV1 = {
  id: number;
  type: string;
};

export type WeatherCityV1 = { name: string; lat: Latitude; lon: Longitude };

export type SearchEngineV1 =
  | "google"
  | "bing"
  | "duckduckgo"
  | "yahoo"
  | "yandex"
  | "brave"
  | "ecosia";

interface ColorStopV1 {
  id: number;
  color: string; // hex, e.g. "#1e293b"
  alpha: number; // 0..1
  pos: number; // 0..100 (%)
  transparent: boolean;
}

interface BaseLayerV1 {
  id: number;
  enabled: boolean;
  stops: ColorStopV1[];
}

interface RadialLayerV1 extends BaseLayerV1 {
  type: "radial";
  sizeX: number;
  sizeY: number;
  posX: number;
  posY: number;
}

interface LinearLayerV1 extends BaseLayerV1 {
  type: "linear";
  angle: number;
}

export type GradientLayerV1 = RadialLayerV1 | LinearLayerV1;

export type GradientWallpaperDataV1 = GradientLayerV1[];

export type UserThemePhotoV1 = {
  wallpaperType: "photo";
  wallpaperData: string;
};

export type UserThemeGradientV1 = {
  wallpaperType: "gradient";
  wallpaperData: GradientWallpaperDataV1;
};

export type UserThemeV1 = {
  id: string;
  name: string;
  colors: Record<string, string>;
} & (UserThemePhotoV1 | UserThemeGradientV1);

export type SettingsDataV1 = {
  language: "en" | "ru" | "es" | "de";
  transparentAddShortcut: boolean;
  transparentChangeGeo: boolean;
  theme: string;
  customThemes: UserThemeV1[];
  weatherProvider: "yandex" | "google" | "wttr";
  weatherUnit: "celsius" | "fahrenheit";
  windSpeedUnit: "ms" | "kmh" | "mph";
  searchEngine: SearchEngineV1 | "default";
};

export type ShortcutTypeV1 = {
  id: number;
  type: "shortcut";
  name: string;
  url: string;
  accentColor: string;
  mutedColor: string;
  groupId?: number;
};

export type ShortcutGroupTypeV1 = {
  id: number;
  type: "group";
  name: string;
  items: Required<ShortcutTypeV1>[];
};

export type ShortcutDataV1 = ShortcutTypeV1 | ShortcutGroupTypeV1;

export type StorageDataV1 = {
  shortcuts: ShortcutDataV1[];
  weatherCity: WeatherCityV1;
  settings: SettingsDataV1;
};

export const backupV1: BackupService<1> = {
  version: 1,

  async exportBackup(zip) {
    const { isLoaded, ...data } = storage

    const iconsFolder = zip.folder(ICONS_DIR_NAME_V1);
    const icons = await getAllImages();

    const iconManifest: IconManifestV1[] = [];

    for (const icon of icons) {
      iconsFolder?.file(`${icon.id}`, icon.blob);

      iconManifest.push({
        id: icon.id,
        type: icon.blob.type,
      });
    }

    // @ts-ignore
    const backup: StorageDataV1 = data as StorageDataV1;

    zip.file(DATA_FILE_NAME_V1, JSON.stringify(backup, null, 2));

    zip.file(ICONS_FILE_NAME_V1, JSON.stringify(iconManifest, null, 2));

    return zip
  },
  async importBackup(zip) {
    return;
  },
  async migrate(zip) {
    return zip;
  },
};

export function getIconIdV1(path: string): Number | null {
  const pathParts = path.split("/");
  const fileName = pathParts[pathParts.length - 1];
  if (!fileName) return null;

  const extensionIndex = fileName.lastIndexOf(".");
  const idText =
    extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);

  return Number(idText);
}

function normalizeWeatherCity(input: unknown): WeatherCityV1 | null {
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

function parseDataBackupPayload(text: string): StorageDataV1 {
  try {
    const parsed: unknown = JSON.parse(text);

    if (!isRecord(parsed)) {
      throw new Error(INVALID_BACKUP_FILE_ERROR);
    }

    return {
      shortcuts: parsed.shortcuts,
      weatherCity: parsed.weatherCity,
      settings: parsed.settings,
    } as StorageDataV1;
  } catch {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }
}

function parseIconsBackupPayload(text: string): IconManifestV1[] {
  try {
    const parsed = JSON.parse(text) as IconManifestV1[];

    return parsed;
  } catch {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }
}

async function readBackupData(zip: JSZip): Promise<StorageDataV1> {
  const dataFile = zip.file(DATA_FILE_NAME_V1);

  if (!dataFile) {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }

  const dataText = await dataFile.async("text");
  const backupData = parseDataBackupPayload(dataText);

  return {
    ...backupData,
  };
}
