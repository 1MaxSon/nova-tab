import type { ComponentType, SVGProps } from "react";
import BingIcon from "@/components/icons/bing-icon";
import BraveIcon from "@/components/icons/brave-icon";
import ChromeIcon from "@/components/icons/chrome-icon";
import DuckDuckGoIcon from "@/components/icons/duckduckgo-icon";
import EcosiaIcon from "@/components/icons/ecosia-icon";
import GoogleIcon from "@/components/icons/google-icon";
import YahooIcon from "@/components/icons/yahoo-icon";
import YandexIcon from "@/components/icons/yandex-icon";

export type SearchEngine =
  | "google"
  | "bing"
  | "duckduckgo"
  | "yahoo"
  | "yandex"
  | "brave"
  | "ecosia";

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
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const searchEngineIcons: Record<
  SearchEngine | "default",
  SearchEngineIcon
> = {
  default: {
    label: "Default",
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
    label: "Yandex",
    icon: YandexIcon,
  },
};
