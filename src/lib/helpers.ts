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

export async function getFaviconDisplay(url: string): Promise<string | null> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			return null;
		}

		const html = await response.text();

		const doc = new DOMParser().parseFromString(html, "text/html");

		const links = Array.from(
			doc.querySelectorAll<HTMLLinkElement>("link[rel]"),
		);

		const icons = links
			.map((link) => ({
				rel: link.rel.toLowerCase(),
				href: link.getAttribute("href"),
				type: link.getAttribute("type")?.toLowerCase() ?? "",
				sizes: link.getAttribute("sizes") ?? "",
			}))
			.filter((icon) => {
				if (!icon.href) {
					return false;
				}

				return (
					icon.rel.includes("icon") || icon.rel.includes("apple-touch-icon")
				);
			});

		if (icons.length === 0) {
			return null;
		}

		const filteredIcons = icons.filter((icon) => {
			const href = icon.href?.toLowerCase() ?? "";

			return (
				!href.includes("safari-pinned-tab") && !icon.rel.includes("mask-icon")
			);
		});

		const svgIcon = filteredIcons.find((icon) => {
			const href = icon.href?.toLowerCase() ?? "";

			return (
				icon.type.includes("svg") ||
				(href.endsWith(".svg") &&
					!href.includes("apple") &&
					!href.includes("mask"))
			);
		});

		if (svgIcon?.href) {
			return new URL(svgIcon.href, url).href;
		}

		const bestIcon = filteredIcons
			.map((icon) => {
				const match = icon.sizes.match(/^(\d+)x(\d+)$/i);

				return {
					...icon,
					size: match ? Number(match[1]) : 0,
				};
			})
			.sort((a, b) => b.size - a.size)[0];

		if (bestIcon?.href) {
			return new URL(bestIcon.href, url).href;
		}

		// 3. fallback favicon.ico
		return new URL("/favicon.ico", url).href;
	} catch {
		return null;
	}
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
