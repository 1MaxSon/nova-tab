<script setup lang="ts">
import CreateShortcutDialog from "@/components/CreateShortcutDialog.vue";
import ShortcutGroup from "@/components/ShortcutGroup.vue";
import ShortcutItem from "@/components/ShortcutItem.vue";
import ShortcutsGrid from "@/components/ShortcutsGrid.vue";
import { generatePreviousId } from "@/lib/helpers";
import { t } from "@/lib/i18n";
import { shortcutSensor } from "@/lib/sensors";
import { storage } from "@/lib/storage";
import { ShortcutGroupType, ShortcutType } from "@/lib/types";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/vue";
import { ref } from "vue";

const shortcutsStructureVersion = ref(0);
</script>

<template>
  <section>
    <DragDropProvider
      @dragEnd="
        async (event) => {
          const shortcutItems = storage.shortcuts;
          const { targetId } = (event.operation.target?.data ?? {}) as {
            targetId?: number;
          };

          if (targetId) {
            const sourceId = event.operation.source?.id as number | undefined;
            if (!sourceId) return;

            if (targetId === sourceId) return;

            const targetIndex = shortcutItems.findIndex(
              (p) => p.type === 'shortcut' && p.id === targetId,
            );

            const sourceShortcut = shortcutItems.find(
              (p) => p.type === 'shortcut' && p.id === sourceId,
            ) as ShortcutType | undefined;

            const targetShortcut = shortcutItems[targetIndex] as
              | ShortcutType
              | undefined;

            if (!targetShortcut || !sourceShortcut || targetIndex === -1)
              return;

            const previousId = generatePreviousId(shortcutItems);

            const newGroup: ShortcutGroupType = {
              id: previousId,
              items: [
                { ...targetShortcut, groupId: previousId },
                { ...sourceShortcut, groupId: previousId },
              ],
              name: t('shortcut.group'),
              type: 'group',
            };

            const withoutGrouped = shortcutItems.filter(
              (p) => p.id !== targetId && p.id !== sourceId,
            );

            const next = [
              ...withoutGrouped.slice(0, targetIndex),
              newGroup,
              ...withoutGrouped.slice(targetIndex),
            ];

            storage.shortcuts = next;
            return;
          }

          if (event.operation.target?.type === 'shortcut-group-drop') {
            const shortcutId = event.operation.source?.id;
            const shortcutGroupId = event.operation.target?.data
              .groupId as number;

            if (!shortcutId || !shortcutGroupId) return;

            const shortcut = shortcutItems.find(
              (p): p is ShortcutType =>
                p.id === shortcutId && p.type === 'shortcut',
            );

            if (!shortcut) return;

            const withoutShortcut = shortcutItems.filter(
              (p) => !(p.type === 'shortcut' && p.id === shortcutId),
            );

            const changedShortcuts = withoutShortcut.map((item) => {
              if (item.type !== 'group') return item;
              if (item.id !== shortcutGroupId) return item;

              return {
                ...item,
                items: [
                  ...item.items,
                  { ...shortcut, groupId: shortcutGroupId },
                ],
              } satisfies ShortcutGroupType;
            });

            storage.shortcuts = changedShortcuts;
            shortcutsStructureVersion++;
            return;
          }

          storage.shortcuts = move(shortcutItems, event);
        }
      "
      :sensors="[shortcutSensor]"
    >
      <ShortcutsGrid :key="shortcutsStructureVersion">
        <template
          v-for="(shortcut, idx) in storage.shortcuts"
          :key="shortcut.id"
        >
          <ShortcutGroup
            v-if="shortcut.type === 'group'"
            :index="idx"
            :shortcut-group="shortcut"
          />
          <ShortcutItem v-else :index="idx" :shortcut="shortcut" />
        </template>

        <CreateShortcutDialog />
      </ShortcutsGrid>
    </DragDropProvider>
  </section>
</template>
