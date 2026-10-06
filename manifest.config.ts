import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json" with { type: "json" };
import { isDev } from "./src/lib/helpers.ts";

export default defineManifest({
  manifest_version: 3,
  name: `Nova Tab${isDev ? " DEV" : ""}`,
  description:
    "Nova Tab replaces the default new tab page with a focused dashboard: clock, date, weather, search, draggable shortcuts, themes",
  version: pkg.version,
  icons: {
    128: "public/icon.png",
  },
  action: {
    default_icon: {
      128: "public/icon.png",
    },
  },
  permissions: ["storage", "search", "tabs"],
  host_permissions: ["<all_urls>"],
  chrome_url_overrides: {
    newtab: "src/newtab/index.html",
  },
});
