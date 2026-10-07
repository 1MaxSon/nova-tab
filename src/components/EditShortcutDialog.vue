<script setup lang="ts">
import CreateShortcutForm from "@/components/CreateShortcutForm.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogTrigger from "@/components/ui/dialog/DialogTrigger.vue";
import Field from "@/components/ui/field/Field.vue";
import FieldDescription from "@/components/ui/field/FieldDescription.vue";
import FieldLabel from "@/components/ui/field/FieldLabel.vue";
import Input from "@/components/ui/input/Input.vue";
import { isDev } from "@/lib/helpers";
import { t } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import {
  CreateShortcutInput,
  ShortcutGroupType,
  ShortcutType,
} from "@/lib/types";
import { fetchFaviconBlob } from "@/lib/utils/favicon";
import { saveImage } from "@/lib/utils/img-idb";
import { RefreshCwIcon } from "@lucide/vue";
import { ref } from "vue";

const props = defineProps<{
  shortcut: ShortcutType;
}>();

const emit = defineEmits<{
  "icon-change": [];
}>();

const isDialogOpen = ref(false);
const isIconRefreshing = ref(false);

const formData = ref<Omit<CreateShortcutInput, "groupId"> & { newIcon?: File }>(
  props.shortcut,
);

const onFormSubmit = async () => {
  const shortcutGroup = storage.shortcuts.find(
    (p): p is ShortcutGroupType => p.id === props.shortcut.groupId,
  );

  const affectedShortcuts = shortcutGroup
    ? shortcutGroup.items
    : storage.shortcuts.filter((p): p is ShortcutType => p.type === "shortcut");

  const changedShortcuts = affectedShortcuts.map((s): ShortcutType => {
    if (s.id === props.shortcut.id)
      return {
        ...props.shortcut,
        url: formData.value.url,
        name: formData.value.name ?? "",
        accentColor: formData.value.accentColor ?? "#000",
        mutedColor: formData.value.mutedColor ?? "#000",
      };

    return s;
  });

  if (
    formData.value.newIcon &&
    Object.keys(formData.value.newIcon).length > 0
  ) {
    await saveImage({
      id: props.shortcut.id,
      blob: formData.value.newIcon,
    });
    emit("icon-change");
  }

  if (shortcutGroup) {
    storage.shortcuts = storage.shortcuts.map((s) => {
      if (s.type === "group" && s.id === shortcutGroup.id) {
        return {
          ...s,
          items: changedShortcuts.map((s) => ({
            ...s,
            groupId: shortcutGroup.id,
          })),
        };
      }
      return s;
    });
  } else {
    storage.shortcuts = storage.shortcuts.map((s) => {
      const changed = changedShortcuts.find((c) => c.id === s.id);
      return changed ?? s;
    });
  }
  isDialogOpen.value = false;
};

const refreshIcon = async () => {
  if (!formData.value.url) return;

  isIconRefreshing.value = true;
  const result = await fetchFaviconBlob(formData.value.url);

  if (!result) {
    alert(t("shortcut.faviconError"));
    return;
  }

  const { iconBlob } = result;

  if (iconBlob) {
    await saveImage({
      id: props.shortcut.id,
      blob: iconBlob,
    });

    emit("icon-change");
  }

  isIconRefreshing.value = false;
};
</script>

<template>
  <Dialog
    :open="isDialogOpen"
    @update:open="
      (val) => {
        isDialogOpen = val;
      }
    "
  >
    <DialogTrigger v-bind="$attrs">
      <slot></slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ t("shortcut.editTitle") }}
        </DialogTitle>
        <DialogDescription>
          {{ isDev ? `#${shortcut.id}` : "" }}
        </DialogDescription>
      </DialogHeader>
      <form
        @submit="
          async (e) => {
            e.preventDefault();
            await onFormSubmit();
          }
        "
      >
        <div class="grid grid-cols-1 gap-4">
          <Field>
            <FieldLabel for="newIcon">
              {{ t("shortcut.newIcon") }} ({{ t("common.optional") }})
            </FieldLabel>
            <div class="flex gap-2">
              <Input
                type="file"
                name="newIcon"
                id="newIcon"
                accept="image/*"
                @change="
                  (e: InputEvent) => {
                    const target = e.target as HTMLInputElement;

                    if (!target.files) return;

                    const files = Array.from(target.files);

                    const file = files.pop();

                    if (file) {
                      formData.newIcon = file;
                    }
                    target.value = '';
                  }
                "
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                :disabled="isIconRefreshing || !formData.url"
                :title="t('shortcut.refreshIcon')"
                :aria-label="t('shortcut.refreshIcon')"
                @click="refreshIcon"
              >
                <RefreshCwIcon :class="{ 'animate-spin': isIconRefreshing }" />
              </Button>
            </div>
            <FieldDescription>
              {{ t("shortcut.iconDescription") }}
            </FieldDescription>
          </Field>
          <CreateShortcutForm v-model="formData" />
          <Field>
            <Button type="submit">{{ t("common.save") }}</Button>
          </Field>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
