import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { type CreateShortcutInput, cn, createShortcut } from "@/lib/utils";
import { shortcutItemClassName } from "@/newtab/components/shortcut-item";

const AddShortcutDialog = () => {
	const { saveShortcuts, storage } = useStorage();

	const [open, setOpen] = useState(false);

	const [formData, setFormData] = useState<CreateShortcutInput>({
		url: "",
		name: "",
		accentColor: undefined,
		mutedColor: undefined,
	});

	const [isPending, setIsPending] = useState(false);

	const onFormSubmit = async () => {
		setIsPending(true);
		setOpen(false);

		const newShortcut = await createShortcut(formData);

		const previousShortcutId =
			Math.max(0, ...storage.shortcuts.map((s) => s.id)) + 1;

		saveShortcuts([
			...storage.shortcuts,
			{ id: previousShortcutId, ...newShortcut },
		]);

		setFormData({ url: "", name: "" });
		setIsPending(false);
	};

	if (isPending)
		return (
			<div className={cn([shortcutItemClassName, "border border-accent"])}>
				<Spinner />
			</div>
		);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				type="button"
				className={cn([
					shortcutItemClassName,
					"border border-dashed rounded-lg border-accent text-accent bg-accent/2 hover:bg-accent/10 transition-colors",
				])}
			>
				<PlusIcon />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add a shortcut</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						await onFormSubmit();
					}}
				>
					<div className="grid grid-cols-1 gap-4">
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
									setFormData((prev) => ({ ...prev, url: e.target.value }));
								}}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="name">Name (Optional)</FieldLabel>
							<Input
								id="name"
								name="name"
								autoComplete="off"
								placeholder="Example.com"
								value={formData.name}
								onChange={(e) => {
									setFormData((prev) => ({ ...prev, name: e.target.value }));
								}}
							/>
							<FieldDescription>
								if it is empty, the domine site will be taken. For example
								Example.com
							</FieldDescription>
						</Field>
						<Field>
							<FieldLabel htmlFor="accentColor">Bg color (Optional)</FieldLabel>
							<Input
								id="accentColor"
								name="accentColor"
								autoComplete="off"
								type="color"
								value={formData.accentColor ?? "#000000"}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										accentColor: e.target.value,
									}));
								}}
							/>
							<FieldDescription>
								if it is empty, the color based on the icon will be taken.
							</FieldDescription>
						</Field>
						<Field>
							<FieldLabel htmlFor="mutedColor">
								Muted color for text (Optional)
							</FieldLabel>
							<Input
								id="mutedColor"
								name="mutedColor"
								autoComplete="off"
								type="color"
								value={formData.mutedColor ?? "#000000"}
								onChange={(e) => {
									setFormData((prev) => ({
										...prev,
										mutedColor: e.target.value,
									}));
								}}
							/>
							<FieldDescription>
								if it is empty, the color based on the icon will be taken.
							</FieldDescription>
						</Field>
						<Field>
							<Button type="submit">Create</Button>
						</Field>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddShortcutDialog;
