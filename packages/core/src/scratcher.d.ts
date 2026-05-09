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
  scratchStart: {
    point: Point;
    snapshot: ScratchSnapshot;
  };
  scratchMove: {
    point: Point;
    snapshot: ScratchSnapshot;
  };
  scratchEnd: {
    snapshot: ScratchSnapshot;
  };
  reset: {
    snapshot: ScratchSnapshot;
  };
  progress: {
    snapshot: ScratchSnapshot;
  };
  complete: {
    snapshot: ScratchSnapshot;
  };
};
type ScratchRuntimeEventName = keyof ScratchRuntimeEventMap;
export declare const SCRATCH_POINTER: {
  readonly IDLE: 'idle';
  readonly DRAWING: 'drawing';
};
export type ScratchPointerState = (typeof SCRATCH_POINTER)[keyof typeof SCRATCH_POINTER];
export declare class Scratcher {
  readonly store: ScratchStore;
  private brushSize;
  private pointerState;
  private completed;
  private currentSnapshot;
  private completionThreshold;
  private revealOnCompletion;
  private readonly listeners;
  private callbackSubscriptions;
  private canvasAdapter;
  private readonly cover;
  private readonly canvasWidth;
  private readonly canvasHeight;
  private readonly mapPoint?;
  private readonly renderAtPoint?;
  private readonly renderCover?;
  constructor(options: ScratcherConfig);
  /**
   * Returns the current scratch snapshot state.
   */
  get snapshot(): ScratchSnapshot;
  /**
   * Returns whether the scratcher is currently drawing (scratching).
   */
  get isDrawing(): boolean;
  /**
   * Returns whether the scratcher is completed.
   */
  get isCompleted(): boolean;
  /**
   * Returns whether the cover should be fully revealed on completion.
   */
  get shouldRevealOnCompletion(): boolean;
  /**
   * Returns the current brush size.
   */
  get currentBrushSize(): number;
  /**
   * Starts the scratch operation.
   * @param point The starting coordinate
   * @returns The current snapshot
   */
  start(point: Point): ScratchSnapshot;
  /**
   * Handles movement during the scratch operation.
   * @param point The move coordinate
   * @returns The current snapshot
   */
  move(point: Point): ScratchSnapshot;
  /**
   * Ends the scratch operation.
   * @returns The current snapshot
   */
  end(): ScratchSnapshot;
  /**
   * Resets the scratch state and redraws the cover.
   * @returns The reset snapshot
   */
  reset(): ScratchSnapshot;
  /**
   * Sets the brush size.
   * @param size The brush size (minimum 1)
   */
  setBrushSize(size: number): void;
  /**
   * Sets an area for measuring progress.
   * @param area The area to measure, or undefined to disable area measurement
   * @returns The current snapshot with area information
   */
  setArea(area?: Area): ScratchSnapshot;
  /**
   * Sets the scratch event callbacks.
   * @param callbacks Callback object
   */
  setCallbacks(callbacks?: ScratchControllerCallbacks): void;
  /**
   * Subscribes to scratch events.
   * @param eventName Event name
   * @param listener Event listener
   * @returns Unsubscribe function
   */
  on<EventName extends ScratchRuntimeEventName>(
    eventName: EventName,
    listener: (payload: ScratchRuntimeEventMap[EventName]) => void,
  ): () => void;
  /**
   * Binds the scratcher to a canvas element.
   * @param canvas Canvas element
   * @returns Unbind function
   */
  bindCanvas(canvas: ScratcherCanvasType): () => void;
  /**
   * Unbinds the canvas from the scratcher.
   */
  unbindCanvas(): void;
  private clearCallbackSubscriptions;
  private addCallbackSubscription;
  private registerCallback;
  private bindPointSnapshotCallback;
  private bindSnapshotCallback;
  private apply;
  private emit;
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
export declare function createScratcher(options: CreateBoundScratcherOptions): {
  scratcher: Scratcher;
  unbind: () => void;
};
export {};
//# sourceMappingURL=scratcher.d.ts.map
