import JSZip from "jszip";

import {
  BACKUP_MANIFEST_FILE_NAME,
  BackupManifest,
  BackupService,
  BackupVersion,
  CURRENT_BACKUP_VERSION,
  INVALID_BACKUP_FILE_ERROR,
} from "./types";

import { backupV1 } from "@/lib/backup/versions/version-1";
import { backupV2 } from "@/lib/backup/versions/version-2";
import { t } from "@/lib/i18n";

const backupServices: Record<BackupVersion, BackupService<BackupVersion>> = {
  1: backupV1,
  2: backupV2,
};

const currentBackupService = backupServices[CURRENT_BACKUP_VERSION];

export async function exportBackup(
  version: BackupVersion = CURRENT_BACKUP_VERSION,
  customData?: any,
): Promise<JSZip> {
  const zip = new JSZip();

  const manifest: BackupManifest = {
    version: version,
    exportedAt: new Date().toISOString(),
  };

  zip.file(BACKUP_MANIFEST_FILE_NAME, JSON.stringify(manifest));

  const backupService = backupServices[version];

  return await backupService.exportBackup(zip, customData);
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
  } catch (e) {
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
