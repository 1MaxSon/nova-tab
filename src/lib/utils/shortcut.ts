import { generatePreviousId, getContrastYIQ } from "@/lib/helpers";
import { saveIcon, storage } from "@/lib/storage";
import type { CreateShortcutInput, ShortcutType } from "@/lib/types";
import { fetchFaviconBlob } from "@/lib/utils/favicon";
import { extractIconPalette } from "@/lib/vibrant";

export async function createShortcut(
  data: CreateShortcutInput,
): Promise<ShortcutType | undefined> {
  const { url, name, accentColor, mutedColor } = data;
  const result = await fetchFaviconBlob(url);

  if (!result) return;

  const { iconBlob, iconUrl, title } = result;

  const { shortcuts } = storage;

  const previousShortcutId = generatePreviousId(shortcuts);

  const fallbackName = title;
  const resolvedName =
    name && name.trim() !== ""
      ? name
      : fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);

  if (iconBlob) {
    saveIcon({ id: previousShortcutId, blob: iconBlob });
  }

  const iconPalette = iconUrl ? await extractIconPalette(iconUrl) : undefined;

  const resolvedAccent = accentColor?.trim()
    ? accentColor
    : (iconPalette?.DarkMuted?.hex ?? "#1a1a1a");

  const resolvedText = mutedColor?.trim()
    ? mutedColor
    : (iconPalette?.LightVibrant?.hex ?? getContrastYIQ(resolvedAccent));

  return {
    id: previousShortcutId,
    type: "shortcut",
    name: resolvedName,
    accentColor: resolvedAccent,
    mutedColor: resolvedText,
    url: url,
  };
}
