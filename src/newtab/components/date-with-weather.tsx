import { ArrowUp, MapPinIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useStorage } from "@/components/providers/storage-provider";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WEATHER_CODES } from "@/lib/constants";
import { useInterval } from "@/lib/hooks/use-interval";
import { useIntervalWhen } from "@/lib/hooks/use-interval-when";
import { useI18n } from "@/lib/i18n";
import type { ForecastData } from "@/lib/types/open-meteo";
import type { NominatimData } from "@/lib/types/openstreetmap";
import { buildWeatherProviderUrl, cn } from "@/lib/utils";

type Item =
  | { type: "skeleton"; id: number }
  | { type: "city"; data: NominatimData };

type WeatherData = {
  icon: string;
  desc: {
    en: string;
    ru: string;
  };
  temperature: number;
  temperatureUnit: ForecastData["current_weather_units"]["temperature"];
  windSpeed: ForecastData["current_weather"]["windspeed"];
  windDirection: ForecastData["current_weather"]["winddirection"];
};

const getDate = (locale: string) => {
  const now = new Date();
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(now);
};

const DateWithWeather = ({ className }: { className: string }) => {
  const { setWeatherCity, storage } = useStorage();
  const { language, t } = useI18n();
  const locale = language === "ru" ? "ru-RU" : "en-US";

  const [date, setDate] = useState(getDate(locale));
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isWeatherFetching, setIsWeatherFetching] = useState(false);
  const [selectedCity, setSelectedCity] = useState<NominatimData | null>(null);
  const [open, setOpen] = useState(false);
  const [isCitiesFetching, setIsCitiesFetching] = useState(false);
  const [addressAutoCompletes, setAddressAutoCompletes] = useState<
    NominatimData[]
  >([]);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressQueryDebounced, { isPending: isDebouncePending }] = useDebounce(
    addressQuery,
    800,
  );

  const fetchWeather = useCallback(async () => {
    if (!storage.weatherCity) return;

    try {
      setIsWeatherFetching(true);

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
        { en: "", ru: "" },
      ];

      setWeatherData({
        icon,
        desc,
        temperature: Math.floor(cw.temperature),
        temperatureUnit: data.current_weather_units.temperature,
        windSpeed: data.current_weather.windspeed,
        windDirection: data.current_weather.winddirection,
      });
    } catch {
    } finally {
      setIsWeatherFetching(false);
    }
  }, [
    storage.weatherCity,
    storage.settings.weatherUnit,
    storage.settings.windSpeedUnit,
  ]);

  useInterval(() => {
    setDate(getDate(locale));
  }, 1000);

  useEffect(() => {
    setDate(getDate(locale));
  }, [locale]);

  useIntervalWhen(
    async () => {
      await fetchWeather();
    },
    {
      ms: 5 * 60 * 10000,
      condition: !!storage.weatherCity,
      startImmediately: true,
    },
  );

  useEffect(() => {
    if (!storage.weatherCity) setWeatherCity(storage.weatherCity);
  }, [storage.weatherCity, setWeatherCity]);

  useEffect(() => {
    if (
      selectedCity ||
      storage.settings.weatherUnit ||
      storage.settings.windSpeedUnit
    )
      fetchWeather();
  }, [
    selectedCity,
    fetchWeather,
    storage.settings.weatherUnit,
    storage.settings.windSpeedUnit,
  ]);

  useEffect(() => {
    const fetchCities = async () => {
      setIsCitiesFetching(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQueryDebounced)}&format=json`,
        { headers: { "Accept-Language": language } },
      );

      const nominatimData = (await res.json()) as NominatimData[];

      if (!nominatimData || nominatimData.length === 0) {
        setAddressAutoCompletes([]);
        setIsCitiesFetching(false);
        return;
      }

      setAddressAutoCompletes(nominatimData);
      setIsCitiesFetching(false);
    };

    if (addressQueryDebounced) fetchCities();
  }, [addressQueryDebounced, language]);

  const comboboxItems =
    isDebouncePending() || isCitiesFetching
      ? [0, 1, 2, 3].map((i) => ({ type: "skeleton", id: i }))
      : addressAutoCompletes.map((c) => ({ type: "city", data: c }));

  const weatherLink = useMemo(() => {
    if (!storage.weatherCity || !storage.settings.language) return "#";
    return buildWeatherProviderUrl(
      storage.settings.weatherProvider,
      storage.weatherCity.name,
      {
        latitude: storage.weatherCity.lat,
        longitude: storage.weatherCity.lon,
      },
    );
  }, [
    storage.settings.weatherProvider,
    storage.weatherCity,
    storage.settings.language,
  ]);

  return (
    <div className={cn(["flex items-center gap-3.5 min-h-7", className])}>
      <span className="text-[0.85rem] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)]">
        {date}
      </span>
      <span className="size-1 rounded-full bg-[#c9a96e] opacity-60 shrink-0 hidden md:inline-block" />
      <div className="flex items-center gap-2 relative">
        {storage.weatherCity ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  href={weatherLink}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-1 rounded-md text-base text-muted-foreground transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  <span>
                    {isWeatherFetching ? (
                      <Spinner />
                    ) : weatherData ? (
                      `${weatherData.icon} ${weatherData.desc[language]}`
                    ) : (
                      <span>{t("weather.fetchingFailed")}</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {weatherData &&
                      `${weatherData.temperature} ${weatherData.temperatureUnit}`}
                  </span>
                </a>
              }
            />
            <TooltipContent side="bottom">
              <div className="flex flex-col gap-1">
                <span>
                  {`${storage.weatherCity.name}, ${storage.weatherCity.lat} / ${storage.weatherCity.lon}`}
                </span>
                {weatherData && (
                  <div className="flex items-center">
                    {`${t("weather.windSpeed")}: 
                    ${weatherData.windSpeed} ${t(`settings.units.${storage.settings.windSpeedUnit}`).toLowerCase()}`}
                    <ArrowUp
                    className="size-4 ml-1"
                      style={{ rotate: `${weatherData.windDirection}deg` }}
                    />
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-base text-muted-foreground">
            {t("weather.selectCity")}
          </span>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <DialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className={
                        storage.settings.transparentChangeGeo
                          ? "opacity-0 hover:opacity-100 transition-opacity duration-300 absolute -right-10"
                          : ""
                      }
                    >
                      <MapPinIcon className="text-muted-foreground" />
                    </Button>
                  }
                ></DialogTrigger>
              }
            ></TooltipTrigger>
            <TooltipContent side="bottom">
              {t("weather.changeAddress")}
            </TooltipContent>
          </Tooltip>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("weather.changeAddress")}</DialogTitle>
            </DialogHeader>
            <div className="min-h-48">
              <Combobox
                items={comboboxItems}
                filteredItems={comboboxItems}
                value={selectedCity}
                onValueChange={(itemValue) => {
                  setSelectedCity(itemValue);
                  if (itemValue) {
                    setOpen(false);
                    setWeatherCity({
                      name: itemValue.name,
                      lat: parseFloat(itemValue.lat),
                      lon: parseFloat(itemValue.lon),
                    });
                    setAddressQuery("");
                    setAddressAutoCompletes([]);
                  }
                }}
              >
                <ComboboxInput
                  placeholder={t("weather.addressPlaceholder")}
                  value={addressQuery}
                  onInput={(e) => setAddressQuery(e.currentTarget.value)}
                />
                <ComboboxContent>
                  <ComboboxEmpty>{t("common.notFound")}</ComboboxEmpty>
                  <ComboboxList>
                    {(item: Item) => {
                      if (item.type === "skeleton") {
                        return (
                          <ComboboxItem key={item.id} disabled value={item.id}>
                            <Skeleton className="h-5 w-full" />
                          </ComboboxItem>
                        );
                      }

                      const city = item.data;

                      return (
                        <ComboboxItem key={city.osm_id} value={city}>
                          {city.display_name}
                        </ComboboxItem>
                      );
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DateWithWeather;
