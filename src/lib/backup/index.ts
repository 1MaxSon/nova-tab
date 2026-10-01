import JSZip from "jszip";

import { downloadBlob } from "./utils";
import {
  BACKUP_FILE_NAME,
  BACKUP_MANIFEST_NAME,
  BackupManifest,
  BackupService,
  BackupVersion,
  CURRENT_BACKUP_VERSION,
  INVALID_BACKUP_FILE_ERROR,
} from "./types";
import { backupV1 } from "./versions/version-1";
import { t } from "@/lib/i18n";

const backupServices: Record<BackupVersion, BackupService<BackupVersion>> = {
  1: backupV1,
};

export async function exportBackup(): Promise<void> {
  const zip = new JSZip();

  const manifest: BackupManifest = {
    version: CURRENT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
  };

  zip.file(BACKUP_MANIFEST_NAME, JSON.stringify(manifest));

  const currentBackupService = backupServices[CURRENT_BACKUP_VERSION];

  await currentBackupService.exportBackup(zip);

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/zip",
  });

  downloadBlob(blob, BACKUP_FILE_NAME);
}

export async function importBackup(file: File): Promise<void> {
  const zip = await JSZip.loadAsync(file);

  const version = await getBackupVersion(zip);

  if (!version || !isBackupVersion(version))
    throw new Error(INVALID_BACKUP_FILE_ERROR);

  const currentBackupService = backupServices[version];

  try {
    await currentBackupService.importBackup(zip);
    window.location.reload();
  } catch {
    alert(t("settings.backupError"));
  }
}

async function getBackupVersion(zip: JSZip): Promise<number | undefined> {
  const dataFile = zip.file(BACKUP_MANIFEST_NAME);

  if (!dataFile) throw new Error(INVALID_BACKUP_FILE_ERROR);

  const dataText = await dataFile.async("text");

  const dataJson = await JSON.parse(dataText);

  if (isBackupManifest(dataJson)) {
    return dataJson.version;
  }

  return;
}

function isBackupManifest(obj: unknown): obj is BackupManifest {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "version" in obj &&
    typeof obj.version === "number" &&
    "exportedAt" in obj &&
    typeof obj.exportedAt === "string"
  );
}

function isBackupVersion(value: number): value is BackupVersion {
  return value in backupServices;
}
