<script setup lang="ts">
import PreviewShortcutItem from "@/components/PreviewShortcutItem.vue";
import ShortcutGroupDialogDrop from "@/components/ShortcutGroupDialogDrop.vue";
import ShortcutItem from "@/components/ShortcutItem.vue";
import ShortcutsGrid from "@/components/ShortcutsGrid.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogTrigger from "@/components/ui/dialog/DialogTrigger.vue";
import { t} from "@/lib/i18n";
import { shortcutSensor } from "@/lib/sensors";
import { storage } from "@/lib/storage";
import { ShortcutGroupType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { pointerIntersection, shapeIntersection } from "@dnd-kit/collision";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDroppable } from "@dnd-kit/vue";

import { useSortable } from "@dnd-kit/vue/sortable";
import { FolderPlusIcon } from "@lucide/vue";
import { refDebounced } from "@vueuse/core";
import { VisuallyHidden } from "reka-ui";
import { ref, useTemplateRef, watch } from "vue";

const props = defineProps<{
  shortcutGroup: ShortcutGroupType;
  index: number;
  class?: string;
}>();



const newName = ref(props.shortcutGroup.name);
const debouncedName = refDebounced(newName, 200);

const isDialogOpen = ref(false);

const sortableRef = useTemplateRef("sortableRef");

const { isDragging } = useSortable({
  element: sortableRef,
  handle: sortableRef,
  target: sortableRef,
  id: props.shortcutGroup.id,
  index: props.index,
  type: "shortcut-group",
  group: "main-shortcuts",
  collisionDetector: () => pointerIntersection,
});

const { isDropTarget } = useDroppable({
  element: sortableRef,
  id: `group-drop-${props.shortcutGroup.id}`,
  type: "shortcut-group-drop",
  data: {
    groupId: props.shortcutGroup.id,
  },
  collisionDetector: () => shapeIntersection,
  disabled: isDragging,
});

watch(debouncedName, (newValue) => {
  storage.shortcuts = storage.shortcuts.map((s) =>
    s.type === "group" && s.id === props.shortcutGroup.id
      ? { ...s, name: newValue }
      : s,
  );
});
</script>

<template>
  <div
    ref="sortableRef"
    :class="
      cn([
        props.class,
        'overflow-hidden bg-accent/5 border-accent/40 border rounded-lg relative aspect-video',
      ])
    "
  >
    <Dialog v-model="isDialogOpen">
      <DialogTrigger
        class="flex h-full w-full flex-col justify-between text-left"
      >
        <div
          class="grid p-2 grid-cols-2 grid-rows-2 gap-1 rounded-md bg-black/10 min-h-0"
        >
          <PreviewShortcutItem
            v-for="shortcut in shortcutGroup.items.slice(0, 4)"
            :key="shortcut.id"
            :shortcut="shortcut"
          />
        </div>

        <span
          class="text-lg text-center text-muted-foreground text-ellipsis overflow-clip shrink-0"
        >
          {{ shortcutGroup.name }}
        </span>
      </DialogTrigger>
      <DialogContent
        class="sm:max-w-[96vw] max-h-[70vh] overflow-y-auto bg-black/40"
        :showCloseButton="false"
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{{ shortcutGroup.name }}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <DragDropProvider
          @dragEnd="
            (event) => {
              {
                if (event.operation.target?.type === 'group-dialog-drop') {
                  const source = event.operation.source;
                  if (!source) return;
                  const shortcutToRemove = shortcutGroup.items.find(
                    (p) => p.id === source.id,
                  );
                  if (!shortcutToRemove) return;
                  const changedShortcutsInGroup = shortcutGroup.items.filter(
                    (p) => p.id !== shortcutToRemove.id,
                  );
                  if (changedShortcutsInGroup.length === 0) {
                    isDialogOpen = false;
                    storage.shortcuts = [
                      ...storage.shortcuts.filter(
                        (p) => p.id !== shortcutGroup.id,
                      ),
                      { ...shortcutToRemove, groupId: undefined },
                    ];
                    return;
                  }
                  storage.shortcuts = [
                    ...storage.shortcuts.map((s) => {
                      if (s.id !== shortcutGroup.id) return s;
                      const changedShorcutGroup: ShortcutGroupType = {
                        ...shortcutGroup,
                        items: changedShortcutsInGroup,
                      };
                      return changedShorcutGroup;
                    }),
                    { ...shortcutToRemove, groupId: undefined },
                  ];
                  return;
                }
                const movedShortcuts = move(shortcutGroup.items, event);
                storage.shortcuts = storage.shortcuts.map((data) => {
                  if (data.id !== shortcutGroup.id) return data;
                  const changedShorcutGroup: ShortcutGroupType = {
                    ...shortcutGroup,
                    items: movedShortcuts,
                  };
                  return changedShorcutGroup;
                });
              }
            }
          "
          :sensors="[shortcutSensor]"
        >
          <div class="space-y-4 rounded-xl">
            <ShortcutsGrid class="gap-2">
              <ShortcutItem
                v-for="(shortcut, idx) in shortcutGroup.items"
                :key="shortcut.id"
                :shortcut="shortcut"
                :index="idx"
                inGroup
              />
            </ShortcutsGrid>

            <input
              :id="`group-name-${shortcutGroup.id}`"
              class="rounded-md text-lg text-center px-3 py-2 text-white outline-none w-full"
              v-model="newName"
            />
          </div>
          <ShortcutGroupDialogDrop />
        </DragDropProvider>
      </DialogContent>
    </Dialog>

    <div
      v-if="isDropTarget"
      class="inset-0 absolute flex items-center justify-center flex-col bg-black/80 rounded-lg"
    >
      <FolderPlusIcon class="size-5" />
      <span class="text-xl">{{ t("shortcut.addToGroup") }}</span>
    </div>
  </div>
</template>
