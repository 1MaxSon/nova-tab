<script setup lang="ts">
import { UserTheme } from "@/lib/types/theme";
import { layersToCss } from "@/lib/utils/gradient";
import { getImageById } from "@/lib/utils/img-idb";
import { CheckIcon, PencilIcon, Trash2Icon } from "@lucide/vue";
import { computedAsync, useObjectUrl } from "@vueuse/core";
import { computed } from "vue";

const props = defineProps<{
  theme: UserTheme;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  themeSelected: [];
  editTheme: [];
  deleteTheme: [];
}>();

const wallpaperBlob = computedAsync(async () => {
  if (props.theme.wallpaperType !== "photo") return null;

  const wallpaper = await getImageById(props.theme.wallpaper.id);

  return wallpaper?.blob ?? null;
});
const wallpaperBlobUrl = useObjectUrl(wallpaperBlob);

const wallpaperStyle = computed(() => {
  if (props.theme.wallpaperType === "gradient")
    return layersToCss(props.theme.gradientLayers);
  return `url(${wallpaperBlobUrl.value})`;
});

const wallpaperBlur = computed(() => {
  return props.theme.wallpaperType === "photo"
    ? `blur(${props.theme.wallpaper.blurValue}px)`
    : "";
});
</script>

<template>
  <button
    type="button"
    class="group relative aspect-video overflow-hidden rounded-md border border-border text-left outline-none transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
    @click="emit('themeSelected')"
  >
    <div
      class="absolute inset-0 blur-sm bg-contain bg-center"
      :style="{ backgroundImage: wallpaperStyle, '--tw-blur': wallpaperBlur }"
    ></div>
    <span
      class="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-background/70 px-2 py-1 text-xs backdrop-blur"
    >
      <span class="truncate">{{ theme.name }}</span>
      <span class="ml-auto flex items-center gap-1">
        <span
          class="size-2 rounded-full"
          :style="{ background: theme.colors.primary }"
        ></span>
        <span
          class="size-2 rounded-full"
          :style="{ background: theme.colors.secondary }"
        ></span>
        <CheckIcon v-if="isSelected" class="size-3" />
      </span>
    </span>
    <span class="absolute right-1 top-1 hidden gap-1 group-hover:flex">
      <span
        class="grid size-6 place-items-center rounded bg-background/80"
        @click.stop="
          () => {
            emit('editTheme');
          }
        "
      >
        <PencilIcon class="size-3" />
      </span>
      <span
        class="grid size-6 place-items-center rounded bg-background/80 text-destructive"
        @click.stop="
          () => {
            emit('deleteTheme');
          }
        "
      >
        <Trash2Icon class="size-3" />
      </span>
    </span>
  </button>
</template>
