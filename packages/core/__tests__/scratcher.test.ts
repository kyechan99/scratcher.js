import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Scratcher, createScratcher } from '../src/scratcher';
import { Point, ScratcherConfig } from '../src/types';
import { ScratchCanvasAdapter } from '../src/canvas';

function createBasicConfig(): ScratcherConfig {
  return {
    width: 100,
    height: 100,
    brushSize: 10,
    cellSize: 1,
    completionThreshold: 0.5,
    revealOnCompletion: false,
  };
}

describe('Scratcher Logic', () => {
  let scratcher: Scratcher;

  beforeEach(() => {
    scratcher = new Scratcher(createBasicConfig());
  });

  it('should initialize with correct defaults', () => {
    expect(scratcher.isCompleted).toBe(false);
    expect(scratcher.isDrawing).toBe(false);
    expect(scratcher.currentBrushSize).toBe(10);
    expect(scratcher.shouldRevealOnCompletion).toBe(false);
  });

  it('should start, move, and end scratching', () => {
    const startPoint: Point = { x: 10, y: 10 };
    scratcher.start(startPoint);
    expect(scratcher.isDrawing).toBe(true);
    scratcher.move({ x: 20, y: 20 });
    expect(scratcher.isDrawing).toBe(true);
    scratcher.end();
    expect(scratcher.isDrawing).toBe(false);
  });

  it('should reset correctly', () => {
    scratcher.start({ x: 10, y: 10 });
    scratcher.end();
    scratcher.reset();
    expect(scratcher.isDrawing).toBe(false);
    expect(scratcher.isCompleted).toBe(false);
  });

  it('should set brush size', () => {
    scratcher.setBrushSize(20);
    expect(scratcher.currentBrushSize).toBe(20);
    scratcher.setBrushSize(0);
    expect(scratcher.currentBrushSize).toBe(1);
  });

  it('should call event callbacks on user input', () => {
    const events: string[] = [];
    const points: Point[] = [];
    const config: ScratcherConfig = {
      ...createBasicConfig(),
      onScratchStart: point => {
        events.push('start');
        points.push(point);
      },
      onScratchMove: point => {
        events.push('move');
        points.push(point);
      },
      onScratchEnd: () => events.push('end'),
      onReset: () => events.push('reset'),
      onProgress: () => events.push('progress'),
      onComplete: () => events.push('complete'),
    };
    const s = new Scratcher(config);
    s.start({ x: 1, y: 2 });
    s.move({ x: 3, y: 4 });
    s.end();
    s.reset();
    expect(events).toContain('start');
    expect(events).toContain('move');
    expect(events).toContain('end');
    expect(events).toContain('reset');
    expect(events).toContain('progress');
    expect(points).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  it('should expose isCoverReady and emit coverReady once the cover paints', () => {
    const s = new Scratcher(createBasicConfig());
    expect(s.isCoverReady).toBe(false);

    const events: boolean[] = [];
    s.on('coverReady', () => events.push(s.isCoverReady));

    const canvas = createMockCanvas();
    s.bindCanvas(canvas);

    expect(s.isCoverReady).toBe(true);
    expect(events).toEqual([true]);

    s.unbindCanvas();
    expect(s.isCoverReady).toBe(false);
  });

  it('should defer coverReady until async renderCover resolves', async () => {
    let resolveRender: (() => void) | null = null;
    const s = new Scratcher({
      ...createBasicConfig(),
      renderCover: () =>
        new Promise<void>(resolve => {
          resolveRender = resolve;
        }),
    });
    const onCoverReady = vi.fn();
    s.on('coverReady', onCoverReady);

    s.bindCanvas(createMockCanvas());
    expect(s.isCoverReady).toBe(false);
    expect(onCoverReady).not.toHaveBeenCalled();

    resolveRender!();
    await Promise.resolve();

    expect(s.isCoverReady).toBe(true);
    expect(onCoverReady).toHaveBeenCalledTimes(1);
  });

  it('should support .on() event subscription', () => {
    const called: { [k: string]: boolean } = {};
    scratcher.on('scratchStart', () => {
      called.start = true;
    });
    scratcher.on('scratchMove', () => {
      called.move = true;
    });
    scratcher.on('scratchEnd', () => {
      called.end = true;
    });
    scratcher.start({ x: 5, y: 5 });
    scratcher.move({ x: 6, y: 6 });
    scratcher.end();
    expect(called.start).toBe(true);
    expect(called.move).toBe(true);
    expect(called.end).toBe(true);
  });
});

describe('createScratcher', () => {
  it('Should Scratcher be used more easily by createScratcher', () => {
    const canvas = createMockCanvas();
    const { scratcher, unbind } = createScratcher({
      canvas,
      width: 100,
      height: 100,
      brushSize: 10,
      cellSize: 1,
    });
    // Should be instance of Scratcher
    expect(scratcher).toBeInstanceOf(Scratcher);
    // Should have canvas bound (simulate pointer event)
    scratcher.start({ x: 10, y: 10 });
    expect(scratcher.isDrawing).toBe(true);
    // Unbind should detach canvas
    unbind();
    // After unbind, canvasAdapter should be null
    expect(scratcher['canvasAdapter']).toBeNull();
  });
});

describe('Scratcher User Input Simulation', () => {
  it('should render cover if cover is provided', () => {
    const renderCover = vi.fn();
    const canvas = createMockCanvas();
    const scratcher = new Scratcher({ width: 100, height: 100, brushSize: 10, cellSize: 1 });
    new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
      renderCover,
      cover: 'red',
    }).bind();
    expect(renderCover).toHaveBeenCalledWith(canvas, 100, 100, 'red');
  });

  it('should clear cover when revealOnCompletion is true and completed', () => {
    const clearRect = vi.fn();
    const ctx = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      clearRect,
      fillRect: vi.fn(),
      globalCompositeOperation: '',
    };
    const canvas = createMockCanvas();
    canvas.getContext = () => ctx;
    const scratcher = new Scratcher({
      width: 100,
      height: 100,
      brushSize: 10,
      cellSize: 1,
      revealOnCompletion: true,
      completionThreshold: 0,
    });
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
    });
    adapter.bind();
    canvas.__listeners['pointerdown'][0]({ clientX: 1, clientY: 1, pointerId: 1 });
    expect(clearRect).toHaveBeenCalled();
  });

  it('should call unbind and remove listeners', () => {
    const canvas = createMockCanvas();
    const scratcher = new Scratcher({ width: 100, height: 100, brushSize: 10, cellSize: 1 });
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
    });
    adapter.bind();
    expect(Object.keys(canvas.__listeners).length).toBeGreaterThan(0);
    adapter.unbind();
    // Check that all listener arrays are empty after unbind
    Object.values(canvas.__listeners).forEach(arr => expect(arr.length).toBe(0));
  });

  it('should call resetCover', () => {
    const renderCover = vi.fn();
    const canvas = createMockCanvas();
    const scratcher = new Scratcher({ width: 100, height: 100, brushSize: 10, cellSize: 1 });
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
      renderCover,
    });
    adapter.resetCover();
    expect(renderCover).toHaveBeenCalled();
  });

  it('should fire onCoverReady synchronously for sync renderCover', () => {
    const onCoverReady = vi.fn();
    const canvas = createMockCanvas();
    const scratcher = new Scratcher({ width: 100, height: 100, brushSize: 10, cellSize: 1 });
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
      onCoverReady,
    });
    adapter.bind();
    expect(onCoverReady).toHaveBeenCalledTimes(1);
  });

  it('should fire onCoverReady only after async renderCover resolves', async () => {
    const onCoverReady = vi.fn();
    let resolveRender: (() => void) | null = null;
    const renderCover = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRender = resolve;
        }),
    );
    const canvas = createMockCanvas();
    const scratcher = new Scratcher({ width: 100, height: 100, brushSize: 10, cellSize: 1 });
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
      renderCover,
      onCoverReady,
    });
    adapter.bind();
    expect(onCoverReady).not.toHaveBeenCalled();
    resolveRender!();
    await Promise.resolve();
    expect(onCoverReady).toHaveBeenCalledTimes(1);
  });

  it('should suppress onCoverReady when unbound before async render resolves', async () => {
    const onCoverReady = vi.fn();
    let resolveRender: (() => void) | null = null;
    const renderCover = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolveRender = resolve;
        }),
    );
    const canvas = createMockCanvas();
    const scratcher = new Scratcher({ width: 100, height: 100, brushSize: 10, cellSize: 1 });
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
      renderCover,
      onCoverReady,
    });
    adapter.bind();
    adapter.unbind();
    resolveRender!();
    await Promise.resolve();
    expect(onCoverReady).not.toHaveBeenCalled();
  });

  it('should handle pointerleave and pointercancel', () => {
    const canvas = createMockCanvas();
    const scratcher = new Scratcher({ width: 100, height: 100, brushSize: 10, cellSize: 1 });
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
    });
    adapter.bind();
    scratcher.start({ x: 1, y: 1 });
    expect(scratcher.isDrawing).toBe(true);
    canvas.__listeners['pointerleave'][0]({});
    expect(scratcher.isDrawing).toBe(false);
    scratcher.start({ x: 2, y: 2 });
    canvas.__listeners['pointercancel'][0]({});
    expect(scratcher.isDrawing).toBe(false);
  });

  it('should update scratcher and call render on pointer events', () => {
    const canvas = createMockCanvas();
    const renderAtPoint = vi.fn();
    const renderCover = vi.fn();
    const scratcher = new Scratcher({
      width: 100,
      height: 100,
      brushSize: 10,
      cellSize: 1,
    });
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: scratcher,
      width: 100,
      height: 100,
      renderAtPoint,
      renderCover,
    });
    adapter.bind();

    // Simulate pointerdown
    const pointerDownEvent = { clientX: 10, clientY: 20, pointerId: 1 };
    canvas.__listeners['pointerdown'][0](pointerDownEvent);
    expect(renderAtPoint).toHaveBeenCalledWith(10, 20, 10, canvas);
    expect(scratcher.isDrawing).toBe(true);

    // Simulate pointermove
    const pointerMoveEvent = { clientX: 15, clientY: 25, pointerId: 1 };
    canvas.__listeners['pointermove'][0](pointerMoveEvent);
    expect(renderAtPoint).toHaveBeenCalledWith(15, 25, 10, canvas);

    // Simulate pointerup
    canvas.__listeners['pointerup'][0]({});
    expect(scratcher.isDrawing).toBe(false);
  });
});

function createMockCanvas() {
  const listeners: Record<string, ((e: any) => void)[]> = {};
  return {
    addEventListener: (type: string, listener: (e: any) => void) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(listener);
    },
    removeEventListener: (type: string, listener: (e: any) => void) => {
      listeners[type] = (listeners[type] || []).filter(l => l !== listener);
    },
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
    getContext: () => ({
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      globalCompositeOperation: '',
    }),
    setPointerCapture: vi.fn(),
    __listeners: listeners,
  };
}
