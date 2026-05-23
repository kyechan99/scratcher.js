<img src="https://github.com/kyechan99/scratcher.js/raw/main/apps/docs/public/logo.png" width="150" height="150" alt="scratcher.js"/>

# @scratcher.js/core

Framework-agnostic scratch interaction engine for [scratcher.js](https://github.com/kyechan99/scratcher.js) — drop a "scratchcard experience" into any product (event reveals, coupon codes, game-style reward UIs).

This package is the core engine. If you use a framework, install the matching binding instead:

- [@scratcher.js/react](https://www.npmjs.com/package/@scratcher.js/react)
- [@scratcher.js/vue](https://www.npmjs.com/package/@scratcher.js/vue)
- [@scratcher.js/svelte](https://www.npmjs.com/package/@scratcher.js/svelte)

## Documentation

Full docs, API reference, and examples - [Scratcher.js | Docs](https://kyechan99.github.io/scratcher.js/)

## Install

```bash
npm i @scratcher.js/core
```

## Quick start

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400,
  height: 240,
  brushSize: 30,
  cover: '#ccc',
  completionThreshold: 0.5,
  onProgress: snap => console.log('Progress:', snap.progress),
  onComplete: () => alert('Scratching complete!'),
});
scratcher.bindCanvas(canvas);
```

## Features

- 🖱️ Mouse & touch scratch interaction
- 🎨 Adjustable brush size, cover/background images, custom rendering
- 📊 Progress tracking, completion detection, lifecycle callbacks
- 🎯 Measure progress over the whole canvas or a specific area (rect / image mask)
- 🟦 Written in TypeScript with full type definitions

## Configuration

| Option                | Type                         | Required | Description                                               | Default     |
| --------------------- | ---------------------------- | :------: | --------------------------------------------------------- | ----------- |
| `width`               | `number`                     |    ✓     | Canvas drawing-buffer width (px). The engine scales pointer coordinates internally, so the bound `<canvas>` may be CSS-sized independently. | —           |
| `height`              | `number`                     |    ✓     | Canvas drawing-buffer height (px).                                                                                                          | —           |
| `brushSize`           | `number`                     |    ✓     | Brush diameter (px)                                       | —           |
| `cellSize`            | `number`                     |          | Grid cell size (px) for progress tracking. Lower = finer. | `16`        |
| `completionThreshold` | `number (0~1)`               |          | Progress at which `onComplete` fires                      | `0.5`       |
| `revealOnCompletion`  | `boolean`                    |          | Auto-clear the cover when threshold is reached            | `false`     |
| `cover`               | `string`                     |          | Cover color or image URL                                  | `'#b9c2ce'` |
| `area`                | `RectArea \| ImageArea`      |          | Restrict progress measurement to a region                 | —           |
| `callbacks`           | `ScratchControllerCallbacks` |          | Event handlers (see below)                                | —           |
| `mapPoint`            | `function`                   |          | Custom pointer → canvas coordinate mapper                 | built-in    |
| `renderAtPoint`       | `function`                   |          | Custom brush-stroke renderer                              | built-in    |
| `renderCover`         | `function`                   |          | Custom cover-layer renderer                               | built-in    |

## Callbacks

All callbacks receive the latest `ScratchSnapshot` — `{ scratchedCells, totalCells, progress, area? }`.

| Callback         | Signature                   | Triggered                   |
| ---------------- | --------------------------- | --------------------------- |
| `onScratchStart` | `(point, snapshot) => void` | Pointer down on the canvas  |
| `onScratchMove`  | `(point, snapshot) => void` | Pointer move while drawing  |
| `onScratchEnd`   | `(snapshot) => void`        | Pointer up / leave / cancel |
| `onReset`        | `(snapshot) => void`        | `reset()` called            |
| `onProgress`     | `(snapshot) => void`        | Any progress change         |
| `onComplete`     | `(snapshot) => void`        | Threshold first reached     |

## API

The `Scratcher` instance exposes the runtime API:

| Member                                   | Description                                                      |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `bindCanvas(canvas)`                     | Attach pointer/render adapter to a canvas. Returns an unbind fn. |
| `unbindCanvas()`                         | Detach the current canvas.                                       |
| `reset()`                                | Reset state and redraw the cover.                                |
| `setBrushSize(size)`                     | Update brush size live.                                          |
| `setArea(area?)`                         | Update the measured area live (or remove it).                    |
| `setCallbacks(callbacks?)`               | Replace event callbacks live.                                    |
| `on(event, listener)`                    | Subscribe to lifecycle events. Returns an unsubscribe fn.        |
| `start(point)` / `move(point)` / `end()` | Manual pointer driving (rarely needed).                          |
| `snapshot`                               | Latest `ScratchSnapshot` (getter).                               |
| `isDrawing` / `isCompleted`              | Runtime state flags (getters).                                   |

## License

[MIT](https://github.com/kyechan99/scratcher.js/blob/main/LICENSE)
