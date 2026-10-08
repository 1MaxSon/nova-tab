import JSZip from "jszip";

import { downloadBlob } from "./utils";
import {
  BACKUP_FILE_NAME,
  BACKUP_MANIFEST_FILE_NAME,
  BackupManifest,
  BackupService,
  BackupVersion,
  CURRENT_BACKUP_VERSION,
  INVALID_BACKUP_FILE_ERROR,
} from "./types";

import { t } from "@/lib/i18n";
import { backupV1 } from "@/lib/backup/versions/version-1";
import { backupV2 } from "@/lib/backup/versions/version-2";

const backupServices: Record<BackupVersion, BackupService<BackupVersion>> = {
  1: backupV1,
  2: backupV2,
};

const currentBackupService = backupServices[CURRENT_BACKUP_VERSION];

export async function exportBackup(): Promise<void> {
  const zip = new JSZip();

  const manifest: BackupManifest = {
    version: CURRENT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
  };

  zip.file(BACKUP_MANIFEST_FILE_NAME, JSON.stringify(manifest));

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

  let importingBackup = zip;

  try {
    if (version !== CURRENT_BACKUP_VERSION) {
      importingBackup = await migrateBackup(zip, version);
    }

    await currentBackupService.importBackup(importingBackup);
    // window.location.reload();
  } catch {
    alert(t("settings.backupError"));
  }
}

async function getBackupVersion(zip: JSZip): Promise<number | undefined> {
  const dataFile = zip.file(BACKUP_MANIFEST_FILE_NAME);

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

async function migrateBackup(zip: JSZip, backupVersion: BackupVersion) {
  let migratedBackupVersion = backupVersion;
  let migratedBackup: JSZip = zip;

  while (migratedBackupVersion !== CURRENT_BACKUP_VERSION) {
    const nextVersionBackupService =
      backupServices[(migratedBackupVersion + 1) as BackupVersion];

    migratedBackup = await nextVersionBackupService.migrate(migratedBackup);

    migratedBackupVersion++;
  }

  return migratedBackup;
}
