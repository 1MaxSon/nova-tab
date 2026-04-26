import { TrashIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import { Button } from "@/components/ui/button";
import { deleteIcon } from "@/lib/storage";
import type { Shortcut } from "@/lib/types";

const DeleteShortcutButton = ({
	shortcut,
	onClick,
	...props
}: { shortcut: Shortcut } & OmitTyped<
	ComponentProps<typeof Button>,
	"children"
>) => {
	const { storage, saveShortcuts } = useStorage();

	return (
		<Button
			{...props}
			onClick={async (e) => {
				onClick?.(e);
				saveShortcuts(storage.shortcuts.filter((p) => p.id !== shortcut.id));
				await deleteIcon(shortcut.id);
			}}
		>
			<TrashIcon />
		</Button>
	);
};

export default DeleteShortcutButton;
