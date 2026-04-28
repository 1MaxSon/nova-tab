import path from "node:path";
import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import zip from "vite-plugin-zip-pack";
import manifest from "./manifest.config.js";
import { name, version } from "./package.json";

export default defineConfig({
	resolve: {
		alias: {
			"@": `${path.resolve(__dirname, "src")}`,
		},
	},
	plugins: [
		react(),
		crx({ manifest }),
		zip({ outDir: "release", outFileName: `crx-${name}-${version}.zip` }),
		tailwindcss(),
	],
	build: {
		rollupOptions: {
			output: {
				chunkFileNames: "chunks/[name]-[hash].js",
				entryFileNames: "[name]-[hash].js",
				assetFileNames: "assets/[name]-[hash][extname]",
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("@dnd-kit")) return "dnd-kit";
						if (id.includes("@base-ui")) return "ui-lib";
						if (id.includes("next-themes")) return "theme";
						if (id.includes("sonner")) return "sonner";
						if (id.includes("node-vibrant")) return "vibrant";

						return "vendor";
					}
				},
			},
		},
	},
	server: {
		cors: {
			origin: [/chrome-extension:\/\//],
		},
		port: 5173,
		strictPort: true,
		hmr: {
			host: "localhost",
			protocol: "ws",
			clientPort: 5173,
		},
	},
});
