/**
 * A 2D coordinate point.
 */
export type Point = {
  x: number;
  y: number;
};

/**
 * Represents a brush stroke with a set of points and brush size.
 */
export type BrushStroke = {
  points: Point[];
  size: number;
};

/**
 * Basic options for initializing a scratch engine.
 */
export type ScratchEngineOptions = {
  width: number;
  height: number;
  coverage?: number;
};

/**
 * Represents the current state of the scratch area.
 */
export type ScratchSnapshot = {
  scratchedCells: number;
  totalCells: number;
  progress: number;
};

/**
 * Interface for a scratch state store/engine.
 */
export interface ScratchStore {
  /** Applies a brush stroke and returns the new snapshot. */
  applyStroke(stroke: BrushStroke): ScratchSnapshot;
  /** Resets the scratch state. */
  reset(): ScratchSnapshot;
  /** Returns the current snapshot. */
  snapshot(): ScratchSnapshot;
  /** Reveals all covered area. */
  revealAll(): ScratchSnapshot;
}

/**
 * Callback functions for scratcher events.
 */
export interface ScratchControllerCallbacks {
  /** Called when scratching starts. */
  onScratchStart?: (point: Point, snapshot: ScratchSnapshot) => void;
  /** Called when scratching moves. */
  onScratchMove?: (point: Point, snapshot: ScratchSnapshot) => void;
  /** Called when scratching ends. */
  onScratchEnd?: (snapshot: ScratchSnapshot) => void;
  /** Called when scratcher is reset. */
  onReset?: (snapshot: ScratchSnapshot) => void;
  /** Called on progress update. */
  onProgress?: (snapshot: ScratchSnapshot) => void;
  /** Called when scratching is complete. */
  onComplete?: (snapshot: ScratchSnapshot) => void;
}

/**
 * Configuration options for the Scratcher instance.
 */
export interface ScratcherConfig extends ScratchEngineOptions {
  /** Brush size in pixels. */
  brushSize: number;
  /** Progress threshold (0~1) to trigger completion. */
  completionThreshold?: number;
  /** Whether to reveal all on completion. */
  revealOnCompletion?: boolean;
  /** Event callbacks. */
  callbacks?: ScratchControllerCallbacks;
  /** Cover color or image. */
  cover?: string;
}

/**
 * Pointer event type for scratcher interaction.
 */
export interface ScratcherPointerEventType {
  clientX: number;
  clientY: number;
  pointerId: number;
}

/**
 * Rectangle type for canvas bounding box.
 */
export type ScratcherCanvasRectType = {
  left: number;
  top: number;
};

type ScratcherCanvasContextType = {
  beginPath: () => void;
  arc: (x: number, y: number, radius: number, startAngle: number, endAngle: number) => void;
  fill: () => void;
  clearRect?: (x: number, y: number, width: number, height: number) => void;
  fillRect?: (x: number, y: number, width: number, height: number) => void;
  fillStyle?: unknown;
  globalCompositeOperation?: string;
};

/**
 * Canvas-like interface for scratcher rendering.
 * (simillar HTMLCanvasElement)
 */
export type ScratcherCanvasType = {
  addEventListener: (type: string, listener: (e: unknown) => void) => void;
  removeEventListener: (type: string, listener: (e: unknown) => void) => void;
  getBoundingClientRect: () => ScratcherCanvasRectType;
  setPointerCapture?: (pointerId: number) => void;
  getContext?: (contextId: '2d') => ScratcherCanvasContextType | null;
};

/**
 * Optional overrides for canvas interaction and rendering behavior when a
 * scratcher is bound to a canvas-like target.
 */
export type ScratcherCanvasBindingOptions = {
  /** Converts pointer coordinates into local scratch-space coordinates. */
  mapPoint?: (e: ScratcherPointerEventType, canvas: ScratcherCanvasType) => Point;

  /** Draws one scratch stamp at the given point and brush size. */
  renderAtPoint?: (x: number, y: number, brushSize: number, canvas: ScratcherCanvasType) => void;

  /** Renders the initial cover layer over the scratchable area. */
  renderCover?: (
    canvas: ScratcherCanvasType,
    cover: string | undefined,
    width: number,
    height: number,
  ) => void;
};
