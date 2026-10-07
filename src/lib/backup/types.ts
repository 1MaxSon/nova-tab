import JSZip from "jszip";

export const BACKUP_FILE_NAME = "nova-tab-backup.zip";
export const BACKUP_MANIFEST_NAME = "manifest.json";
export const INVALID_BACKUP_FILE_ERROR = "INVALID_BACKUP_FILE";

// 1 | 2 | 3
export type BackupVersion = 1 | 2;

export const CURRENT_BACKUP_VERSION: BackupVersion = 2;

export type BackupManifest = {
  version: number;
  exportedAt: string;
};

export type BackupService<Version extends BackupVersion> = {
  version: Version;

  exportBackup: (zip: JSZip) => Promise<JSZip>;
  importBackup: (zip: JSZip) => Promise<void>;
  migrate?: (zip: JSZip) => Promise<JSZip>;
};
