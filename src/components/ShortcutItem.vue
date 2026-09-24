<script setup lang="ts">
import DeleteShortcutButton from "@/components/DeleteShortcutButton.vue";
import EditShortcutDialog from "@/components/EditShortcutDialog.vue";
import Button from "@/components/ui/button/Button.vue";
import { GROUP_DROP_PREFIX, shortcutItemClassName } from "@/lib/constants";
import { t} from "@/lib/i18n";
import { getIconById } from "@/lib/storage";
import { ShortcutType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/vue";
import { useSortable } from "@dnd-kit/vue/sortable";
import { Edit2Icon } from "@lucide/vue";
import { computed, onUnmounted, ref, useTemplateRef, watch } from "vue";
import { pointerIntersection } from "@dnd-kit/collision";
import { GroupIcon } from "@lucide/vue";

const props = withDefaults(
  defineProps<{
    class?: string;
    shortcut: ShortcutType;
    index: number;
    inGroup?: boolean;
  }>(),
  {
    inGroup: false,
  },
);


const sortableRef = useTemplateRef("sortableRef");
const handleRef = useTemplateRef("handleRef");
const dropRef = useTemplateRef("dropRef");

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
    const icon = await getIconById(newShortcut.id);
    if (icon) iconBlob.value = icon.blob;
  },
  { immediate: true },
);

onUnmounted(() => {
  if (iconBlobUrl.value) URL.revokeObjectURL(iconBlobUrl.value);
});

// DnD logic

const { sortable } = useSortable({
  id: props.shortcut.id,
  index: props.index,
  type: "shortcut",
  group: "main-shortcuts",
  element: sortableRef,
  handle: handleRef,
  collisionDetector: () => pointerIntersection,
});

const isGroupTarget = computed(() => {
  const manager = sortable.value?.manager;
  if (!manager?.dragOperation) return false;

  const sourceId = manager.dragOperation.source?.id;
  const sourceType = manager.dragOperation.source?.type?.toString();
  return (
    isDropTarget.value &&
    sourceId !== props.shortcut.id &&
    sourceType === "shortcut"
  );
});

const { isDropTarget } = useDroppable({
  id: `${GROUP_DROP_PREFIX}${props.shortcut.id}`,
  data: { targetId: props.shortcut.id },
  disabled: props.inGroup,
  element: dropRef,
});
</script>

<template>
  <div class="relative group" ref="sortableRef">
    <a
      ref="handleRef"
      :href="shortcut.url"
      :class="cn(props.class, shortcutItemClassName, 'h-full')"
      :style="{ background: shortcut.accentColor }"
      rel="noreferrer"
    >
      <img
        v-if="iconBlobUrl"
        :src="iconBlobUrl"
        :alt="shortcut.name"
        class="size-12 mb-2"
      />
      <span
        :class="`${iconBlobUrl ? 'text-lg' : 'text-xl'}`"
        :style="{ color: shortcut.mutedColor }"
      >
        {{ shortcut.name }}
      </span>

      <div ref="dropRef" class="absolute inset-[25%] rounded-md z-0"></div>

      <div
        v-if="isGroupTarget"
        class="absolute flex flex-col items-center justify-center inset-0 rounded-lg bg-black/50 z-20"
      >
        <GroupIcon />
        <span class="text-xl">{{ t("shortcut.createGroup") }}</span>
      </div>
    </a>

    <EditShortcutDialog
      :shortcut="shortcut"
      @iconChange="async () => {}"
      as-child
    >
      <Button
        variant="ghost"
        size="icon"
        class="absolute top-1 right-1 text-transparent group-hover:text-(--color) transition-colors duration-300 z-10"
        :style="{ '--color': shortcut.mutedColor }"
      >
        <Edit2Icon />
      </Button>
    </EditShortcutDialog>

    <DeleteShortcutButton
      :shortcut="shortcut"
      variant="ghost"
      size="icon"
      class="absolute bottom-1 right-1 text-transparent group-hover:text-(--color) transition-colors duration-300 z-10"
      :style="{ '--color': shortcut.mutedColor }"
    />
  </div>
</template>
