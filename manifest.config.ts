import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

const isDev = process.env.NODE_ENV === "development";

export default defineManifest({
  manifest_version: 3,
  name: `Nova Tab${isDev ? " DEV" : ""}`,
  version: pkg.version,
  icons: {
    48: "public/logo.png",
  },
  action: {
    default_icon: {
      48: "public/logo.png",
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
