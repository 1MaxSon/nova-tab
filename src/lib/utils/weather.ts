import { getDefaultLanguage } from "@/lib/helpers";
import { t } from "@/lib/i18n";
import { WeatherProvider } from "@/lib/storage";
import { Coords } from "@/lib/types/open-meteo";

function buildYandexWeatherUrl(coords: Coords) {
  return `https://yandex.ru/pogoda/?lat=${coords.latitude}&lon=${coords.longitude}`;
}

function buildGoogleWeatherUrl(coords: Coords, cityName: string) {
  const weatherIn = t("weather.provider.searchQuery");
  const query = `${weatherIn} ${cityName} ${coords.latitude}, ${coords.longitude}`;

  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function buildWttrWeatherUrl(coords: Coords) {
  return `https://wttr.in/${coords.latitude},${coords.longitude}`;
}

const weatherProvidersUrls: Record<
  WeatherProvider,
  (coords: Coords, cityName: string) => string
> = {
  google: buildGoogleWeatherUrl,
  yandex: buildYandexWeatherUrl,
  wttr: buildWttrWeatherUrl,
};

export function buildWeatherProviderUrl(
  provider: WeatherProvider,
  cityName: string,
  coords: Coords,
) {
  const builder = weatherProvidersUrls[provider];

  return builder(coords, cityName);
}

export const getDefaultWeatherProvider = (
  language = getDefaultLanguage(),
): WeatherProvider => {
  return language === "ru" ? "yandex" : "google";
};
