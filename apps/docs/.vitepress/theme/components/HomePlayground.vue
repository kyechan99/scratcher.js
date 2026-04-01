<script setup lang="ts">
import {
  type Scratcher as CoreScratcher,
  type ScratchControllerCallbacks,
  type ScratchSnapshot,
  type ScratcherConfig as CoreScratcherConfig,
} from '@scratcher/core';
import { Scratcher as VueScratcher } from '@scratcher/vue';
import { computed, onUnmounted, ref } from 'vue';

interface PlaygroundScratcherConfig extends CoreScratcherConfig {
  width: number;
  height: number;
  coverage: number;
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

const currentScratcherConfig = ref<PlaygroundScratcherConfig>({
  width: 400,
  height: 400,
  coverage: 10,
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
    coverage: Math.max(4, safeNumber(raw.coverage, 10)),
    brushSize: Math.max(8, safeNumber(raw.brushSize, 30)),
    cover: normalizeCoverColor(raw.cover, '#d6d9df'),
    completionThreshold: Math.min(1, Math.max(0, safeNumber(raw.completionThreshold, 0.2))),
    revealOnCompletion: raw.revealOnCompletion === true,
  };
});

const previewCallbacks = computed<ScratchControllerCallbacks>(() => ({
  onProgress: next => {
    snapshot.value = next;
  },
  onComplete: () => {
    isCompleted.value = true;
  },
}));

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

  scratcher = null;
});
</script>

<template>
  <section class="home-shell fulled">
    <div class="hero-grid">
      <div class="preview-zone">
        <div class="preview-stage">
          <VueScratcher class="scratch-card" :width="sanitizedScratcherConfig.width"
            :height="sanitizedScratcherConfig.height" :coverage="sanitizedScratcherConfig.coverage"
            :brush-size="sanitizedScratcherConfig.brushSize" :cover="sanitizedScratcherConfig.cover"
            :callbacks="previewCallbacks" :completion-threshold="sanitizedScratcherConfig.completionThreshold"
            :reveal-on-completion="sanitizedScratcherConfig.revealOnCompletion" canvas-class="scratch-canvas"
            :on-scratcher-ready="handleScratcherReady">
            <div class="reward">You found it!</div>
          </VueScratcher>
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
          <input v-model.number="currentScratcherConfig.brushSize" type="range" min="8" max="80" step="1" />
        </label>

        <label class="field">
          <div class="field-head">
            <span>Coverage</span>
            <strong>{{ sanitizedScratcherConfig.coverage }}</strong>
          </div>
          <input v-model.number="currentScratcherConfig.coverage" type="range" min="4" max="24" step="1" />
        </label>

        <label class="color-field">
          <span>Cover color</span>
          <div class="color-input-wrap">
            <input v-model="currentScratcherConfig.cover" type="color" aria-label="Pick cover color" />
          </div>
        </label>

        <hr />

        <label class="field">
          <div class="field-head">
            <span>completionThreshold</span>
            <strong>{{ sanitizedScratcherConfig.completionThreshold?.toFixed(2) }}</strong>
          </div>
          <input v-model.number="currentScratcherConfig.completionThreshold" type="range" min="0" max="1" step="0.01" />
        </label>

        <label class="toggle-row">
          <span>revealOnCompletion {{ sanitizedScratcherConfig.revealOnCompletion ? 'On' : 'Off' }}</span>
          <input v-model="currentScratcherConfig.revealOnCompletion" type="checkbox" />
        </label>

        <hr />

        <div class="progress-box">
          <div class="progress-head">
            <span>Progress</span>
            <strong>{{ progressPercent }}%</strong>
          </div>
          <div class="progress-track" role="progressbar" :aria-valuenow="Number(progressPercent)" aria-valuemin="0"
            aria-valuemax="100">
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

  /* background-image: -webkit-radial-gradient(#ddd 1px, transparent 0), -webkit-radial-gradient(#ddd 1px, transparent 0); */
  background-image: -moz-radial-gradient(var(--week-gray) 1px, transparent 0), -moz-radial-gradient(var(--week-gray) 1px, transparent 0);
  background-image: -o-radial-gradient(var(--week-gray) 1px, transparent 0), -o-radial-gradient(var(--week-gray) 1px, transparent 0);
  background-image: radial-gradient(var(--week-gray) 1px, transparent 0), radial-gradient(var(--week-gray) 1px, transparent 0);
  background-position: 0 0, 20px 20px;
  -webkit-background-size: 40px 40px;
  -moz-background-size: 40px 40px;
  -o-background-size: 40px 40px;
  background-size: 40px 40px;
  word-break: keep-all;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  align-items: start;
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
  place-items: center;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}

.scratch-card {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  touch-action: none;
  max-width: 100%;
  box-shadow: 0 1rem 2.5rem var(--vp-c-gray-soft);
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

.scratch-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
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

.progress-box {}

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

.completion-status {
  margin: 8px 0 0;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 700;
  min-height: 1.2em;
  visibility: hidden;
  transition: visibility 0s, opacity 0.2s;
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
