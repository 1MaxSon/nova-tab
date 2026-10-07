<script setup lang="ts">
import Clock from "@/components/Clock.vue";
import DateWithWeather from "@/components/DateWithWeather.vue";
import SearchBar from "@/components/SearchBar.vue";
import Shortcuts from "@/components/Shortcuts.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import TooltipProvider from "@/components/ui/tooltip/TooltipProvider.vue";
import { THEMES } from "@/lib/constants";
import { layersToCss } from "@/lib/utils/gradient";
import { storage } from "@/lib/storage";
import { computed, defineAsyncComponent, ref, Suspense, watch } from "vue";
import { useObjectUrl } from "@vueuse/core";
import { getImageById } from "@/lib/utils/img-idb";

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

const themeVariables = computed(() =>
  Object.fromEntries(
    Object.entries(selectedTheme.value.colors).map(([key, value]) => [
      `--${key}`,
      value,
    ]),
  ),
);

const wallpaperBlob = ref<Blob | undefined>();
const wallpaperBlobUrl = useObjectUrl(wallpaperBlob);

watch(
  selectedTheme,
  async (newValue) => {
    const theme = newValue;

    if (!("wallpaperType" in theme) || theme.wallpaperType !== "photo") return;

    const wallpaper = await getImageById(theme.wallpaper.id);

    wallpaperBlob.value = wallpaper?.blob;
  },
  { immediate: true },
);

const backgroundImage = computed(() => {
  const theme = selectedTheme.value;
  if (!("wallpaperType" in theme)) return theme.wallpaper;

  if (theme.wallpaperType === "photo") {
    return wallpaperBlobUrl.value ? `url("${wallpaperBlobUrl.value}")` : "";
  }

  return layersToCss(theme.gradientLayers);
});

const wallpaperBlur = computed(() => {
  return "wallpaperType" in selectedTheme.value &&
    selectedTheme.value.wallpaperType === "photo"
    ? `blur(${selectedTheme.value.wallpaper.blurValue}px)`
    : "";
});
</script>

<template>
  <TooltipProvider>
    <div
      class="fixed inset-0 z-0 nova-gradient overflow-auto no-scrollbar"
      :style="{
        ...themeVariables,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }"
    >
      <div class="nova-bg-grain z-0"></div>
      <div
        class="fixed inset-0 z-0 animate-in fade-in blur-md"
        :style="{
          backgroundImage,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          '--tw-blur': wallpaperBlur,
        }"
      ></div>

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
