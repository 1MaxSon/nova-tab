import JSZip from "jszip";

import {
  BACKUP_MANIFEST_FILE_NAME,
  BackupManifest,
  BackupService,
  INVALID_BACKUP_FILE_ERROR,
} from "@/lib/backup/types";
import { getFileOrError, isRecord } from "@/lib/backup/utils";
import {
  getIconIdV1,
  GradientLayerV1,
  IconManifestV1,
  ICONS_FILE_NAME_V1,
  SettingsDataV1,
  ShortcutTypeV1,
  StorageDataV1,
  WeatherCityV1,
} from "@/lib/backup/versions/version-1";
import { t, type Language } from "@/lib/i18n";
import type { SearchEngine } from "@/lib/search-engines";
import {
  normalizeSettingsData,
  normalizeShortcutData,
  storage,
} from "@/lib/storage";
import { UserTheme } from "@/lib/types/theme";
import { getAllImages, saveImage } from "@/lib/utils/img-idb";

export const DATA_FILE_NAME_V2 = "data.json";
const IMAGES_FILE_NAME_V2 = "images.json";
const IMAGES_DIR_NAME_V2 = "images";

type ImageManifestV2 = {
  id: string;
  type: string;
};

export type SavedImageV2 = {
  id: string;
  blob: Blob;
};

export type ShortcutTypeV2 = {
  id: string;
  type: "shortcut";
  name: string;
  url: string;
  accentColor: string;
  mutedColor: string;
  iconId: string;
  groupId?: string;
};

export type ShortcutGroupTypeV2 = {
  id: string;
  type: "group";
  name: string;
  items: Required<ShortcutTypeV2>[];
};

export type ShortcutDataV2 = ShortcutTypeV2 | ShortcutGroupTypeV2;

export type ThemeColorsV2 = Record<string, string>;

export type GradientWallpaperDataV2 = GradientLayerV1[];

export type UserThemePhotoV2 = {
  wallpaperType: "photo";
  wallpaper: {
    id: string;
    blurValue: number;
  };
};

export type UserThemeGradientV2 = {
  wallpaperType: "gradient";
  gradientLayers: GradientWallpaperDataV2;
};

export type UserThemeV2 = {
  id: string;
  name: string;
  colors: ThemeColorsV2;
} & (UserThemePhotoV2 | UserThemeGradientV2);

export type SettingsDataV2 = {
  language: Language;
  transparentAddShortcut: boolean;
  transparentChangeGeo: boolean;
  theme: string;
  customThemes: UserTheme[];
  weatherProvider: SettingsDataV1["weatherProvider"];
  weatherUnit: "celsius" | "fahrenheit";
  windSpeedUnit: "ms" | "kmh" | "mph";
  searchEngine: SearchEngine | "default";
};

export type StorageDataV2 = {
  shortcuts: ShortcutDataV2[];
  weatherCity: WeatherCityV1 | null;
  settings: SettingsDataV2;
};

export const backupV2: BackupService<2> = {
  version: 2,

  async exportBackup(zip) {
    const { isLoaded, ...data } = storage;

    const iconsFolder = zip.folder(IMAGES_DIR_NAME_V2);
    const icons = await getAllImages();

    const iconManifest: ImageManifestV2[] = [];

    for (const icon of icons) {
      iconsFolder?.file(`${icon.id}`, icon.blob);

      iconManifest.push({
        id: icon.id,
        type: icon.blob.type,
      });
    }

    const backup: StorageDataV2 = data;

    zip.file(DATA_FILE_NAME_V2, JSON.stringify(backup, null, 2));

    zip.file(IMAGES_FILE_NAME_V2, JSON.stringify(iconManifest, null, 2));

    return zip;
  },
  async importBackup(zip) {
    console.log(zip);
    const payload = await readBackupData(zip);

    const shortcuts = normalizeShortcutData(payload.shortcuts);
    const weatherCity = normalizeWeatherCity(payload.weatherCity);
    const settings = normalizeSettingsData(payload.settings);

    await restoreImages(zip);
    storage.settings = settings;
    storage.shortcuts = shortcuts;
    storage.weatherCity = weatherCity;
  },

  async migrate(zip) {
    try {
      const migratedZip = await migrateStorage(zip);
      if (!migratedZip) throw new Error();

      return migratedZip;
    } catch {
      alert(t("settings.backupError"));
    }

    return zip;
  },
};

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

function parseDataBackupPayload(text: string): StorageDataV2 {
  try {
    const parsed: unknown = JSON.parse(text);

    if (!isRecord(parsed)) {
      throw new Error(INVALID_BACKUP_FILE_ERROR);
    }

    return {
      shortcuts: parsed.shortcuts as ShortcutDataV2[],
      weatherCity: parsed.weatherCity as WeatherCityV1,
      settings: parsed.settings as SettingsDataV2,
    };
  } catch {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }
}

function parseImagesBackupPayload(text: string): ImageManifestV2[] {
  try {
    const parsed = JSON.parse(text) as ImageManifestV2[];

    return parsed;
  } catch {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }
}

async function readBackupData(zip: JSZip): Promise<StorageDataV2> {
  const dataFile = zip.file(DATA_FILE_NAME_V2);

  if (!dataFile) {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }

  const dataText = await dataFile.async("text");
  const backupData = parseDataBackupPayload(dataText);

  return {
    ...backupData,
  };
}

function getImageId(path: string): string | null {
  const pathParts = path.split("/");
  const fileName = pathParts[pathParts.length - 1];
  if (!fileName) return null;

  const extensionIndex = fileName.lastIndexOf(".");
  const idText =
    extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);

  return idText;
}

async function restoreImages(zip: JSZip) {
  const iconsFile = zip.file(IMAGES_FILE_NAME_V2);

  if (!iconsFile) {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }

  const iconsText = await iconsFile.async("text");
  const iconsFolder = zip.folder(IMAGES_DIR_NAME_V2);

  const iconsData = parseImagesBackupPayload(iconsText);

  if (!iconsFolder) return;

  const restoreTasks: Promise<void>[] = [];

  iconsFolder.forEach((relativePath, iconFile) => {
    if (iconFile.dir) return;

    const id = getImageId(relativePath);

    if (id === null) return;

    restoreTasks.push(
      iconFile.async("arraybuffer").then((buffer) => {
        const iconData = iconsData.filter((p) => p.id === id).pop();
        if (!iconData) return;

        const resolvedBlob = new Blob([buffer], { type: iconData.type });

        return saveImage({ id, blob: resolvedBlob });
      }),
    );
  });

  await Promise.all(restoreTasks);
}

// MIGRATION
async function migrateStorage(zip: JSZip) {
  const iconsFile = getFileOrError(zip, ICONS_FILE_NAME_V1);
  const dataFile = getFileOrError(zip, DATA_FILE_NAME_V2);

  const iconsRaw = JSON.parse(await iconsFile.async("text"));
  const storageDataV1 = JSON.parse(await dataFile.async("text"));

  const iconsV1 = Array.isArray(iconsRaw) ? iconsRaw.filter(isIconV1) : [];

  if (!isStorageDataV1(storageDataV1))
    throw new Error(INVALID_BACKUP_FILE_ERROR);

  const migratedCustomThemes: UserThemeV2[] = [];

  for (const oldTheme of storageDataV1.settings.customThemes) {
    switch (oldTheme.wallpaperType) {
      case "gradient": {
        migratedCustomThemes.push({
          ...oldTheme,
          wallpaperType: "gradient",
          gradientLayers: oldTheme.wallpaperData,
        });
        break;
      }
      case "photo": {
        const res = await fetch(oldTheme.wallpaperData);
        const blob = await res.blob();
        const wallpaperId = crypto.randomUUID();

        saveImage({
          id: wallpaperId,
          blob,
        });

        migratedCustomThemes.push({
          ...oldTheme,
          wallpaperType: "photo",
          wallpaper: {
            id: wallpaperId,
            blurValue: 0,
          },
        });
        break;
      }
      default: {
        break;
      }
    }
  }

  const storageDataV2: StorageDataV2 = {
    shortcuts: [],
    settings: { ...storageDataV1.settings, customThemes: migratedCustomThemes },
    weatherCity: storageDataV1.weatherCity as WeatherCityV1,
  };

  // oldIconId, newIconId
  const changedIcons: Record<number, string> = {};

  const shortcutsV2: ShortcutDataV2[] = [];

  const migrateShortcut = (oldShortcut: ShortcutTypeV1) => {
    const newShortcutId = crypto.randomUUID();

    const shortcutIcon = iconsV1.find((p) => p.id === oldShortcut.id);

    if (!shortcutIcon) return;

    const newIconId = crypto.randomUUID();
    changedIcons[shortcutIcon.id] = newIconId;

    return {
      ...oldShortcut,
      id: newShortcutId,
      iconId: newIconId,
      groupId: undefined,
    };
  };

  storageDataV1.shortcuts.forEach((oldShortcut) => {
    if (oldShortcut.type === "shortcut") {
      const migratedShortcut = migrateShortcut(oldShortcut);

      if (migratedShortcut) shortcutsV2.push(migratedShortcut);
    }

    if (oldShortcut.type === "group") {
      const newShortcutGroupId = crypto.randomUUID();
      const migratedItems: ShortcutGroupTypeV2["items"] = [];

      oldShortcut.items.forEach((s) => {
        const migratedShortcut = migrateShortcut(s);

        if (migratedShortcut)
          migratedItems.push({
            ...migratedShortcut,
            groupId: newShortcutGroupId,
          });
      });

      shortcutsV2.push({
        ...oldShortcut,
        id: newShortcutGroupId,
        items: migratedItems,
      });
    }
  });

  storageDataV2.shortcuts = shortcutsV2;

  const iconsFolder = zip.folder(ICONS_FILE_NAME_V1);

  if (!iconsFolder) return;

  const migrateTasks: Promise<void>[] = [];
  // newImageId, Blob
  const resolvedImgsBlob: Record<string, Blob> = {};

  Object.entries(iconsFolder.files).forEach(([relativePath, iconFile]) => {
    if (iconFile.dir) return;

    const oldIconId = getIconIdV1(relativePath);

    if (oldIconId === null) return;

    const newIconId = changedIcons[oldIconId.valueOf()];

    migrateTasks.push(
      iconFile.async("arraybuffer").then((buffer) => {
        const iconData = iconsV1
          .filter((p) => p.id === oldIconId.valueOf())
          .pop();
        console.log(iconData);

        if (!iconData) return;

        const resolvedBlob = new Blob([buffer], { type: iconData.type });

        resolvedImgsBlob[newIconId] = resolvedBlob;
      }),
    );
  });

  await Promise.all(migrateTasks);

  // migrated zip
  const migratedZip = new JSZip();

  const manifestV2: BackupManifest = {
    version: 2,
    exportedAt: new Date().toISOString(),
  };

  migratedZip.file(DATA_FILE_NAME_V2, JSON.stringify(storageDataV2));
  migratedZip.file(BACKUP_MANIFEST_FILE_NAME, JSON.stringify(manifestV2));

  const imagesDir = migratedZip.folder(IMAGES_DIR_NAME_V2);

  if (!imagesDir) throw new Error(INVALID_BACKUP_FILE_ERROR);

  const imagesManifest: ImageManifestV2[] = Object.entries(
    resolvedImgsBlob,
  ).map(([imgId, imgBlob]) => {
    imagesDir.file(imgId, imgBlob);

    return {
      id: imgId,
      type: imgBlob.type,
    };
  });

  migratedZip.file(IMAGES_FILE_NAME_V2, JSON.stringify(imagesManifest));
  return migratedZip;
}

function isIconV1(obj: unknown): obj is IconManifestV1 {
  return (
    typeof obj === "object" &&
    !!obj &&
    "id" in obj &&
    typeof obj.id === "number" &&
    "type" in obj &&
    typeof obj.type === "string"
  );
}

function isStorageDataV1(obj: unknown): obj is StorageDataV1 {
  return (
    !!obj &&
    typeof obj === "object" &&
    "weatherCity" in obj &&
    typeof obj.weatherCity === "object" &&
    "shortcuts" in obj &&
    Array.isArray(obj.shortcuts) &&
    "settings" in obj &&
    typeof obj.settings === "object"
  );
}
