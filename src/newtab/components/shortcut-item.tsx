import { pointerIntersection } from "@dnd-kit/collision";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Edit2Icon, FolderPlusIcon } from "lucide-react";
import { type ComponentProps, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getIconByName } from "@/lib/storage";
import type { ShortcutType } from "@/lib/types";
import { cn } from "@/lib/utils";
import DeleteShortcutButton from "@/newtab/components/delete-shortcut-button";
import EditShortcutDialog from "@/newtab/components/edit-shortcut-dialog";

export const GROUP_DROP_PREFIX = "shortcut-drop:";

export type ShortcutItemCSSVars = React.CSSProperties & {
	"--color"?: string;
};

export const shortcutItemClassName =
	"flex flex-col items-center justify-center h-42 rounded-lg relative";

const ShortcutItem = ({
	className,
	shortcut,
	index,
	inGroup = false,
	...props
}: {
	shortcut: ShortcutType;
	index: number;
	inGroup?: boolean;
} & ComponentProps<"div">) => {
	const [iconBlob, setIconBlob] = useState<Blob | undefined>(undefined);
	const [iconBlobUrl, setIconBlobUrl] = useState<string | undefined>(undefined);

	const {
		ref: sortableRef,
		handleRef,
		sortable,
	} = useSortable({
		id: shortcut.id,
		index,
		collisionDetector: pointerIntersection,
		type: "shortcut",
		group: "main-shortcuts",
	});

	const manager = sortable.manager;

	const sourceId = manager?.dragOperation.source?.id;
	const sourceType = manager?.dragOperation.source?.type?.toString();

	const { ref: dropRef, isDropTarget } = useDroppable({
		id: `${GROUP_DROP_PREFIX}${shortcut.id}`,
		data: { targetId: shortcut.id },
		disabled: inGroup,
	});

	const isGroupTarget =
		isDropTarget && sourceId !== shortcut.id && sourceType === "shortcut";

	const loadIcon = useCallback(async () => {
		const icon = await getIconByName(shortcut.id);
		setIconBlob(icon.blob);
	}, [shortcut.id]);

	useEffect(() => {
		loadIcon();
	}, [loadIcon]);

	useEffect(() => {
		let _iconBlobUrl = "";
		if (iconBlob) {
			_iconBlobUrl = URL.createObjectURL(iconBlob);
			setIconBlobUrl(_iconBlobUrl);
		}
		return () => {
			if (_iconBlobUrl !== "") URL.revokeObjectURL(_iconBlobUrl);
		};
	}, [iconBlob]);

	return (
		<div
			className="relative group"
			{...props}
			ref={(e) => {
				sortableRef(e);
			}}
		>
			<a
				ref={handleRef}
				href={shortcut.url}
				rel="noreferrer"
				className={cn(className, shortcutItemClassName)}
				style={{ background: shortcut.accentColor }}
			>
				{iconBlobUrl ? (
					<img
						src={iconBlobUrl}
						alt={shortcut.name}
						className="size-20 object-cover mb-2"
					/>
				) : (
					<Spinner />
				)}
				<span className="text-lg" style={{ color: shortcut.mutedColor }}>
					{shortcut.name}
				</span>

				<div ref={dropRef} className="absolute inset-[25%] rounded-md z-0" />

				{isGroupTarget && (
					<div className="absolute flex flex-col items-center justify-center inset-0 rounded-lg bg-black/50 ...">
						<FolderPlusIcon className="size-8 text-white" />
						<span className="text-xl">Create a group</span>
					</div>
				)}
			</a>

			<EditShortcutDialog
				shortcut={shortcut}
				onIconChange={async () => {
					await loadIcon();
				}}
				render={
					<Button
						variant="ghost"
						size="icon"
						className="absolute top-1 right-1 text-transparent group-hover:text-(--color) transition-colors duration-300 z-10"
						style={{ "--color": shortcut.mutedColor } as ShortcutItemCSSVars}
					>
						<Edit2Icon />
					</Button>
				}
			/>
			<DeleteShortcutButton
				shortcut={shortcut}
				variant="ghost"
				size="icon"
				className="absolute bottom-1 right-1 text-transparent group-hover:text-(--color) transition-colors duration-300 z-10"
				style={{ "--color": shortcut.mutedColor } as ShortcutItemCSSVars}
			/>
		</div>
	);
};

export default ShortcutItem;
