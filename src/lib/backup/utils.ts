import { INVALID_BACKUP_FILE_ERROR } from "@/lib/backup/types";
import JSZip from "jszip";

export const downloadBlob = (blob: Blob, fileName: string) => {
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

export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object";
};

export function getFileOrError(zip: JSZip, fileName: string) {
  const file = zip.file(fileName);

  if (!file) {
    throw new Error(INVALID_BACKUP_FILE_ERROR);
  }

  return file;
}
