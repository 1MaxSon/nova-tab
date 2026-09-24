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
import { t } from "@/lib/i18n";
import { saveIcon, storage } from "@/lib/storage";
import { ShortcutGroupType, ShortcutType } from "@/lib/types";
import { CreateShortcutInput, fetchFaviconBlob } from "@/lib/utils";
import { RefreshCwIcon } from "@lucide/vue";
import { ref } from "vue";

const props = defineProps<{
  shortcut: ShortcutType;
}>();

const emit = defineEmits<{
  iconChange: [];
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

  if (formData.value.newIcon) {
    await saveIcon({
      id: props.shortcut.id,
      blob: formData.value.newIcon,
      format: formData.value.newIcon.name.split(".").pop() ?? "image/x-icon",
    });
    emit("iconChange");
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
  console.log(isDialogOpen.value);
};

const refreshIcon = async () => {
  if (!formData.value.url) return;

  isIconRefreshing.value = true;
  const result = await fetchFaviconBlob(formData.value.url, {
    faviconErrorMessage: t("shortcut.faviconError"),
  });

  if (!result) {
    alert(t("shortcut.faviconError"));
    return;
  }

  const { iconFormat, iconBlob } = result;

  if (iconBlob) {
    await saveIcon({
      id: props.shortcut.id,
      blob: iconBlob,
      format: iconFormat,
    });
  }

  emit("iconChange");

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
        <DialogDescription></DialogDescription>
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
              {{ t("shortcut.newIcon") }} {{ t("common.optional") }}
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

                    formData.newIcon = file;
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

<!-- 

import { useStorage } from "@/components/providers/storage-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { t} from "@/lib/i18n";
import { saveIcon } from "@/lib/storage";
import type { ShortcutGroupType, ShortcutType } from "@/lib/types";
import { fetchFaviconBlob, type CreateShortcutInput } from "@/lib/utils";
import CreateShortcutForm from "@/newtab/components/create-shortcut-form";
import { RefreshCwIcon } from "lucide-react";
import { memo, useState, type ComponentProps } from "react";

const EditShortcutDialog = ({
  shortcut,
  children,
  onIconChange,
  ...props
}: { shortcut: ShortcutType; onIconChange: () => void } & ComponentProps<
  typeof DialogTrigger
>) => {
  const { setShortcuts, storage } = useStorage();
  

  const [open, setOpen] = useState(false);
  const [isIconRefreshing, setIsIconRefreshing] = useState(false);

  const [formData, setFormData] = useState<
    OmitTyped<CreateShortcutInput, "groupId" | "id"> & { newIcon?: File }
  >(shortcut);

  const onFormSubmit = async () => {
    const shortcutGroup = storage.shortcuts.find(
      (p): p is ShortcutGroupType => p.id === shortcut.groupId,
    );

    const affectedShortcuts = shortcutGroup
      ? shortcutGroup.items
      : storage.shortcuts.filter(
          (p): p is ShortcutType => p.type === "shortcut",
        );

    const changedShortcuts = affectedShortcuts.map((s): ShortcutType => {
      if (s.id === shortcut.id)
        return {
          ...shortcut,
          url: formData.url,
          name: formData.name ?? "",
          accentColor: formData.accentColor ?? "#000",
          mutedColor: formData.mutedColor ?? "#000",
        };

      return s;
    });

    if (formData.newIcon) {
      await saveIcon({
        id: shortcut.id,
        blob: formData.newIcon,
        format: formData.newIcon.name.split(".").pop() ?? "image/x-icon",
      });
      onIconChange();
    }

    if (shortcutGroup) {
      setShortcuts(
        storage.shortcuts.map((s) => {
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
        }),
      );
    } else {
      setShortcuts(
        storage.shortcuts.map((s) => {
          const changed = changedShortcuts.find((c) => c.id === s.id);
          return changed ?? s;
        }),
      );
    }

    setOpen(false);
  };

  const refreshIcon = async () => {
    if (!formData.url) return;

    setIsIconRefreshing(true);
    const result = await fetchFaviconBlob(formData.url, {
      faviconErrorMessage: t("shortcut.faviconError"),
    });

    if (!result) {
      alert(t("shortcut.faviconError"));
      return;
    }

    const { iconFormat, iconBlob } = result;

    if (iconBlob) {
      await saveIcon({ id: shortcut.id, blob: iconBlob, format: iconFormat });
    }

    onIconChange();

    setIsIconRefreshing(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger {...props}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>{t("shortcut.editTitle")}</DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onFormSubmit();
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            <Field>
              <FieldLabel htmlFor="newIcon">
                {t("shortcut.newIcon")} ({t("common.optional")})
              </FieldLabel>
              <div className="flex gap-2">
                <Input
                  type="file"
                  name="newIcon"
                  id="newIcon"
                  accept="image/*"
                  onChange={(e) => {
                    if (!e.target.files) return;

                    const files = Array.from(e.target.files);

                    const file = files.pop();

                    setFormData((prev) => ({
                      ...prev,
                      newIcon: file,
                    }));
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={isIconRefreshing || !formData.url}
                  title={t("shortcut.refreshIcon")}
                  aria-label={t("shortcut.refreshIcon")}
                  onClick={refreshIcon}
                >
                  <RefreshCwIcon
                    className={isIconRefreshing ? "animate-spin" : undefined}
                  />
                </Button>
              </div>
              <FieldDescription>
                {t("shortcut.iconDescription")}
              </FieldDescription>
            </Field>
            <CreateShortcutForm
              formData={formData}
              onFormDataChange={(data) => {
                setFormData((prev) => ({
                  ...data,
                  newIcon: prev.newIcon,
                }));
              }}
              hasOptional={false}
            />
            <Field>
              <Button type="submit">{t("common.save")}</Button>
            </Field>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default memo(EditShortcutDialog);
-->
