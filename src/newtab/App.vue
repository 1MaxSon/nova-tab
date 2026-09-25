<script setup lang="ts">
import Clock from "@/components/Clock.vue";
import DateWithWeather from "@/components/DateWithWeather.vue";
import SearchBar from "@/components/SearchBar.vue";
import Shortcuts from "@/components/Shortcuts.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import TooltipProvider from "@/components/ui/tooltip/TooltipProvider.vue";
import { THEMES } from "@/lib/constants";
import { layersToCss } from "@/lib/gradient";
import { currentLanguage, t } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { computed, defineAsyncComponent, Suspense, watch } from "vue";

const SettingsDialog = defineAsyncComponent(
  () => import("@/components/SettingsDialog.vue"),
);

const selectedTheme = computed(() => {
  return (
    storage.settings.customThemes.find(
      (theme) => theme.id === storage.settings.theme,
    ) ??
    THEMES.find((theme) => theme.id === storage.settings.theme) ??
    THEMES[0]
  );
});

const backgroundImage = computed(() => {
  const theme = selectedTheme.value;
  if (!("wallpaperType" in theme)) return theme.wallpaper;

  if (theme.wallpaperType === "photo") {
    return `url("${theme.wallpaperData}")`;
  }

  return layersToCss(theme.wallpaperData);
});
const themeVariables = computed(() =>
  Object.fromEntries(
    Object.entries(selectedTheme.value.colors).map(([key, value]) => [
      `--${key}`,
      value,
    ]),
  ),
);

watch(
  currentLanguage,
  () => {
    document.title = t("window.title");
  },
  { immediate: true },
);
</script>

<template>
  <TooltipProvider>
    <div
      class="fixed inset-0 z-0 nova-gradient overflow-auto no-scrollbar"
      :style="{
        backgroundImage,
        ...themeVariables,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }"
    >
      <div class="nova-bg-grain z-0 relative"></div>

      <main
        class="relative flex flex-col items-center justify-center px-12 py-6"
      >
        <div class="flex flex-col items-center">
          <Clock class="mb-3 animate-in fade-in duration-300" />
          <DateWithWeather
            class="mb-10 animate-in fade-in duration-300 flex-col md:flex-row"
          />
        </div>

        <SearchBar class="max-w-135 mb-10 animate-in fade-in duration-300" />

        <Shortcuts class="w-full fade-in animate-in duration-500" />

        <Suspense>
          <template #fallback>
            <Spinner class="absolute top-4 right-4" />
          </template>
          <SettingsDialog />
        </Suspense>
      </main>
    </div>
  </TooltipProvider>
</template>
