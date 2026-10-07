<script setup lang="ts">
import ThemeBuilderDialog from "@/components/theme/ThemeBuilderDialog.vue";
import UserThemeItem from "@/components/theme/UserThemeItem.vue";
import Button from "@/components/ui/button/Button.vue";
import Field from "@/components/ui/field/Field.vue";
import FieldContent from "@/components/ui/field/FieldContent.vue";
import FieldLabel from "@/components/ui/field/FieldLabel.vue";
import { THEMES } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { UserTheme } from "@/lib/types/theme";
import { CheckIcon, PaletteIcon, PlusIcon } from "@lucide/vue";
import { computed, ref } from "vue";

const isThemeEditorOpen = ref(false);
const editingThemeId = ref<string | null>(null);

const editingTheme = computed(() =>
  storage.settings.customThemes.find(
    (theme) => theme.id === editingThemeId.value,
  ),
);

const deleteTheme = (theme: UserTheme) => {
  storage.settings.customThemes = storage.settings.customThemes.filter(
    (item) => item.id !== theme.id,
  );
  if (storage.settings.theme === theme.id)
    storage.settings.theme = THEMES[0].id;
};
</script>

<template>
  <Field>
    <FieldContent>
      <FieldLabel for="theme">
        <PaletteIcon class="size-4" /> {{ t("settings.theme") }}
      </FieldLabel>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="theme in THEMES"
          :key="theme.id"
          type="button"
          class="group relative aspect-video overflow-hidden rounded-md border border-border text-left outline-none transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          :style="{ backgroundImage: theme.wallpaper }"
          @click="storage.settings.theme = theme.id"
        >
          <span
            class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-background/70 px-2 py-1 text-xs backdrop-blur"
          >
            <span>{{ theme.name }}</span>
            <span class="ml-auto flex items-center gap-1">
              <span
                class="size-2 rounded-full"
                :style="{ background: theme.colors.primary }"
              ></span>
              <span
                class="size-2 rounded-full"
                :style="{ background: theme.colors.secondary }"
              ></span>
              <span
                class="size-2 rounded-full"
                :style="{ background: theme.colors.accent }"
              ></span>
              <CheckIcon
                v-if="storage.settings.theme === theme.id"
                class="size-3"
              />
            </span>
          </span>
        </button>
        <UserThemeItem
          v-for="theme in storage.settings.customThemes"
          :key="theme.id"
          :theme
          :is-selected="storage.settings.theme === theme.id"
          @theme-selected="
            () => {
              storage.settings.theme = theme.id;
            }
          "
          @edit-theme="
            () => {
              editingThemeId = theme.id;
              isThemeEditorOpen = true;
            }
          "
          @delete-theme="
            () => {
              deleteTheme(theme);
            }
          "
        />
      </div>
      <Button
        type="button"
        variant="secondary"
        class="mt-2 w-full"
        @click="
          () => {
            isThemeEditorOpen = true;
          }
        "
      >
        <PlusIcon />{{ t("settings.createTheme") }}</Button
      >
    </FieldContent>
  </Field>

  <ThemeBuilderDialog
    :editingTheme="editingTheme"
    v-model:open="isThemeEditorOpen"
    @handle-close="
      () => {
        isThemeEditorOpen = false;
      }
    "
  />
</template>
