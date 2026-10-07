import { GradientLayer } from "@/lib/utils/gradient";

export type ThemeColors = Record<string, string>;

export type GradientWallpaperData = GradientLayer[];

export type UserThemePhoto = {
  wallpaperType: "photo";
  wallpaper: {
    id: string;
    blurValue: number;
  };
};

export type UserThemeGradient = {
  wallpaperType: "gradient";
  gradientLayers: GradientWallpaperData;
};

export type UserTheme = {
  id: string;
  name: string;
  colors: ThemeColors;
} & (UserThemePhoto | UserThemeGradient);
