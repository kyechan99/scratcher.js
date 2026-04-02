<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue';
import { type Scratcher as CoreScratcher } from '@scratcher/core';
import { Scratcher as VueScratcher } from '@scratcher/vue';

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
  <div class="playground playground-bg">
    <div class="preview-zone">
      <VueScratcher
        class="scratch-card"
        :width="400"
        :height="240"
        :brush-size="30"
        :renderCover="renderCover"
        canvas-class="scratch-canvas"
        :on-scratcher-ready="handleScratcherReady"
      >
        <div class="reward">Custom Cover Example</div>
      </VueScratcher>
      <div class="action-row">
        <button type="button" class="btn btn-sm" @click="resetCanvas()">Reset</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playground {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0;
}

.preview-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-radius: 1rem;
}

.reward {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  font-weight: 800;
  text-align: center;
  color: #151b3a;
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
