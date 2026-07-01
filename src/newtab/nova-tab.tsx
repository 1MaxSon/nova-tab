import { lazy, Suspense, useEffect } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import { Spinner } from "@/components/ui/spinner";
import { THEMES } from "@/lib/constants";
import Clock from "@/newtab/components/clock";
import DateWithWeather from "@/newtab/components/date-with-weather";
import SearchBar from "@/newtab/components/search-bar";
import Shortcuts from "@/newtab/components/shortcuts";
import { useI18n } from "@/lib/i18n";

const SettingsDrawer = lazy(
  () => import("@/newtab/components/settings-drawer"),
);

export default function NovaTab() {
  const {
    customWallpaperUrl,
    storage: { settings, wallpaper },
  } = useStorage();

  const { t, language } = useI18n();

  const selectedTheme =
    THEMES.find((theme) => theme.id === settings.theme) ?? THEMES[0];

  const backgroundImage =
    wallpaper.type === "custom" && customWallpaperUrl
      ? `${selectedTheme.customWallpaperOverlay}, url("${customWallpaperUrl}")`
      : selectedTheme.wallpaper;

  useEffect(() => {
    document.title = t("window.title");
  }, [language]);

  return (
    <>
      <div
        className="fixed inset-0 z-0 nova-gradient"
        style={{
          backgroundImage,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="nova-bg-grain z-0" />

      <main className="relative flex flex-col items-center justify-center px-12 py-6">
        <div className="flex flex-col items-center">
          <Clock className="mb-3 animate-in fade-in duration-300" />
          <DateWithWeather className="mb-10 animate-in fade-in duration-300 flex-col md:flex-row" />
        </div>

        <SearchBar className="max-w-135 mb-10 animate-in fade-in duration-300" />

        <Shortcuts className="w-full fade-in animate-in duration-500" />

        <Suspense fallback={<Spinner className="absolute top-4 right-4" />}>
          <SettingsDrawer />
        </Suspense>
      </main>
    </>
  );
}
