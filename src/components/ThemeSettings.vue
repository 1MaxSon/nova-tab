<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Field from "@/components/ui/field/Field.vue";
import FieldContent from "@/components/ui/field/FieldContent.vue";
import FieldLabel from "@/components/ui/field/FieldLabel.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Slider from "@/components/ui/slider/Slider.vue";
import { THEMES } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import type {
  GradientWallpaperData,
  ThemeColors,
  UserTheme,
} from "@/lib/types";
import {
  CheckIcon,
  PaletteIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from "@lucide/vue";
import { computed, ref } from "vue";

type ThemeDraft = {
  name: string;
  wallpaperType: "photo" | "gradient";
  photoData: string;
  gradientData: GradientWallpaperData;
  colors: ThemeColors;
};

const defaultColors: ThemeColors = {
  background: "#121522",
  foreground: "#f5f2ff",
  primary: "#d9bd7b",
  secondary: "#d9bd7b",
  accent: "#d9bd7b",
};
const defaultGradient: GradientWallpaperData = {
  from: "#18233d",
  to: "#090b12",
  angle: 135,
};

const isThemeEditorOpen = ref(false);
const editingThemeId = ref<string | null>(null);
const wallpaperInput = ref<HTMLInputElement | null>(null);
const themeDraft = ref<ThemeDraft>(createDefaultDraft());

const editingTheme = computed(() =>
  storage.settings.customThemes.find(
    (theme) => theme.id === editingThemeId.value,
  ),
);

function createDefaultDraft(): ThemeDraft {
  return {
    name: "",
    wallpaperType: "gradient",
    photoData: "",
    gradientData: { ...defaultGradient },
    colors: { ...defaultColors },
  };
}

const getWallpaperStyle = (theme: UserTheme) => {
  if (theme.wallpaperType === "photo") return `url("${theme.wallpaperData}")`;
  const gradient = theme.wallpaperData as GradientWallpaperData;
  return `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`;
};

const resetThemeDraft = () => {
  themeDraft.value = createDefaultDraft();
  editingThemeId.value = null;
};

const openThemeEditor = (theme?: UserTheme) => {
  if (!theme) {
    resetThemeDraft();
  } else {
    editingThemeId.value = theme.id;
    themeDraft.value = {
      name: theme.name,
      wallpaperType: theme.wallpaperType,
      photoData:
        theme.wallpaperType === "photo" ? (theme.wallpaperData as string) : "",
      gradientData:
        theme.wallpaperType === "gradient"
          ? { ...(theme.wallpaperData as GradientWallpaperData) }
          : { ...defaultGradient },
      colors: { ...defaultColors, ...theme.colors },
    };
  }
  isThemeEditorOpen.value = true;
};

const closeThemeEditor = () => {
  isThemeEditorOpen.value = false;
  resetThemeDraft();
};

const saveTheme = () => {
  const name = themeDraft.value.name.trim();
  if (
    !name ||
    (themeDraft.value.wallpaperType === "photo" && !themeDraft.value.photoData)
  ) {
    return;
  }

  const id = editingThemeId.value ?? `custom-${crypto.randomUUID()}`;
  const wallpaperData =
    themeDraft.value.wallpaperType === "photo"
      ? themeDraft.value.photoData
      : { ...themeDraft.value.gradientData };
  const theme: UserTheme = {
    id,
    name,
    wallpaperType: themeDraft.value.wallpaperType,
    wallpaperData,
    colors: { ...themeDraft.value.colors },
  };
  const themes = [...storage.settings.customThemes];
  const index = themes.findIndex((item) => item.id === id);

  if (index === -1) themes.push(theme);
  else themes[index] = theme;

  storage.settings.customThemes = themes;
  storage.settings.theme = id;
  closeThemeEditor();
};

const deleteTheme = (theme: UserTheme) => {
  storage.settings.customThemes = storage.settings.customThemes.filter(
    (item) => item.id !== theme.id,
  );
  if (storage.settings.theme === theme.id)
    storage.settings.theme = THEMES[0].id;
};

const handleWallpaperChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    if (typeof reader.result === "string")
      themeDraft.value.photoData = reader.result;
  });
  reader.readAsDataURL(file);
  input.value = "";
};
</script>

<template>
  <Field>
    <FieldContent>
      <FieldLabel for="theme"
        ><PaletteIcon class="size-4" /> {{ t("settings.theme") }}</FieldLabel
      >
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
        <button
          v-for="theme in storage.settings.customThemes"
          :key="theme.id"
          type="button"
          class="group relative aspect-video overflow-hidden rounded-md border border-border text-left outline-none transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring"
          :style="{ backgroundImage: getWallpaperStyle(theme) }"
          @click="storage.settings.theme = theme.id"
        >
          <span
            class="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-background/70 px-2 py-1 text-xs backdrop-blur"
          >
            <span class="truncate">{{ theme.name }}</span>
            <span class="ml-auto flex items-center gap-1">
              <span
                class="size-2 rounded-full"
                :style="{ background: theme.colors.primary }"
              ></span>
              <span
                class="size-2 rounded-full"
                :style="{ background: theme.colors.secondary }"
              ></span>
              <CheckIcon
                v-if="storage.settings.theme === theme.id"
                class="size-3"
              />
            </span>
          </span>
          <span class="absolute right-1 top-1 hidden gap-1 group-hover:flex">
            <span
              class="grid size-6 place-items-center rounded bg-background/80"
              @click.stop="openThemeEditor(theme)"
              ><PencilIcon class="size-3"
            /></span>
            <span
              class="grid size-6 place-items-center rounded bg-background/80 text-destructive"
              @click.stop="deleteTheme(theme)"
              ><Trash2Icon class="size-3"
            /></span>
          </span>
        </button>
      </div>
      <Button
        type="button"
        variant="secondary"
        class="mt-2 w-full"
        @click="openThemeEditor()"
        ><PlusIcon />{{ t("settings.createTheme") }}</Button
      >
    </FieldContent>
  </Field>

  <Field v-if="isThemeEditorOpen" class="border border-border p-3">
    <FieldContent>
      <FieldLabel for="custom-theme-name">{{
        editingTheme ? t("settings.editTheme") : t("settings.createTheme")
      }}</FieldLabel>
      <input
        id="custom-theme-name"
        v-model="themeDraft.name"
        class="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
        :placeholder="t('settings.themeName')"
      />
      <div class="grid grid-cols-2 gap-2">
        <label
          v-for="color in [
            ['background', t('settings.backgroundColor')],
            ['foreground', t('settings.foregroundColor')],
            ['primary', t('settings.primaryColor')],
            ['secondary', t('settings.secondaryColor')],
            ['accent', t('settings.accentColor')],
          ]"
          :key="color[0]"
          class="flex items-center justify-between gap-2 text-xs text-muted-foreground"
        >
          {{ color[1] }}
          <input
            v-model="themeDraft.colors[color[0]]"
            type="color"
            class="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
          />
        </label>
      </div>
      <FieldLabel for="wallpaper-type">{{
        t("settings.wallpaperType")
      }}</FieldLabel>
      <Select
        id="wallpaper-type"
        v-model="themeDraft.wallpaperType"
        class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
      >
        <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="photo">{{
            t("settings.imageWallpaper")
          }}</SelectItem>
          <SelectItem value="gradient">{{ t("settings.gradient") }}</SelectItem>
        </SelectContent>
      </Select>
      <div
        v-if="themeDraft.wallpaperType === 'gradient'"
        class="grid gap-2 rounded-md border border-border p-2"
      >
        <div class="grid grid-cols-2 gap-2">
          <label
            class="flex items-center justify-between gap-2 text-xs text-muted-foreground"
            >{{ t("settings.gradientStart")
            }}<input
              v-model="themeDraft.gradientData.from"
              type="color"
              class="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
          /></label>
          <label
            class="flex items-center justify-between gap-2 text-xs text-muted-foreground"
            >{{ t("settings.gradientEnd")
            }}<input
              v-model="themeDraft.gradientData.to"
              type="color"
              class="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
          /></label>
        </div>
        <label class="grid gap-1 text-xs text-muted-foreground">
          {{ t("settings.gradientAngle") }}:
          {{ themeDraft.gradientData.angle }}°
          <Slider
            :default-value="[themeDraft.gradientData.angle]"
            @update:model-value="
              (newValue) => {
                if (!newValue) return;
                themeDraft.gradientData.angle = newValue[0];
              }
            "
            :min="0"
            :max="360"
            class="mt-2"
          />
        </label>
      </div>
      <input
        ref="wallpaperInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleWallpaperChange"
      />
      <Button
        v-if="themeDraft.wallpaperType === 'photo'"
        type="button"
        variant="secondary"
        class="w-full"
        @click="wallpaperInput?.click()"
        ><UploadIcon />{{ t("settings.chooseWallpaper") }}</Button
      >
      <div class="flex gap-2">
        <Button
          type="button"
          class="flex-1"
          :disabled="
            !themeDraft.name.trim() ||
            (themeDraft.wallpaperType === 'photo' && !themeDraft.photoData)
          "
          @click="saveTheme"
          >{{ t("settings.saveTheme") }}</Button
        >
        <Button type="button" variant="ghost" @click="closeThemeEditor">{{
          t("settings.cancelTheme")
        }}</Button>
      </div>
    </FieldContent>
  </Field>
</template>
