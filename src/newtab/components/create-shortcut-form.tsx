import { memo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
				<FieldLabel htmlFor="url">Url</FieldLabel>
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
					Name {hasOptional && "(Optional)"}
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
					<FieldDescription>
						if it is empty, the domine site will be taken. For example
						Example.com
					</FieldDescription>
				)}
			</Field>
			<Field>
				<FieldLabel htmlFor="accentColor">
					Bg color {hasOptional && "(Optional)"}
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
					<FieldDescription>
						if it is empty, the color based on the icon will be taken.
					</FieldDescription>
				)}
			</Field>

			<Field>
				<FieldLabel htmlFor="mutedColor">
					Muted color {hasOptional && "(Optional)"}
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
					<FieldDescription>
						if it is empty, the color based on the icon will be taken.
					</FieldDescription>
				)}
			</Field>
		</>
	);
};

export default memo(CreateShortcutForm);
