import { MapPinIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import type { WeatheCity } from "@/lib/types";
import type {
	ForecastData,
	GeocodedEntry,
	GeocodingData,
} from "@/lib/types/open-meteo";
import { buildYandexUrl, cn, getCityName } from "@/lib/utils";

const locale = navigator.language;

type Item =
	| { type: "skeleton"; id: number }
	| { type: "city"; data: GeocodedEntry };

type WeatherData = {
	icon: string;
	desc: string;
	temperature: number;
	temperatureUnit: ForecastData["current_weather_units"]["temperature"];
};

const getDate = () => {
	const now = new Date();
	const date = new Intl.DateTimeFormat(locale, {
		day: "numeric",
		month: "long",
		weekday: "long",
	}).format(now);

	return date;
};

const DateWithWeather = ({ className }: { className: string }) => {
	const { saveWeatherCity, storage } = useStorage();

	const [date, setDate] = useState(getDate());

	const [weatherCity, setWeatherCity] = useState<WeatheCity | null>(null);
	const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

	const [selectedCity, setSelectedCity] = useState<GeocodedEntry | null>(null);
	const [open, setOpen] = useState(false);

	const [addressAutoCompletes, setAddressAutoCompletes] = useState<
		GeocodedEntry[]
	>([]);
	const [addressQuery, setAddressQuery] = useState("");
	const [addressQueryDebounced, { isPending: isDebouncePending }] = useDebounce(
		addressQuery,
		800,
	);

	useInterval(() => {
		setDate(getDate());
	}, 1000);

	useIntervalWhen(
		async () => {
			const fetchWeather = async () => {
				if (!weatherCity) return;

				const res = await fetch(
					`https://api.open-meteo.com/v1/forecast?latitude=${weatherCity.lat}&longitude=${weatherCity.lon}` +
						`&current_weather=true&temperature_unit=celsius&timezone=auto`,
				);
				if (res.status !== 200) {
					return;
				}

				const data = (await res.json()) as ForecastData;
				const cw = data.current_weather;
				const [icon, desc] = WEATHER_CODES[cw.weathercode] || ["🌡️", ""];
				setWeatherData({
					icon,
					desc,
					temperature: Math.floor(cw.temperature),
					temperatureUnit: data.current_weather_units.temperature,
				});
			};
			await fetchWeather();
		},
		{
			ms: 5 * 60 * 10000,
			condition: !!weatherCity,
			startImmediately: true,
		},
	);

	useEffect(() => {
		if (!("weatherCity" in storage)) return;

		if (!weatherCity) setWeatherCity(storage.weatherCity);
	}, [weatherCity, storage]);

	useEffect(() => {
		const fetchCities = async () => {
			const res = await fetch(
				`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(addressQueryDebounced)}&count=5&language=ru`,
			);
			const data = (await res.json()) as GeocodingData;

			const cities = data.results;

			if (!cities || cities.length === 0) {
				setAddressAutoCompletes([]);
				return;
			}

			setAddressAutoCompletes(
				cities.filter((p) => ["PPLA", "PPL"].includes(p.feature_code)),
			);
		};

		fetchCities();
	}, [addressQueryDebounced]);

	useEffect(() => {
		const fetchCityName = async () => {
			if (!selectedCity) return;
			const cityName = await getCityName({
				latitude: selectedCity.latitude,
				longitude: selectedCity.longitude,
			});

			const weaCity: WeatheCity = {
				name: cityName,
				lat: selectedCity.latitude,
				lon: selectedCity.longitude,
			};

			setWeatherCity(weaCity);
			saveWeatherCity(weaCity);
		};

		fetchCityName();
	}, [selectedCity, saveWeatherCity]);

	const comboboxItems = isDebouncePending()
		? [0, 1, 2, 3].map((i) => ({ type: "skeleton", id: i }))
		: addressAutoCompletes.map((c) => ({ type: "city", data: c }));

	const weatherLink = useMemo(() => {
		if (!weatherCity) return "#";
		return buildYandexUrl({
			latitude: weatherCity.lat,
			longitude: weatherCity.lat,
		});
	}, [weatherCity]);

	return (
		<div className={cn(["flex items-center gap-3.5", className])}>
			<span className="text-[0.85rem] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)]">
				{date}
			</span>
			<span className="inline-block h-1 w-1 rounded-full bg-[#c9a96e] opacity-60 shrink-0" />
			<a
				id="weather-link"
				href={weatherLink}
				target="_blank"
				rel="noopener"
				className="flex items-center gap-1 rounded-[0.375rem] px-1.5 py-0.5 text-[0.85rem] text-muted-foreground transition-colors duration-200 hover:bg-white/5 hover:text-white"
			>
				<span className="text-base">{weatherCity?.name ?? "загрузка..."}</span>
				<span className="text-base">
					{weatherData ? (
						`${weatherData.icon} ${weatherData.desc}`
					) : (
						<Spinner />
					)}
				</span>
				<span className="text-muted-foreground">
					{weatherData &&
						`${weatherData.temperature} ${weatherData.temperatureUnit}`}
				</span>
			</a>
			<Dialog open={open} onOpenChange={setOpen}>
				<Tooltip>
					<TooltipTrigger
						render={
							<DialogTrigger render={<Button variant="ghost" size="icon" />}>
								<MapPinIcon className="text-muted-foreground" />
							</DialogTrigger>
						}
					></TooltipTrigger>
					<TooltipContent side="bottom">Изменить адрес</TooltipContent>
				</Tooltip>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Изменить адрес</DialogTitle>
					</DialogHeader>
					<Combobox
						items={comboboxItems}
						filteredItems={comboboxItems}
						value={selectedCity}
						onValueChange={(itemValue) => {
							setSelectedCity(itemValue);
							if (itemValue) setOpen(false);
						}}
					>
						<ComboboxInput
							placeholder="Введите адрес"
							value={addressQuery}
							onInput={(e) => setAddressQuery(e.currentTarget.value)}
						/>
						<ComboboxContent>
							<ComboboxEmpty>Ничего не найдено</ComboboxEmpty>
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
										<ComboboxItem key={city.id} value={city}>
											{`${city.name}, ${[city.admin1, city.country].filter(Boolean).join(", ")}`}
										</ComboboxItem>
									);
								}}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DateWithWeather;
