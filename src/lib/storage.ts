import { getDefaultLanguage, getDefaultWeatherProvider } from "@/lib/helpers";
import type { Language } from "@/lib/i18n";
import type { SearchEngine } from "@/lib/search-engines";
import type {
  GradientWallpaperData,
  ShortcutData,
  ThemeColors,
  UserTheme,
  WeatherCity,
} from "@/lib/types";
import { IDBPDatabase, openDB } from "idb";
import { reactive, watch } from "vue";

export type WeatherProvider = "yandex" | "google" | "wttr";

export type SettingsData = {
  language: Language;
  transparentAddShortcut: boolean;
  transparentChangeGeo: boolean;
  theme: string;
  customThemes: UserTheme[];
  weatherProvider: WeatherProvider;
  weatherUnit: "celsius" | "fahrenheit";
  windSpeedUnit: "ms" | "kmh" | "mph";
  searchEngine: SearchEngine | "default";
};

export type StorageData = {
  shortcuts: ShortcutData[];
  weatherCity: WeatherCity | null;
  settings: SettingsData;
  isLoaded: boolean;
};

export const DEFAULT_STORAGE_DATA: Omit<StorageData, "isLoaded"> = {
  shortcuts: [],
  weatherCity: null,
  settings: {
    language: getDefaultLanguage(),
    transparentAddShortcut: false,
    transparentChangeGeo: false,
    theme: "nova",
    customThemes: [],
    weatherProvider: getDefaultWeatherProvider(),
    weatherUnit: "celsius",
    windSpeedUnit: "ms",
    searchEngine: "default",
  },
};

export const storage = reactive<StorageData>({
  ...DEFAULT_STORAGE_DATA,
  isLoaded: false,
});

let isSelfUpdating = false;

async function loadData() {
  try {
    const data = await chrome.storage.local.get(
      Object.keys(DEFAULT_STORAGE_DATA),
    );

    if ("settings" in data) {
      storage.settings = normalizeSettingsData(data.settings);
    }
    if ("shortcuts" in data) {
      storage.shortcuts = normalizeShortcutData(data.shortcuts);
    }
    if ("weatherCity" in data) {
      storage.weatherCity = normalizeWeatherCity(data.weatherCity);
    }
  } catch (error) {
    console.error("Failed to load data from chrome.storage", error);
  } finally {
    storage.isLoaded = true;
  }
}

await loadData();

watch(
  () => storage,
  async (newState) => {
    if (!newState.isLoaded || isSelfUpdating) return;

    try {
      await chrome.storage.local.set({
        shortcuts: JSON.parse(JSON.stringify(newState.shortcuts)),
        settings: JSON.parse(JSON.stringify(newState.settings)),
        weatherCity: JSON.parse(JSON.stringify(newState.weatherCity)),
      });
    } catch (e) {
      console.error("Error saving to chrome.storage:", e);
    }
  },
  { deep: true },
);

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  isSelfUpdating = true;

  if (changes.shortcuts) {
    storage.shortcuts = normalizeShortcutData(changes.shortcuts.newValue);
  }
  if (changes.settings) {
    storage.settings = normalizeSettingsData(changes.settings.newValue);
  }
  if (changes.weatherCity) {
    storage.weatherCity = normalizeWeatherCity(changes.weatherCity.newValue);
  }

  setTimeout(() => {
    isSelfUpdating = false;
  }, 0);
});

export function normalizeSettingsData(input: unknown): SettingsData {
  if (!input || typeof input !== "object") return DEFAULT_STORAGE_DATA.settings;
  const raw = input as Partial<SettingsData>;
  const language = (["en", "ru", "es", "de"] as const).includes(
    raw.language as Language,
  )
    ? (raw.language as Language)
    : "en";
  const weatherProvider =
    raw.weatherProvider === "yandex" ||
    raw.weatherProvider === "google" ||
    raw.weatherProvider === "wttr"
      ? raw.weatherProvider
      : getDefaultWeatherProvider(language);

  const customThemes = Array.isArray(raw.customThemes)
    ? raw.customThemes
        .map(normalizeUserTheme)
        .filter((theme): theme is UserTheme => theme !== null)
    : [];

  return {
    ...DEFAULT_STORAGE_DATA.settings,
    ...raw,
    customThemes,
    language,
    weatherProvider,
  };
}

function normalizeUserTheme(input: unknown): UserTheme | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<UserTheme> & { wallpaper?: unknown };

  if (
    typeof raw.id !== "string" ||
    typeof raw.name !== "string" ||
    !isThemeColors(raw.colors)
  ) {
    return null;
  }

  if (raw.wallpaperType === "photo" && typeof raw.wallpaperData === "string") {
    return {
      id: raw.id,
      name: raw.name,
      wallpaperType: "photo",
      wallpaperData: raw.wallpaperData,
      colors: raw.colors,
    };
  }
  if (
    raw.wallpaperType === "gradient" &&
    isGradientWallpaperData(raw.wallpaperData)
  ) {
    return {
      id: raw.id,
      name: raw.name,
      wallpaperType: "gradient",
      wallpaperData: raw.wallpaperData,
      colors: raw.colors,
    };
  }

  return null;
}

function isThemeColors(input: unknown): input is ThemeColors {
  return Boolean(input) && typeof input === "object";
}

function isGradientWallpaperData(
  input: unknown,
): input is GradientWallpaperData {
  return Array.isArray(input);
}

export function normalizeShortcutData(input: unknown): ShortcutData[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item): ShortcutData | null => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      if (raw.type === "group" || Array.isArray(raw.items)) {
        return { ...raw, type: "group" } as ShortcutData;
      }

      return { ...raw, type: "shortcut" } as ShortcutData;
    })
    .filter(Boolean) as ShortcutData[];
}

export function normalizeWeatherCity(
  input: unknown,
): StorageData["weatherCity"] {
  return isWeatherCity(input) ? input : DEFAULT_STORAGE_DATA.weatherCity;
}

function isWeatherCity(obj: any): obj is WeatherCity {
  return (
    obj &&
    typeof obj === "object" &&
    "name" in obj &&
    typeof obj.name === "string" &&
    "lat" in obj &&
    typeof obj.lat === "number" &&
    "lon" in obj &&
    typeof obj.lon === "number"
  );
}

const ICONS_DB_NAME = "IconCacheDB";
const ICONS_STORE_NAME = "icons";

export type SavedIcon = {
  id: number;
  blob: Blob;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(ICONS_DB_NAME, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(ICONS_STORE_NAME)) {
          db.createObjectStore(ICONS_STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

export const getIcons = async () => {
  const db = await getDB();
  const icons = await db.getAll(ICONS_STORE_NAME);

  return icons.filter((p): p is SavedIcon => {
    return (
      "id" in p &&
      typeof p.id === "number" &&
      "blob" in p &&
      p.blob instanceof Blob
    );
  });
};

export const saveIcon = async (data: SavedIcon) => {
  const { id, blob } = data;

  const db = await getDB();
  await db.put(ICONS_STORE_NAME, { id, blob, type: blob.type }, id);
};

export const deleteIcon = async (id: number) => {
  const db = await getDB();

  db.delete(ICONS_STORE_NAME, id);
};

export const getIconById = async (id: number): Promise<SavedIcon | null> => {
  const db = await getDB();
  return await db.get(ICONS_STORE_NAME, id);
};
