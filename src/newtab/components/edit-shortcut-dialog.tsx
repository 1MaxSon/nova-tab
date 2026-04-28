import { type ComponentProps, memo, useState } from "react";
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
import { saveIcon } from "@/lib/storage";
import type { ShortcutGroupType, ShortcutType } from "@/lib/types";
import type { CreateShortcutInput } from "@/lib/utils";
import CreateShortcutForm from "@/newtab/components/create-shortcut-form";

const EditShortcutDialog = ({
	shortcut,
	children,
	onIconChange,
	...props
}: { shortcut: ShortcutType; onIconChange: () => void } & ComponentProps<
	typeof DialogTrigger
>) => {
	const { saveShortcuts, storage } = useStorage();

	const [open, setOpen] = useState(false);

	const [formData, setFormData] = useState<
		OmitTyped<CreateShortcutInput, "groupId" | "id"> & { newIcon?: Blob }
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
			await saveIcon({ id: shortcut.id, blob: formData.newIcon });
			onIconChange();
		}

		if (shortcutGroup) {
			saveShortcuts(
				storage.shortcuts.map((s) => {
					if (s.type === "group" && s.id === shortcutGroup.id) {
						return {
							...s,
							items: changedShortcuts,
						};
					}
					return s;
				}),
			);
		} else {
			saveShortcuts(changedShortcuts);
		}

		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger {...props}>{children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>Edit shortcut</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onFormSubmit();
					}}
				>
					<div className="grid grid-cols-1 gap-4">
						<Field>
							<FieldLabel htmlFor="newIcon">New icon (Optional)</FieldLabel>
							<Input
								type="file"
								name="newIcon"
								id="newIcon"
								accept="image/*"
								onChange={(e) => {
									if (!e.target.files) return;

									const files = Array.from(e.target.files);

									setFormData((prev) => ({
										...prev,
										newIcon: files.pop(),
									}));
								}}
							/>
							<FieldDescription>
								The colors will not be changed
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
							<Button type="submit">Save</Button>
						</Field>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default memo(EditShortcutDialog);
