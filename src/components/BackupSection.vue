<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Field from "@/components/ui/field/Field.vue";
import FieldContent from "@/components/ui/field/FieldContent.vue";
import FieldDescription from "@/components/ui/field/FieldDescription.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import {
  exportData,
  importData,
  INVALID_BACKUP_FILE_ERROR,
} from "@/lib/backup";
import { t } from "@/lib/i18n";
import { DownloadIcon, UploadIcon } from "@lucide/vue";
import { ref, useTemplateRef } from "vue";

const isLoading = ref(false);
const backupError = ref<string | null>(null);
const fileInputRef = useTemplateRef("fileInputRef");

const runBackupAction = async (action: () => Promise<void>) => {  
  isLoading.value = true;
  backupError.value = null;

  try {
    await action();
  } catch (caughtError) {
    if (
      caughtError instanceof Error &&
      caughtError.message === INVALID_BACKUP_FILE_ERROR
    ) {
      backupError.value = t("settings.backupInvalidFile");
      return;
    }

    backupError.value = t("settings.backupError");
  } finally {
    isLoading.value = false;
  }
};

const handleExport = () => {
  void runBackupAction(exportData);
};

const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement;

  const file = target.files?.[0];
  target.value = "";

  if (!file) return;

  void runBackupAction(() => importData(file));
};
</script>

<template>
  <Field>
    <FieldContent>
      <div class="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="secondary"
          :disabled="isLoading"
          @click="handleExport"
        >
          <Spinner v-if="isLoading" />
          <DownloadIcon v-else />
          {{ t("settings.backupExport") }}
        </Button>
        <Button
          type="button"
          variant="secondary"
          :disabled="isLoading"
          @click="
            () => {
              fileInputRef?.click();
            }
          "
        >
          <Spinner v-if="isLoading" />
          <UploadIcon v-else />
          {{ t("settings.backupImport") }}
        </Button>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        accept=".zip"
        class="hidden"
        @change="handleImport"
      />
    </FieldContent>
    <FieldDescription>
      {{ backupError ?? t("settings.backupDescription") }}
    </FieldDescription>
  </Field>
</template>

<!-- 

import { DownloadIcon, UploadIcon } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { exportData, importData, INVALID_BACKUP_FILE_ERROR } from "@/lib/backup";
import { useI18n } from "@/lib/i18n";

const BackupSection = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { t } = useI18n();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const runBackupAction = async (action: () => Promise<void>) => {
		setIsLoading(true);
		setError(null);

		try {
			await action();
		} catch (caughtError) {
			if (
				caughtError instanceof Error &&
				caughtError.message === INVALID_BACKUP_FILE_ERROR
			) {
				setError(t("settings.backupInvalidFile"));
				return;
			}

			setError(t("settings.backupError"));
		} finally {
			setIsLoading(false);
		}
	};

	const handleExport = () => {
		void runBackupAction(exportData);
	};

	const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";


		if (!file) return;

		void runBackupAction(() => importData(file));
	};

	return (
		<Field>
			<FieldContent>
				<div class="grid grid-cols-2 gap-2">
					<Button
						type="button"
						variant="secondary"
						disabled={isLoading}
						onClick={handleExport}
					>
						{isLoading ? <Spinner /> : <DownloadIcon />}
						{t("settings.backupExport")}
					</Button>
					<Button
						type="button"
						variant="secondary"
						disabled={isLoading}
						onClick={() => fileInputRef.current?.click()}
					>
						{isLoading ? <Spinner /> : <UploadIcon />}
						{t("settings.backupImport")}
					</Button>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept=".zip"
					className="hidden"
					onChange={handleImport}
				/>
			</FieldContent>
			<FieldDescription>
				{error ?? t("settings.backupDescription")}
			</FieldDescription>
		</Field>
	);
};

export default BackupSection;
-->
