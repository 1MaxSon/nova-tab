import { ChevronRightIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import { useChromeSearch } from "@/lib/hooks/use-chrome-search";
import { cn } from "@/lib/utils";

const SearchBar = ({ className }: { className?: string }) => {
	const { search } = useChromeSearch();
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<div className={cn(["relative w-full", className])}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					search(searchQuery);
				}}
			>
				<SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					placeholder="Search..."
					autoComplete="off"
					spellCheck="false"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full rounded-full border border-white/10 bg-white/5 px-14 py-4 text-base text-white outline-none transition duration-200 focus:border-white/20 focus:bg-white/10"
					id="search"
					name="search"
				/>
				<button
					type="submit"
					className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-primary/30 bg-primary/15 text-primary transition-colors hover:bg-primary/20"
				>
					<ChevronRightIcon className="translate-x-px" />
				</button>
			</form>
		</div>
	);
};

export default SearchBar;
