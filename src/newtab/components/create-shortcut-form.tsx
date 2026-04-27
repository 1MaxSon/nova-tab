import { memo } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Field, FieldLabel } from "@/components/ui/field";
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
			</Field>
		</>
	);
};

export default memo(CreateShortcutForm);
