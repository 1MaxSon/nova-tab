
export type GradientType = "radial" | "linear";

export interface ColorStop {
  id: number;
  color: string; // hex, e.g. "#1e293b"
  alpha: number; // 0..1
  pos: number; // 0..100 (%)
  transparent: boolean;
}

export interface BaseLayer {
  id: number;
  enabled: boolean;
  stops: ColorStop[];
}

export interface RadialLayer extends BaseLayer {
  type: "radial";
  sizeX: number;
  sizeY: number;
  posX: number;
  posY: number;
}

export interface LinearLayer extends BaseLayer {
  type: "linear";
  angle: number;
}

export type GradientLayer = RadialLayer | LinearLayer;

let uid = 0;
export function nextGradientId(): number {
  return ++uid;
}

export function randomHex(): string {
  const n = Math.floor(Math.random() * 0xffffff);
  return "#" + n.toString(16).padStart(6, "0");
}

export function makeStop(
  pos: number,
  color: string = randomHex(),
  alpha: number = 0.5,
  transparent: boolean = false,
): ColorStop {
  return { id: nextGradientId(), color, alpha, pos, transparent };
}

export function makeRadialLayer(): RadialLayer {
  return {
    id: nextGradientId(),
    type: "radial",
    enabled: true,
    sizeX: 60,
    sizeY: 60,
    posX: Math.round(Math.random() * 100),
    posY: Math.round(Math.random() * 100),
    stops: [makeStop(0, randomHex(), 0.6), makeStop(60, "#000000", 0, true)],
  };
}

export function makeLinearLayer(): LinearLayer {
  return {
    id: nextGradientId(),
    type: "linear",
    enabled: true,
    angle: 135,
    stops: [makeStop(0, randomHex(), 1), makeStop(100, randomHex(), 1)],
  };
}

export function makeDefaultLayers(): GradientLayer[] {
  return [makeRadialLayer(), makeRadialLayer(), makeLinearLayer()];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function stopToCss(stop: ColorStop): string {
  if (stop.transparent) return `transparent ${stop.pos}%`;
  const { r, g, b } = hexToRgb(stop.color);
  return `rgba(${r}, ${g}, ${b}, ${stop.alpha}) ${stop.pos}%`;
}

export function layerToCss(layer: GradientLayer): string {
  const stopsCss = layer.stops
    .slice()
    .sort((a, b) => a.pos - b.pos)
    .map(stopToCss)
    .join(", ");

  if (layer.type === "radial") {
    return `radial-gradient(ellipse ${layer.sizeX}% ${layer.sizeY}% at ${layer.posX}% ${layer.posY}%, ${stopsCss})`;
  }
  return `linear-gradient(${layer.angle}deg, ${stopsCss})`;
}

export function layersToCss(layers: GradientLayer[]): string {
  return layers
    .filter((l) => l.enabled)
    .map(layerToCss)
    .join(", ");
}

export function cloneLayers(layers: GradientLayer[]): GradientLayer[] {
  return layers.map((layer) => ({
    ...layer,
    stops: layer.stops.map((stop) => ({ ...stop })),
  }));
}