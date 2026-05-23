# Configuration

This guide covers the main configuration methods and options for Scratcher.js and its framework-specific packages. Almost the same options are used across all environments, with only the method of passing them varying by framework.

## Common Options (Core)

| Option Name         | Type         | Description                                                          | Default |
| ------------------- | ------------ | -------------------------------------------------------------------- | ------- |
| width \*            | number       | Canvas drawing-buffer width (px). Also the wrapper's max display width — see [Responsive sizing](#responsive-sizing). | -       |
| height \*           | number       | Canvas drawing-buffer height (px). Display height follows `width` via `aspect-ratio`.                                | -       |
| brushSize           | number       | Brush size for scratching (px)                                       | 30      |
| cellSize            | number       | Grid cell size (px) for progress tracking. Lower = finer resolution. | 16      |
| completionThreshold | number (0~1) | Percentage threshold for completion                                  | 0.7     |
| revealOnCompletion  | boolean      | Auto-reveal all on completion                                        | false   |
| cover               | string       | Cover color or image URL                                             | #ccc    |
| disabled            | boolean      | Whether scratching is disabled                                       | false   |
| callbacks           | function     | See more detail : [Callbacks](#callbacks-option-details)             | -       |

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

## Responsive sizing

The React, Vue, and Svelte wrappers render with `width: ${width}px; max-width: 100%; aspect-ratio: ${width} / ${height}`, so the Scratcher fits its parent container while preserving its aspect ratio.

- Parent ≥ `width`: rendered at the exact `width × height` (same as a fixed-size wrapper).
- Parent < `width`: shrinks proportionally to the parent's width.

Pointer coordinates are scaled internally by the core engine, so scratches stay aligned with the cursor even when the canvas is CSS-scaled — this also applies to Vanilla JS users who size the bound `<canvas>` with CSS.

To opt out and force the wrapper to its natural pixel size, override the wrapper's `max-width`:

```tsx
// React
<Scratcher {...config} style={{ maxWidth: 'none' }} />
```

```vue
<!-- Vue -->
<Scratcher v-bind="config" :style="{ maxWidth: 'none' }" />
```

If you place custom overlays (e.g. area markers) inside the wrapper, prefer percentage coordinates over pixels so they scale with the canvas.

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
