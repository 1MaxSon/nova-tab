/**
 * @deprecated
 */

// import JSZip from "jszip";

// import {
//   normalizeSettingsData,
//   normalizeShortcutData,
//   storage,
// } from "@/lib/storage";
import { BackupService } from "../types";
// import { isRecord } from "../utils";
// import { getAllImages, saveImage } from "@/lib/utils/img-idb";
// import type { Latitude, Longitude } from "@/lib/types/open-meteo";

// const DATA_FILE_NAME = "data.json";
// const ICONS_FILE_NAME = "icons.json";
// const ICONS_DIR_NAME = "icons";

// type IconManifestV1 = {
//   id: number;
//   type: string;
// };

// type WeatherCityV1 = { name: string; lat: Latitude; lon: Longitude };

// type BackupDataV1 = {
//   shortcuts: unknown;
//   weatherCity: unknown;
//   settings: unknown;
//   icons: IconManifestV1[];
// };

export const backupV1: BackupService<1> = {
  version: 1,

  async exportBackup(zip) {
    return zip;
  },
  async importBackup(zip) {
    return;
  },
};

// function normalizeWeatherCity(input: unknown): WeatherCityV1 | null {
//   if (input === null || input === undefined) return null;
//   if (!isRecord(input)) return null;

//   const { name, lat, lon } = input;
//   if (
//     typeof name !== "string" ||
//     typeof lat !== "number" ||
//     typeof lon !== "number"
//   ) {
//     return null;
//   }

//   return { name, lat, lon };
// }

// function parseDataBackupPayload(text: string): Omit<BackupDataV1, "icons"> {
//   try {
//     const parsed: unknown = JSON.parse(text);

//     if (!isRecord(parsed)) {
//       throw new Error(INVALID_BACKUP_FILE_ERROR);
//     }

//     return {
//       shortcuts: parsed.shortcuts,
//       weatherCity: parsed.weatherCity,
//       settings: parsed.settings,
//     };
//   } catch {
//     throw new Error(INVALID_BACKUP_FILE_ERROR);
//   }
// }

// function parseIconsBackupPayload(text: string): Pick<BackupDataV1, "icons"> {
//   try {
//     const parsed = JSON.parse(text) as IconManifestV1[];

//     return {
//       icons: parsed,
//     };
//   } catch {
//     throw new Error(INVALID_BACKUP_FILE_ERROR);
//   }
// }

// async function readBackupData(
//   zip: JSZip,
// ): Promise<Omit<BackupDataV1, "icons">> {
//   const dataFile = zip.file(DATA_FILE_NAME);

//   if (!dataFile) {
//     throw new Error(INVALID_BACKUP_FILE_ERROR);
//   }

//   const dataText = await dataFile.async("text");
//   const backupData = parseDataBackupPayload(dataText);

//   return {
//     ...backupData,
//   };
// }

// function getIconId(path: string): number | null {
//   const pathParts = path.split("/");
//   const fileName = pathParts[pathParts.length - 1];
//   if (!fileName) return null;

//   const extensionIndex = fileName.lastIndexOf(".");
//   const idText =
//     extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);
//   const id = Number(idText);

//   return Number.isInteger(id) ? id : null;
// }

// async function restoreIcons(zip: JSZip) {
//   const iconsFile = zip.file(ICONS_FILE_NAME);

//   if (!iconsFile) {
//     throw new Error(INVALID_BACKUP_FILE_ERROR);
//   }

//   const iconsText = await iconsFile.async("text");
//   const iconsFolder = zip.folder(ICONS_DIR_NAME);

//   const iconsData = parseIconsBackupPayload(iconsText);

//   if (!iconsFolder) return;

//   const restoreTasks: Promise<void>[] = [];

//   iconsFolder.forEach((relativePath, iconFile) => {
//     if (iconFile.dir) return;

//     const id = getIconId(relativePath);

//     if (id === null) return;

//     restoreTasks.push(
//       iconFile.async("arraybuffer").then((buffer) => {
//         const iconData = iconsData.icons.filter((p) => p.id === id).pop();
//         if (!iconData) return;

//         const resolvedBlob = new Blob([buffer], { type: iconData.type });

//         return saveImage({ id, blob: resolvedBlob });
//       }),
//     );
//   });

//   await Promise.all(restoreTasks);
// }
