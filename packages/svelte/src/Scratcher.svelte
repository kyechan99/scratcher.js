<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import {
    Scratcher as CoreScratcher,
    type Area,
    type ScratchControllerCallbacks,
    type ScratcherConfig,
  } from '@scratcher.js/core';

  type Props = {
    width: number;
    height: number;
    cellSize?: number;
    brushSize: number;
    completionThreshold?: number;
    revealOnCompletion?: boolean;
    callbacks?: ScratchControllerCallbacks;
    cover?: string;
    area?: Area;
    mapPoint?: ScratcherConfig['mapPoint'];
    renderAtPoint?: ScratcherConfig['renderAtPoint'];
    renderCover?: ScratcherConfig['renderCover'];
    class?: string;
    canvasClass?: string;
    rewardClass?: string;
    onScratcherReady?: (scratcher: CoreScratcher) => void;
    children?: Snippet;
  };

  let {
    width,
    height,
    cellSize,
    brushSize,
    completionThreshold,
    revealOnCompletion,
    callbacks,
    cover,
    area,
    mapPoint,
    renderAtPoint,
    renderCover,
    class: className,
    canvasClass,
    rewardClass,
    onScratcherReady,
    children,
  }: Props = $props();

  let canvas = $state<HTMLCanvasElement | null>(null);
  let scratcher: CoreScratcher | null = null;

  // Recreate the core scratcher when structural props change.
  // Other props (brushSize/callbacks/area/render fns) are read via untrack
  // so they don't trigger recreation; live updates are handled below.
  $effect(() => {
    void [width, height, cellSize, cover, completionThreshold, revealOnCompletion, canvas];

    if (!canvas) return;

    const next = new CoreScratcher({
      width,
      height,
      cellSize,
      brushSize: untrack(() => brushSize),
      cover,
      area: untrack(() => area),
      completionThreshold,
      revealOnCompletion,
      mapPoint: untrack(() => mapPoint),
      renderAtPoint: untrack(() => renderAtPoint),
      renderCover: untrack(() => renderCover),
    });
    scratcher = next;
    next.setCallbacks(untrack(() => callbacks));
    untrack(() => onScratcherReady)?.(next);
    const cleanup = next.bindCanvas(canvas);

    return () => {
      cleanup();
      next.unbindCanvas();
      if (scratcher === next) {
        scratcher = null;
      }
    };
  });

  // Live updates without recreating the instance — mirrors the Vue binding.
  $effect(() => {
    scratcher?.setBrushSize(brushSize);
  });

  $effect(() => {
    scratcher?.setCallbacks(callbacks);
  });

  $effect(() => {
    scratcher?.setArea(area);
  });
</script>

<div
  class={className}
  style:position="relative"
  style:width="{width}px"
  style:height="{height}px"
  style:overflow="hidden"
  style:touch-action="none"
>
  {#if children}
    <div class={rewardClass} style:position="absolute" style:inset="0">
      {@render children()}
    </div>
  {/if}
  <canvas
    bind:this={canvas}
    {width}
    {height}
    class={canvasClass}
    style:position="absolute"
    style:inset="0"
    style:width="100%"
    style:height="100%"
  ></canvas>
</div>
