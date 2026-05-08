import {
	type ComponentProps,
	type CSSProperties,
	useCallback,
	useEffect,
	useState,
} from "react";
import { getIconByName } from "@/lib/storage";
import type { ShortcutType } from "@/lib/types";
import { cn } from "@/lib/utils";

const PreviewShortcutItem = ({
	shortcut,
	className,
	style,
	...props
}: { shortcut: ShortcutType } & ComponentProps<"div">) => {
	const [iconBlob, setIconBlob] = useState<Blob | undefined>(undefined);
	const [iconBlobUrl, setIconBlobUrl] = useState<string | undefined>(undefined);

	const loadIcon = useCallback(async () => {
		const icon = await getIconByName(shortcut.id);
		if (icon) setIconBlob(icon.blob);
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
			className={cn([
				className,
				"flex flex-col items-center justify-center gap-1 bg-(--color) p-2 rounded-lg min-h-0 overflow-hidden",
			])}
			style={
				{
					"--color": shortcut.accentColor,
					"--muted-color": shortcut.mutedColor,
				} as CSSProperties
			}
			{...props}
		>
			<img
				src={iconBlobUrl}
				alt={shortcut.name}
				className="min-h-0 flex-1 w-auto max-w-full object-contain"
			/>
		</div>
	);
};

export default PreviewShortcutItem;
