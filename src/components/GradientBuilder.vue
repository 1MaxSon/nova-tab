<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  cloneLayers,
  layersToCss,
  makeDefaultLayers,
  makeLinearLayer,
  makeRadialLayer,
  makeStop,
  randomHex,
  type GradientLayer,
  type GradientType,
} from "@/lib/gradient";
import { t } from "@/lib/i18n";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CircleGaugeIcon,
  DicesIcon,
  LineDotRightHorizontalIcon,
  PlusIcon,
  Trash2Icon,
} from "@lucide/vue";
import { computed, ref, watch } from "vue";

interface Props {
  modelValue?: GradientLayer[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
});
const emit = defineEmits<{
  (e: "update:modelValue", value: GradientLayer[]): void;
}>();

const layers = ref<GradientLayer[]>(
  props.modelValue && props.modelValue.length > 0
    ? cloneLayers(props.modelValue)
    : makeDefaultLayers(),
);

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return;
    if (JSON.stringify(value) !== JSON.stringify(layers.value)) {
      layers.value = cloneLayers(value);
    }
  },
);

watch(
  layers,
  (value) => {
    emit("update:modelValue", cloneLayers(value));
  },
  { deep: true, immediate: true },
);

const cssString = computed<string>(() => layersToCss(layers.value));
defineExpose({ cssString });

function addLayer(type: GradientType): void {
  layers.value.push(type === "radial" ? makeRadialLayer() : makeLinearLayer());
}

function removeLayer(index: number): void {
  layers.value.splice(index, 1);
}

function moveLayer(index: number, dir: 1 | -1): void {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= layers.value.length) return;
  const arr = layers.value;
  [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
}

function addStop(layer: GradientLayer): void {
  layer.stops.push(makeStop(100, randomHex(), 1));
}

function removeStop(layer: GradientLayer, index: number): void {
  if (layer.stops.length <= 1) return;
  layer.stops.splice(index, 1);
}

function sliderModel(value: number) {
  return [value];
}
function setSlider(
  target: { [key: string]: any },
  key: string,
  value: number[] | undefined,
) {
  if (value && value.length > 0) target[key] = value[0];
}

function randomize(): void {
  const count = 2 + Math.floor(Math.random() * 2); // 2-3 layers
  const newLayers: GradientLayer[] = [];
  for (let i = 0; i < count - 1; i++) newLayers.push(makeRadialLayer());
  newLayers.push(Math.random() > 0.5 ? makeLinearLayer() : makeRadialLayer());
  layers.value = newLayers;
}
</script>

<template>
  <div
    class="w-full max-w-3xl mx-auto p-5 rounded-2xl bg-neutral-900 text-neutral-100 font-sans h-full"
  >
    <div
      class="h-48 rounded-xl border border-neutral-700 bg-neutral-950 mb-4 sticky top-0 z-10"
    >
      <div class="absolute inset-0" :style="{ background: cssString }"></div>
    </div>

    <div class="flex flex-wrap gap-2 mb-4">
      <Button @click="addLayer('radial')">
        <CircleGaugeIcon /> {{ t("gradientBuilder.addRadialLayer") }}
      </Button>
      <Button @click="addLayer('linear')">
        <LineDotRightHorizontalIcon /> {{ t("gradientBuilder.addLinearLayer") }}
      </Button>
      <Button @click="randomize" variant="outline">
        <DicesIcon />
        {{ t("gradientBuilder.generateGradient") }}
      </Button>
    </div>

    <div class="flex flex-col gap-3">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
        class="rounded-xl border border-neutral-700 bg-neutral-800/60 p-3.5"
        :class="{ 'opacity-50': !layer.enabled }"
      >
        <div class="flex items-center justify-between mb-2.5">
          <Label class="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox v-model="layer.enabled" />
            <span>
              {{
                layer.type === "radial"
                  ? t("gradientBuilder.radialLayer")
                  : t("gradientBuilder.linearLayer")
              }}
              {{ index + 1 }}
            </span>
          </Label>
          <div class="flex gap-1.5">
            <Button
              variant="outline"
              size="icon"
              class="size-7"
              :disabled="index === 0"
              :aria-label="t('gradientBuilder.moveUp')"
              @click="moveLayer(index, -1)"
            >
              <ChevronUpIcon class="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="size-7"
              :disabled="index === layers.length - 1"
              :aria-label="t('gradientBuilder.moveDown')"
              @click="moveLayer(index, 1)"
            >
              <ChevronDownIcon class="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="size-7 text-red-400 hover:text-red-400"
              :aria-label="t('gradientBuilder.removeLayer')"
              @click="removeLayer(index)"
            >
              <Trash2Icon class="size-3.5" />
            </Button>
          </div>
        </div>

        <template v-if="layer.type === 'radial'">
          <div class="grid grid-cols-2 gap-3 mb-2.5">
            <div>
              <Label class="block text-xs text-neutral-400 mb-1">
                {{ t("gradientBuilder.width") }}: {{ layer.sizeX }}%
              </Label>
              <Slider
                :model-value="sliderModel(layer.sizeX)"
                @update:model-value="(v) => setSlider(layer, 'sizeX', v)"
                :min="5"
                :max="150"
                :step="1"
              />
            </div>
            <div>
              <Label class="block text-xs text-neutral-400 mb-1">
                {{ t("gradientBuilder.height") }}: {{ layer.sizeY }}%
              </Label>
              <Slider
                :model-value="sliderModel(layer.sizeY)"
                @update:model-value="(v) => setSlider(layer, 'sizeY', v)"
                :min="5"
                :max="150"
                :step="1"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mb-2.5">
            <div>
              <Label class="block text-xs text-neutral-400 mb-1">
                {{ t("gradientBuilder.positionX") }}: {{ layer.posX }}%
              </Label>
              <Slider
                :model-value="sliderModel(layer.posX)"
                @update:model-value="(v) => setSlider(layer, 'posX', v)"
                :min="0"
                :max="100"
                :step="1"
              />
            </div>
            <div>
              <Label class="block text-xs text-neutral-400 mb-1">
                {{ t("gradientBuilder.positionY") }}: {{ layer.posY }}%
              </Label>
              <Slider
                :model-value="sliderModel(layer.posY)"
                @update:model-value="(v) => setSlider(layer, 'posY', v)"
                :min="0"
                :max="100"
                :step="1"
              />
            </div>
          </div>
        </template>

        <template v-else>
          <div class="mb-2.5">
            <Label class="block text-xs text-neutral-400 mb-1">
              {{ t("gradientBuilder.angle") }}: {{ layer.angle }}deg
            </Label>
            <Slider
              :model-value="sliderModel(layer.angle)"
              @update:model-value="(v) => setSlider(layer, 'angle', v)"
              :min="0"
              :max="360"
              :step="1"
            />
          </div>
        </template>

        <div
          class="border-t border-dashed border-neutral-700 pt-2.5 mt-1.5 flex flex-col gap-2"
        >
          <div
            v-for="(stop, sIndex) in layer.stops"
            :key="stop.id"
            class="grid grid-cols-[34px_1fr_auto_auto_auto] items-center gap-2"
          >
            <input
              type="color"
              v-model="stop.color"
              :disabled="stop.transparent"
              class="w-8.5 h-6.5 rounded-md bg-transparent border-0 p-0 cursor-pointer disabled:opacity-40"
            />
            <Slider
              :model-value="[stop.alpha]"
              @update:model-value="(v) => setSlider(stop, 'alpha', v)"
              :min="0"
              :max="1"
              :step="0.01"
              :disabled="stop.transparent"
              :title="t('gradientBuilder.opacity')"
              class="disabled:opacity-40"
            />
            <Label
              class="flex items-center gap-1 text-[11px] text-neutral-400 cursor-pointer"
            >
              <Checkbox v-model="stop.transparent" />
              <span>{{ t("gradientBuilder.transparent") }}</span>
            </Label>
            <Label class="flex items-center gap-1 text-xs text-neutral-400">
              <Input
                type="number"
                min="0"
                max="100"
                v-model.number="stop.pos"
                class="w-13.75 h-7 bg-neutral-900 border-neutral-700 px-1.5 py-0.5"
              />%
            </Label>
            <Button
              variant="outline"
              size="icon"
              class="size-7 text-red-400 hover:text-red-400"
              :disabled="layer.stops.length <= 1"
              :aria-label="t('gradientBuilder.removeStop')"
              @click="removeStop(layer, sIndex)"
            >
              <Trash2Icon class="size-3.5" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="self-start"
            @click="addStop(layer)"
          >
            <PlusIcon class="size-3.5" />
            {{ t("gradientBuilder.addColorStop") }}
          </Button>
        </div>
      </div>

      <p v-if="layers.length === 0" class="text-center text-neutral-400 py-8">
        {{ t("gradientBuilder.emptyState") }}
      </p>
    </div>
  </div>
</template>
