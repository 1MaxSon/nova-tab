import BraveIcon from "@/components/icons/BraveIcon.vue";
import ChromeIcon from "@/components/icons/ChromeIcon.vue";
import DuckDuckGoIcon from "@/components/icons/DuckDuckGoIcon.vue";
import EcosiaIcon from "@/components/icons/EcosiaIcon.vue";
import GoogleIcon from "@/components/icons/GoogleIcon.vue";
import YahooIcon from "@/components/icons/YahooIcon.vue";
import YandexIcon from "@/components/icons/YandexIcon.vue";
import BingIcon from "@/components/icons/BingIcon.vue";
import { Component, computed } from "vue";
import { t } from "@/lib/i18n";

export type SearchEngine =
  "google" | "bing" | "duckduckgo" | "yahoo" | "yandex" | "brave" | "ecosia";

const searchEngines: Record<SearchEngine, (query: string) => string> = {
  google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  yahoo: (q) => `https://search.yahoo.com/search?p=${encodeURIComponent(q)}`,
  yandex: (q) => `https://yandex.com/search/?text=${encodeURIComponent(q)}`,
  brave: (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  ecosia: (q) => `https://www.ecosia.org/search?q=${encodeURIComponent(q)}`,
};

export function getSearchUrl(engine: SearchEngine, query: string): string {
  const builder = searchEngines[engine];

  return builder(query);
}

type SearchEngineIcon = {
  label: string;
  icon: Component;
};

export const searchEngineIcons = computed<
  Record<SearchEngine | "default", SearchEngineIcon>
>(() => ({
  default: {
    label: t("search.engineDefault"),
    icon: ChromeIcon,
  },
  google: {
    label: "Google",
    icon: GoogleIcon,
  },
  bing: {
    label: "Bing",
    icon: BingIcon,
  },
  brave: {
    label: "Brave",
    icon: BraveIcon,
  },
  duckduckgo: {
    label: "DuckDuckGo",
    icon: DuckDuckGoIcon,
  },
  ecosia: {
    label: "Ecosia",
    icon: EcosiaIcon,
  },
  yahoo: {
    label: "Yahoo",
    icon: YahooIcon,
  },
  yandex: {
    label: t("search.engineYandex"),
    icon: YandexIcon,
  },
}));
