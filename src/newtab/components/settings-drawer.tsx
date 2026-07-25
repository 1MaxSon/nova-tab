import {
  CheckIcon,
  CloudSunIcon,
  LanguagesIcon,
  MapPinIcon,
  PaletteIcon,
  PlusIcon,
  SettingsIcon,
  UploadIcon,
} from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import pkg from "@/../package.json";
import { useStorage } from "@/components/providers/storage-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { THEMES } from "@/lib/constants";
import { languageOptions, useI18n } from "@/lib/i18n";
import type { Language, SettingsData, WeatherProvider } from "@/lib/storage";
import { saveCustomWallpaper } from "@/lib/storage";
import BackupSection from "@/newtab/components/backup-section";

const weatherProviderOptions = [
  "yandex",
  "google",
  "wttr",
] as const satisfies WeatherProvider[];

const SettingsDrawer = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();
  const {
    setWallpaper,
    setSettings,
    storage: { settings, wallpaper },
  } = useStorage();

  const setSetting = <K extends keyof SettingsData>(
    key: K,
    value: SettingsData[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCustomWallpaper = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await saveCustomWallpaper(file);
    setWallpaper({
      type: "custom",
      updatedAt: Date.now(),
    });
    event.target.value = "";
  };

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-60 hover:opacity-100"
        >
          <SettingsIcon />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="flex items-center justify-between">
            {t("settings.title")}{" "}
            <span className="text-muted-foreground text-sm">
              v{pkg.version}
            </span>
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-4">
          <FieldGroup>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="language">
                  <LanguagesIcon className="size-4" /> {t("settings.language")}
                </FieldLabel>
                <select
                  id="language"
                  name="language"
                  value={settings.language}
                  onChange={(event) => {
                    setSetting("language", event.target.value as Language);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {Object.entries(languageOptions).map(([langKey, lang]) => (
                    <option key={langKey} value={langKey}>
                      {lang}
                    </option>
                  ))}
                </select>
              </FieldContent>
              <FieldDescription>
                {t("settings.languageDescription")}
              </FieldDescription>
            </Field>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="weatherProvider">
                  <CloudSunIcon className="size-4" /> {t("weather.provider")}
                </FieldLabel>
                <select
                  id="weatherProvider"
                  name="weatherProvider"
                  value={settings.weatherProvider}
                  onChange={(event) => {
                    setSetting(
                      "weatherProvider",
                      event.target.value as WeatherProvider,
                    );
                  }}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {weatherProviderOptions.map((provider) => (
                    <option key={provider} value={provider}>
                      {t(`weather.provider.${provider}`)}
                    </option>
                  ))}
                </select>
              </FieldContent>
              <FieldDescription>
                {t("weather.providerDescription")}
              </FieldDescription>
            </Field>
            <FieldSet>
              <FieldLegend>{t("settings.units.title")}</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel
                    className="text-muted-foreground"
                    htmlFor="units-temp"
                  >
                    {t("settings.units.temp")}
                  </FieldLabel>
                  <ToggleGroup
                    size="lg"
                    className="w-full"
                    variant="outline"
                    spacing={0}
                    value={[settings.weatherUnit]}
                    onValueChange={(value) => {
                      const unit = value[0];
                      if (unit === "celsius" || unit === "fahrenheit") {
                        setSetting("weatherUnit", unit);
                      }
                    }}
                    id="units-temp"
                  >
                    <ToggleGroupItem value="celsius" className="flex-1/2">
                      °C
                    </ToggleGroupItem>
                    <ToggleGroupItem value="fahrenheit" className="flex-1/2">
                      °F
                    </ToggleGroupItem>
                  </ToggleGroup>
                </Field>
                <Field>
                  <FieldLabel
                    className="text-muted-foreground"
                    htmlFor="units-wind"
                  >
                    {t("settings.units.wind")}
                  </FieldLabel>
                  <ToggleGroup
                    size="lg"
                    className="w-full"
                    variant="outline"
                    spacing={0}
                    value={[settings.windSpeedUnit]}
                    onValueChange={(value) => {
                      const unit = value[0] as SettingsData["windSpeedUnit"];
                      const acceptUnits = ["ms", "kmh", "mph"];

                      if (acceptUnits.includes(unit)) {
                        setSetting("windSpeedUnit", unit);
                      }
                    }}
                    id="units-wind"
                  >
                    <ToggleGroupItem value="ms" className="flex-1/3">
                      {t("settings.units.ms")}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="kmh" className="flex-1/3">
                      {t("settings.units.kmh")}
                    </ToggleGroupItem>
                    <ToggleGroupItem value="mph" className="flex-1/3">
                      {t("settings.units.mph")}
                    </ToggleGroupItem>
                  </ToggleGroup>
                </Field>
              </FieldGroup>
            </FieldSet>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="theme">
                  <PaletteIcon className="size-4" /> {t("settings.theme")}
                </FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map((theme) => {
                    const selected = settings.theme === theme.id;

                    return (
                      <button
                        type="button"
                        key={theme.id}
                        className="group relative aspect-video overflow-hidden rounded-md border border-border text-left outline-none transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ backgroundImage: theme.wallpaper }}
                        onClick={() => {
                          setSetting("theme", theme.id);
                          setWallpaper({
                            type: "preset",
                            id: theme.id,
                          });
                        }}
                      >
                        <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-background/70 px-2 py-1 text-xs backdrop-blur">
                          <span>{theme.name}</span>
                          <span className="ml-auto flex items-center gap-1">
                            <span
                              className="size-2 rounded-full"
                              style={{ background: theme.colors.primary }}
                            />
                            <span
                              className="size-2 rounded-full"
                              style={{ background: theme.colors.secondary }}
                            />
                            <span
                              className="size-2 rounded-full"
                              style={{ background: theme.colors.accent }}
                            />
                            {selected ? <CheckIcon className="size-3" /> : null}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCustomWallpaper}
                  id="theme"
                />
                <Button
                  type="button"
                  variant={
                    wallpaper.type === "custom" ? "default" : "secondary"
                  }
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                  {t("settings.uploadWallpaper")}
                  {wallpaper.type === "custom" ? (
                    <CheckIcon className="ml-auto" />
                  ) : null}
                </Button>
              </FieldContent>
              <FieldDescription>
                {t("settings.themeDescription")}
              </FieldDescription>
            </Field>
            <Field>
              <FieldContent className="flex items-center justify-between flex-row">
                <FieldLabel htmlFor="transparentAddShortcut">
                  <PlusIcon className="size-4" />{" "}
                  {t("settings.transparentAddShortcut")}
                </FieldLabel>
                <Switch
                  name="transparentAddShortcut"
                  id="transparentAddShortcut"
                  checked={settings.transparentAddShortcut}
                  onCheckedChange={(checked) => {
                    setSetting("transparentAddShortcut", checked);
                  }}
                />
              </FieldContent>
              <FieldDescription>
                {t("settings.transparentDescription")}
              </FieldDescription>
            </Field>
            <Field>
              <FieldContent className="flex items-center justify-between flex-row">
                <FieldLabel htmlFor="transparentChangeGeo">
                  <MapPinIcon className="size-4" />{" "}
                  {t("settings.transparentChangeGeo")}
                </FieldLabel>
                <Switch
                  name="transparentChangeGeo"
                  id="transparentChangeGeo"
                  checked={settings.transparentChangeGeo}
                  onCheckedChange={(checked) => {
                    setSetting("transparentChangeGeo", checked);
                  }}
                />
              </FieldContent>
              <FieldDescription>
                {t("settings.transparentDescription")}
              </FieldDescription>
            </Field>
            <BackupSection />
          </FieldGroup>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>{t("common.close")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer;
