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
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { shortcutItemClassName } from "@/lib/constants";
import { t } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { cn, createShortcut, CreateShortcutInput } from "@/lib/utils";
import { PlusIcon } from "@lucide/vue";
import { ref } from "vue";

const isDialogOpen = ref(false);

const formData = ref<CreateShortcutInput>({
  url: "",
  name: "",
  accentColor: "",
  mutedColor: "",
});

const isPending = ref(false);

const onFormSubmit = async () => {
  isPending.value = true;
  isDialogOpen.value = false;

  const newShortcut = await createShortcut(formData.value);

  if (!newShortcut) {
    return;
  }

  storage.shortcuts = [...storage.shortcuts, newShortcut];

  formData.value = { url: "", name: "", accentColor: "", mutedColor: "" };

  isPending.value = false;
};
</script>

<template>
  <div
    v-if="isPending"
    :class="cn([shortcutItemClassName, 'border border-accent'])"
  >
    <Spinner />
  </div>
  <Dialog v-else v-model="isDialogOpen">
    <DialogTrigger
      type="button"
      :class="
        cn([
          shortcutItemClassName,
          'border border-dashed size-full border-accent text-accent bg-accent/2 hover:bg-accent/10 transition-all duration-300 animate-in fade-in',
          {
            'opacity-0 hover:opacity-100':
              storage.settings.transparentAddShortcut,
          },
        ])
      "
    >
      <PlusIcon />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ t("shortcut.createTitle") }}</DialogTitle>
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
          <CreateShortcutForm v-model="formData" hasOptional />
          <Field>
            <Button type="submit">{{ t("common.create") }}</Button>
          </Field>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
