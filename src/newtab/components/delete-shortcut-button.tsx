import { TrashIcon } from "lucide-react";
import { type ComponentProps, memo } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import { Button } from "@/components/ui/button";
import { deleteIcon } from "@/lib/storage";
import type { ShortcutGroupType, ShortcutType } from "@/lib/types";

const DeleteShortcutButton = ({
	shortcut,
	onClick,
	...props
}: { shortcut: ShortcutType } & OmitTyped<
	ComponentProps<typeof Button>,
	"children"
>) => {
	const { storage, saveShortcuts } = useStorage();

	return (
		<Button
			{...props}
			onClick={async (e) => {
				onClick?.(e);

				if (shortcut.groupId) {
					const shortcutGroup = storage.shortcuts.find(
						(p): p is ShortcutGroupType =>
							p.type === "group" && p.id === shortcut.groupId,
					);

					if (shortcutGroup) {
						const shortcutGroupItems = shortcutGroup.items.filter(
							(p) => p.id !== shortcut.id,
						);

						saveShortcuts(
							storage.shortcuts.map((s) => {
								if (s.id === shortcutGroup.id) {
									return { ...s, items: shortcutGroupItems };
								}

								return s;
							}),
						);
					}
				} else {
					saveShortcuts(storage.shortcuts.filter((p) => p.id !== shortcut.id));
				}

				await deleteIcon(shortcut.id);
			}}
		>
			<TrashIcon />
		</Button>
	);
};

export default memo(DeleteShortcutButton);
