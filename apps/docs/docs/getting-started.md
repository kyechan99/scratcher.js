# Getting Started

## Installation

Scratcher.js uses a monorepo structure with separate core, react, vue, and svelte packages. You can install it using your preferred package manager like pnpm, npm, or yarn.

:::tabs
== Vanilla

```bash
npm i @scratcher.js/core
```

== React

```bash
npm i @scratcher.js/react
```

== Vue

```bash
npm i @scratcher.js/vue
```

== Svelte

```bash
npm i @scratcher.js/svelte
```

:::

## Quick Start

Below are basic usage examples for each environment. When using it in practice, you need to specify required options in the config object (canvas size, cover/background, etc.), and you can freely use additional options like callbacks.

For detailed explanations of config values, see [Configuration](/docs/configuration).

### Config Example and Key Options

```ts
const scratcherConfig = {
  width: 300, // Canvas width
  height: 150, // Canvas height
  brushSize: 30, // Brush size
  threshold: 0.7, // Scratch completion percentage (0~1)
  cover: '#ccc', // Cover color or image
  background: '/img/coupon.png', // Background image
  // Callback example
  onProgress: next => console.log('Progress:', next.progress),
  onComplete: () => alert('Scratching complete!'),
};
```

> width/height are required. cover/background support both color and image. Callbacks can be added as needed.

### Vanilla JS

```ts
import { Scratcher } from '@scratcher.js/core';
const scratcher = new Scratcher(scratcherConfig);
```

### React

```tsx
import { Scratcher } from '@scratcher.js/react';
<Scratcher {...scratcherConfig} />;
```

### Vue

```vue
<Scratcher v-bind="scratcherConfig" />
```

### Svelte

```svelte
<script>
  import { Scratcher } from '@scratcher.js/svelte';
</script>

<Scratcher {...scratcherConfig} />
```

## Integration Tips

- Config, callbacks, cover/background, and more work almost identically across all environments
- Easy to port by just adjusting framework-specific syntax
- For more examples and advanced usage, see the [Examples](/examples/custom-cover) documentation.
