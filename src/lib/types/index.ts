import type { Latitude, Longitude } from "@/lib/types/open-meteo";

export type ShortcutType = {
  id: string;
  type: "shortcut";
  name: string;
  url: string;
  accentColor: string;
  mutedColor: string;
  iconId: string;
  groupId?: string;
};

export type ShortcutGroupType = {
  id: string;
  type: "group";
  name: string;
  items: Required<ShortcutType>[];
};

export type ShortcutData = ShortcutType | ShortcutGroupType;

export type CreateShortcutInput = Pick<ShortcutType, "url"> &
  Omit<ShortcutType, "url" | "id" | "type" | "iconId">;

export type WeatherCity = { name: string; lat: Latitude; lon: Longitude };
