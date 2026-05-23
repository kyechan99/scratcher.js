# Configuration

This guide covers the main configuration methods and options for Scratcher.js and its framework-specific packages. Almost the same options are used across all environments, with only the method of passing them varying by framework.

## Common Options (Core)

| Option Name         | Type         | Description                                                                                                                         | Default |
| ------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------- |
| width \*            | number       | Canvas width (px). Drawing-buffer size; in wrappers, also the display width (or max width when [`responsive`](#responsive-sizing)). | -       |
| height \*           | number       | Canvas height (px). Drawing-buffer size; ignored for display when a wrapper uses [`responsive`](#responsive-sizing).                | -       |
| brushSize           | number       | Brush size for scratching (px)                                                                                                      | 30      |
| cellSize            | number       | Grid cell size (px) for progress tracking. Lower = finer resolution.                                                                | 16      |
| completionThreshold | number (0~1) | Percentage threshold for completion                                                                                                 | 0.7     |
| revealOnCompletion  | boolean      | Auto-reveal all on completion                                                                                                       | false   |
| cover               | string       | Cover color or image URL                                                                                                            | #ccc    |
| disabled            | boolean      | Whether scratching is disabled                                                                                                      | false   |
| callbacks           | function     | See more detail : [Callbacks](#callbacks-option-details)                                                                            | -       |

- [Area](#area): measure specific areas

### Config Example

```ts
const scratcherConfig = {
  width: 300,
  height: 150,
  brushSize: 30,
  cellSize: 16, // Progress tracking grid cell size (px). Lower = finer.
  completionThreshold: 0.7, // Completion percentage (0~1)
  revealOnCompletion: true, // Auto-reveal all on completion
  cover: '#ccc', // Cover color or image URL
  disabled: false,
  onProgress: next => console.log(next.progress),
  onComplete: () => alert('Scratching complete!'),
};
```

## Framework-Specific Usage

- **Vanilla JS**: `new Scratcher(config)`
- **React**: `<Scratcher {...config} />`
- **Vue**: `<Scratcher v-bind="config" />`
- **Svelte**: `<Scratcher {...config} />`

## Callbacks Option Details

Callbacks are functions executed at various points during scratching, configured as follows:

| Callback Name  | When Called and Arguments                              |
| -------------- | ------------------------------------------------------ |
| onScratchStart | On scratch start (point, snapshot)                     |
| onScratchMove  | During scratching (point, snapshot)                    |
| onScratchEnd   | When scratching ends (mouse/touch up) (snapshot)       |
| onReset        | When scratch state resets (snapshot)                   |
| onProgress     | When progress changes (snapshot)                       |
| onComplete     | On completion (completionThreshold reached) (snapshot) |

Callback Arguments:

- `point`: { x, y } (2D coordinates)
- `snapshot`: { scratchedCells, totalCells, progress } (current scratch state)

## Area

Scratcher.js can measure scratch progress in **specific areas** rather than the entire canvas. For more detailed usage, see the Examples pages below:

- [Custom Area (Rect)](/examples/custom-area-rect)
- [Custom Area (Image)](/examples/custom-area-image)

## Responsive sizing

By default the React, Vue, and Svelte wrappers render at a fixed `width × height`. Pass the `responsive` prop to make the wrapper shrink to fit narrower parent containers while preserving its aspect ratio:

```tsx
// React
<Scratcher {...config} responsive />
```

```vue
<!-- Vue -->
<Scratcher v-bind="config" responsive />
```

```svelte
<!-- Svelte -->
<Scratcher {...config} responsive />
```

When `responsive` is enabled, the wrapper renders with `width: ${width}px; max-width: 100%; min-width: 0; aspect-ratio: ${width} / ${height}`:

- Parent ≥ `width`: rendered at the exact `width × height` (same as the fixed-size default).
- Parent < `width`: shrinks proportionally to the parent's width.

Pointer coordinates are scaled internally by the core engine regardless of `responsive`, so scratches stay aligned with the cursor even when the canvas is CSS-scaled. This also applies to Vanilla JS users who size the bound `<canvas>` with CSS.

If you place custom overlays (e.g. area markers) inside a responsive wrapper, prefer percentage coordinates over pixels so they scale with the canvas.

### Vanilla JS

The core engine never touches the `<canvas>` element's CSS, so responsive sizing is entirely up to you. Style the canvas however you like — the engine scales pointer coordinates to the drawing buffer internally, so scratches stay aligned with the cursor:

```html
<canvas
  id="my-canvas"
  width="400"
  height="240"
  style="width: 100%; max-width: 400px; aspect-ratio: 400 / 240;"
></canvas>
```

```ts
import { Scratcher } from '@scratcher.js/core';

const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const scratcher = new Scratcher({
  width: 400, // drawing-buffer size (resolution)
  height: 240,
  brushSize: 30,
  cover: '#ccc',
});
scratcher.bindCanvas(canvas);
```

The HTML `width`/`height` attributes set the drawing buffer; the CSS controls the displayed size. They don't have to match.
