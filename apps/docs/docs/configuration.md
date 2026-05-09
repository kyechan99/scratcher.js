# Configuration

This guide covers the main configuration methods and options for Scratcher.js and its framework-specific packages. Almost the same options are used across all environments, with only the method of passing them varying by framework.

## Common Options (Core)

| Option Name         | Type         | Description                                | Default |
| ------------------- | ------------ | ------------------------------------------ | ------- |
| width \*            | number       | Canvas width (px)                          | -       |
| height \*           | number       | Canvas height (px)                         | -       |
| brushSize           | number       | Brush size for scratching (px)             | 30      |
| coverage            | number (0~1) | Initial cover ratio (0=none, 1=full cover) | 1       |
| completionThreshold | number (0~1) | Percentage threshold for completion        | 0.7     |
| revealOnCompletion  | boolean      | Auto-reveal all on completion              | false   |
| cover               | string       | Cover color or image URL                   | #ccc    |
| disabled            | boolean      | Whether scratching is disabled             | false   |
| callbacks           | object       | Callbacks (onProgress, onComplete, etc.)   | -       |

- [Area](#area): measure specific areas

### Config Example

```ts
const scratcherConfig = {
  width: 300,
  height: 150,
  brushSize: 30,
  coverage: 1, // 1=full cover, 0.5=half cover, etc.
  completionThreshold: 0.7, // Completion percentage (0~1)
  revealOnCompletion: true, // Auto-reveal all on completion
  cover: '#ccc', // Cover color or image URL
  disabled: false,
  callbacks: {
    onProgress: next => console.log(next.progress),
    onComplete: () => alert('Scratching complete!'),
  },
};
```

## Framework-Specific Usage

- **Vanilla JS**: `new Scratcher(config)`
- **React**: `<Scratcher {...config} />`
- **Vue**: `<Scratcher v-bind="config" />`
- **React Native**: `useNativeScratchController(config)`

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
