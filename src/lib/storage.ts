import type { Shortcut, WeatheCity } from "@/lib/types";

const useChrome = typeof chrome !== "undefined" && chrome?.storage?.local;

function saveShortcuts(s: Shortcut[]) {
	useChrome
		? chrome.storage.local.set({ shortcuts: s })
		: localStorage.setItem("nova_shortcuts", JSON.stringify(s));
}
function saveWallpaper(w: object) {
	useChrome
		? chrome.storage.local.set({ wallpaper: w })
		: localStorage.setItem("nova_wallpaper", JSON.stringify(w));
}

function saveWeatherCity(c: WeatheCity) {
	useChrome
		? chrome.storage.local.set({ weatherCity: c })
		: localStorage.setItem("nova_weather_city", JSON.stringify(c));
}

async function loadData(): Promise<
	| {
			shortcuts: Shortcut[];
			wallpaper: object;
			weatherCity: WeatheCity | null;
	  }
	| object
> {
	return new Promise((resolve) => {
		if (typeof chrome !== "undefined") {
			chrome.storage.local.get(
				["shortcuts", "wallpaper", "weatherCity"],
				resolve,
			);
		} else {
			try {
				resolve({
					shortcuts: JSON.parse(
						localStorage.getItem("nova_shortcuts") || "[]",
					) as Shortcut[],
					wallpaper: JSON.parse(
						localStorage.getItem("nova_wallpaper") || "null",
					),
					weatherCity: JSON.parse(
						localStorage.getItem("nova_weather_city") || "null",
					) as WeatheCity | null,
				});
			} catch {
				resolve({});
			}
		}
	});
}

export { loadData, saveShortcuts, saveWallpaper, saveWeatherCity };
