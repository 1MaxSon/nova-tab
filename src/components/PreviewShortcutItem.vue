<script setup lang="ts">
import { ShortcutType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getImageById } from "@/lib/utils/img-idb";
import { computedAsync, useObjectUrl } from "@vueuse/core";

const props = defineProps<{
  class?: string;
  shortcut: ShortcutType;
}>();

const iconBlob = computedAsync(async () => {
  const icon = await getImageById(props.shortcut.iconId);

  if (icon) return icon.blob;
});
const iconBlobUrl = useObjectUrl(iconBlob);
</script>

<template>
  <div
    :class="
      cn([
        props.class,
        'flex flex-col items-center justify-center gap-1 bg-(--color) p-2 rounded-lg min-h-0 overflow-hidden',
      ])
    "
    :style="{
      '--color': shortcut.accentColor,
      '--muted-color': shortcut.mutedColor,
    }"
  >
    <img
      :src="iconBlobUrl"
      :alt="shortcut.name"
      class="min-h-0 flex-1 w-auto max-w-full object-contain"
    />
  </div>
</template>
