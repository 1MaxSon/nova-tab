import { currentLanguage } from "@/lib/i18n";
import { NominatimData } from "@/lib/types/openstreetmap";

export async function fetchCities(query: string): Promise<NominatimData[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&featureType=city`,
    { headers: { "Accept-Language": currentLanguage.value } },
  );

  const nominatimData = (await res.json()) as NominatimData[];

  return nominatimData;
}
