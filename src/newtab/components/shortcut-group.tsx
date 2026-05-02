import { pointerIntersection, shapeIntersection } from "@dnd-kit/collision";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { FolderPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useStorage } from "@/components/providers/storage-provider";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { shortcutSensor } from "@/lib/sensors";
import type { ShortcutGroupType } from "@/lib/types";
import { cn } from "@/lib/utils";
import PreviewShortcutItem from "@/newtab/components/preview-shortcut-item";
import ShortcutGroupDialogDrop from "@/newtab/components/shortcut-group-dialog-drop";
import ShortcutItem from "@/newtab/components/shortcut-item";
import ShortcutsGrid from "@/newtab/components/shortcuts-grid";

const ShortcutGroup = ({
	className,
	shortcutGroup,
	index,
}: {
	className?: string;
	shortcutGroup: ShortcutGroupType;
	index: number;
}) => {
	const { storage, setShortcuts } = useStorage();

	const [name, setName] = useState(shortcutGroup.name);
	const [debouncedName] = useDebounce(name, 200);

	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const {
		ref: sortableRef,
		handleRef,
		isDragging,
	} = useSortable({
		id: shortcutGroup.id,
		index,
		type: "shortcut-group",
		group: "main-shortcuts",
		collisionDetector: pointerIntersection,
	});

	const { ref: dropRef, isDropTarget } = useDroppable({
		id: `group-drop-${shortcutGroup.id}`,
		type: "shortcut-group-drop",
		data: {
			groupId: shortcutGroup.id,
		},
		collisionDetector: shapeIntersection,
		disabled: isDragging,
	});

	useEffect(() => {
		if (!debouncedName.trim()) return;
		setShortcuts(
			storage.shortcuts.map((s) =>
				s.type === "group" && s.id === shortcutGroup.id
					? { ...s, name: debouncedName }
					: s,
			),
		);
	}, [debouncedName, setShortcuts, shortcutGroup.id, storage.shortcuts.map]);

	return (
		<div
			ref={(e) => {
				dropRef(e);
				sortableRef(e);
				handleRef(e);
			}}
			className={cn([
				className,
				"overflow-hidden bg-accent/5 border-accent/40 border rounded-lg relative aspect-video",
			])}
		>
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogTrigger className="flex h-full w-full flex-col justify-between text-left">
					<div className="grid p-2 grid-cols-2 grid-rows-2 gap-1 rounded-md bg-black/10 min-h-0">
						{shortcutGroup.items.slice(0, 4).map((shortcut) => (
							<PreviewShortcutItem key={shortcut.id} shortcut={shortcut} />
						))}
					</div>

					<span className="text-lg text-center text-muted-foreground text-ellipsis overflow-clip shrink-0">
						{shortcutGroup.name}
					</span>
				</DialogTrigger>
				<DialogContent
					className="sm:max-w-[96vw] max-h-[70vh] overflow-y-auto bg-black/40"
					showCloseButton={false}
				>
					<DragDropProvider
						onDragEnd={(event) => {
							if (event.operation.target?.type === "group-dialog-drop") {
								const source = event.operation.source;
								if (!source) return;

								const shortcutToRemove = shortcutGroup.items.find(
									(p) => p.id === source.id,
								);

								if (!shortcutToRemove) return;

								const changedShortcutsInGroup = shortcutGroup.items.filter(
									(p) => p.id !== shortcutToRemove.id,
								);

								if (changedShortcutsInGroup.length === 0) {
									setIsDialogOpen(false);

									setShortcuts([
										...storage.shortcuts.filter(
											(p) => p.id !== shortcutGroup.id,
										),
										{
											...shortcutToRemove,
											groupId: undefined,
										},
									]);

									return;
								}

								setShortcuts([
									...storage.shortcuts.map((s) => {
										if (s.id !== shortcutGroup.id) return s;

										const changedShorcutGroup: ShortcutGroupType = {
											...shortcutGroup,
											items: changedShortcutsInGroup,
										};

										return changedShorcutGroup;
									}),
									{
										...shortcutToRemove,
										groupId: undefined,
									},
								]);

								return;
							}

							const movedShortcuts = move(shortcutGroup.items, event);

							setShortcuts(
								storage.shortcuts.map((data) => {
									if (data.id !== shortcutGroup.id) return data;

									const changedShorcutGroup: ShortcutGroupType = {
										...shortcutGroup,
										items: movedShortcuts,
									};

									return changedShorcutGroup;
								}),
							);
						}}
						sensors={[shortcutSensor]}
					>
						<div className="space-y-4 rounded-xl">
							<ShortcutsGrid className="gap-2">
								{shortcutGroup.items.map((shortcut, idx) => (
									<ShortcutItem
										key={shortcut.id}
										shortcut={shortcut}
										index={idx}
										inGroup
									/>
								))}
							</ShortcutsGrid>

							<input
								id={`group-name-${shortcutGroup.id}`}
								className="rounded-md text-lg text-center px-3 py-2 text-white outline-none w-full"
								value={name}
								onChange={(event) => setName(event.target.value)}
							/>
						</div>
						<ShortcutGroupDialogDrop />
					</DragDropProvider>
				</DialogContent>
			</Dialog>

			{isDropTarget && (
				<div className="inset-0 absolute flex items-center justify-center flex-col bg-black/80 rounded-lg">
					<FolderPlusIcon className="size-5" />
					<span className="text-xl">Add to the group</span>
				</div>
			)}
		</div>
	);
};

export default ShortcutGroup;
