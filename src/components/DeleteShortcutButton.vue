<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { deleteIcon, storage } from "@/lib/storage";
import { ShortcutGroupType, ShortcutType } from "@/lib/types";
import { TrashIcon } from "@lucide/vue";

const props = defineProps<{
  shortcut: ShortcutType;
}>();
</script>

<template>
  <Button
    @click="
      async () => {
        if (shortcut.groupId) {
          const shortcutGroup = storage.shortcuts.find(
            (p): p is ShortcutGroupType =>
              p.type === 'group' && p.id === shortcut.groupId,
          );

          if (shortcutGroup) {
            const shortcutGroupItems = shortcutGroup.items.filter(
              (p) => p.id !== shortcut.id,
            );

            if (shortcutGroupItems.length === 0) {
              storage.shortcuts = storage.shortcuts.filter(
                (p) => p.id !== shortcut.groupId,
              );

              return;
            }

            storage.shortcuts = storage.shortcuts.map((s) => {
              if (s.id === shortcutGroup.id) {
                return { ...s, items: shortcutGroupItems };
              }

              return s;
            });
          }
        } else {
          storage.shortcuts = storage.shortcuts.filter(
            (p) => p.id !== shortcut.id,
          );
        }

        await deleteIcon(shortcut.id);
      }
    "
  >
    <TrashIcon />
  </Button>
</template>
