<script setup lang="ts">
import { ShortcutType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getImageById } from "@/lib/utils/img-idb";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  class?: string;
  shortcut: ShortcutType;
}>();

const iconBlob = ref<Blob | undefined>(undefined);

const iconBlobUrl = computed<string | undefined>((oldValue) => {
  if (oldValue) URL.revokeObjectURL(oldValue);

  if (iconBlob.value) {
    return URL.createObjectURL(iconBlob.value);
  }

  return undefined;
});

watch(
  () => props.shortcut,
  async (newShortcut) => {
    if (!newShortcut?.id) return;
    const icon = await getImageById(newShortcut.id);
    if (icon) iconBlob.value = icon.blob;
  },
  { immediate: true },
);
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
