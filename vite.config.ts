import path from "node:path";
import { crx } from "@crxjs/vite-plugin";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import zip from "vite-plugin-zip-pack";
import manifest from "./manifest.config.ts";
import packageJson from "./package.json" with { type: "json" };
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": `${path.resolve(import.meta.dirname, "./src")}`,
    },
  },
  plugins: [
    vue({ features: { optionsAPI: false } }),
    crx({ manifest }),
    zip({
      outDir: "release",
      outFileName: `crx-${packageJson.name}-${packageJson}.zip`,
    }),
    tailwindcss(),
  ],
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
