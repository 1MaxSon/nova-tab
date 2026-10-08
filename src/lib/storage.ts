import { exportBackup } from "@/lib/backup";
import {
  BACKUP_FILE_NAME,
  BackupVersion,
  CURRENT_BACKUP_VERSION,
} from "@/lib/backup/types";
import { downloadBlob } from "@/lib/backup/utils";
import { getDefaultLanguage } from "@/lib/helpers";
import { t, type Language } from "@/lib/i18n";
import type { SearchEngine } from "@/lib/search-engines";
import type { ShortcutData, WeatherCity } from "@/lib/types";
import {
  GradientWallpaperData,
  ThemeColors,
  UserTheme,
} from "@/lib/types/theme";
import { getDefaultWeatherProvider } from "@/lib/utils/weather";
import { isEqual } from "lodash-es";
import { reactive, toRaw, watch } from "vue";

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
  backupVersion: BackupVersion;
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
  backupVersion: CURRENT_BACKUP_VERSION,
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

    const backupVersion = normalizeBackupVersion(data.backupVersion);

    if (!backupVersion) {
      await chrome.storage.local.set({
        backupVersion: 1,
      });
    } else {
      storage.backupVersion = backupVersion;
      await chrome.storage.local.set({
        backupVersion: CURRENT_BACKUP_VERSION,
      });
    }

    if (backupVersion !== CURRENT_BACKUP_VERSION) {
      const backup = await exportBackup(backupVersion);

      const backupBlob = await backup.generateAsync({
        type: "blob",
        mimeType: "application/zip",
      });
      downloadBlob(backupBlob, BACKUP_FILE_NAME);
      alert(t("backup.outdated"));
    }

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
        backupVersion: newState.backupVersion,
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
    const next = normalizeShortcutData(changes.shortcuts.newValue);
    if (!isEqual(next, toRaw(storage.shortcuts))) storage.shortcuts = next;
  }
  if (changes.settings) {
    const next = normalizeSettingsData(changes.settings.newValue);
    if (!isEqual(next, toRaw(storage.settings))) storage.settings = next;
  }
  if (changes.weatherCity) {
    const next = normalizeWeatherCity(changes.weatherCity.newValue);
    if (!isEqual(next, toRaw(storage.weatherCity))) storage.weatherCity = next;
  }
  if (changes.backupVersion) {
    const next = normalizeBackupVersion(changes.backupVersion) ?? 1;
    if (!isEqual(next, toRaw(storage.backupVersion)))
      changes.backupVersion = next as any;
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

  if (raw.wallpaperType === "photo" && typeof raw.wallpaper?.id === "string") {
    return {
      id: raw.id,
      name: raw.name,
      wallpaperType: "photo",
      wallpaper: { id: raw.wallpaper.id, blurValue: raw.wallpaper.blurValue },
      colors: raw.colors,
    };
  }
  if (
    raw.wallpaperType === "gradient" &&
    isGradientWallpaperData(raw.gradientLayers)
  ) {
    return {
      id: raw.id,
      name: raw.name,
      wallpaperType: "gradient",
      gradientLayers: raw.gradientLayers,
      colors: raw.colors,
    };
  }

  return null;
}

function normalizeBackupVersion(input: unknown): BackupVersion | undefined {
  if (!input || typeof input !== "number") return;

  return input as BackupVersion;
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
