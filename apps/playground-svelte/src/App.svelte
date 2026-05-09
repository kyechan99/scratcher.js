<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Scratcher } from '@scratcher.js/svelte';
  import type {
    Area,
    ImageArea,
    RectArea,
    ScratchControllerCallbacks,
    ScratchSnapshot,
    Scratcher as CoreScratcher,
    ScratcherCanvasType,
    ScratcherConfig,
  } from '@scratcher.js/core';

  const FRAME_WIDTH = 400;
  const FRAME_HEIGHT = 280;
  const MIN_RECT = 50;

  type AreaMode = 'rect' | 'image';
  type LoadedImage = { src: string; imageData: ImageData };

  let brushSize = $state(30);
  let cellSize = $state(10);
  let cover = $state('#b9c2ce');
  let threshold = $state(0.5);
  let revealOnCompletion = $state(false);
  let useGradientCover = $state(false);

  let areaEnabled = $state(false);
  let areaMode = $state<AreaMode>('rect');
  let areaRect = $state<RectArea>({ x: 60, y: 40, width: 240, height: 160 });
  let areaImage = $state<LoadedImage | null>(null);
  let areaImageX = $state(30);
  let areaImageY = $state(30);
  let areaImageScale = $state(1);
  let alphaThreshold = $state(128);
  let imageStatus = $state('(empty)');

  let progress = $state(0);
  let completed = $state(false);
  let scratcher: CoreScratcher | null = null;
  let lastImageSrc: string | null = null;

  const imageScaleMax = $derived(
    !areaImage
      ? 4
      : Math.max(
          0.1,
          Math.min(
            4,
            Math.min(
              FRAME_WIDTH / areaImage.imageData.width,
              FRAME_HEIGHT / areaImage.imageData.height,
            ) * 2,
          ),
        ),
  );

  const imageXMax = $derived(
    !areaImage
      ? FRAME_WIDTH
      : Math.max(0, FRAME_WIDTH - areaImage.imageData.width * areaImageScale),
  );

  const imageYMax = $derived(
    !areaImage
      ? FRAME_HEIGHT
      : Math.max(0, FRAME_HEIGHT - areaImage.imageData.height * areaImageScale),
  );

  const area = $derived<Area | undefined>(
    !areaEnabled
      ? undefined
      : areaMode === 'image' && areaImage
        ? ({
            imageData: areaImage.imageData,
            x: areaImageX,
            y: areaImageY,
            scale: areaImageScale,
            alphaThreshold,
          } satisfies ImageArea)
        : areaMode === 'rect'
          ? areaRect
          : undefined,
  );

  const callbacks: ScratchControllerCallbacks = {
    onProgress: (snap: ScratchSnapshot) => {
      progress = snap.area?.progress ?? snap.progress;
    },
    onComplete: () => {
      completed = true;
    },
  };

  const renderCover = $derived<ScratcherConfig['renderCover']>(
    useGradientCover
      ? (canvas: ScratcherCanvasType, width: number, height: number) => {
          const ctx = canvas.getContext?.('2d');
          if (!ctx) return;
          const grad = (ctx as CanvasRenderingContext2D).createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, '#7700ff');
          grad.addColorStop(1, '#bf4587');
          ctx.fillStyle = grad;
          ctx.fillRect?.(0, 0, width, height);
        }
      : undefined,
  );

  // Force remount of the binding when "captured-at-mount" props change
  // (renderCover/renderAtPoint/mapPoint) — only relevant for testing.
  const mountKey = $derived(`cover:${useGradientCover ? 'gradient' : 'solid'}`);

  function handleReady(next: CoreScratcher) {
    scratcher = next;
    progress = 0;
    completed = false;
  }

  function reset() {
    if (!scratcher) return;
    scratcher.reset();
    progress = 0;
    completed = false;
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  async function onImageChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      if (lastImageSrc) URL.revokeObjectURL(lastImageSrc);
      lastImageSrc = null;
      areaImage = null;
      imageStatus = '(empty)';
      return;
    }

    try {
      const loaded = await loadImageData(file);
      if (lastImageSrc) URL.revokeObjectURL(lastImageSrc);
      lastImageSrc = loaded.src;
      areaImage = loaded;
      areaImageX = 30;
      areaImageY = 30;
      areaImageScale = 1;
      areaMode = 'image';
      areaEnabled = true;
      imageStatus = `${file.name} (${loaded.imageData.width}×${loaded.imageData.height})`;
    } catch (e) {
      console.error(e);
      imageStatus = 'Failed to load image.';
    }
  }

  async function loadImageData(file: File): Promise<LoadedImage> {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D canvas context');
    ctx.drawImage(img, 0, 0);

    return { src: objectUrl, imageData: ctx.getImageData(0, 0, canvas.width, canvas.height) };
  }

  // Re-clamp transforms when scale change shrinks the allowed range.
  $effect(() => {
    void imageXMax;
    if (areaImageX > imageXMax) areaImageX = imageXMax;
  });
  $effect(() => {
    void imageYMax;
    if (areaImageY > imageYMax) areaImageY = imageYMax;
  });

  onDestroy(() => {
    if (lastImageSrc) URL.revokeObjectURL(lastImageSrc);
  });
</script>

<div class="layout">
  <header>
    <h1>scratcher.js · Svelte playground</h1>
    <p>
      Smoke test for <code>@scratcher.js/svelte</code>. Live updates: brush, callbacks, area
      (rect/image), custom render.
    </p>
  </header>

  <main class="grid">
    <section class="preview">
      <div class="frame" style:width="{FRAME_WIDTH}px" style:height="{FRAME_HEIGHT}px">
        {#key mountKey}
          <Scratcher
            width={FRAME_WIDTH}
            height={FRAME_HEIGHT}
            {cellSize}
            {brushSize}
            {cover}
            {area}
            completionThreshold={threshold}
            {revealOnCompletion}
            {renderCover}
            canvasClass="scratch-canvas"
            onScratcherReady={handleReady}
            {...callbacks}
          >
            <div class="reward">You found it!</div>
          </Scratcher>
        {/key}

        {#if areaEnabled && areaMode === 'rect'}
          <div
            class="area-overlay"
            style:left="{areaRect.x}px"
            style:top="{areaRect.y}px"
            style:width="{areaRect.width}px"
            style:height="{areaRect.height}px"
          ></div>
        {/if}

        {#if areaEnabled && areaMode === 'image' && areaImage}
          <img
            class="area-image-overlay"
            src={areaImage.src}
            alt="Area mask preview"
            style:left="{areaImageX}px"
            style:top="{areaImageY}px"
            style:width="{areaImage.imageData.width * areaImageScale}px"
            style:height="{areaImage.imageData.height * areaImageScale}px"
          />
        {/if}
      </div>
      <button type="button" class="btn" onclick={reset}>Reset</button>
    </section>

    <aside class="config">
      <label class="field">
        <div class="field-head"><span>Brush size</span><strong>{brushSize}</strong></div>
        <input type="range" min="4" max="80" bind:value={brushSize} />
      </label>
      <label class="field">
        <div class="field-head"><span>Cell size</span><strong>{cellSize}px</strong></div>
        <input type="range" min="2" max="24" bind:value={cellSize} />
      </label>
      <label class="field">
        <div class="field-head"><span>Cover color</span><strong>{cover}</strong></div>
        <input type="color" bind:value={cover} disabled={useGradientCover} />
      </label>
      <label class="field">
        <div class="field-head">
          <span>Completion threshold</span><strong>{threshold.toFixed(2)}</strong>
        </div>
        <input type="range" min="0" max="1" step="0.01" bind:value={threshold} />
      </label>

      <label class="toggle-row">
        <span>Reveal on completion</span>
        <input type="checkbox" bind:checked={revealOnCompletion} />
      </label>
      <label class="toggle-row">
        <span>Use gradient renderCover</span>
        <input type="checkbox" bind:checked={useGradientCover} />
      </label>

      <hr />

      <label class="toggle-row">
        <span>Enable area mask</span>
        <input type="checkbox" bind:checked={areaEnabled} />
      </label>

      {#if areaEnabled}
        <div class="mode-switcher">
          <button
            type="button"
            class="mode-button"
            class:active={areaMode === 'rect'}
            onclick={() => (areaMode = 'rect')}
          >
            Rectangle
          </button>
          <button
            type="button"
            class="mode-button"
            class:active={areaMode === 'image'}
            onclick={() => (areaMode = 'image')}
          >
            Image mask
          </button>
        </div>

        {#if areaMode === 'rect'}
          <label class="field">
            <div class="field-head"><span>Area X</span><strong>{areaRect.x}</strong></div>
            <input
              type="range"
              min="0"
              max={Math.max(0, FRAME_WIDTH - MIN_RECT)}
              bind:value={areaRect.x}
            />
          </label>
          <label class="field">
            <div class="field-head"><span>Area Y</span><strong>{areaRect.y}</strong></div>
            <input
              type="range"
              min="0"
              max={Math.max(0, FRAME_HEIGHT - MIN_RECT)}
              bind:value={areaRect.y}
            />
          </label>
          <label class="field">
            <div class="field-head"><span>Area width</span><strong>{areaRect.width}</strong></div>
            <input type="range" min={MIN_RECT} max={FRAME_WIDTH} bind:value={areaRect.width} />
          </label>
          <label class="field">
            <div class="field-head"><span>Area height</span><strong>{areaRect.height}</strong></div>
            <input type="range" min={MIN_RECT} max={FRAME_HEIGHT} bind:value={areaRect.height} />
          </label>
        {/if}

        {#if areaMode === 'image'}
          <label class="field">
            <div class="field-head"><span>Alpha image</span><strong>{imageStatus}</strong></div>
            <input type="file" accept="image/*" onchange={onImageChange} />
          </label>
          <label class="field">
            <div class="field-head">
              <span>Alpha threshold</span><strong>{alphaThreshold}</strong>
            </div>
            <input type="range" min="0" max="255" bind:value={alphaThreshold} />
          </label>

          {#if areaImage}
            <label class="field">
              <div class="field-head"><span>Image X</span><strong>{areaImageX}</strong></div>
              <input
                type="range"
                min="0"
                max={imageXMax}
                value={areaImageX}
                oninput={e => (areaImageX = clamp(Number(e.currentTarget.value), 0, imageXMax))}
              />
            </label>
            <label class="field">
              <div class="field-head"><span>Image Y</span><strong>{areaImageY}</strong></div>
              <input
                type="range"
                min="0"
                max={imageYMax}
                value={areaImageY}
                oninput={e => (areaImageY = clamp(Number(e.currentTarget.value), 0, imageYMax))}
              />
            </label>
            <label class="field">
              <div class="field-head">
                <span>Image scale</span><strong>{areaImageScale.toFixed(2)}x</strong>
              </div>
              <input
                type="range"
                min="0.1"
                max={imageScaleMax}
                step="0.01"
                value={areaImageScale}
                oninput={e =>
                  (areaImageScale = clamp(Number(e.currentTarget.value), 0.1, imageScaleMax))}
              />
            </label>
          {/if}
        {/if}
      {/if}

      <hr />

      <div class="progress-box">
        <div class="progress-head">
          <span>{areaEnabled ? 'Area progress' : 'Progress'}</span>
          <strong>{(progress * 100).toFixed(1)}%</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill" class:area={areaEnabled} style:width="{progress * 100}%"></div>
        </div>
      </div>
      <p class="completion" class:visible={completed}>Completed 🎉</p>
    </aside>
  </main>
</div>
