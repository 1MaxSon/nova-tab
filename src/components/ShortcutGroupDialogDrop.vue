<script setup lang="ts">
import { useDroppable } from "@dnd-kit/vue";
import { Teleport, useTemplateRef } from "vue";

const droppableRef = useTemplateRef("droppableRef");

const { isDropTarget } = useDroppable({
  id: "dialogDrop",
  type: "group-dialog-drop",
  collisionPriority: 1,
  element: droppableRef,
});
</script>

<template>
  <Teleport to="body">
    <div
      ref="droppableRef"
      :class="[
        'fixed inset-0 z-20 transition-colors',
        { 'bg-accent/20': isDropTarget },
      ]"
    ></div>
  </Teleport>
</template>
