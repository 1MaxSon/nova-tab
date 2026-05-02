import { lazy, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import Clock from "@/newtab/components/clock";
import DateWithWeather from "@/newtab/components/date-with-weather";
import SearchBar from "@/newtab/components/search-bar";

const Shortcuts = lazy(() => import("@/newtab/components/shortcuts"));

export default function NovaTab() {
	return (
		<>
			<div className="fixed inset-0 z-0 nova-gradient" />
			<div className="nova-bg-grain z-0" />

			<main className="relative flex flex-col items-center justify-center px-12 py-6">
				<div className="flex flex-col items-center">
					<Clock className="mb-3 animate-in duration-500" />
					<DateWithWeather className="mb-10 animate-in duration-500 delay-100 flex-col md:flex-row" />
				</div>

				<SearchBar className="max-w-135 mb-10 animate-in duration-500 delay-200" />

				<Suspense fallback={<Spinner />}>
					<Shortcuts className="w-full animate-in duration-500 delay-300" />
				</Suspense>
			</main>
		</>
	);
}
