<script setup lang="ts">
import GradientBuilder from "@/components/theme/GradientBuilder.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Field from "@/components/ui/field/Field.vue";
import FieldGroup from "@/components/ui/field/FieldGroup.vue";
import FieldLabel from "@/components/ui/field/FieldLabel.vue";
import Input from "@/components/ui/input/Input.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Slider from "@/components/ui/slider/Slider.vue";
import { t } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { ThemeColors, UserTheme } from "@/lib/types/theme";
import { GradientLayer, layersToCss } from "@/lib/utils/gradient";
import { getImageById, saveImage } from "@/lib/utils/img-idb";
import { UploadIcon } from "@lucide/vue";
import { useObjectUrl } from "@vueuse/core";
import { computed, ref, useTemplateRef, watchEffect } from "vue";

type ThemeDraft = {
  name: string;
  wallpaperType: UserTheme["wallpaperType"];
  wallpaper: {
    id?: string;
    blurValue: number;
  };
  gradientData: GradientLayer[];
  colors: ThemeColors;
};

const defaultColors: ThemeColors = {
  background: "#121522",
  foreground: "#f5f2ff",
  primary: "#d9bd7b",
  secondary: "#d9bd7b",
  accent: "#d9bd7b",
};

const props = defineProps<{
  editingTheme?: UserTheme;
}>();

const emit = defineEmits<{
  handleClose: [];
}>();

const themeDraft = ref<ThemeDraft>(createDefaultDraft());
const wallpaperInputRef = useTemplateRef("wallpaperInputRef");
const wallpaperBlob = ref<Blob | undefined>();
const wallpaperBlobUrl = useObjectUrl(wallpaperBlob);

const previewCssString = computed<string>(() => {
  if (themeDraft.value.wallpaperType === "photo") {
    if (!!wallpaperBlob.value) {
      return `url("${wallpaperBlobUrl.value}")`;
    } else {
      return "";
    }
  }
  return layersToCss(themeDraft.value.gradientData);
});

function createDefaultDraft(): ThemeDraft {
  return {
    name: "",
    wallpaperType: "gradient",
    wallpaper: {
      blurValue: 0,
    },
    gradientData: [],
    colors: { ...defaultColors },
  };
}

const saveTheme = () => {
  const name = themeDraft.value.name.trim();
  if (
    !name ||
    (themeDraft.value.wallpaperType === "photo" && !themeDraft.value.wallpaper)
  ) {
    return;
  }

  const id = props.editingTheme?.id ?? crypto.randomUUID();
  const wallpaperId = themeDraft.value.wallpaper.id ?? crypto.randomUUID();

  if (themeDraft.value.wallpaperType === "photo" && wallpaperBlob.value) {
    saveImage({ id: wallpaperId, blob: wallpaperBlob.value });
  }

  const theme: UserTheme =
    themeDraft.value.wallpaperType === "photo"
      ? {
          id,
          name,
          wallpaperType: "photo",
          wallpaper: {
            id: wallpaperId,
            blurValue: themeDraft.value.wallpaper.blurValue,
          },
          colors: { ...themeDraft.value.colors },
        }
      : {
          id,
          name,
          wallpaperType: "gradient",
          gradientLayers: themeDraft.value.gradientData,
          colors: { ...themeDraft.value.colors },
        };
  const themes = [...storage.settings.customThemes];
  const index = themes.findIndex((item) => item.id === id);

  if (index === -1) themes.push(theme);
  else themes[index] = theme;

  storage.settings.customThemes = themes;
  storage.settings.theme = id;

  emit("handleClose");
};

const handleWallpaperChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const wallpaperId = crypto.randomUUID();

  const fileBlob = new Blob([await file.arrayBuffer()]);
  wallpaperBlob.value = fileBlob;
  themeDraft.value.wallpaper.id = wallpaperId;
  input.value = "";
};

watchEffect(async () => {
  const theme = props.editingTheme;

  if (theme) {
    const isHasWallpaper = theme.wallpaperType === "photo";

    if (isHasWallpaper) {
      const wallpaper = await getImageById(theme.wallpaper.id);

      if (wallpaper) {
        wallpaperBlob.value = wallpaper.blob;
      }
    }

    themeDraft.value = {
      name: theme.name,
      wallpaperType: theme.wallpaperType,
      wallpaper: {
        id: isHasWallpaper ? theme.wallpaper.id : "",
        blurValue: isHasWallpaper ? theme.wallpaper.blurValue : 0,
      },
      gradientData:
        theme.wallpaperType === "gradient" ? theme.gradientLayers : [],
      colors: { ...defaultColors, ...theme.colors },
    };

  } else {
    themeDraft.value = createDefaultDraft();
  }
});
</script>

<template>
  <Dialog>
    <DialogContent
      class="max-w-[98vw] sm:max-w-[98w] md:max-w-[98w] lg:max-w-[98w]"
    >
      <DialogHeader>
        <DialogTitle>
          {{
            editingTheme ? t("settings.editTheme") : t("settings.createTheme")
          }}
        </DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <div class="max-h-[80vh] pr-2 overflow-y-auto">
        <div class="flex justify-center gap-4">
          <div class="sticky top-0 h-min w-[40%]">
            <div
              class="h-68 mb-4 bg-contain bg-center bg-no-repeat blur-sm"
              :style="{
                backgroundImage: previewCssString,
                '--tw-blur': themeDraft.wallpaper.blurValue
                  ? `blur(${themeDraft.wallpaper.blurValue}px)`
                  : '0',
              }"
            ></div>
            <div class="flex gap-2">
              <Button
                type="button"
                class="flex-1"
                :disabled="
                  !themeDraft.name.trim() ||
                  (themeDraft.wallpaperType === 'photo' &&
                    !themeDraft.wallpaper.id)
                "
                @click="saveTheme"
              >
                {{ t("settings.saveTheme") }}
              </Button>
              <Button
                type="button"
                variant="ghost"
                @click="
                  () => {
                    emit('handleClose');
                  }
                "
              >
                {{ t("settings.cancelTheme") }}
              </Button>
            </div>
          </div>
          <FieldGroup class="w-[60%]">
            <Field>
              <FieldLabel for="custom-theme-name">
                {{ t("settings.themeName") }}
              </FieldLabel>
              <Input
                id="custom-theme-name"
                v-model="themeDraft.name"
                class="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                :placeholder="t('settings.themeName')"
              />
            </Field>
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
                :for="color[0]"
              >
                {{ color[1] }}
                <input
                  v-model="themeDraft.colors[color[0]]"
                  :id="color[0]"
                  type="color"
                  class="size-8 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              </label>
            </div>
            <Field>
              <FieldLabel for="wallpaper-type">
                {{ t("settings.wallpaperType") }}
              </FieldLabel>
              <Select
                id="wallpaper-type"
                v-model="themeDraft.wallpaperType"
                class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              >
                <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="photo">
                    {{ t("settings.imageWallpaper") }}
                  </SelectItem>
                  <SelectItem value="gradient">{{
                    t("settings.gradient")
                  }}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div v-if="themeDraft.wallpaperType === 'gradient'">
              <GradientBuilder v-model="themeDraft.gradientData" />
            </div>

            <input
              ref="wallpaperInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleWallpaperChange"
            />
            <FieldGroup v-if="themeDraft.wallpaperType === 'photo'">
              <Button
                type="button"
                variant="secondary"
                class="w-full"
                @click="wallpaperInputRef?.click()"
              >
                <UploadIcon />{{ t("settings.chooseWallpaper") }}
              </Button>
              <Field class="mb-6">
                <FieldLabel for="wallpaper-blur"> {{ t('themeEditor.blurLabel') }} </FieldLabel>
                <Slider
                  :min="0"
                  :max="40"
                  :model-value="[themeDraft.wallpaper.blurValue]"
                  @update:model-value="
                    (newValue) => {
                      themeDraft.wallpaper.blurValue = newValue?.pop() ?? 0;
                    }
                  "
                  id="wallpaper-blur"
                />
              </Field>
            </FieldGroup>
          </FieldGroup>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
