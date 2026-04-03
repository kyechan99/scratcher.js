<script setup lang="ts">
import { ref } from 'vue';
import { type Scratcher as CoreScratcher } from '@scratcher/core';
import { Scratcher as VueScratcher } from '@scratcher/vue';
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

function renderAtPoint(x: number, y: number, brushSize: number, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(
      Math.cos(((18 + i * 72) / 180) * Math.PI) * brushSize,
      -Math.sin(((18 + i * 72) / 180) * Math.PI) * brushSize,
    );
    ctx.lineTo(
      Math.cos(((54 + i * 72) / 180) * Math.PI) * (brushSize / 2),
      -Math.sin(((54 + i * 72) / 180) * Math.PI) * (brushSize / 2),
    );
  }
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fill();
  ctx.restore();
}
</script>

<template>
  <PlaygroundFrame @reset="resetCanvas">
    <template #main>
      <VueScratcher
        class="scratch-card"
        :width="400"
        :height="240"
        :brush-size="30"
        :renderAtPoint="renderAtPoint"
        canvas-class="scratch-canvas"
        :on-scratcher-ready="handleScratcherReady"
      >
        <div class="reward">Custom Scratch Example</div>
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
