import App from "./App.vue";
import "@/assets/globals.css";
import { createApp } from "vue";

await import("@/lib/i18n.ts");
await import("@/lib/storage.ts");

createApp(App).mount("#app");
