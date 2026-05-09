import { MapPinIcon } from "lucide-react";
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
import type { ForecastData } from "@/lib/types/open-meteo";
import type { NominatimData } from "@/lib/types/openstreetmap";
import { buildYandexUrl, cn } from "@/lib/utils";

const locale = navigator.language;

type Item =
	| { type: "skeleton"; id: number }
	| { type: "city"; data: NominatimData };

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
	const { setWeatherCity, storage } = useStorage();

	const [date, setDate] = useState(getDate());

	const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

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

		const res = await fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${storage.weatherCity.lat}&longitude=${storage.weatherCity.lon}` +
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
	}, [storage.weatherCity]);

	useInterval(() => {
		setDate(getDate());
	}, 1000);

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
		if (selectedCity) fetchWeather();
	}, [selectedCity, fetchWeather]);

	useEffect(() => {
		const fetchCities = async () => {
			setIsCitiesFetching(true);
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQueryDebounced)}&format=json`,
			);

			const nominatimData = (await res.json()) as NominatimData[];

			if (!nominatimData || nominatimData.length === 0) {
				setAddressAutoCompletes([]);
				return;
			}

			setAddressAutoCompletes(nominatimData);
			setIsCitiesFetching(false);
		};

		if (addressQueryDebounced) fetchCities();
	}, [addressQueryDebounced]);

	const comboboxItems =
		isDebouncePending() || isCitiesFetching
			? [0, 1, 2, 3].map((i) => ({ type: "skeleton", id: i }))
			: addressAutoCompletes.map((c) => ({ type: "city", data: c }));

	const weatherLink = useMemo(() => {
		if (!storage.weatherCity) return "#";
		return buildYandexUrl({
			latitude: storage.weatherCity.lat,
			longitude: storage.weatherCity.lon,
		});
	}, [storage.weatherCity]);

	return (
		<div className={cn(["flex items-center gap-3.5", className])}>
			<span className="text-[0.85rem] font-normal uppercase tracking-[0.12em] text-[rgba(255,255,255,0.45)]">
				{date}
			</span>
			<span className="size-1 rounded-full bg-[#c9a96e] opacity-60 shrink-0 hidden md:inline-block" />
			<div className="flex items-center gap-2">
				<a
					id="weather-link"
					href={weatherLink}
					target="_blank"
					rel="noopener"
					className="flex items-center gap-1 rounded-[0.375rem] px-1.5 py-0.5 text-base text-muted-foreground transition-colors duration-200 hover:bg-white/5 hover:text-white"
				>
					<span>{storage.weatherCity?.name ?? "загрузка..."}</span>
					<span>
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
								<DialogTrigger
									render={
										<Button
											variant="ghost"
											size="icon"
											className={
												storage.settings.transparentChangeGeo
													? "opacity-0 hover:opacity-100 transition-opacity duration-300"
													: ""
											}
										>
											<MapPinIcon className="text-muted-foreground" />
										</Button>
									}
								></DialogTrigger>
							}
						></TooltipTrigger>
						<TooltipContent side="bottom">Изменить адрес</TooltipContent>
					</Tooltip>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Изменить адрес</DialogTitle>
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
