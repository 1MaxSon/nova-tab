import { IDBPDatabase, openDB } from "idb";

const IMG_DB_NAME = "ImgCacheDB";
const IMG_STORE_NAME = "imgs";

export type SavedImage = {
  id: string;
  blob: Blob;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(IMG_DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(IMG_STORE_NAME)) {
          db.createObjectStore(IMG_STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

export const getAllImages = async () => {
  const db = await getDB();
  const icons = await db.getAll(IMG_STORE_NAME);

  return icons;
};

export const saveImage = async (data: SavedImage) => {
  const { id, blob } = data;

  const db = await getDB();
  await db.put(IMG_STORE_NAME, { id, blob, type: blob.type }, id);
};

export const deleteImage = async (id: string) => {
  const db = await getDB();

  await db.delete(IMG_STORE_NAME, id);
};

export const getImageById = async (id: string): Promise<SavedImage | null> => {
  const db = await getDB();
  const image = await db.get(IMG_STORE_NAME, id);

  if (!image) {
    return null;
  }

  return { id: image.id, blob: image.blob };
};

