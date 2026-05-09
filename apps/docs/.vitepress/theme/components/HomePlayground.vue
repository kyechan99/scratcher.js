<script setup lang="ts">
import {
  type Scratcher as CoreScratcher,
  type ScratchControllerCallbacks,
  type ScratchSnapshot,
  type ScratcherConfig as CoreScratcherConfig,
  type Area,
  type RectArea,
} from '@scratcher.js/core';
import { Scratcher as VueScratcher } from '@scratcher.js/vue';
import { computed, onUnmounted, ref } from 'vue';

interface PlaygroundScratcherConfig extends CoreScratcherConfig {
  width: number;
  height: number;
  cellSize: number;
  brushSize: number;
  cover: string;
  completionThreshold?: number;
  revealOnCompletion?: boolean;
}

const isCompleted = ref(false);

const snapshot = ref<ScratchSnapshot>({
  scratchedCells: 0,
  totalCells: 1,
  progress: 0,
});

const isAreaEnabled = ref(false);
const areaMode = ref<'rect' | 'image'>('rect');

const areaConfig = ref<RectArea>({
  x: 75,
  y: 75,
  width: 250,
  height: 250,
});

const areaImage = ref<{
  src: string;
  imageData: ImageData;
} | null>(null);

const areaImageTransform = ref({
  x: 50,
  y: 50,
  scale: 1,
});

const areaImageAlphaThreshold = ref(128);
const areaImageStatus = ref('(empty)');

const minAreaSize = 50;

const currentScratcherConfig = ref<PlaygroundScratcherConfig>({
  width: 400,
  height: 400,
  cellSize: 16,
  brushSize: 55,
  cover: '#b9c2ce',
  completionThreshold: 0.3,
  revealOnCompletion: true,
});

let scratcher: CoreScratcher | null = null;
let previewTimer: number | null = null;

const progressPercent = computed(() => (snapshot.value.progress * 100).toFixed(1));

function safeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeCoverColor(value: unknown, fallback: string): string {
  const cover = safeText(value, fallback);
  return /gradient\s*\(/i.test(cover) ? fallback : cover;
}

const sanitizedScratcherConfig = computed<PlaygroundScratcherConfig>(() => {
  const raw = currentScratcherConfig.value;
  return {
    width: Math.max(180, safeNumber(raw.width, 360)),
    height: Math.max(120, safeNumber(raw.height, 200)),
    cellSize: Math.max(4, safeNumber(raw.cellSize, 10)),
    brushSize: Math.max(8, safeNumber(raw.brushSize, 30)),
    cover: normalizeCoverColor(raw.cover, '#d6d9df'),
    completionThreshold: Math.min(1, Math.max(0, safeNumber(raw.completionThreshold, 0.2))),
    revealOnCompletion: raw.revealOnCompletion === true,
  };
});

const previewCallbacks = computed<ScratchControllerCallbacks>(() => ({
  onProgress: (next: any) => {
    snapshot.value = next;
  },
  onComplete: () => {
    isCompleted.value = true;
  },
}));

const currentArea = computed<Area | undefined>(() => {
  if (!isAreaEnabled.value) {
    return undefined;
  }

  if (areaMode.value === 'image' && areaImage.value) {
    return {
      imageData: areaImage.value.imageData,
      x: areaImageTransform.value.x,
      y: areaImageTransform.value.y,
      scale: areaImageTransform.value.scale,
      alphaThreshold: areaImageAlphaThreshold.value,
    };
  }

  return areaMode.value === 'rect' ? areaConfig.value : undefined;
});

const areaProgressPercent = computed(() => {
  if (!snapshot.value.area) return '0.0';
  return (snapshot.value.area.progress * 100).toFixed(1);
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const areaImagePreviewStyle = computed(() => {
  if (!areaImage.value) {
    return {};
  }

  return {
    left: `${areaImageTransform.value.x}px`,
    top: `${areaImageTransform.value.y}px`,
    width: `${areaImage.value.imageData.width * areaImageTransform.value.scale}px`,
    height: `${areaImage.value.imageData.height * areaImageTransform.value.scale}px`,
  };
});

const areaImageXMax = computed(() => {
  if (!areaImage.value) return sanitizedScratcherConfig.value.width;
  return Math.max(
    0,
    sanitizedScratcherConfig.value.width -
      areaImage.value.imageData.width * areaImageTransform.value.scale,
  );
});

const areaImageYMax = computed(() => {
  if (!areaImage.value) return sanitizedScratcherConfig.value.height;
  return Math.max(
    0,
    sanitizedScratcherConfig.value.height -
      areaImage.value.imageData.height * areaImageTransform.value.scale,
  );
});

const areaImageScaleMax = computed(() => {
  if (!areaImage.value) return 4;
  const maxWidthScale = sanitizedScratcherConfig.value.width / areaImage.value.imageData.width;
  const maxHeightScale = sanitizedScratcherConfig.value.height / areaImage.value.imageData.height;
  return Math.max(0.1, Math.min(4, Math.min(maxWidthScale, maxHeightScale) * 2));
});

function updateAreaImageX(value: number): void {
  areaImageTransform.value.x = clamp(value, 0, areaImageXMax.value);
}

function updateAreaImageY(value: number): void {
  areaImageTransform.value.y = clamp(value, 0, areaImageYMax.value);
}

function updateAreaImageScale(value: number): void {
  areaImageTransform.value.scale = clamp(value, 0.1, areaImageScaleMax.value);
  areaImageTransform.value.x = clamp(areaImageTransform.value.x, 0, areaImageXMax.value);
  areaImageTransform.value.y = clamp(areaImageTransform.value.y, 0, areaImageYMax.value);
}

function setAreaMode(mode: 'rect' | 'image') {
  areaMode.value = mode;
}

async function handleAreaImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    if (areaImage.value) {
      URL.revokeObjectURL(areaImage.value.src);
    }
    areaImage.value = null;
    areaImageStatus.value = '(empty)';
    return;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const loadedImage = await loadImage(objectUrl);
    const canvas = document.createElement('canvas');
    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context is not available.');
    }

    if (areaImage.value) {
      URL.revokeObjectURL(areaImage.value.src);
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(loadedImage, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    areaImage.value = {
      src: objectUrl,
      imageData,
    };
    areaImageStatus.value = `${file.name} (${loadedImage.width}×${loadedImage.height})`;
    areaImageTransform.value = {
      x: 50,
      y: 50,
      scale: 1,
    };
    areaMode.value = 'image';
    isAreaEnabled.value = true;
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    areaImage.value = null;
    areaImageStatus.value = '이미지를 읽을 수 없습니다.';
    console.error(error);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load area image.'));
    image.src = src;
  });
}

function handleScratcherReady(nextScratcher: CoreScratcher) {
  scratcher = nextScratcher;
  snapshot.value = nextScratcher.snapshot;
  isCompleted.value = false;
}

function resetCanvas() {
  if (!scratcher) {
    return;
  }

  snapshot.value = scratcher.reset();
  isCompleted.value = false;
}

onUnmounted(() => {
  if (previewTimer !== null) {
    window.clearTimeout(previewTimer);
  }

  if (areaImage.value) {
    URL.revokeObjectURL(areaImage.value.src);
  }

  scratcher = null;
});
</script>

<template>
  <section class="home-shell fulled playground-bg">
    <div class="hero-grid">
      <div class="preview-zone">
        <div class="preview-stage">
          <div
            class="scratch-frame"
            :style="{
              width: `${sanitizedScratcherConfig.width}px`,
              height: `${sanitizedScratcherConfig.height}px`,
            }"
          >
            <VueScratcher
              class="scratch-card"
              :width="sanitizedScratcherConfig.width"
              :height="sanitizedScratcherConfig.height"
              :cell-size="sanitizedScratcherConfig.cellSize"
              :brush-size="sanitizedScratcherConfig.brushSize"
              :cover="sanitizedScratcherConfig.cover"
              :area="currentArea"
              :callbacks="previewCallbacks"
              :completion-threshold="sanitizedScratcherConfig.completionThreshold"
              :reveal-on-completion="sanitizedScratcherConfig.revealOnCompletion"
              canvas-class="scratch-canvas"
              :on-scratcher-ready="handleScratcherReady"
            >
              <div class="reward">You found it!</div>
            </VueScratcher>

            <div
              v-if="isAreaEnabled && areaMode === 'rect'"
              class="area-overlay"
              :style="{
                left: `${areaConfig.x}px`,
                top: `${areaConfig.y}px`,
                width: `${areaConfig.width}px`,
                height: `${areaConfig.height}px`,
              }"
            />

            <img
              v-if="isAreaEnabled && areaMode === 'image' && areaImage"
              class="area-image-overlay"
              :src="areaImage.src"
              alt="Area mask overlay"
              :style="areaImagePreviewStyle"
            />
          </div>
        </div>

        <div class="action-row">
          <button type="button" class="btn" @click="resetCanvas">Reset</button>
        </div>
      </div>

      <aside class="config-card">
        <label class="field">
          <div class="field-head">
            <span>Brush size</span>
            <strong>{{ sanitizedScratcherConfig.brushSize }}</strong>
          </div>
          <input
            v-model.number="currentScratcherConfig.brushSize"
            type="range"
            min="8"
            max="80"
            step="1"
          />
        </label>

        <label class="field">
          <div class="field-head">
            <span>Cell size</span>
            <strong>{{ sanitizedScratcherConfig.cellSize }}px</strong>
          </div>
          <input
            v-model.number="currentScratcherConfig.cellSize"
            type="range"
            min="4"
            max="24"
            step="1"
          />
        </label>

        <label class="color-field">
          <span>Cover color</span>
          <div class="color-input-wrap">
            <input
              v-model="currentScratcherConfig.cover"
              type="color"
              aria-label="Pick cover color"
            />
          </div>
        </label>

        <hr />

        <label class="field">
          <div class="field-head">
            <span>completionThreshold</span>
            <strong>{{ sanitizedScratcherConfig.completionThreshold?.toFixed(2) }}</strong>
          </div>
          <input
            v-model.number="currentScratcherConfig.completionThreshold"
            type="range"
            min="0"
            max="1"
            step="0.01"
          />
        </label>

        <label class="toggle-row">
          <span
            >revealOnCompletion
            {{ sanitizedScratcherConfig.revealOnCompletion ? 'On' : 'Off' }}</span
          >
          <input v-model="currentScratcherConfig.revealOnCompletion" type="checkbox" />
        </label>

        <hr />

        <label class="toggle-row">
          <span>Enable Area {{ isAreaEnabled ? 'On' : 'Off' }}</span>
          <input v-model="isAreaEnabled" type="checkbox" />
        </label>

        <template v-if="isAreaEnabled">
          <div class="mode-switcher">
            <button
              type="button"
              class="mode-button"
              :class="{ active: areaMode === 'rect' }"
              @click="setAreaMode('rect')"
            >
              Rectangle
            </button>
            <button
              type="button"
              class="mode-button"
              :class="{ active: areaMode === 'image' }"
              @click="setAreaMode('image')"
            >
              Image Mask
            </button>
          </div>

          <label class="field" v-if="areaMode === 'image'">
            <div class="field-head">
              <span>Alpha Image</span>
              <strong>{{ areaImageStatus }}</strong>
            </div>
            <input type="file" accept="image/*" @change="handleAreaImageChange" />
          </label>

          <label class="field" v-if="areaMode === 'image'">
            <div class="field-head">
              <span>Alpha Threshold</span>
              <strong>{{ areaImageAlphaThreshold }}</strong>
            </div>
            <input
              v-model.number="areaImageAlphaThreshold"
              type="range"
              min="0"
              max="255"
              step="1"
            />
          </label>

          <div v-if="areaMode === 'image' && areaImage" class="image-preview">
            <img :src="areaImage.src" alt="Area mask preview" />
          </div>

          <label class="field" v-if="areaMode === 'image' && areaImage">
            <div class="field-head">
              <span>Image X</span>
              <strong>{{ areaImageTransform.x }}</strong>
            </div>
            <input
              :value="areaImageTransform.x"
              type="range"
              min="0"
              :max="areaImageXMax"
              step="1"
              @input="
                (event: any) => updateAreaImageX(Number((event.target as HTMLInputElement).value))
              "
            />
          </label>

          <label class="field" v-if="areaMode === 'image' && areaImage">
            <div class="field-head">
              <span>Image Y</span>
              <strong>{{ areaImageTransform.y }}</strong>
            </div>
            <input
              :value="areaImageTransform.y"
              type="range"
              min="0"
              :max="areaImageYMax"
              step="1"
              @input="
                (event: any) => updateAreaImageY(Number((event.target as HTMLInputElement).value))
              "
            />
          </label>

          <label class="field" v-if="areaMode === 'image' && areaImage">
            <div class="field-head">
              <span>Image Scale</span>
              <strong>{{ areaImageTransform.scale.toFixed(2) }}x</strong>
            </div>
            <input
              :value="areaImageTransform.scale"
              type="range"
              min="0.1"
              :max="areaImageScaleMax"
              step="0.01"
              @input="
                (event: any) =>
                  updateAreaImageScale(Number((event.target as HTMLInputElement).value))
              "
            />
          </label>
        </template>

        <template v-if="isAreaEnabled && areaMode === 'rect'">
          <label class="field">
            <div class="field-head">
              <span>Area X</span>
              <strong>{{ areaConfig.x }}</strong>
            </div>
            <input
              v-model.number="areaConfig.x"
              type="range"
              min="0"
              :max="Math.max(0, sanitizedScratcherConfig.width - minAreaSize)"
              step="5"
            />
          </label>

          <label class="field">
            <div class="field-head">
              <span>Area Y</span>
              <strong>{{ areaConfig.y }}</strong>
            </div>
            <input
              v-model.number="areaConfig.y"
              type="range"
              min="0"
              :max="Math.max(0, sanitizedScratcherConfig.height - minAreaSize)"
              step="5"
            />
          </label>

          <label class="field">
            <div class="field-head">
              <span>Area Width</span>
              <strong>{{ areaConfig.width }}</strong>
            </div>
            <input
              v-model.number="areaConfig.width"
              type="range"
              :min="minAreaSize"
              :max="sanitizedScratcherConfig.width"
              step="5"
            />
          </label>

          <label class="field">
            <div class="field-head">
              <span>Area Height</span>
              <strong>{{ areaConfig.height }}</strong>
            </div>
            <input
              v-model.number="areaConfig.height"
              type="range"
              :min="minAreaSize"
              :max="sanitizedScratcherConfig.height"
              step="5"
            />
          </label>
        </template>

        <div v-if="isAreaEnabled" class="area-progress-box">
          <div class="progress-head">
            <span>Area Progress</span>
            <strong>{{ areaProgressPercent }}%</strong>
          </div>
          <div
            class="progress-track"
            role="progressbar"
            :aria-valuenow="Number(areaProgressPercent)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-fill area-fill" :style="{ width: `${areaProgressPercent}%` }" />
          </div>
        </div>

        <hr />

        <div class="progress-box">
          <div class="progress-head">
            <span>Progress</span>
            <strong>{{ progressPercent }}%</strong>
          </div>
          <div
            class="progress-track"
            role="progressbar"
            :aria-valuenow="Number(progressPercent)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
          </div>
          <p class="completion-status" :class="{ visible: isCompleted }">Completed 🎉</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.home-shell {
  padding: 12px 0 28px;
  min-height: 60vh;
  display: grid;
  align-items: center;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  align-items: center;
  gap: 1rem;
  max-width: 1320px !important;
  margin: 0 auto;
  width: 100%;
  padding: 0px 1rem;
}

.preview-zone {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.preview-stage {
  border-radius: 22px;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.scratch-frame {
  position: relative;
}

.scratch-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  touch-action: none;
  box-shadow: 0 1rem 2.5rem var(--vp-c-gray-soft);
  cursor: crosshair;
}

.area-overlay {
  position: absolute;
  border: 2px dashed #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
  border-radius: 0.375rem;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.3);
  transition: all 0.2s ease;
}

.area-image-overlay {
  position: absolute;
  object-fit: fill;
  opacity: 0.5;
  pointer-events: none;
  image-rendering: auto;
  filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0));
}

.reward {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: clamp(1.5rem, 2.3vw, 2rem);
  font-weight: 800;
  color: #151b3a;
  background:
    radial-gradient(circle at 32% 22%, #fff4a5 0 64px, transparent 65px),
    radial-gradient(circle at 72% 38%, #9db9f2 0 100px, transparent 101px),
    linear-gradient(135deg, #d7f1ef, #fde9d7);
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.config-card {
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1rem 2.5rem 1rem var(--vp-c-gray-soft);
  background: var(--vp-c-bg);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.config-card hr {
  border-top: 1px solid #e1e7ef;
  margin: 0;
}

.field {
  display: grid;
  gap: 0.125rem;
}

.field-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-head span {
  font-size: 1rem;
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.field-head strong {
  font-size: 0.875rem;
}

.field input[type='range'] {
  width: 100%;
  accent-color: var(--vp-c-brand-2);
  cursor: pointer;
}

.compact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 8px 0;
}

.color-field span {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.color-field input {
  width: 2rem;
  height: 2rem;
  border-radius: 10px;
  background: #fff;
  color: #1c2b3f;
  padding: 0px;
  font-size: 0.9rem;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.color-field input::-webkit-color-swatch {
  border-radius: 0.25rem;
  border: none;
}

.color-field {
  display: grid;
  gap: 6px;
  margin-top: 2px;
}

.color-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cover-chip {
  width: 32px;
  min-width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #cdd7e4;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-row span {
  font-size: 0.98rem;
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.toggle-row input[type='checkbox'] {
  width: 44px;
  height: 26px;
  appearance: none;
  border-radius: 999px;
  background: #dbe2ea;
  position: relative;
  cursor: pointer;
}

.toggle-row input[type='checkbox']::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.16s ease;
}

.toggle-row input[type='checkbox']:checked {
  background: var(--vp-c-brand-2);
}

.toggle-row input[type='checkbox']:checked::after {
  transform: translateX(18px);
}

.mode-switcher {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.mode-button {
  border: 1px solid #d6dce5;
  border-radius: 0.75rem;
  background: #f7f9fc;
  color: var(--vp-c-text-1);
  padding: 0.7rem 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.mode-button:hover {
  transform: translateY(-1px);
}

.mode-button.active {
  border-color: rgba(139, 92, 246, 0.45);
  background: rgba(139, 92, 246, 0.09);
  color: #6d28d9;
}

.image-preview {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid #e1e7ef;
  background: #fff;
}

.image-preview img {
  width: 100%;
  display: block;
  border-radius: 0.5rem;
  background:
    linear-gradient(45deg, rgba(148, 163, 184, 0.16) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(148, 163, 184, 0.16) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.16) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.16) 75%);
  background-size: 18px 18px;
  background-position:
    0 0,
    0 9px,
    9px -9px,
    -9px 0px;
}

.area-progress-box {
  padding: 0.75rem;
  background: rgba(139, 92, 246, 0.05);
  border-radius: 0.5rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.progress-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
}

.progress-track {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-1));
  transition: width 0.2s ease;
}

.progress-fill.area-fill {
  background: linear-gradient(90deg, #8b5cf6, #d946ef);
}

.completion-status {
  margin: 8px 0 0;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 700;
  min-height: 1.2em;
  visibility: hidden;
  transition:
    visibility 0s,
    opacity 0.2s;
  opacity: 0;
}

.completion-status.visible {
  visibility: visible;
  opacity: 1;
}

.landing-header__title {
  font-size: 40px;
}

@media (max-width: 1120px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .playground-wrap {
    padding: 14px;
    border-radius: 18px;
  }

  .preview-stage {
    min-height: 250px;
  }

  .compact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
