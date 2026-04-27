import { useSortable } from "@dnd-kit/react/sortable";
import { Edit2Icon } from "lucide-react";
import { type ComponentProps, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getIconByName } from "@/lib/storage";
import type { Shortcut } from "@/lib/types";
import { cn } from "@/lib/utils";
import DeleteShortcutButton from "@/newtab/components/delete-shortcut-button";
import EditShortcutDialog from "@/newtab/components/edit-shortcut-dialog";

export type ShortcutItemCSSVars = React.CSSProperties & {
	"--color"?: string;
};

export const shortcutItemClassName =
	"flex flex-col items-center justify-center h-42 rounded-lg relative";

const ShortcutItem = ({
	className,
	shortcut,
	index,
	...props
}: {
	shortcut: Shortcut;
	index: number;
} & ComponentProps<"div">) => {
	const [iconBlob, setIconBlob] = useState<Blob | undefined>(undefined);
	const [iconBlobUrl, setIconBlobUrl] = useState<string | undefined>(undefined);

	const { ref, handleRef } = useSortable({
		id: shortcut.id,
		index: index,
	});

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
		<div className="relative group" {...props} ref={ref}>
			<a
				ref={handleRef}
				href={shortcut.url}
				rel="norefer"
				className={cn([className, shortcutItemClassName])}
				style={{
					background: shortcut.accentColor,
				}}
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
						style={
							{
								"--color": shortcut.mutedColor,
							} as ShortcutItemCSSVars
						}
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
				style={
					{
						"--color": shortcut.mutedColor,
					} as ShortcutItemCSSVars
				}
			/>
		</div>
	);
};

export default ShortcutItem;
