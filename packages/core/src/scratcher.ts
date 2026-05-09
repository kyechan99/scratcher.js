import { ScratchCanvasAdapter } from './canvas';
import { createScratchStore } from './state';
import {
  ScratcherCanvasType,
  Point,
  ScratchStore,
  ScratchControllerCallbacks,
  ScratcherConfig,
  ScratchSnapshot,
  Area,
} from './types';

type ScratchRuntimeEventMap = {
  scratchStart: { point: Point; snapshot: ScratchSnapshot };
  scratchMove: { point: Point; snapshot: ScratchSnapshot };
  scratchEnd: { snapshot: ScratchSnapshot };
  reset: { snapshot: ScratchSnapshot };
  progress: { snapshot: ScratchSnapshot };
  complete: { snapshot: ScratchSnapshot };
};

type ScratchRuntimeEventName = keyof ScratchRuntimeEventMap;

export const SCRATCH_POINTER = {
  IDLE: 'idle',
  DRAWING: 'drawing',
} as const;

export type ScratchPointerState = (typeof SCRATCH_POINTER)[keyof typeof SCRATCH_POINTER];

type ScratchPointSnapshotCallback = (point: Point, snapshot: ScratchSnapshot) => void;
type ScratchSnapshotCallback = (snapshot: ScratchSnapshot) => void;

export class Scratcher {
  readonly store: ScratchStore;
  private brushSize: number;
  private pointerState: ScratchPointerState;
  private completed: boolean;
  private currentSnapshot: ScratchSnapshot;
  private completionThreshold: number;
  private revealOnCompletion: boolean;
  private readonly listeners: {
    [K in ScratchRuntimeEventName]: Set<(payload: ScratchRuntimeEventMap[K]) => void>;
  };
  private callbackSubscriptions: Array<() => void>;
  private canvasAdapter: ScratchCanvasAdapter | null;
  private readonly cover: string | undefined;
  private readonly canvasWidth: number;
  private readonly canvasHeight: number;
  private readonly mapPoint?: (e: any, canvas: any) => any;
  private readonly renderAtPoint?: (x: number, y: number, brushSize: number, canvas: any) => void;
  private readonly renderCover?: (canvas: any, width: number, height: number, cover: any) => void;

  constructor(options: ScratcherConfig) {
    this.cover = options.cover;

    this.store = createScratchStore({
      width: options.width,
      height: options.height,
      cellSize: options.cellSize,
    });

    // Set area if provided
    if (options.area) {
      this.store.setArea(options.area);
    }

    this.brushSize = Math.max(1, options.brushSize);
    this.pointerState = SCRATCH_POINTER.IDLE;
    this.completed = false;
    this.currentSnapshot = this.store.snapshot();
    this.completionThreshold = Math.min(1, Math.max(0, options.completionThreshold ?? 0.5));
    this.revealOnCompletion = options.revealOnCompletion ?? false;
    this.mapPoint = options.mapPoint;
    this.renderAtPoint = options.renderAtPoint;
    this.renderCover = options.renderCover;
    this.listeners = {
      scratchStart: new Set(),
      scratchMove: new Set(),
      scratchEnd: new Set(),
      reset: new Set(),
      progress: new Set(),
      complete: new Set(),
    };
    this.callbackSubscriptions = [];
    this.canvasAdapter = null;
    this.canvasWidth = options.width;
    this.canvasHeight = options.height;

    this.setCallbacks({
      onScratchStart: options.onScratchStart,
      onScratchMove: options.onScratchMove,
      onScratchEnd: options.onScratchEnd,
      onReset: options.onReset,
      onProgress: options.onProgress,
      onComplete: options.onComplete,
    });
  }

  /**
   * Returns the current scratch snapshot state.
   */
  get snapshot(): ScratchSnapshot {
    return this.currentSnapshot;
  }

  /**
   * Returns whether the scratcher is currently drawing (scratching).
   */
  get isDrawing(): boolean {
    return this.pointerState === SCRATCH_POINTER.DRAWING;
  }

  /**
   * Returns whether the scratcher is completed.
   */
  get isCompleted(): boolean {
    return this.completed;
  }

  /**
   * Returns whether the cover should be fully revealed on completion.
   */
  get shouldRevealOnCompletion(): boolean {
    return this.revealOnCompletion;
  }

  /**
   * Returns the current brush size.
   */
  get currentBrushSize(): number {
    return this.brushSize;
  }

  /**
   * Starts the scratch operation.
   * @param point The starting coordinate
   * @returns The current snapshot
   */
  start(point: Point): ScratchSnapshot {
    this.pointerState = SCRATCH_POINTER.DRAWING;
    const snapshot = this.apply(point);
    this.emit('scratchStart', { point, snapshot });
    return snapshot;
  }

  /**
   * Handles movement during the scratch operation.
   * @param point The move coordinate
   * @returns The current snapshot
   */
  move(point: Point): ScratchSnapshot {
    if (!this.isDrawing) {
      return this.currentSnapshot;
    }

    const snapshot = this.apply(point);
    this.emit('scratchMove', { point, snapshot });
    return snapshot;
  }

  /**
   * Ends the scratch operation.
   * @returns The current snapshot
   */
  end(): ScratchSnapshot {
    if (!this.isDrawing) {
      return this.currentSnapshot;
    }

    this.pointerState = SCRATCH_POINTER.IDLE;
    this.emit('scratchEnd', { snapshot: this.currentSnapshot });
    return this.currentSnapshot;
  }

  /**
   * Resets the scratch state and redraws the cover.
   * @returns The reset snapshot
   */
  reset(): ScratchSnapshot {
    this.canvasAdapter?.resetCover();
    this.pointerState = SCRATCH_POINTER.IDLE;
    this.completed = false;
    this.currentSnapshot = this.store.reset();
    this.emit('reset', { snapshot: this.currentSnapshot });
    this.emit('progress', { snapshot: this.currentSnapshot });
    return this.currentSnapshot;
  }

  /**
   * Sets the brush size.
   * @param size The brush size (minimum 1)
   */
  setBrushSize(size: number): void {
    this.brushSize = Math.max(1, size);
  }

  /**
   * Sets an area for measuring progress.
   * @param area The area to measure, or undefined to disable area measurement
   * @returns The current snapshot with area information
   */
  setArea(area?: Area): ScratchSnapshot {
    this.currentSnapshot = this.store.setArea(area);
    this.emit('progress', { snapshot: this.currentSnapshot });
    return this.currentSnapshot;
  }

  /**
   * Sets the scratch event callbacks.
   * @param callbacks Callback object
   */
  setCallbacks(callbacks?: ScratchControllerCallbacks): void {
    this.clearCallbackSubscriptions();

    const nextCallbacks = callbacks ?? {};
    const { onScratchStart, onScratchMove, onScratchEnd, onReset, onProgress, onComplete } =
      nextCallbacks;

    this.bindPointSnapshotCallback('scratchStart', onScratchStart);
    this.bindPointSnapshotCallback('scratchMove', onScratchMove);
    this.bindSnapshotCallback('scratchEnd', onScratchEnd);
    this.bindSnapshotCallback('reset', onReset);
    this.bindSnapshotCallback('progress', onProgress);
    this.bindSnapshotCallback('complete', onComplete);
  }

  /**
   * Subscribes to scratch events.
   * @param eventName Event name
   * @param listener Event listener
   * @returns Unsubscribe function
   */
  on<EventName extends ScratchRuntimeEventName>(
    eventName: EventName,
    listener: (payload: ScratchRuntimeEventMap[EventName]) => void,
  ): () => void {
    const eventListeners = this.listeners[eventName] as Set<
      (payload: ScratchRuntimeEventMap[EventName]) => void
    >;

    eventListeners.add(listener);

    return () => {
      eventListeners.delete(listener);
    };
  }

  /**
   * Binds the scratcher to a canvas element.
   * @param canvas Canvas element
   * @returns Unbind function
   */
  bindCanvas(canvas: ScratcherCanvasType): () => void {
    this.unbindCanvas();
    const adapter = new ScratchCanvasAdapter({
      canvas,
      interaction: this,
      cover: this.cover,
      width: this.canvasWidth,
      height: this.canvasHeight,
      mapPoint: this.mapPoint,
      renderAtPoint: this.renderAtPoint,
      renderCover: this.renderCover,
    });
    adapter.bind();
    this.canvasAdapter = adapter;

    return () => {
      adapter.unbind();
      if (this.canvasAdapter === adapter) {
        this.canvasAdapter = null;
      }
    };
  }

  /**
   * Unbinds the canvas from the scratcher.
   */
  unbindCanvas(): void {
    this.canvasAdapter?.unbind();
    this.canvasAdapter = null;
  }

  private clearCallbackSubscriptions(): void {
    for (const unsubscribe of this.callbackSubscriptions) {
      unsubscribe();
    }
    this.callbackSubscriptions = [];
  }

  private addCallbackSubscription(unsubscribe: () => void): void {
    this.callbackSubscriptions.push(unsubscribe);
  }

  private registerCallback<CallbackFn extends (...args: never[]) => void>(
    callback: CallbackFn | undefined,
    subscribe: (nextCallback: CallbackFn) => () => void,
  ): void {
    if (!callback) {
      return;
    }

    this.addCallbackSubscription(subscribe(callback));
  }

  private bindPointSnapshotCallback(
    eventName: 'scratchStart' | 'scratchMove',
    callback: ScratchPointSnapshotCallback | undefined,
  ): void {
    this.registerCallback(callback, nextCallback =>
      this.on(eventName, ({ point, snapshot }) => {
        nextCallback(point, snapshot);
      }),
    );
  }

  private bindSnapshotCallback(
    eventName: 'scratchEnd' | 'reset' | 'progress' | 'complete',
    callback: ScratchSnapshotCallback | undefined,
  ): void {
    this.registerCallback(callback, nextCallback =>
      this.on(eventName, ({ snapshot }) => {
        nextCallback(snapshot);
      }),
    );
  }

  private apply(point: Point): ScratchSnapshot {
    const snapshot = this.store.applyStroke({
      size: this.brushSize,
      points: [point],
    });

    this.currentSnapshot = snapshot;
    this.emit('progress', { snapshot });

    // Use area progress if area is set, otherwise use overall progress
    const currentProgress = snapshot.area?.progress ?? snapshot.progress;

    if (!this.completed && currentProgress >= this.completionThreshold) {
      this.completed = true;
      if (this.revealOnCompletion) {
        this.currentSnapshot = this.store.revealAll();
      }
      this.emit('complete', { snapshot: this.currentSnapshot });
    }

    return this.currentSnapshot;
  }

  private emit<EventName extends ScratchRuntimeEventName>(
    eventName: EventName,
    payload: ScratchRuntimeEventMap[EventName],
  ): void {
    const eventListeners = this.listeners[eventName] as Set<
      (eventPayload: ScratchRuntimeEventMap[EventName]) => void
    >;

    for (const listener of eventListeners) {
      listener(payload);
    }
  }
}

type CreateBoundScratcherOptions = ScratcherConfig & {
  canvas: ScratcherCanvasType;
};

/**
 * @brief Create and bind a scratcher instance in one step.
 *
 * This helper is intended for consumers who want a simple setup without
 * manually calling bindCanvas after constructing Scratcher.
 *
 * @param options Configuration for Scratcher plus canvas binding inputs.
 * @param options.canvas Target canvas-like element used for pointer binding.
 * @param options.bindingOptions Optional adapter overrides for mapping and rendering.
 * @returns An object containing the created scratcher instance and its unbind function.
 *
 * @example
 * const { scratcher, unbind } = createScratcher({
 *   canvas,
 *   width: 320,
 *   height: 180,
 *   brushSize: 24,
 * });
 */
export function createScratcher(options: CreateBoundScratcherOptions): {
  scratcher: Scratcher;
  unbind: () => void;
} {
  const { canvas, ...scratcherConfig } = options;
  const scratcher = new Scratcher(scratcherConfig);
  const unbind = scratcher.bindCanvas(canvas);

  return {
    scratcher,
    unbind,
  };
}
