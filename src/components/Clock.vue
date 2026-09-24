<script setup lang="ts">
import { cn } from "@/lib/utils";
import { useIntervalFn } from "@vueuse/core";
import { ref } from "vue";

const props = defineProps<{
  class?: string;
}>();

const hm = ref("");
const seconds = ref("");

const updateTime = () => {
  const now = new Date();

  hm.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  seconds.value = String(now.getSeconds()).padStart(2, "0");
};

updateTime()

useIntervalFn(updateTime, 1000)
</script>

<template>
  <div :class="cn(['text-center'])">
    <div
      class="flex items-baseline gap-0 text-[clamp(5rem,14vw,9.5rem)] font-thin tracking-[0.06em] text-white leading-none drop-shadow-[0_0_80px_rgba(201,169,110,0.12)]"
    >
      <span>{{ hm }}</span>
      <span
        class="ml-2 pb-3 w-12 text-[clamp(2rem,5vw,3.8rem)] font-thin tracking-wider text-[rgba(255,255,255,0.28)]"
      >
        {{ seconds }}
      </span>
    </div>
  </div>
</template>