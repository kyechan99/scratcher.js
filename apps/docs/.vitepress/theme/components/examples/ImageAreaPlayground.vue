<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue';
import {
  type Scratcher as CoreScratcher,
  type ScratchSnapshot,
  type ImageArea,
} from '@scratcher.js/core';
import { Scratcher as VueScratcher } from '@scratcher.js/vue';
import PlaygroundFrame from './PlaygroundFrame.vue';

let scratcher: CoreScratcher | null = null;

const snapshot = ref<ScratchSnapshot>({
  scratchedCells: 0,
  totalCells: 1,
  progress: 0,
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
const areaImageStatus = ref('No image uploaded');

const canvasSize = {
  width: 400,
  height: 400,
};

const areaImageXMax = computed(() => {
  if (!areaImage.value) return canvasSize.width;
  return Math.max(
    0,
    canvasSize.width - areaImage.value.imageData.width * areaImageTransform.value.scale,
  );
});

const areaImageYMax = computed(() => {
  if (!areaImage.value) return canvasSize.height;
  return Math.max(
    0,
    canvasSize.height - areaImage.value.imageData.height * areaImageTransform.value.scale,
  );
});

const areaImageScaleMax = computed(() => {
  if (!areaImage.value) return 1.5;
  const maxWidthScale = canvasSize.width / areaImage.value.imageData.width;
  const maxHeightScale = canvasSize.height / areaImage.value.imageData.height;
  return Math.max(0.1, Math.min(1.5, Math.min(maxWidthScale, maxHeightScale) * 2));
});

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

const currentArea = computed<ImageArea | undefined>(() => {
  if (!areaImage.value) {
    return undefined;
  }

  return {
    imageData: areaImage.value.imageData,
    x: areaImageTransform.value.x,
    y: areaImageTransform.value.y,
    scale: areaImageTransform.value.scale,
    alphaThreshold: areaImageAlphaThreshold.value,
  };
});

const areaProgressPercent = computed(() => {
  if (!snapshot.value.area) return '0.0';
  return (snapshot.value.area.progress * 100).toFixed(1);
});

const onProgress = (next: ScratchSnapshot) => {
  snapshot.value = next;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function updateAreaImageX(value: number) {
  areaImageTransform.value.x = clamp(value, 0, areaImageXMax.value);
}

function updateAreaImageY(value: number) {
  areaImageTransform.value.y = clamp(value, 0, areaImageYMax.value);
}

function updateAreaImageScale(value: number) {
  areaImageTransform.value.scale = clamp(value, 0.1, areaImageScaleMax.value);
  areaImageTransform.value.x = clamp(areaImageTransform.value.x, 0, areaImageXMax.value);
  areaImageTransform.value.y = clamp(areaImageTransform.value.y, 0, areaImageYMax.value);
}

async function handleAreaImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    if (areaImage.value) {
      URL.revokeObjectURL(areaImage.value.src);
    }
    areaImage.value = null;
    areaImageStatus.value = 'No image uploaded';
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
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    areaImage.value = null;
    areaImageStatus.value = 'Failed to load image';
    console.error(error);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = src;
  });
}

function handleScratcherReady(nextScratcher: CoreScratcher) {
  scratcher = nextScratcher;
  snapshot.value = nextScratcher.snapshot;
}

function resetCanvas() {
  if (!scratcher) {
    return;
  }
  snapshot.value = scratcher.reset();
}

async function loadDefaultImage() {
  try {
    const loadedImage = await loadImage('/scratcher.js/area_mask_sample.png');
    const canvas = document.createElement('canvas');
    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context is not available.');
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(loadedImage, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    areaImage.value = {
      src: '/scratcher.js/area_mask_sample.png',
      imageData,
    };
    areaImageStatus.value = `area_mask_sample.png (${loadedImage.width}×${loadedImage.height})`;
    areaImageTransform.value = {
      x: 50,
      y: 50,
      scale: 1,
    };
  } catch (error) {
    areaImage.value = null;
    areaImageStatus.value = 'Failed to load default image';
    console.error(error);
  }
}

onMounted(() => {
  loadDefaultImage();
});

onUnmounted(() => {
  if (areaImage.value) {
    URL.revokeObjectURL(areaImage.value.src);
  }
  scratcher = null;
});
</script>

<template>
  <PlaygroundFrame @reset="resetCanvas">
    <template #main>
      <div class="image-area-container">
        <div class="scratch-frame">
          <VueScratcher
            class="scratch-card"
            :width="canvasSize.width"
            :height="canvasSize.height"
            :brush-size="40"
            :cover="'#b9c2ce'"
            :area="currentArea"
            :on-progress="onProgress"
            canvas-class="scratch-canvas"
            :on-scratcher-ready="handleScratcherReady"
          >
            <div class="reward">Scratch the area!</div>
          </VueScratcher>

          <img
            v-if="areaImage"
            class="area-image-overlay"
            :src="areaImage.src"
            alt="Area mask overlay"
            :style="areaImagePreviewStyle"
          />
        </div>

        <div class="area-info">
          <div class="progress-text">
            <span class="label">Area Progress:</span>
            <span class="value">{{ areaProgressPercent }}%</span>
          </div>
          <div v-if="snapshot.area" class="progress-detail">
            {{ snapshot.area.scratchedCells }} / {{ snapshot.area.totalCells }} cells
          </div>
        </div>

        <div class="controls">
          <!-- <label class="control-group">
                        <span class="control-label">Image: {{ areaImageStatus }}</span>
                        <input type="file" accept="image/*" class="file-input" @change="handleAreaImageChange" />
                    </label> -->

          <template v-if="areaImage">
            <label class="control-group">
              <div class="control-label">
                <span>Alpha Threshold</span>
                <strong>{{ areaImageAlphaThreshold }}</strong>
              </div>
              <input
                v-model.number="areaImageAlphaThreshold"
                type="range"
                min="0"
                max="255"
                step="1"
                class="slider"
              />
            </label>

            <label class="control-group">
              <div class="control-label">
                <span>Image X</span>
                <strong>{{ areaImageTransform.x }}</strong>
              </div>
              <input
                :value="areaImageTransform.x"
                type="range"
                min="0"
                :max="areaImageXMax"
                step="1"
                class="slider"
                @input="
                  (event: any) => updateAreaImageX(Number((event.target as HTMLInputElement).value))
                "
              />
            </label>

            <label class="control-group">
              <div class="control-label">
                <span>Image Y</span>
                <strong>{{ areaImageTransform.y }}</strong>
              </div>
              <input
                :value="areaImageTransform.y"
                type="range"
                min="0"
                :max="areaImageYMax"
                step="1"
                class="slider"
                @input="
                  (event: any) => updateAreaImageY(Number((event.target as HTMLInputElement).value))
                "
              />
            </label>

            <label class="control-group">
              <div class="control-label">
                <span>Scale</span>
                <strong>{{ areaImageTransform.scale.toFixed(2) }}</strong>
              </div>
              <input
                :value="areaImageTransform.scale"
                type="range"
                min="0.1"
                :max="areaImageScaleMax"
                step="0.1"
                class="slider"
                @input="
                  (event: any) =>
                    updateAreaImageScale(Number((event.target as HTMLInputElement).value))
                "
              />
            </label>

            <!-- <div class="image-preview-section">
                            <div class="preview-label">Image Preview:</div>
                            <img :src="areaImage.src" alt="Image preview" class="image-preview" />
                        </div> -->
          </template>
        </div>
      </div>
    </template>
  </PlaygroundFrame>
</template>

<style scoped>
.image-area-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.scratch-frame {
  position: relative;
  display: inline-block;
}

.reward {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  font-weight: 800;
  text-align: center;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
}

.scratch-card {
  position: relative;
  border-radius: 0.875rem;
  overflow: hidden;
  touch-action: none;
  max-width: 100%;
  box-shadow: 0 1rem 2.5rem var(--vp-c-gray-soft);
}

.area-image-overlay {
  position: absolute;
  pointer-events: none;
  border: 2px dashed var(--vp-c-divider);
  opacity: 0.8;
}

.area-info {
  padding: 1rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 0.5rem;
  text-align: center;
}

.progress-text {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.label {
  color: var(--vp-c-text-2);
}

.value {
  color: #4caf50;
  font-size: 1.1rem;
}

.progress-detail {
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
  margin-top: 0.5rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 0.875rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.control-label strong {
  color: var(--vp-c-brand-2);
  font-weight: 700;
}

.slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--vp-c-divider);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand-2);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand-2);
  cursor: pointer;
  border: none;
}

.file-input {
  padding: 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.4rem;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
}

.image-preview-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 0.4rem;
  border: 1px solid var(--vp-c-divider);
}

:deep(.scratch-canvas) {
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
