import { useDebouncedCallback } from "use-debounce";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import type { CreateShortcutInput } from "@/lib/utils";

const CreateShortcutForm = ({
	formData,
	onFormDataChange,
	hasOptional = true,
}: {
	formData: CreateShortcutInput;
	onFormDataChange: (data: CreateShortcutInput) => void;
	hasOptional?: boolean;
}) => {
	const { t } = useI18n();
	const debouncedUpdate = useDebouncedCallback((data: CreateShortcutInput) => {
		onFormDataChange(data);
	}, 80);

	const handleChange = (key: keyof CreateShortcutInput, value: string) => {
		debouncedUpdate({
			...formData,
			[key]: value,
		});
	};

	return (
		<>
			<Field>
				<FieldLabel htmlFor="url">{t("shortcut.url")}</FieldLabel>
				<Input
					id="url"
					name="url"
					autoComplete="off"
					required
					placeholder="https://example.com"
					type="url"
					value={formData.url}
					onChange={(e) => {
						onFormDataChange({ ...formData, url: e.target.value });
					}}
				/>
			</Field>
			<Field>
				<FieldLabel htmlFor="name">
					{t("shortcut.name")} {hasOptional && `(${t("common.optional")})`}
				</FieldLabel>
				<Input
					id="name"
					name="name"
					autoComplete="off"
					placeholder="Example.com"
					value={formData.name}
					onChange={(e) => {
						onFormDataChange({ ...formData, name: e.target.value });
					}}
				/>
				{hasOptional && (
					<FieldDescription>{t("shortcut.nameDescription")}</FieldDescription>
				)}
			</Field>
			<Field>
				<FieldLabel htmlFor="accentColor">
					{t("shortcut.bgColor")} {hasOptional && `(${t("common.optional")})`}
				</FieldLabel>
				<Input
					id="accentColor"
					type="color"
					value={formData.accentColor ?? "#000000"}
					onChange={(e) => {
						handleChange("accentColor", e.target.value);
					}}
				/>
				{hasOptional && (
					<FieldDescription>{t("shortcut.colorDescription")}</FieldDescription>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="mutedColor">
					{t("shortcut.mutedColor")}{" "}
					{hasOptional && `(${t("common.optional")})`}
				</FieldLabel>
				<Input
					id="mutedColor"
					type="color"
					value={formData.mutedColor ?? "#000000"}
					onChange={(e) => {
						handleChange("mutedColor", e.target.value);
					}}
				/>
				{hasOptional && (
					<FieldDescription>{t("shortcut.colorDescription")}</FieldDescription>
				)}
			</Field>
		</>
	);
};

export default CreateShortcutForm;
