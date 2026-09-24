<script setup lang="ts">
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import { searchEngineIcons } from "@/lib/search-engines";
import { storage } from "@/lib/storage";
import { computed } from "vue";

const TriggerIcon = computed(() => {
  return searchEngineIcons[storage.settings.searchEngine].icon;
});
</script>

<template>
  <Select v-model="storage.settings.searchEngine">
    <SelectTrigger class="border-none px-0 pl-1">
      <component :is="TriggerIcon" />
    </SelectTrigger>
    <SelectContent align="start" class="mt-4">
      <SelectItem
        v-for="[engine, item] in Object.entries(searchEngineIcons)"
        :key="engine"
        :value="engine"
        class="focus:bg-primary/60"
      >
        <div class="flex items-center gap-2">
          <component :is="item.icon" class="size-4" />
          <span>{{ item.label }}</span>
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
