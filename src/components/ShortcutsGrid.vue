<script setup lang="ts">
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: string;
}>();
</script>

<template>
  <div
    :class="
      cn([
        'grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(200px,1fr))] justify-center gap-3',
        props.class,
      ])
    "
  >
    <slot></slot>
  </div>
</template>
