import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { getIconByName } from "@/lib/storage";
import type { Shortcut } from "@/lib/types";
import { cn } from "@/lib/utils";

export const shortcutItemClassName =
	"flex flex-col items-center justify-center h-42 rounded-lg";

const ShortcutItem = ({
	className,
	shortcut,
}: {
	className?: string;
	shortcut: Shortcut;
}) => {
	const [iconBlob, setIconBlob] = useState<Blob | undefined>(undefined);
	const [iconBlobUrl, setIconBlobUrl] = useState<string | undefined>(undefined);

	useEffect(() => {
		const loadIcon = async () => {
			const icon = await getIconByName(shortcut.name);
			setIconBlob(icon.blob);
		};

		loadIcon();
	}, [shortcut.name]);

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
		<a
			href={shortcut.url}
			rel="norefer"
			className={cn([className, shortcutItemClassName])}
			style={{
				background: shortcut.accentColor,
			}}
		>
			{iconBlobUrl ? (
				<img src={iconBlobUrl} alt={shortcut.name} />
			) : (
				<Spinner />
			)}
			<span className="text-lg" style={{ color: shortcut.mutedColor }}>
				{shortcut.name}
			</span>
		</a>
	);
};

export default ShortcutItem;
