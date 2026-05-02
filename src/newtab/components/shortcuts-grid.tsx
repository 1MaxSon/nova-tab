import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ShortcutsGrid = ({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn([
				"grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(200px,1fr))] justify-center gap-3",
				className,
			])}
		>
			{children}
		</div>
	);
};

export default ShortcutsGrid;
