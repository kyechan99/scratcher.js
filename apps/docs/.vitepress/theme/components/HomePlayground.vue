<script setup lang="ts">
import {
  type Scratcher as CoreScratcher,
  type ScratchControllerCallbacks,
  type ScratchSnapshot,
  type ScratcherConfig as CoreScratcherConfig,
} from '@scratcher/core';
import { Scratcher as VueScratcher } from '@scratcher/vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

type FrameworkId = 'react' | 'vue' | 'react-native' | 'typescript';

const frameworkOrder: FrameworkId[] = ['react', 'vue', 'react-native', 'typescript'];

interface PlaygroundScratcherConfig extends CoreScratcherConfig {
  width: number;
  height: number;
  coverage: number;
  brushSize: number;
  cover: string;
}

const frameworkLabels: Record<FrameworkId, string> = {
  react: 'React',
  vue: 'Vue',
  'react-native': 'React Native',
  typescript: 'TypeScript',
};
 

const usageExamples: Record<FrameworkId, string> = {
  react: `import { Scratcher } from "@scratcher/react";

<Scratcher
  {...scratcherConfig}
  callbacks={{
    onProgress: (next) => console.log(next.progress),
    onComplete: () => console.log("completed")
  }}
>
  <div>React: React Coupon</div>
</Scratcher>;`,
  vue: `import { Scratcher } from "@scratcher/vue";

<Scratcher
  v-bind="scratcherConfig"
  :callbacks="{
    onStrokeEnd: (next) => console.log(next.scratchedCells)
  }"
>
  <div>Vue: Vue Coupon</div>
</Scratcher>`,
  'react-native': `import { useNativeScratchController } from "@scratcher/react-native";

const { scratcher } = useNativeScratchController({
  ...scratcherConfig,
  callbacks: {
    onReset: () => console.log("reset")
  }
});`,
  typescript: `import { Scratcher, type ScratcherConfig } from "@scratcher/core";

const scratcher = new Scratcher({
  ...scratcherConfig
});`,
};

const sharedConfigCode = ref(`const scratcherConfig = {
  width: 360,
  height: 200,
  coverage: 10,
  brushSize: 30,
  cover: "#b9c2ce"
};`);

const activeFramework = ref<FrameworkId>('react');
const parseError = ref('');
const snapshot = ref<ScratchSnapshot>({
  scratchedCells: 0,
  totalCells: 1,
  progress: 0,
});
const currentScratcherConfig = ref<PlaygroundScratcherConfig>({
  width: 360,
  height: 200,
  coverage: 10,
  brushSize: 30,
  cover: '#b9c2ce',
});

let scratcher: CoreScratcher | null = null;
let parseTimer: number | null = null;

const configCode = computed({
  get: () => sharedConfigCode.value,
  set: (value: string) => {
    sharedConfigCode.value = value;
  },
});

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

function extractConfigObjectLiteral(source: string): string {
  const anchor = /\bconst\s+(?:scratcherConfig|config)(?:\s*:\s*[^=]+)?\s*=\s*/.exec(source);
  if (!anchor || anchor.index < 0) {
    throw new Error(
      'const scratcherConfig = { ... } 또는 const config = { ... } 형태를 찾지 못했습니다.',
    );
  }

  const startSearchIndex = anchor.index + anchor[0].length;
  const startBraceIndex = source.indexOf('{', startSearchIndex);
  if (startBraceIndex < 0) {
    throw new Error('config 객체 시작({)을 찾지 못했습니다.');
  }

  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateLiteral = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let i = startBraceIndex; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && !inTemplateLiteral) {
      if (char === '/' && next === '/') {
        inLineComment = true;
        i += 1;
        continue;
      }
      if (char === '/' && next === '*') {
        inBlockComment = true;
        i += 1;
        continue;
      }
    }

    if (inSingleQuote || inDoubleQuote || inTemplateLiteral) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (inSingleQuote && char === "'") {
        inSingleQuote = false;
      } else if (inDoubleQuote && char === '"') {
        inDoubleQuote = false;
      } else if (inTemplateLiteral && char === '`') {
        inTemplateLiteral = false;
      }
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (char === '`') {
      inTemplateLiteral = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(startBraceIndex, i + 1);
      }
    }
  }

  throw new Error('config 객체가 닫히지 않았습니다.');
}

function parseConfig(source: string): PlaygroundScratcherConfig {
  const objectLiteral = extractConfigObjectLiteral(source);
  const evaluator = new Function(`return (${objectLiteral});`);
  const result = evaluator() as
    | Partial<
        PlaygroundScratcherConfig & {
          coverTop?: string;
          coverBottom?: string;
        }
      >
    | undefined;

  if (!result || typeof result !== 'object') {
    throw new Error('config object를 찾지 못했습니다.');
  }

  return {
    width: Math.max(180, safeNumber(result.width, 360)),
    height: Math.max(120, safeNumber(result.height, 200)),
    coverage: Math.max(
      4,
      safeNumber(result.coverage, safeNumber((result as { gridSize?: unknown }).gridSize, 10)),
    ),
    brushSize: Math.max(8, safeNumber(result.brushSize, 30)),
    cover: safeText(
      normalizeCoverColor(result.cover, safeText(result.coverTop, '#d6d9df')),
      safeText(result.coverTop, '#d6d9df'),
    ),
  };
}

const previewCallbacks = computed<ScratchControllerCallbacks>(() => ({
  onProgress: (next: any) => {
    snapshot.value = next;
  },
}));

function handleScratcherReady(nextScratcher: CoreScratcher) {
  scratcher = nextScratcher;
  snapshot.value = nextScratcher.snapshot;
}

function refreshFromEditor() {
  try {
    currentScratcherConfig.value = parseConfig(sharedConfigCode.value);
    parseError.value = '';
  } catch (error) {
    parseError.value = error instanceof Error ? error.message : '코드 해석 중 오류가 발생했습니다.';
  }
}

function scheduleRefresh() {
  if (parseTimer !== null) {
    window.clearTimeout(parseTimer);
  }

  parseTimer = window.setTimeout(() => {
    refreshFromEditor();
  }, 180);
}

function resetCanvas() {
  if (!scratcher) {
    return;
  }

  snapshot.value = scratcher.reset();
}

watch(configCode, () => {
  scheduleRefresh();
});

onMounted(() => {
  refreshFromEditor();
});

onUnmounted(() => {
  if (parseTimer !== null) {
    window.clearTimeout(parseTimer);
  }
  scratcher = null;
});
</script>

<template>
  <section class="home-shell">
    <header class="home-intro"> 
      <h1>Scratcher.js</h1> 
    </header>

    <div class="studio-grid">
      <section class="studio-panel editor-panel">
        <div class="panel-head">
          <h2>Framework Usage</h2> 
        </div>

        <div class="framework-tabs">
          <button
            v-for="id in frameworkOrder"
            :key="id"
            :class="['tab', { active: activeFramework === id }]"
            type="button"
            @click="activeFramework = id"
          >
            {{ frameworkLabels[id] }}
          </button>
        </div>
 
        <pre class="usage-code"><code>{{ usageExamples[activeFramework] }}</code></pre>
 
        <textarea
          v-model="configCode"
          class="code-editor"
          spellcheck="false"
          aria-label="Scratcher config editor"
        />

        <p v-if="parseError" class="error-text">error: {{ parseError }}</p>
      </section>

      <section class="studio-panel preview-panel">
        <div class="panel-head">
          <h2>Preview</h2>
          <p>progress {{ progressPercent }}%</p>
        </div>

        <VueScratcher
          class="scratch-card"
          :width="currentScratcherConfig.width"
          :height="currentScratcherConfig.height"
          :coverage="currentScratcherConfig.coverage"
          :brush-size="currentScratcherConfig.brushSize"
          :cover="normalizeCoverColor(currentScratcherConfig.cover, '#d6d9df')"
          :callbacks="previewCallbacks"
          canvas-class="scratch-canvas"
          :on-scratcher-ready="handleScratcherReady"
        >
          <div class="reward">🎁 Scratched!</div>
        </VueScratcher>

        <div class="preview-footer"> 
          <button type="button" class="reset-button" @click="resetCanvas">reset</button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.home-shell {
  padding: 18px 0 40px;
}

.home-intro {
  margin: 8px 0 22px;
}

.home-intro h1 {
  margin: 6px 0;
  font-size: clamp(1.5rem, 3.2vw, 2.6rem);
  line-height: 1.15;
  color: #102335;
}

.home-intro p {
  margin: 0;
  color: #43506a;
  font-size: 0.98rem;
}
 

.studio-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.studio-panel {
  border-radius: 18px;
  border: 1px solid rgba(25, 36, 48, 0.15);
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 16px 34px rgba(41, 58, 79, 0.12);
  backdrop-filter: blur(10px);
  padding: 16px;
}

.panel-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.panel-head h2 {
  margin: 0;
  font-size: 1rem;
  color: #1c2f42;
}

.panel-head p {
  margin: 0;
  font-size: 0.82rem;
  color: #5b6783;
}

.framework-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tab {
  border: 1px solid #d8deea;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #43506a;
  background: #fff;
  cursor: pointer;
}

.tab.active {
  color: #0e523d;
  border-color: #5fbf9f;
  background: linear-gradient(135deg, #e9fff8, #defff0);
}
 
.usage-code {
  margin: 0 0 10px;
  border: 1px solid #d0d8e6;
  border-radius: 14px;
  padding: 12px 14px;
  background: linear-gradient(180deg, #141d2b, #0f1722);
  color: #eaf2ff;
  font-family: var(--vp-font-family-mono);
  font-size: 0.82rem;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-x: auto;
}

.code-editor {
  width: 100%;
  min-height: 370px;
  border: 1px solid #d0d8e6;
  border-radius: 14px;
  padding: 12px 14px;
  resize: vertical;
  background: linear-gradient(180deg, #141d2b, #0f1722);
  color: #eaf2ff;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  line-height: 1.55;
}

.code-editor:focus {
  outline: 2px solid #7fe7c4;
  outline-offset: 1px;
}

.error-text {
  margin: 10px 0 0;
  color: #b22542;
  font-size: 0.82rem;
  font-family: var(--vp-font-family-mono);
}

.preview-panel {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.scratch-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #d4dbdf;
  background: #fff;
  touch-action: none;
  max-width: 100%;
}

.reward {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  font-weight: 700;
  color: #4a2e00;
  background: repeating-linear-gradient(-45deg, #ffe08e, #ffe08e 14px, #ffd06c 14px, #ffd06c 28px);
}

.reward-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.scratch-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.preview-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.preview-footer p {
  margin: 0;
  color: #43506a;
  font-size: 0.9rem;
}

.reset-button {
  border: 1px solid #156a50;
  border-radius: 999px;
  padding: 8px 16px;
  background: #13795b;
  color: #fff;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
}

.reset-button:hover {
  background: #0f684d;
}

@media (min-width: 960px) {
  .studio-grid {
    grid-template-columns: 1.08fr 0.92fr;
    gap: 20px;
  }
}
</style>
