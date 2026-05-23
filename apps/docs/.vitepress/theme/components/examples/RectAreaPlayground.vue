<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  type Scratcher as CoreScratcher,
  type ScratchSnapshot,
  type RectArea,
} from '@scratcher.js/core';
import { Scratcher as VueScratcher } from '@scratcher.js/vue';
import PlaygroundFrame from './PlaygroundFrame.vue';

let scratcher: CoreScratcher | null = null;

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

const snapshot = ref<ScratchSnapshot>({
  scratchedCells: 0,
  totalCells: 1,
  progress: 0,
});

const areaConfig = ref<RectArea>({
  x: 75,
  y: 75,
  width: 250,
  height: 250,
});

const areaOverlayStyle = computed(() => ({
  left: `${(areaConfig.value.x / CANVAS_WIDTH) * 100}%`,
  top: `${(areaConfig.value.y / CANVAS_HEIGHT) * 100}%`,
  width: `${(areaConfig.value.width / CANVAS_WIDTH) * 100}%`,
  height: `${(areaConfig.value.height / CANVAS_HEIGHT) * 100}%`,
}));

const areaProgressPercent = computed(() => {
  if (!snapshot.value.area) return '0.0';
  return (snapshot.value.area.progress * 100).toFixed(1);
});

const onProgress = (next: ScratchSnapshot) => {
  snapshot.value = next;
};

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

function updateAreaX(value: number) {
  areaConfig.value.x = value;
  if (scratcher) {
    scratcher.setArea(areaConfig.value);
  }
}

function updateAreaY(value: number) {
  areaConfig.value.y = value;
  if (scratcher) {
    scratcher.setArea(areaConfig.value);
  }
}

function updateAreaWidth(value: number) {
  areaConfig.value.width = value;
  if (scratcher) {
    scratcher.setArea(areaConfig.value);
  }
}

function updateAreaHeight(value: number) {
  areaConfig.value.height = value;
  if (scratcher) {
    scratcher.setArea(areaConfig.value);
  }
}
</script>

<template>
  <PlaygroundFrame @reset="resetCanvas">
    <template #main>
      <div class="scratch-frame">
        <VueScratcher
          class="scratch-card"
          responsive
          :width="CANVAS_WIDTH"
          :height="CANVAS_HEIGHT"
          :brush-size="40"
          :cover="'#b9c2ce'"
          :area="areaConfig"
          :on-progress="onProgress"
          canvas-class="scratch-canvas"
          :on-scratcher-ready="handleScratcherReady"
        >
          <div class="reward">Scratch the blue area!</div>
        </VueScratcher>

        <div class="area-overlay" :style="areaOverlayStyle" />
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
    </template>
  </PlaygroundFrame>
</template>

<style scoped>
.scratch-frame {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
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

.area-overlay {
  position: absolute;
  pointer-events: none;
  border: 2px dashed #4caf50;
  box-shadow: inset 0 0 0 1px rgba(76, 175, 80, 0.3);
  background-color: rgba(76, 175, 80, 0.05);
}

.area-info {
  margin-top: 1rem;
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

:deep(.scratch-canvas) {
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
