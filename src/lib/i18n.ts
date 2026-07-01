import { useStorage } from "@/components/providers/storage-provider";
import type { Language } from "@/lib/storage";

const translations = {
  en: {
    "window.title": "New Tab",
    "common.close": "Close",
    "common.create": "Create",
    "common.save": "Save",
    "common.optional": "Optional",
    "common.notFound": "Nothing found",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.languageDescription": "Choose the interface language",
    "settings.theme": "Theme",
    "settings.themeDescription":
      "The theme changes the wallpaper and interface colors",
    "settings.uploadWallpaper": "Upload wallpaper",
    "settings.transparentAddShortcut":
      "Make the add shortcut button transparent",
    "settings.transparentChangeGeo": "Make the change geo button transparent",
    "settings.transparentDescription": "It will become visible on hover",
    "settings.backupExport": "Export",
    "settings.backupImport": "Import",
    "settings.backupDescription":
      "Backup includes settings, shortcuts, and weather city",
    "settings.backupError": "Failed to complete the operation",
    "settings.backupInvalidFile": "Invalid backup file",
    "search.placeholder": "Search...",
    "weather.selectCity": "Select city ->",
    "weather.changeAddress": "Change address",
    "weather.addressPlaceholder": "Enter an address",
    "weather.fetchingFailed": "Unknown weather",
    "weather.provider": "Weather site",
    "weather.providerDescription": "Choose where the weather widget opens",
    "weather.provider.googleQuery": "weather in",
    "weather.provider.yandex": "Yandex Weather",
    "weather.provider.google": "Google Weather",
    "weather.provider.wttr": "Wttr",
    "shortcut.createTitle": "Create a shortcut",
    "shortcut.editTitle": "Edit shortcut",
    "shortcut.url": "Url",
    "shortcut.name": "Name",
    "shortcut.bgColor": "Bg color",
    "shortcut.mutedColor": "Muted color",
    "shortcut.newIcon": "New icon",
    "shortcut.refreshIcon": "Fetch favicon again",
    "shortcut.nameDescription":
      "If it is empty, the site domain will be used. For example Example.com",
    "shortcut.colorDescription":
      "If it is empty, a color based on the icon will be used.",
    "shortcut.iconDescription": "The colors will not be changed",
    "shortcut.faviconError": "Failed to fetch favicon",
    "shortcut.group": "Group",
    "shortcut.createGroup": "Create a group",
    "shortcut.addToGroup": "Add to the group",
  },
  ru: {
    "window.title": "Новая вкладка",
    "common.close": "Закрыть",
    "common.create": "Создать",
    "common.save": "Сохранить",
    "common.optional": "Необязательно",
    "common.notFound": "Ничего не найдено",
    "settings.title": "Настройки",
    "settings.language": "Язык",
    "settings.languageDescription": "Выберите язык интерфейса",
    "settings.theme": "Тема",
    "settings.themeDescription": "Тема меняет обои и цвета интерфейса",
    "settings.uploadWallpaper": "Загрузить обои",
    "settings.transparentAddShortcut":
      "Сделать кнопку добавления ярлыка прозрачной",
    "settings.transparentChangeGeo":
      "Сделать кнопку смены геолокации прозрачной",
    "settings.transparentDescription": "Она появится при наведении",
    "settings.backupExport": "Экспортировать",
    "settings.backupImport": "Импортировать",
    "settings.backupDescription":
      "Резервная копия включает настройки, ярлыки и город погоды",
    "settings.backupError": "Не удалось выполнить операцию",
    "settings.backupInvalidFile": "Некорректный файл резервной копии",
    "search.placeholder": "Поиск...",
    "weather.selectCity": "Выберите город ->",
    "weather.changeAddress": "Изменить адрес",
    "weather.addressPlaceholder": "Введите адрес",
    "weather.fetchingFailed": "🌈",
    "weather.provider": "Сайт погоды",
    "weather.providerDescription": "Выберите, где открывается виджет погоды",
    "weather.provider.googleQuery": "Погода",
    "weather.provider.yandex": "Яндекс Погода",
    "weather.provider.google": "Google Погода",
    "weather.provider.wttr": "Wttr",
    "shortcut.createTitle": "Создать ярлык",
    "shortcut.editTitle": "Редактировать ярлык",
    "shortcut.url": "Url",
    "shortcut.name": "Название",
    "shortcut.bgColor": "Цвет фона",
    "shortcut.mutedColor": "Приглушенный цвет",
    "shortcut.newIcon": "Новая иконка",
    "shortcut.refreshIcon": "Получить фавикон заново",
    "shortcut.nameDescription":
      "Если оставить пустым, будет использован домен сайта. Например Example.com",
    "shortcut.colorDescription":
      "Если оставить пустым, цвет будет подобран по иконке.",
    "shortcut.iconDescription": "Цвета не изменятся",
    "shortcut.faviconError": "Не удалось загрузить фавикон",
    "shortcut.group": "Группа",
    "shortcut.createGroup": "Создать группу",
    "shortcut.addToGroup": "Добавить в группу",
  },
} as const satisfies Record<Language, Record<string, string>>;

export type TranslationKey = keyof (typeof translations)["en"];

export const languageOptions: Record<Language, string> = {
  en: "English",
  ru: "Русский",
};

export function useI18n() {
  const {
    storage: { settings },
  } = useStorage();

  const language = settings.language;
  const t = (key: TranslationKey) => translations[language][key];

  return { language, t };
}
