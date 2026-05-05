<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Scratcher as CoreScratcher } from '@scratcher/core';
import { Scratcher as VueScratcher } from '@scratcher/vue';
import PlaygroundFrame from './PlaygroundFrame.vue';

const scratchCardRef = ref(null);
let scratcher: CoreScratcher | null = null;
const isCompleted = ref(false);

const rewardClass = computed(() => {
  let base = 'reward';
  if (isCompleted.value) base += ' complete';
  return base;
});

const canvasClass = computed(() => {
  let base = 'scratch-canvas';
  if (isCompleted.value) base += ' complete';
  return base;
});

function handleScratcherReady(nextScratcher: CoreScratcher) {
  scratcher = nextScratcher;
}

function resetCanvas() {
  if (!scratcher) return;
  scratcher.reset();
  isCompleted.value = false;
}

function handleComplete() {
  isCompleted.value = true;

  // vibrate
  if (window.navigator.vibrate) {
    window.navigator.vibrate([30, 30, 30]);
  }
}
</script>

<template>
  <PlaygroundFrame @reset="resetCanvas">
    <template #main>
      <VueScratcher
        ref="scratchCardRef"
        class="scratch-card"
        :width="400"
        :height="240"
        :brush-size="50"
        :canvas-class="canvasClass"
        :completion-threshold="0.3"
        :reveal-on-completion="false"
        :on-scratcher-ready="handleScratcherReady"
        :callbacks="{ onComplete: handleComplete }"
        :reward-class="rewardClass"
      >
        <div>Complete Animation Example</div>
      </VueScratcher>
    </template>
  </PlaygroundFrame>
</template>

<style scoped>
.rewardClass {
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

.scratch-card .reward {
  opacity: 0;
  transition: opacity 1s !important;
}

.scratch-card .reward.complete {
  opacity: 1;
}

.scratch-card .scratch-canvas {
  opacity: 1;
  transition: opacity 1s !important;
}

.scratch-card .scratch-canvas.complete {
  opacity: 0;
}
</style>
