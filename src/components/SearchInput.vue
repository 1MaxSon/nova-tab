<script setup lang="ts">
import SearchEngineMenu from "@/components/SearchEngineMenu.vue";
import InputGroup from "@/components/ui/input-group/InputGroup.vue";
import InputGroupAddon from "@/components/ui/input-group/InputGroupAddon.vue";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "@lucide/vue";

const props = defineProps<{
  class?: string;
}>();

const emit = defineEmits<{
  incognitoRequest: [];
}>();
</script>

<template>
  <div class="p-1 pb-0">
    <InputGroup
      class="h-14 w-full rounded-full border border-white/10 bg-white/5 p-2 text-base text-white outline-none transition duration-200 focus:border-white/20 focus:bg-white/10 *:data-[slot=input-group-addon]:pl-2!"
    >
      <InputGroupAddon align="inline-start">
        <SearchEngineMenu />
      </InputGroupAddon>
      <input
        :class="
          cn('ml-2 w-full bg-transparent text-sm outline-hidden', props.class)
        "
        v-bind="$attrs"
      />
      <InputGroupAddon align="inline-end">
        <button
          type="submit"
          class="size-9 place-items-center rounded-full border border-primary/30 bg-primary/15 text-primary transition-colors hover:bg-primary/20"
          @click="
            (e) => {
              const isCtrlPressed = e.ctrlKey || e.metaKey;
              if (isCtrlPressed) {
                e.preventDefault();
                emit('incognitoRequest');
              }
            }
          "
        >
          <ChevronRightIcon class="translate-x-px" />
        </button>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>
