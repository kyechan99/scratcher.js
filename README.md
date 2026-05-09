<img src="/apps/docs/public/logo.png" width="150" height="150" alt="scratcher.js"/>

# @scratcher.js

[![@scratcher.js/core](https://img.shields.io/npm/v/@scratcher.js/core?style=flat&color=cb3837&logo=npm&label=core)](https://www.npmjs.com/package/@scratcher.js/core)
[![@scratcher.js/react](https://img.shields.io/npm/v/@scratcher.js/react?style=flat&color=cb3837&logo=npm&label=%40scratcher.js%2Freact)](https://www.npmjs.com/package/@scratcher.js/react)
[![@scratcher.js/vue](https://img.shields.io/npm/v/@scratcher.js/vue?style=flat&color=cb3837&logo=npm&label=%40scratcher.js%2Fsvelte)](https://www.npmjs.com/package/@scratcher.js/vue)
[![@scratcher.js/svelte](https://img.shields.io/npm/v/@scratcher.js/svelte?style=flat&color=cb3837&logo=npm&label=%40scratcher.js%2Fsvelte)](https://www.npmjs.com/package/@scratcher.js/svelte)
<br/>
[![codecov](https://img.shields.io/codecov/c/github/kyechan99/scratcher.js?style=flat&logo=codecov&logoColor=white)](https://codecov.io/gh/kyechan99/scratcher.js)
[![license](https://img.shields.io/npm/l/@scratcher.js/core?style=flat&color=green)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A lightweight library for building expressive Scratch interactions.

Scratcher.js lets you drop a "scratchcard experience" into your product with a few lines of config — event reveals, coupon codes, game-style reward UIs, anywhere user engagement matters.

**Docs:** [English](https://kyechan99.github.io/scratcher.js/) · [한국어](https://kyechan99.github.io/scratcher.js/kr/) · ...

## Why?

Building a scratch UI from scratch means handling input events, progress calculation, completion thresholds, rendering performance, and reimplementing it for every framework. Scratcher.js consolidates that work into a single core engine and ships thin bindings for each framework.

## Features

- 🖱️ Mouse & touch scratch interaction
- 🎨 Adjustable brush size, sensitivity, cover/background images, custom rendering
- 📊 Progress tracking, completion detection, and lifecycle callbacks
- 🎯 Measure progress over the whole canvas or a specific area (rect / image mask)
- 🧩 Framework bindings for React, Vue, and React Native — same options everywhere
- 🟦 Written in TypeScript with full type definitions

## Packages

| Package                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `@scratcher.js/core`   | Framework-agnostic scratch engine and types |
| `@scratcher.js/react`  | React bindings                              |
| `@scratcher.js/vue`    | Vue bindings                                |
| `@scratcher.js/svelte` | Svelte bindings                             |

## Installation

```bash
# Vanilla JS
npm i @scratcher.js/core

# React
npm i @scratcher.js/react

# Vue
npm i @scratcher.js/vue

# Svelte
npm i @scratcher.js/svelte
```

## Quick Start

The same config object works across every binding — only the way you pass it in changes.

```ts
const scratcherConfig = {
  width: 300,
  height: 150,
  brushSize: 30,
  completionThreshold: 0.7,
  cover: '#ccc',
  onProgress: snap => console.log('Progress:', snap.progress),
  onComplete: () => alert('Scratching complete!'),
};
```

### React

```tsx
import { Scratcher } from '@scratcher.js/react';

<Scratcher {...scratcherConfig}>
  <div className="reward">You found it!</div>
</Scratcher>;
```

### Vue

```vue
<Scratcher v-bind="scratcherConfig">
  <div class="reward">You found it!</div>
</Scratcher>
```

### Svelte

```svelte
<script lang="ts">
  import { Scratcher } from '@scratcher.js/svelte';
</script>

<Scratcher {...scratcherConfig}>
  <div class="reward">You found it!</div>
</Scratcher>
```

### Vanilla JS

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher(scratcherConfig);
scratcher.bindCanvas(canvas);
```

## Configuration

| Option                | Type                    | Description                                                                                                                                    | Default     |
| --------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `width` \*            | `number`                | Canvas width (px)                                                                                                                              | —           |
| `height` \*           | `number`                | Canvas height (px)                                                                                                                             | —           |
| `brushSize` \*        | `number`                | Brush diameter (px)                                                                                                                            | —           |
| `cellSize`            | `number`                | Grid cell size (px) for progress tracking. Lower = finer.                                                                                      | `16`        |
| `completionThreshold` | `number (0~1)`          | Progress at which `onComplete` fires                                                                                                           | `0.5`       |
| `revealOnCompletion`  | `boolean`               | Auto-clear the cover when threshold is reached                                                                                                 | `false`     |
| `cover`               | `string`                | Cover color or image URL                                                                                                                       | `'#b9c2ce'` |
| `area`                | `RectArea \| ImageArea` | Restrict progress measurement to a region                                                                                                      | —           |
| `callbacks`           | `object`                | `onProgress`, `onComplete`, `onScratchStart`, [etc](https://kyechan99.github.io/scratcher.js/docs/configuration.html#callbacks-option-details) | —           |

See the [Configuration guide](https://kyechan99.github.io/scratcher.js/docs/configuration) and [API Reference](https://kyechan99.github.io/scratcher.js/docs/api-reference) for the full list.

## Examples

You can also implement deeper features by utilizing Scratcher's basic functions.

- [Default](https://kyechan99.github.io/scratcher.js/examples/default)
- [Custom Cover](https://kyechan99.github.io/scratcher.js/examples/custom-cover)
- [Custom Scratch](https://kyechan99.github.io/scratcher.js/examples/custom-scratch)
- [Custom Area — Rect](https://kyechan99.github.io/scratcher.js/examples/custom-area-rect)
- [Custom Area — Image](https://kyechan99.github.io/scratcher.js/examples/custom-area-image)
- [Using Images](https://kyechan99.github.io/scratcher.js/examples/using-images)
- [Async Reward](https://kyechan99.github.io/scratcher.js/examples/async-reward)
- [Completion Animation](https://kyechan99.github.io/scratcher.js/examples/complete-animation)

## Contributing

Issues and PRs are welcome. For bugs, please include a minimal reproduction. For feature ideas, open an issue first so we can align on scope.

- [Open an issue](https://github.com/kyechan99/scratcher.js/issues)
- [Pull requests](https://github.com/kyechan99/scratcher.js/pulls)

## License

[MIT](LICENSE) © 2026
