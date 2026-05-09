import { lazy, Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import Clock from "@/newtab/components/clock";
import DateWithWeather from "@/newtab/components/date-with-weather";
import SearchBar from "@/newtab/components/search-bar";

const Shortcuts = lazy(() => import("@/newtab/components/shortcuts"));
const SettingsDrawer = lazy(
	() => import("@/newtab/components/settings-drawer"),
);

export default function NovaTab() {
	return (
		<>
			<div className="fixed inset-0 z-0 nova-gradient" />
			<div className="nova-bg-grain z-0" />

			<main className="relative flex flex-col items-center justify-center px-12 py-6">
				<div className="flex flex-col items-center">
					<Clock className="mb-3 animate-in fade-in duration-300" />
					<DateWithWeather className="mb-10 animate-in fade-in duration-300 flex-col md:flex-row" />
				</div>

				<SearchBar className="max-w-135 mb-10 animate-in fade-in duration-300" />

				<Suspense fallback={<Spinner />}>
					<Shortcuts className="w-full" />
				</Suspense>

				<Suspense fallback={<Spinner className="absolute top-4 right-4" />}>
					<SettingsDrawer />
				</Suspense>
			</main>
		</>
	);
}
