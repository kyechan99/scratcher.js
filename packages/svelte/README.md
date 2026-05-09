<img src="https://github.com/kyechan99/scratcher.js/raw/main/apps/docs/public/logo.png" width="150" height="150" alt="scratcher.js"/>

# @scratcher.js/svelte

Svelte 5 bindings for [scratcher.js](https://github.com/kyechan99/scratcher.js) — a A lightweight library for building expressive Scratch interactions.

## Documentation

Full docs, API reference, and examples - [Scratcher.js | Docs](https://kyechan99.github.io/scratcher.js/)

## Install

```bash
npm i @scratcher.js/svelte
```

Requires `svelte >= 5` as a peer dependency.

## Quick start

```svelte
<script lang="ts">
  import { Scratcher } from '@scratcher.js/svelte';

  const config = {
    width: 400,
    height: 240,
    brushSize: 30,
    cover: '#ccc',
    completionThreshold: 0.5,
    callbacks: {
      onProgress: (snap) => console.log('Progress:', snap.progress),
      onComplete: () => alert('Scratching complete!'),
    },
  };
</script>

<Scratcher {...config}>
  <div class="reward">You found it!</div>
</Scratcher>
```

## Configuration

All `ScratcherConfig` options from [`@scratcher.js/core`](https://www.npmjs.com/package/@scratcher.js/core) are accepted as props.

| Prop                  | Type                         | Required | Description                                               | Default     |
| --------------------- | ---------------------------- | :------: | --------------------------------------------------------- | ----------- |
| `width`               | `number`                     |    ✓     | Canvas width (px)                                         | —           |
| `height`              | `number`                     |    ✓     | Canvas height (px)                                        | —           |
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

### Callbacks

All callbacks receive `ScratchSnapshot` — `{ scratchedCells, totalCells, progress, area? }`.

| Callback         | Signature                   | Triggered                   |
| ---------------- | --------------------------- | --------------------------- |
| `onScratchStart` | `(point, snapshot) => void` | Pointer down on the canvas  |
| `onScratchMove`  | `(point, snapshot) => void` | Pointer move while drawing  |
| `onScratchEnd`   | `(snapshot) => void`        | Pointer up / leave / cancel |
| `onReset`        | `(snapshot) => void`        | `reset()` called            |
| `onProgress`     | `(snapshot) => void`        | Any progress change         |
| `onComplete`     | `(snapshot) => void`        | Threshold first reached     |

### Svelte-specific props

| Prop               | Type                                 | Description                                         |
| ------------------ | ------------------------------------ | --------------------------------------------------- |
| `class`            | `string`                             | Class on the wrapper `<div>`                        |
| `canvasClass`      | `string`                             | Class on the inner `<canvas>`                       |
| `rewardClass`      | `string`                             | Class on the reward layer                           |
| `onScratcherReady` | `(scratcher: CoreScratcher) => void` | Receive the underlying engine instance once mounted |
| `children`         | `Snippet`                            | Rendered as the reveal layer below the cover        |

## License

[MIT](https://github.com/kyechan99/scratcher.js/blob/main/LICENSE)
