<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue';
import { type Scratcher as CoreScratcher } from '@scratcher.js/core';
import { Scratcher as VueScratcher } from '@scratcher.js/vue';

import PlaygroundFrame from './PlaygroundFrame.vue';
let scratcher: CoreScratcher | null = null;

function handleScratcherReady(nextScratcher: CoreScratcher) {
  scratcher = nextScratcher;
}
function resetCanvas() {
  if (!scratcher) {
    return;
  }
  scratcher.reset();
}

function renderCover(canvas: HTMLCanvasElement, width: number, height: number, _cover: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // custom Gradient cover
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#7700ff');
  grad.addColorStop(1, '#bf4587');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}
</script>

<template>
  <PlaygroundFrame @reset="resetCanvas">
    <template #main>
      <VueScratcher
        class="scratch-card"
        responsive
        :width="400"
        :height="240"
        :brush-size="50"
        :renderCover="renderCover"
        canvas-class="scratch-canvas"
        :on-scratcher-ready="handleScratcherReady"
      >
        <div class="reward">Custom Cover Example</div>
      </VueScratcher>
    </template>
  </PlaygroundFrame>
</template>

<style scoped>
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

.completion-status {
  color: #4caf50;
  font-weight: bold;
  margin-top: 1rem;
}

.scratch-card {
  position: relative;
  border-radius: 0.875rem;
  overflow: hidden;
  touch-action: none;
  max-width: 100%;
  box-shadow: 0 1rem 2.5rem var(--vp-c-gray-soft);
}
</style>
