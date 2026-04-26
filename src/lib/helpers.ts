import { Vibrant, WorkerPipeline } from "node-vibrant/worker";
import PipelineWorker from "node-vibrant/worker.worker?worker";

Vibrant.use(new WorkerPipeline(PipelineWorker as never));

export function domainFromUrl(url: string) {
	try {
		return new URL(url).hostname.replace("www.", "");
	} catch {
		return url;
	}
}

export function getFaviconDisplay(url: string) {
	return `https://www.google.com/s2/favicons?domain=${domainFromUrl(url)}&sz=64`;
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
