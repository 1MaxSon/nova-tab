import { Vibrant, WorkerPipeline } from "node-vibrant/worker";
import PipelineWorker from "node-vibrant/worker.worker?worker";
import type { ShortcutData } from "@/lib/types";

Vibrant.use(new WorkerPipeline(PipelineWorker as never));

export function domainFromUrl(url: string) {
	try {
		return new URL(url).hostname.replace("www.", "");
	} catch {
		return url;
	}
}

export function getFaviconDisplay(url: string) {
	// return `https://www.google.com/s2/favicons?domain=${domainFromUrl(url)}&sz=64`;
	return `https://icons.duckduckgo.com/ip3/${domainFromUrl(url)}.ico`;
}

export async function extractIconPalette(blobUrl: string) {
	const palette = await Vibrant.from(blobUrl).getPalette();

	return palette;
}

export const getContrastYIQ = (hexcolor: string) => {
	const r = parseInt(hexcolor.substring(1, 3), 16);
	const g = parseInt(hexcolor.substring(3, 5), 16);
	const b = parseInt(hexcolor.substring(5, 7), 16);
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 128 ? "#000000" : "#ffffff";
};

export function generatePreviousId(shortcuts: ShortcutData[]) {
	const ids: number[] = [];

	shortcuts.forEach((s) => {
		ids.push(s.id);

		if (s.type === "group") {
			ids.push(...s.items.map((item) => item.id));
		}
	});

	return Math.max(0, ...ids) + 1;
}
