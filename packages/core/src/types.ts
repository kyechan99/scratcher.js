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
  /**
   * Grid cell size (px) used for progress tracking. Lower values give finer
   * progress resolution and smoother completion detection at the cost of more
   * cells to track. Has no visual effect on the cover layer.
   *
   * @default 16
   */
  cellSize?: number;
};

/**
 * Represents a rectangular area defined by coordinates and dimensions.
 */
export type RectArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Represents an image-based area using alpha channel as mask.
 */
export type ImageArea = {
  imageData: ImageData;
  x?: number;
  y?: number;
  scale?: number;
  alphaThreshold?: number; // 0-255, default 128
};

/**
 * Area type that can be either rectangular or image-based.
 */
export type Area = RectArea | ImageArea;

/**
 * Represents area-specific scratch progress.
 */
export type AreaSnapshot = {
  scratchedCells: number;
  totalCells: number;
  progress: number;
};

/**
 * Represents the current state of the scratch area.
 */
export type ScratchSnapshot = {
  scratchedCells: number;
  totalCells: number;
  progress: number;
  area?: AreaSnapshot;
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
  /** Sets an area for measuring progress. */
  setArea(area?: Area): ScratchSnapshot;
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
  /**
   * Called once the cover layer has finished painting on the canvas.
   *
   * Wrappers use this signal to delay revealing the reward layer so it never
   * flashes before the cover is on screen — applicable to both synchronous
   * (e.g. `fillRect`) and asynchronous (e.g. image loading) cover renders.
   */
  onCoverReady?: (snapshot: ScratchSnapshot) => void;
}

/**
 * Configuration options for the Scratcher instance.
 *
 * Lifecycle callbacks (`onScratchStart`, `onProgress`, `onComplete`, …) are
 * inherited from {@link ScratchControllerCallbacks} and accepted directly at
 * the top level — no nested `callbacks` object required.
 */
export interface ScratcherConfig extends ScratchEngineOptions, ScratchControllerCallbacks {
  /** Brush size in pixels. */
  brushSize: number;
  /** Progress threshold (0~1) to trigger completion. */
  completionThreshold?: number;
  /** Whether to reveal all on completion. */
  revealOnCompletion?: boolean;
  /** Cover color or image. */
  cover?: string;
  /** Area for measuring progress. */
  area?: Area;
  /** Custom pointer mapping function. */
  mapPoint?: (e: ScratcherPointerEventType, canvas: ScratcherCanvasType) => Point;
  /** Custom render at point function. */
  renderAtPoint?: (x: number, y: number, brushSize: number, canvas: ScratcherCanvasType) => void;
  /**
   * Custom render cover function.
   *
   * May return a `Promise` that resolves once the cover has finished drawing
   * (e.g. after an image has loaded). The cover-ready signal fires after the
   * returned promise settles so wrappers can keep the reward hidden until
   * then.
   */
  renderCover?: (
    canvas: ScratcherCanvasType,
    width: number,
    height: number,
    cover: string | undefined,
  ) => void | Promise<void>;
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
  // width/height are optional so non-DOM ScratcherCanvasType implementations
  // (lightweight mocks, SSR shims, custom backends) need not provide them.
  // defaultMapPoint falls back to scale=1 when they are missing or zero.
  width?: number;
  height?: number;
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
