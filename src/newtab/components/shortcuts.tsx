import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useEffect, useState } from "react";
import { useStorage } from "@/components/providers/storage-provider";
import type { Shortcut } from "@/lib/types";
import CreateShortcutDialog from "@/newtab/components/create-shortcut-dialog";
import ShortcutItem from "@/newtab/components/shortcut-item";
import ShortcutsGrid from "@/newtab/components/shortcuts-grid";

const Shortcuts = ({ className }: { className?: string }) => {
	const { storage, saveShortcuts } = useStorage();
	const [shortcutItems, setShortcutItems] = useState<Shortcut[]>([]);

	useEffect(() => {
		setShortcutItems(storage.shortcuts.filter((p) => p.type === "shortcut"));
	}, [storage.shortcuts]);

	return (
		<section className={className}>
			<ShortcutsGrid>
				<DragDropProvider
					onDragEnd={(event) => {
						const movedShortcuts = move(shortcutItems, event);

						setShortcutItems(movedShortcuts);
						saveShortcuts(movedShortcuts);
					}}
				>
					{shortcutItems.map((shortcut, idx) => (
						<ShortcutItem key={shortcut.id} index={idx} shortcut={shortcut} />
					))}
				</DragDropProvider>
				<CreateShortcutDialog />
			</ShortcutsGrid>
		</section>
	);
};

export default Shortcuts;
