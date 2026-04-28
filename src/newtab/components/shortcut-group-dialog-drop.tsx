import { useDroppable } from "@dnd-kit/react";
import { createPortal } from "react-dom";

const ShortcutGroupDialogDrop = () => {
	const { ref, isDropTarget } = useDroppable({
		id: "dialogDrop",
		type: "group-dialog-drop",
		collisionPriority: 1,
	});

	return createPortal(
		<div
			ref={ref}
			className={`fixed inset-0 z-20 transition-colors ${isDropTarget ? "bg-accent/20" : ""}`}
		></div>,
		document.body,
	);
};

export default ShortcutGroupDialogDrop;
