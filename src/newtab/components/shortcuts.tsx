import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useStorage } from "@/components/providers/storage-provider";
import { generatePreviousId } from "@/lib/helpers";
import { shortcutSensor } from "@/lib/sensors";
import type { ShortcutGroupType, ShortcutType } from "@/lib/types";
import CreateShortcutDialog from "@/newtab/components/create-shortcut-dialog";
import ShortcutGroup from "@/newtab/components/shortcut-group";
import ShortcutItem from "@/newtab/components/shortcut-item";
import ShortcutsGrid from "@/newtab/components/shortcuts-grid";

const Shortcuts = ({ className }: { className?: string }) => {
	const { storage, saveShortcuts } = useStorage();

	const shortcutItems = storage.shortcuts;

	return (
		<section className={className}>
			<ShortcutsGrid>
				<DragDropProvider
					onDragEnd={(event) => {
						const { targetId } = (event.operation.target?.data ?? {}) as {
							targetId?: number;
						};

						if (targetId) {
							const sourceId = event.operation.source?.id as number | undefined;
							if (!sourceId) return;

							const targetIndex = shortcutItems.findIndex(
								(p) => p.type === "shortcut" && p.id === targetId,
							);

							const sourceShortcut = shortcutItems.find(
								(p) => p.type === "shortcut" && p.id === sourceId,
							) as ShortcutType | undefined;

							const targetShortcut = shortcutItems[targetIndex] as
								| ShortcutType
								| undefined;

							if (!targetShortcut || !sourceShortcut || targetIndex === -1)
								return;

							const previousId = generatePreviousId(shortcutItems);

							const newGroup: ShortcutGroupType = {
								id: previousId,
								items: [
									{ ...targetShortcut, groupId: previousId },
									{ ...sourceShortcut, groupId: previousId },
								],
								name: "Group",
								type: "group",
							};

							const withoutGrouped = shortcutItems.filter(
								(p) => p.id !== targetId && p.id !== sourceId,
							);

							const next = [
								...withoutGrouped.slice(0, targetIndex),
								newGroup,
								...withoutGrouped.slice(targetIndex),
							];

							saveShortcuts(next);
							return;
						}

						if (event.operation.target?.type === "shortcut-group-drop") {
							const shortcutId = event.operation.source?.id;
							const shortcutGroupId = event.operation.target?.data
								.groupId as number;

							if (!shortcutId || !shortcutGroupId) return;

							const shortcut = shortcutItems.find(
								(p): p is ShortcutType =>
									p.id === shortcutId && p.type === "shortcut",
							);

							if (!shortcut) return;

							const withoutShortcut = shortcutItems.filter(
								(p) => !(p.type === "shortcut" && p.id === shortcutId),
							);

							const changedShortcuts = withoutShortcut.map((item) => {
								if (item.type !== "group") return item;
								if (item.id !== shortcutGroupId) return item;

								return {
									...item,
									items: [
										...item.items,
										{ ...shortcut, groupId: shortcutGroupId },
									],
								} satisfies ShortcutGroupType;
							});

							saveShortcuts(changedShortcuts);
							return;
						}

						saveShortcuts(move(shortcutItems, event));
					}}
					sensors={[shortcutSensor]}
				>
					{shortcutItems.map((shortcut, idx) => {
						if (shortcut.type === "group") {
							return (
								<ShortcutGroup
									key={shortcut.id}
									index={idx}
									shortcutGroup={shortcut}
									className="h-42"
								/>
							);
						}

						return (
							<ShortcutItem key={shortcut.id} index={idx} shortcut={shortcut} />
						);
					})}
				</DragDropProvider>
				<CreateShortcutDialog />
			</ShortcutsGrid>
		</section>
	);
};

export default Shortcuts;
