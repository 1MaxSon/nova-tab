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
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { type CreateShortcutInput, cn, createShortcut } from "@/lib/utils";
import CreateShortcutForm from "@/newtab/components/create-shortcut-form";
import { shortcutItemClassName } from "@/newtab/components/shortcut-item";

const CreateShortcutDialog = () => {
	const { setShortcuts, storage } = useStorage();

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
		setShortcuts([...storage.shortcuts, newShortcut]);

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
					"border border-dashed size-full border-accent text-accent bg-accent/2 hover:bg-accent/10 transition-all duration-300 animate-in fade-in",
					{
						"opacity-0 hover:opacity-100 ":
							storage.settings.transparentAddShortcut,
					},
				])}
			>
				<PlusIcon />
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create a shortcut</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						await onFormSubmit();
					}}
				>
					<div className="grid grid-cols-1 gap-4">
						<CreateShortcutForm
							onFormDataChange={setFormData}
							formData={formData}
						/>
						<Field>
							<Button type="submit">Create</Button>
						</Field>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateShortcutDialog;
