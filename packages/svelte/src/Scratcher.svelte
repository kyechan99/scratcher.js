<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import {
    Scratcher as CoreScratcher,
    type Area,
    type Point,
    type ScratchSnapshot,
    type ScratcherConfig,
  } from '@scratcher.js/core';

  type Props = {
    width: number;
    height: number;
    cellSize?: number;
    brushSize: number;
    completionThreshold?: number;
    revealOnCompletion?: boolean;
    cover?: string;
    area?: Area;
    onScratchStart?: (point: Point, snapshot: ScratchSnapshot) => void;
    onScratchMove?: (point: Point, snapshot: ScratchSnapshot) => void;
    onScratchEnd?: (snapshot: ScratchSnapshot) => void;
    onReset?: (snapshot: ScratchSnapshot) => void;
    onProgress?: (snapshot: ScratchSnapshot) => void;
    onComplete?: (snapshot: ScratchSnapshot) => void;
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
    cover,
    area,
    onScratchStart,
    onScratchMove,
    onScratchEnd,
    onReset,
    onProgress,
    onComplete,
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
  let isCoverReady = $state(false);

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
      onScratchStart: untrack(() => onScratchStart),
      onScratchMove: untrack(() => onScratchMove),
      onScratchEnd: untrack(() => onScratchEnd),
      onReset: untrack(() => onReset),
      onProgress: untrack(() => onProgress),
      onComplete: untrack(() => onComplete),
      mapPoint: untrack(() => mapPoint),
      renderAtPoint: untrack(() => renderAtPoint),
      renderCover: untrack(() => renderCover),
    });
    scratcher = next;
    untrack(() => onScratcherReady)?.(next);

    // Subscribe before bind so the synchronous coverReady emit (default cover
    // render is sync) is observed and the reward layer never flashes through
    // an empty canvas on first paint.
    isCoverReady = next.isCoverReady;
    const offCoverReady = next.on('coverReady', () => {
      isCoverReady = true;
    });
    const cleanup = next.bindCanvas(canvas);

    return () => {
      offCoverReady();
      cleanup();
      next.unbindCanvas();
      if (scratcher === next) {
        scratcher = null;
      }
      isCoverReady = false;
    };
  });

  // Live updates without recreating the instance — mirrors the Vue binding.
  $effect(() => {
    scratcher?.setBrushSize(brushSize);
  });

  $effect(() => {
    scratcher?.setCallbacks({
      onScratchStart,
      onScratchMove,
      onScratchEnd,
      onReset,
      onProgress,
      onComplete,
    });
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
    <div
      class={rewardClass}
      style:position="absolute"
      style:inset="0"
      style:visibility={isCoverReady ? 'visible' : 'hidden'}
      aria-hidden={!isCoverReady}
    >
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
