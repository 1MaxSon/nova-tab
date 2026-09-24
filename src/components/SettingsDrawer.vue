<script setup lang="ts">
import pkg from "@/../package.json";
import BackupSection from "@/components/BackupSection.vue";
import Button from "@/components/ui/button/Button.vue";
import Drawer from "@/components/ui/drawer/Drawer.vue";
import DrawerClose from "@/components/ui/drawer/DrawerClose.vue";
import DrawerContent from "@/components/ui/drawer/DrawerContent.vue";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTitle from "@/components/ui/drawer/DrawerTitle.vue";
import DrawerTrigger from "@/components/ui/drawer/DrawerTrigger.vue";
import Field from "@/components/ui/field/Field.vue";
import FieldContent from "@/components/ui/field/FieldContent.vue";
import FieldDescription from "@/components/ui/field/FieldDescription.vue";
import FieldGroup from "@/components/ui/field/FieldGroup.vue";
import FieldLabel from "@/components/ui/field/FieldLabel.vue";
import FieldLegend from "@/components/ui/field/FieldLegend.vue";
import FieldSet from "@/components/ui/field/FieldSet.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Switch from "@/components/ui/switch/Switch.vue";
import ToggleGroup from "@/components/ui/toggle-group/ToggleGroup.vue";
import ToggleGroupItem from "@/components/ui/toggle-group/ToggleGroupItem.vue";
import { languageOptions, t } from "@/lib/i18n";
import { storage, WeatherProvider } from "@/lib/storage";
import ThemeSettings from "@/components/ThemeSettings.vue";
import {
  CloudSunIcon,
  LanguagesIcon,
  MapPinIcon,
  PlusIcon,
  SettingsIcon,
} from "@lucide/vue";

const weatherProviderOptions = [
  "yandex",
  "google",
  "wttr",
] as const satisfies WeatherProvider[];
</script>

<template>
  <Drawer swipeDirection="right">
    <DrawerTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        class="absolute top-2 right-2 opacity-60 hover:opacity-100"
      >
        <SettingsIcon />
      </Button>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle class="flex items-center justify-between">
          {{ t("settings.title") }}
          <span class="text-muted-foreground text-sm">
            v{{ pkg.version }}
          </span>
        </DrawerTitle>
        <DrawerDescription></DrawerDescription>
      </DrawerHeader>
      <div class="overflow-y-auto px-4">
        <FieldGroup>
          <Field>
            <FieldContent>
              <FieldLabel for="language">
                <LanguagesIcon class="size-4" />
                {{ t("settings.language") }}
              </FieldLabel>
              <Select
                id="language"
                name="language"
                v-model="storage.settings.language"
                class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <SelectTrigger class="w-full">
                  <SelectValue></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="[langKey, lang] in Object.entries(languageOptions)"
                    :key="langKey"
                    :value="langKey"
                  >
                    {{ lang }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
            <FieldDescription>
              {{ t("settings.languageDescription") }}
            </FieldDescription>
          </Field>
          <Field>
            <FieldContent>
              <FieldLabel for="weatherProvider">
                <CloudSunIcon class="size-4" /> {{ t("weather.provider") }}
              </FieldLabel>
              <Select
                id="weatherProvider"
                name="weatherProvider"
                v-model="storage.settings.weatherProvider"
                class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <SelectTrigger class="w-full">
                  {{
                    t(`weather.provider.${storage.settings.weatherProvider}`)
                  }}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="provider in weatherProviderOptions"
                    :key="provider"
                    :value="provider"
                  >
                    {{ t(`weather.provider.${provider}`) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FieldContent>
            <FieldDescription>
              {{ t("weather.providerDescription") }}
            </FieldDescription>
          </Field>
          <FieldSet>
            <FieldLegend>{{ t("settings.units.title") }}</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldLabel class="text-muted-foreground" for="units-temp">
                  {{ t("settings.units.temp") }}
                </FieldLabel>
                <ToggleGroup
                  size="lg"
                  class="w-full"
                  variant="outline"
                  :spacing="0"
                  v-model="storage.settings.weatherUnit"
                  id="units-temp"
                >
                  <ToggleGroupItem value="celsius" class="flex-1/2">
                    °C
                  </ToggleGroupItem>
                  <ToggleGroupItem value="fahrenheit" class="flex-1/2">
                    °F
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>
              <Field>
                <FieldLabel class="text-muted-foreground" for="units-wind">
                  {{ t("settings.units.wind") }}
                </FieldLabel>
                <ToggleGroup
                  size="lg"
                  class="w-full"
                  variant="outline"
                  :spacing="0"
                  v-model="storage.settings.windSpeedUnit"
                  id="units-wind"
                >
                  <ToggleGroupItem value="ms" class="flex-1/3">
                    {{ t("settings.units.ms") }}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="kmh" class="flex-1/3">
                    {{ t("settings.units.kmh") }}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="mph" class="flex-1/3">
                    {{ t("settings.units.mph") }}
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>
            </FieldGroup>
          </FieldSet>
          <ThemeSettings />
          <Field>
            <FieldContent class="flex items-center justify-between flex-row">
              <FieldLabel for="transparentAddShortcut">
                <PlusIcon class="size-4" />
                {{ t("settings.transparentAddShortcut") }}
              </FieldLabel>
              <Switch
                name="transparentAddShortcut"
                id="transparentAddShortcut"
                v-model="storage.settings.transparentAddShortcut"
              />
            </FieldContent>
            <FieldDescription>
              {{ t("settings.transparentDescription") }}
            </FieldDescription>
          </Field>
          <Field>
            <FieldContent class="flex items-center justify-between flex-row">
              <FieldLabel for="transparentChangeGeo">
                <MapPinIcon class="size-4" />
                {{ t("settings.transparentChangeGeo") }}
              </FieldLabel>
              <Switch
                name="transparentChangeGeo"
                id="transparentChangeGeo"
                v-model="storage.settings.transparentChangeGeo"
              />
            </FieldContent>
            <FieldDescription>
              {{ t("settings.transparentDescription") }}
            </FieldDescription>
          </Field>
          <BackupSection />
        </FieldGroup>
      </div>
      <DrawerFooter>
        <DrawerClose asChild>
          <Button>{{ t("common.close") }}</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
