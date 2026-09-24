<script setup lang="ts">
import Field from "@/components/ui/field/Field.vue";
import FieldDescription from "@/components/ui/field/FieldDescription.vue";
import FieldLabel from "@/components/ui/field/FieldLabel.vue";
import Input from "@/components/ui/input/Input.vue";
import { t } from "@/lib/i18n";
import { CreateShortcutInput } from "@/lib/utils";


const formData = defineModel<CreateShortcutInput>({
  default: () => ({
    url: "",
    accentColor: "#000",
    mutedColor: "#000",
    name: "",
  }),
});

const { hasOptional } = defineProps<{
  hasOptional?: boolean;
}>();
</script>

<template>
  <div class="grid grid-cols-1 gap-4">
    <Field>
      <FieldLabel for="url">{{ t("shortcut.url") }}</FieldLabel>
      <Input
        id="url"
        name="url"
        autoComplete="off"
        required
        placeholder="https://example.com"
        type="url"
        v-model="formData.url"
      />
    </Field>
    <Field>
      <FieldLabel for="name">
        {{ t("shortcut.name") }}
        <template v-if="hasOptional">
          {{ `(${t("common.optional")})` }}
        </template>
      </FieldLabel>
      <Input
        id="name"
        name="name"
        autoComplete="off"
        placeholder="Example.com"
        v-model="formData.name"
      />
      <FieldDescription v-if="hasOptional">
        {{ t("shortcut.nameDescription") }}
      </FieldDescription>
    </Field>
    <Field>
      <FieldLabel htmlFor="accentColor">
        {{ t("shortcut.bgColor") }}
        <template v-if="hasOptional">
          {{ `(${t("common.optional")})` }}
        </template>
      </FieldLabel>
      <Input id="accentColor" type="color" v-model="formData.accentColor" />
      <FieldDescription v-if="hasOptional">{{
        t("shortcut.colorDescription")
      }}</FieldDescription>
    </Field>

    <Field>
      <FieldLabel htmlFor="mutedColor">
        {{ t("shortcut.mutedColor") }}
        <template v-if="hasOptional">
          {{ `(${t("common.optional")})` }}
        </template>
      </FieldLabel>
      <Input id="mutedColor" type="color" v-model="formData.mutedColor" />
      <FieldDescription v-if="hasOptional">
        {{ t("shortcut.colorDescription") }}
      </FieldDescription>
    </Field>
  </div>
</template>
