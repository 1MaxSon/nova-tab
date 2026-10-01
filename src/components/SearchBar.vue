<script setup lang="ts">
import SearchInput from "@/components/SearchInput.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import { t} from "@/lib/i18n";
import { getSearchUrl } from "@/lib/search-engines";
import { storage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useDebounceFn } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, useId, useTemplateRef } from "vue";

type DuckDuckGoSuggestions = [string, string[]];

const props = defineProps<{
  class: string;
}>();

const searchInput = useTemplateRef('searchInput');

const listId = useId();
const latestRequestRef = ref(0);
const typedQuery = ref("");
const searchQuery = ref("");
const suggestions = ref<string[]>([]);
const activeSuggestionIndex = ref(-1);
const isSuggestionsOpen = ref(false);
const isFetching = ref(false);

const hasSuggestions = computed(() => suggestions.value.length > 0);

const shouldShowSuggestions = computed(() => {
  return (
    isSuggestionsOpen.value &&
    (Boolean(searchQuery.value.trim()) ||
      loadSuggestions.isPending.value ||
      isFetching.value)
  );
});

const loadSuggestions = useDebounceFn(async (searchValue: string) => {
  const normalizedSearchValue = searchValue.trim();

  if (!normalizedSearchValue) {
    suggestions.value = [];
    isFetching.value = false;
    return;
  }

  const requestId = latestRequestRef.value + 1;
  latestRequestRef.value = requestId;
  isFetching.value = true;

  try {
    const res = await fetch(
      `https://duckduckgo.com/ac/?q=${encodeURIComponent(normalizedSearchValue)}&type=list`,
    );
    const data = (await res.json()) as DuckDuckGoSuggestions;

    if (requestId !== latestRequestRef.value) return;

    suggestions.value = data[1];
    isSuggestionsOpen.value = true;
  } catch {
    if (requestId !== latestRequestRef.value) return;
    suggestions.value = [];
  } finally {
    if (requestId === latestRequestRef.value) {
      isFetching.value = false;
    }
  }
}, 400);

onMounted(async () => {
  await nextTick();
  searchInput.value?.input?.focus();
})


const search = (query: string) => {
  if (!query.trim()) return;
  if (typeof chrome !== "undefined" && chrome.search?.query)
    chrome.search.query({ text: query, disposition: "CURRENT_TAB" });
  else
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
};

const searchInIncognito = async (query: string) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;

  if (typeof chrome !== "undefined" && chrome.search?.query && chrome.windows) {
    const allowed = await chrome.extension.isAllowedIncognitoAccess();
    if (!allowed) {
      alert(t("search.allowIncognito"));
      return;
    }

    try {
      const incognitoWindow = await chrome.windows.create({
        incognito: true,
        focused: true,
        state: "maximized",
        setSelfAsOpener: true,
      });

      const incognitoTabId = incognitoWindow?.tabs?.[0]?.id;

      if (!incognitoTabId) throw new Error();

      chrome.search.query({
        text: trimmedQuery,
        tabId: incognitoTabId,
      });
      window.close();
    } catch (error) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`,
        "_blank",
      );
    }
  } else {
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`;
  }
};

const searchCurrentQuery = () => {
  const query = searchQuery.value.trim();

  if (!query) return;

  isSuggestionsOpen.value = false;
  activeSuggestionIndex.value = -1;

  if (storage.settings.searchEngine === "default") search(query);
  else
    window.location.href = getSearchUrl(storage.settings.searchEngine, query);
};

const searchCurrentQueryInIncognito = () => {
  const query = searchQuery.value.trim();

  if (!query) return;

  isSuggestionsOpen.value = false;
  activeSuggestionIndex.value = -1;

  if (storage.settings.searchEngine === "default") searchInIncognito(query);
  else {
    chrome.windows.create({
      url: getSearchUrl(storage.settings.searchEngine, query),
      incognito: true,
      state: "maximized",
    });
    window.close();
  }
};

const updateQuery = async (query: string) => {
  typedQuery.value = query;
  searchQuery.value = query;

  activeSuggestionIndex.value = -1;

  if (!query.trim()) {
    loadSuggestions.cancel();
    suggestions.value = [];
    isFetching.value = false;
    isSuggestionsOpen.value = false;
    return;
  }

  isSuggestionsOpen.value = true;
  await loadSuggestions(query);
};

const selectSuggestionPreview = (nextIndex: number) => {
  activeSuggestionIndex.value = nextIndex;
  searchQuery.value =
    nextIndex === -1 ? typedQuery.value : suggestions.value[nextIndex];
};

const handleBlur = () => {
  setTimeout(() => (isSuggestionsOpen.value = false), 100);
};
</script>

<template>
  <div :class="cn(['relative w-full', props.class])">
    <form
      @submit="
        (e) => {
          e.preventDefault();
          searchCurrentQuery();
        }
      "
    >
      <SearchInput
        :aria-activedescendant="
          activeSuggestionIndex >= 0
            ? `${listId}-${activeSuggestionIndex}`
            : undefined
        "
        aria-autocomplete="list"
        :aria-controls="listId"
        :aria-expanded="shouldShowSuggestions"
        autocomplete="off"
        @blur="handleBlur"
        @input="
          (e: InputEvent) => {
            const target = e.target as HTMLInputElement;
            updateQuery(target.value);
          }
        "
        @incognito-request="searchCurrentQueryInIncognito"
        @focus="() => (searchQuery.trim() ? (isSuggestionsOpen = true) : '')"
        @keydown="
          (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' && hasSuggestions) {
              e.preventDefault();
              e.stopPropagation();
              isSuggestionsOpen = true;
              const nextIndex =
                activeSuggestionIndex >= suggestions.length - 1
                  ? -1
                  : activeSuggestionIndex + 1;
              selectSuggestionPreview(nextIndex);
            }

            if (e.key === 'ArrowUp' && hasSuggestions) {
              e.preventDefault();
              e.stopPropagation();
              isSuggestionsOpen = true;
              const nextIndex =
                activeSuggestionIndex <= -1
                  ? suggestions.length - 1
                  : activeSuggestionIndex - 1;
              selectSuggestionPreview(nextIndex);
            }

            if (e.key === 'Escape') {
              searchQuery = typedQuery;
              activeSuggestionIndex = -1;
              isSuggestionsOpen = false;
            }

            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              e.stopPropagation();
              searchCurrentQueryInIncognito();
            }
          }
        "
        :placeholder="t('search.placeholder')"
        role="combobox"
        spellCheck="false"
        :value="searchQuery"
        ref="searchInput"
      />
      <div
        v-if="shouldShowSuggestions"
        class="absolute top-full z-40 mt-1 w-full animate-in fade-in-0 zoom-in-95 px-4"
      >
        <div
          :class="
            cn(
              'overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-lg backdrop-blur-xl',
              !hasSuggestions &&
                !(loadSuggestions.isPending.value || isFetching) &&
                'border-transparent bg-transparent shadow-none backdrop-blur-none',
            )
          "
        >
          <div
            v-if="loadSuggestions.isPending.value || isFetching"
            class="grid grid-cols-1 gap-1 p-1"
          >
            <Skeleton
              v-for="(_, idx) in Array(6).fill(null)"
              class="h-9 w-full rounded-sm px-2 py-1.5"
              :key="idx"
            />
          </div>
          <div
            v-else-if="
              !(loadSuggestions.isPending.value || isFetching) && hasSuggestions
            "
            :id="listId"
            role="listbox"
            class="grid grid-cols-1 p-1 bg-background/80 border-none"
          >
            <button
              v-for="(suggestion, index) in suggestions"
              :aria-selected="activeSuggestionIndex === index"
              :class="
                cn(
                  'flex h-9 cursor-pointer items-center rounded-sm px-2 text-left text-sm text-foreground transition-colors',
                  activeSuggestionIndex === index
                    ? 'bg-accent/15'
                    : 'hover:bg-accent/10',
                )
              "
              :id="`${listId}-${index}`"
              :key="`${suggestion}-${index}`"
              @mousedown="(e) => e.preventDefault()"
              @mouseenter="() => (activeSuggestionIndex = index)"
              @click="(e) => {
                  searchQuery = suggestion;
                  isSuggestionsOpen = false;
                  (e.ctrlKey || e.metaKey) ? searchCurrentQueryInIncognito() : searchCurrentQuery();
                }
              "
              role="option"
              tabindex="-1"
              type="button"
            >
              {{ suggestion }}
            </button>
            <div class="px-2 flex flex-col md:flex-row items-center justify-between mt-2 gap-2">
                <span><kbd>Ctrl</kbd> + <kbd>Click/Enter</kbd> {{ t('search.ctrlToIncognito') }}</span>
                <span>Powered By DuckDuckGo</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
