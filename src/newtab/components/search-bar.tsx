import { ChevronRightIcon } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useStorage } from "@/components/providers/storage-provider";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useChromeSearch } from "@/lib/hooks/use-chrome-search";
import { useI18n } from "@/lib/i18n";
import { getSearchUrl, searchEngineIcons } from "@/lib/search-engines";
import type { SettingsData } from "@/lib/storage";
import { cn } from "@/lib/utils";

type DuckDuckGoSuggestions = [string, string[]];

const SearchBar = ({ className }: { className?: string }) => {
  const { search } = useChromeSearch();
  const { t } = useI18n();
  const listId = useId();
  const latestRequestRef = useRef(0);
  const typedQueryRef = useRef("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const {
    storage: { settings },
  } = useStorage();

  const loadSuggestions = useDebouncedCallback(async (searchValue: string) => {
    const normalizedSearchValue = searchValue.trim();

    if (!normalizedSearchValue) {
      setSuggestions([]);
      setIsFetching(false);
      return;
    }

    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;
    setIsFetching(true);

    try {
      const res = await fetch(
        `https://duckduckgo.com/ac/?q=${encodeURIComponent(normalizedSearchValue)}&type=list`,
      );
      const data = (await res.json()) as DuckDuckGoSuggestions;

      if (requestId !== latestRequestRef.current) return;

      setSuggestions(data[1]);
      setIsSuggestionsOpen(true);
    } catch {
      if (requestId !== latestRequestRef.current) return;
      setSuggestions([]);
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsFetching(false);
      }
    }
  }, 250);

  const searchCurrentQuery = () => {
    const query = searchQuery.trim();

    if (!query) return;

    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    if (settings.searchEngine === "default") search(query);
    else window.location.href = getSearchUrl(settings.searchEngine, query);
  };

  const updateQuery = (query: string) => {
    typedQueryRef.current = query;
    setSearchQuery(query);
    setActiveSuggestionIndex(-1);

    if (!query.trim()) {
      loadSuggestions.cancel();
      setSuggestions([]);
      setIsFetching(false);
      setIsSuggestionsOpen(false);
      return;
    }

    setIsSuggestionsOpen(true);
    loadSuggestions(query);
  };

  const selectSuggestionPreview = (nextIndex: number) => {
    setActiveSuggestionIndex(nextIndex);
    setSearchQuery(
      nextIndex === -1 ? typedQueryRef.current : suggestions[nextIndex],
    );
  };

  const hasSuggestions = suggestions.length > 0;
  const shouldShowSuggestions =
    isSuggestionsOpen &&
    (Boolean(searchQuery.trim()) || loadSuggestions.isPending() || isFetching);

  return (
    <div className={cn(["relative w-full", className])}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          searchCurrentQuery();
        }}
      >
        <SearchInput
          aria-activedescendant={
            activeSuggestionIndex >= 0
              ? `${listId}-${activeSuggestionIndex}`
              : undefined
          }
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={shouldShowSuggestions}
          autoComplete="off"
          onBlur={() => {
            window.setTimeout(() => setIsSuggestionsOpen(false), 100);
          }}
          onChange={(e) => updateQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim()) setIsSuggestionsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && hasSuggestions) {
              e.preventDefault();
              const nextIndex =
                activeSuggestionIndex >= suggestions.length - 1
                  ? -1
                  : activeSuggestionIndex + 1;
              selectSuggestionPreview(nextIndex);
            }

            if (e.key === "ArrowUp" && hasSuggestions) {
              e.preventDefault();
              const nextIndex =
                activeSuggestionIndex <= -1
                  ? suggestions.length - 1
                  : activeSuggestionIndex - 1;
              selectSuggestionPreview(nextIndex);
            }

            if (e.key === "Escape") {
              setSearchQuery(typedQueryRef.current);
              setActiveSuggestionIndex(-1);
              setIsSuggestionsOpen(false);
            }
          }}
          placeholder={t("search.placeholder")}
          role="combobox"
          spellCheck="false"
          value={searchQuery}
          id="searchInput"
        />
        {shouldShowSuggestions && (
          <div className="absolute top-full z-40 mt-1 w-full animate-in fade-in-0 zoom-in-95 px-4">
            <div
              className={cn(
                "overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-lg backdrop-blur-xl",
                !hasSuggestions &&
                  !(loadSuggestions.isPending() || isFetching) &&
                  "border-transparent bg-transparent shadow-none backdrop-blur-none",
              )}
            >
              {(loadSuggestions.isPending() || isFetching) && (
                <div className="grid grid-cols-1 gap-1 p-1">
                  {Array(6)
                    .fill(null)
                    .map((_, idx) => (
                      <Skeleton
                        className="h-9 w-full rounded-sm px-2 py-1.5"
                        key={idx}
                      />
                    ))}
                </div>
              )}
              {!(loadSuggestions.isPending() || isFetching) &&
                hasSuggestions && (
                  <div
                    id={listId}
                    role="listbox"
                    className="grid grid-cols-1 p-1"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        aria-selected={activeSuggestionIndex === index}
                        className={cn(
                          "flex h-9 cursor-pointer items-center rounded-sm px-2 text-left text-sm text-white transition-colors",
                          activeSuggestionIndex === index
                            ? "bg-white/15"
                            : "hover:bg-white/10",
                        )}
                        id={`${listId}-${index}`}
                        key={`${suggestion}-${index}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setIsSuggestionsOpen(false);
                          search(suggestion);
                        }}
                        role="option"
                        tabIndex={-1}
                        type="button"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;

const SearchInput = ({
  className,
  ...props
}: React.ComponentProps<"input">) => {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-14 w-full rounded-full border border-white/10 bg-white/5 p-2 text-base text-white outline-none transition duration-200 focus:border-white/20 focus:bg-white/10 *:data-[slot=input-group-addon]:pl-2!">
        <InputGroupAddon align="inline-start">
          <SearchEngineMenu />
        </InputGroupAddon>
        <input
          data-slot="command-input"
          className={cn(
            "ml-2 w-full bg-transparent text-sm outline-hidden",
            className,
          )}
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <button
            type="submit"
            className="size-9 place-items-center rounded-full border border-primary/30 bg-primary/15 text-primary transition-colors hover:bg-primary/20"
          >
            <ChevronRightIcon className="translate-x-px" />
          </button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

const SearchEngineMenu = () => {
  const {
    setSettings,
    storage: { settings },
  } = useStorage();

  const TriggerIcon = searchEngineIcons[settings.searchEngine].icon;

  return (
    <Select
      onValueChange={(val) => {
        const engine = val as SettingsData["searchEngine"];

        setSettings({
          ...settings,
          searchEngine: engine,
        });
      }}
      value={settings.searchEngine}
    >
      <SelectTrigger className="border-none px-0 pl-1">
        <TriggerIcon />
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        align="start"
        className="mt-4"
      >
        {Object.entries(searchEngineIcons).map(([engine, meta]) => {
          const Icon = meta.icon;
          return (
            <SelectItem
              key={engine}
              value={engine}
              className="focus:bg-primary/60"
            >
              <div className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="capitalize">{meta.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
