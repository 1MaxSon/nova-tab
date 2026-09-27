import en from "@/locales/en.json";
import { storage } from "@/lib/storage";
import { computed, ref, watch } from "vue";
import { isDev } from "@/lib/helpers";

export const languages = ["en", "ru", "es", "de"] as const;
export type Language = (typeof languages)[number];
export type TranslationKey = keyof typeof en;

type TranslationDictionary = Partial<Record<TranslationKey, string>>;

const localeLoaders: Record<
  Exclude<Language, "en">,
  () => Promise<{ default: TranslationDictionary }>
> = {
  ru: () => import("@/locales/ru.json"),
  es: () => import("@/locales/es.json"),
  de: () => import("@/locales/de.json"),
};

export const languageOptions: Record<Language, string> = {
  en: "English",
  ru: "Русский",
  es: "Español",
  de: "Deutsch",
};

export const currentLanguage = computed(() => storage.settings.language);
const selectedTranslations = ref<TranslationDictionary>(en);

watch(
  currentLanguage,
  async (language) => {
    selectedTranslations.value = en;
    if (language === "en") return;

    try {
      const locale = await localeLoaders[language]();
      if (currentLanguage.value === language) {
        selectedTranslations.value = locale.default;
      }

      document.title = t("window.title");
    } catch (error) {
      console.error(`Failed to load the ${language} locale`, error);
    }
  },
  { immediate: true },
);

export const t = (key: TranslationKey): string => {
  const translation = selectedTranslations.value[key];
  if (!translation) {
    if (isDev) console.error("Missing translation for key: ", key);

    return en[key] ?? key;
  }

  return translation;
};
