<script setup lang="ts">
import { ref, computed } from 'vue';
import { type Scratcher as CoreScratcher } from '@scratcher.js/core';
import { Scratcher as VueScratcher } from '@scratcher.js/vue';
import PlaygroundFrame from './PlaygroundFrame.vue';

const coverImg = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=300';

function renderCover(canvas: HTMLCanvasElement, width: number, height: number, _cover: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const prev = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.globalCompositeOperation = prev;
  };
  img.src = coverImg;
}

let scratcher: CoreScratcher | null = null;

function resetCanvas() {
  if (!scratcher) return;
  scratcher.reset();
}
</script>

<template>
  <PlaygroundFrame @reset="resetCanvas">
    <template #main>
      <VueScratcher :width="300" :height="200" :brush-size="50" :renderCover="renderCover">
        <div class="reward">Image Cover Example</div>
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

.scratch-card {
  position: relative;
  border-radius: 0.875rem;
  overflow: hidden;
  touch-action: none;
  max-width: 100%;
  box-shadow: 0 1rem 2.5rem var(--vp-c-gray-soft);
}
</style>
