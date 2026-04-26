import { useStorage } from "@/components/providers/storage-provider";
import CreateShortcutDialog from "@/newtab/components/create-shortcut-dialog";
import ShortcutItem from "@/newtab/components/shortcut-item";

const Shortcuts = ({ className }: { className?: string }) => {
	const { storage } = useStorage();

	return (
		<section className={className}>
			<div className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(256px,1fr))] justify-center gap-3">
				{storage.shortcuts.map((shortcut) => (
					<ShortcutItem key={shortcut.id} shortcut={shortcut} />
				))}
				<CreateShortcutDialog />
			</div>
		</section>
	);
};

export default Shortcuts;
