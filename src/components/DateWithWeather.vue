<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogContent from "@/components/ui/dialog/DialogContent.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DialogTrigger from "@/components/ui/dialog/DialogTrigger.vue";
import Field from "@/components/ui/field/Field.vue";
import FieldLabel from "@/components/ui/field/FieldLabel.vue";
import InputGroup from "@/components/ui/input-group/InputGroup.vue";
import InputGroupAddon from "@/components/ui/input-group/InputGroupAddon.vue";
import InputGroupInput from "@/components/ui/input-group/InputGroupInput.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Tooltip from "@/components/ui/tooltip/Tooltip.vue";
import TooltipContent from "@/components/ui/tooltip/TooltipContent.vue";
import TooltipTrigger from "@/components/ui/tooltip/TooltipTrigger.vue";
import { WEATHER_CODES } from "@/lib/constants";
import { currentLanguage, t, type TranslationKey } from "@/lib/i18n";
import { storage } from "@/lib/storage";
import { ForecastData } from "@/lib/types/open-meteo";
import { NominatimData } from "@/lib/types/openstreetmap";
import { buildWeatherProviderUrl, cn } from "@/lib/utils";
import { ArrowUp, MapPinIcon, MoveRightIcon, SearchIcon } from "@lucide/vue";
import { useDebounceFn, useIntervalFn, useLocalStorage } from "@vueuse/core";
import { ref, watch, watchEffect } from "vue";

type WeatherData = {
  icon: string;
  desc: TranslationKey;
  temperature: number;
  temperatureUnit: ForecastData["current_weather_units"]["temperature"];
  windSpeed: ForecastData["current_weather"]["windspeed"];
  windDirection: ForecastData["current_weather"]["winddirection"];
  fetchedAt: Date | string;
};

const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

const props = defineProps<{
  class: string;
}>();

const isDialogOpen = ref(false);

const date = ref(getDate(currentLanguage.value));
const cachedWeatherData = useLocalStorage<WeatherData | null>(
  "weatherData",
  null,
  {
    serializer: {
      read: (v: any) => (v ? JSON.parse(v) : null),
      write: (v: any) => JSON.stringify(v),
    },
  },
);
const weatherData = ref<WeatherData | null>(cachedWeatherData.value);

const isWeatherFetching = ref(false);
const weatherLink = ref("");

const selectedCity = ref<NominatimData | null>(null);

const addressQuery = ref("");
const isCitiesFetching = ref(false);
const suggestionItems = ref<NominatimData[]>([]);
const isSuggestionsPending = ref(false);
const fetchCitiesDebounce = useDebounceFn(fetchCities, 800);

useIntervalFn(() => {
  date.value = getDate(currentLanguage.value);
}, 1000);

const { pause: pauseWeatherFetch, resume: resumeWeatherFetch } = useIntervalFn(
  fetchWeather,
  TEN_MINUTES_IN_MS,
  { immediateCallback: true },
);

watch(
  () => storage.weatherCity,
  (value) => {
    value ? resumeWeatherFetch() : pauseWeatherFetch();
  },
);

watch(currentLanguage, (newValue) => {
  date.value = getDate(newValue);
});

watch(
  () => `${storage.settings.weatherUnit}_${storage.settings.windSpeedUnit}`,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      fetchWeather(true);
    }
  },
);

watch(weatherData, (newValue) => {
  cachedWeatherData.value = newValue;
});

watchEffect(() => {
  const { weatherCity, settings } = storage;
  weatherLink.value = weatherCity
    ? buildWeatherProviderUrl(settings.weatherProvider, weatherCity.name, {
        latitude: weatherCity.lat,
        longitude: weatherCity.lon,
      })
    : "#";
});

watchEffect(() => {
  isSuggestionsPending.value =
    fetchCitiesDebounce.isPending.value || isCitiesFetching.value;
});

async function fetchCities() {
  isCitiesFetching.value = true;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery.value)}&format=json&type=city`,
    { headers: { "Accept-Language": currentLanguage.value } },
  );

  const nominatimData = (await res.json()) as NominatimData[];

  if (!nominatimData || nominatimData.length === 0) {
    suggestionItems.value = [];
    isCitiesFetching.value = false;
    return;
  }

  suggestionItems.value = nominatimData;
  isCitiesFetching.value = false;
}

function getDate(locale: string) {
  const now = new Date();
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(now);
}

async function fetchWeather(force: boolean = false) {
  if (!storage.weatherCity) return;
  const now = new Date();

  if (!force && cachedWeatherData.value) {
    const whenCachedFetched = new Date(
      cachedWeatherData.value.fetchedAt,
    ).getTime();

    if (now.getTime() - whenCachedFetched < TEN_MINUTES_IN_MS) return;
  }

  try {
    isWeatherFetching.value = true;

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${storage.weatherCity.lat}&longitude=${storage.weatherCity.lon}` +
        `&current_weather=true&temperature_unit=${storage.settings.weatherUnit}&timezone=auto&wind_speed_unit=${storage.settings.windSpeedUnit}`,
      {
        signal: AbortSignal.timeout(10000),
      },
    );

    if (res.status !== 200) return;

    const data = (await res.json()) as ForecastData;

    const cw = data.current_weather;
    const [icon, desc] = WEATHER_CODES[cw.weathercode] || [
      "🌡️",
      "weather.condition.unknown",
    ];

    weatherData.value = {
      icon,
      desc,
      temperature: Math.floor(cw.temperature),
      temperatureUnit: data.current_weather_units.temperature,
      windSpeed: data.current_weather.windspeed,
      windDirection: data.current_weather.winddirection,
      fetchedAt: new Date(),
    };
  } catch {
  } finally {
    isWeatherFetching.value = false;
  }
}
</script>

<template>
  <div :class="cn(['flex items-center gap-3.5 min-h-11', props.class])">
    <span
      class="text-[0.85rem] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)]"
    >
      {{ date }}
    </span>
    <span
      class="size-1 rounded-full bg-[#c9a96e] opacity-60 shrink-0 hidden md:inline-block"
    ></span>
    <div class="flex items-center gap-2 relative">
      <Tooltip v-if="storage.weatherCity !== null">
        <TooltipTrigger as-child>
          <a
            :href="weatherLink"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-1 rounded-md text-base text-muted-foreground transition-colors duration-200 hover:bg-white/5 hover:text-white"
          >
            <Spinner v-if="isWeatherFetching" />
            <span v-else-if="weatherData">
              {{ `${weatherData.icon} ${t(weatherData.desc)}` }}
            </span>
            <span v-else>{{ t("weather.fetchingFailed") }}</span>

            <span class="text-muted-foreground">
              {{
                weatherData &&
                `${weatherData.temperature} ${weatherData.temperatureUnit}`
              }}
            </span>
          </a>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div class="flex flex-col gap-1">
            <span>
              {{
                `${storage.weatherCity.name}, ${storage.weatherCity.lat} / ${storage.weatherCity.lon}`
              }}
            </span>
            <div v-if="weatherData" class="flex items-center">
              {{
                `${t("weather.windSpeed")}: ${weatherData.windSpeed} ${t(`settings.units.${storage.settings.windSpeedUnit}`).toLowerCase()}`
              }}
              <ArrowUp
                class="size-4 ml-1"
                :style="{ rotate: `${weatherData.windDirection}deg` }"
              />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      <div
        v-else
        class="text-base text-muted-foreground flex items-center gap-2"
      >
        <span>{{ t("weather.selectCity") }}</span>
        <MoveRightIcon class="size-4 mt-1" />
      </div>

      <Dialog v-model:open="isDialogOpen">
        <Tooltip>
          <TooltipTrigger as-child>
            <DialogTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                :class="[
                  'text-muted-foreground',
                  {
                    'opacity-0 hover:opacity-100 transition-opacity duration-300 absolute -right-10':
                      storage.settings.transparentChangeGeo,
                  },
                ]"
              >
                <MapPinIcon />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {{ t("weather.changeAddress") }}
          </TooltipContent>
        </Tooltip>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ t("weather.changeAddress") }}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div class="min-h-48 flex flex-col w-full">
            <Field class="mb-4">
              <FieldLabel for="address">{{
                t("weather.addressPlaceholder")
              }}</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  v-model="addressQuery"
                  @input="
                    () => {
                      selectedCity = null;
                      fetchCitiesDebounce();
                    }
                  "
                  type="search"
                  autocomplete="street-address"
                  :placeholder="t('weather.addressPlaceholder')"
                  id="address"
                  name="address"
                />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <template
              v-if="
                addressQuery &&
                (suggestionItems.length > 0 || isSuggestionsPending)
              "
            >
              <Select
                v-if="!isSuggestionsPending"
                @update:model-value="
                  (value) => {
                    selectedCity = value as NominatimData;
                  }
                "
              >
                <SelectTrigger class="whitespace-normal h-auto! w-full">
                  <SelectValue :placeholder="t('weather.selectCity')" />
                </SelectTrigger>

                <SelectContent class="w-(--reka-select-trigger-width)">
                  <SelectItem
                    v-for="item in suggestionItems"
                    :key="item.osm_id"
                    :value="item"
                  >
                    <span class="block"
                      >{{ item.display_name }} ({{ item.addresstype }})</span
                    >
                  </SelectItem>
                </SelectContent>
              </Select>
              <Skeleton v-else class="w-full h-9" />

              <Button
                v-if="selectedCity"
                class="mt-4"
                variant="secondary"
                @click="
                  () => {
                    if (!selectedCity) return;

                    storage.weatherCity = {
                      name: selectedCity.name,
                      lat: Number(selectedCity.lat),
                      lon: Number(selectedCity.lon),
                    };

                    selectedCity = null;
                    addressQuery = '';
                    isDialogOpen = false;
                    fetchWeather(true);
                  }
                "
              >
                {{ t("common.select") }}
              </Button>
            </template>

            <div
              v-else-if="
                addressQuery &&
                !isSuggestionsPending &&
                suggestionItems.length === 0
              "
              class="text-center text-xl text-muted-foreground"
            >
              {{ t("common.notFound") }}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
