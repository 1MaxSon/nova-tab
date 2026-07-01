import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

const isDev = process.env.NODE_ENV === "development";

export default defineManifest({
  manifest_version: 3,
  name: `Nova Tab${isDev ? " DEV" : ""}`,
  description:
    "Nova Tab replaces the default new tab page with a focused dashboard: clock, date, weather, search, draggable shortcuts, themes, custom wallpapers",
  version: pkg.version,
  icons: {
    128: "public/icon.png",
  },
  action: {
    default_icon: {
      128: "public/icon.png",
    },
  },
  permissions: ["storage", "search"],
  host_permissions: [
    "<all_urls>",
    // "https://api.open-meteo.com/*",
    // "https://geocoding-api.open-meteo.com/*",
    // "https://nominatim.openstreetmap.org/*",
    // "https://icons.duckduckgo.com/ip3/*",
  ],
  chrome_url_overrides: {
    newtab: "src/newtab/index.html",
  },
});
