export type Point = {
  x: number;
  y: number;
};

export type BrushStroke = {
  points: Point[];
  size: number;
};

export type ScratchEngineOptions = {
  width: number;
  height: number;
  coverage?: number;
};

export type ScratchSnapshot = {
  scratchedCells: number;
  totalCells: number;
  progress: number;
};

export interface ScratchStore {
  applyStroke(stroke: BrushStroke): ScratchSnapshot;
  reset(): ScratchSnapshot;
  snapshot(): ScratchSnapshot;
  revealAll(): ScratchSnapshot;
}

export interface ScratchControllerCallbacks {
  onScratchStart?: (point: Point, snapshot: ScratchSnapshot) => void;
  onScratchMove?: (point: Point, snapshot: ScratchSnapshot) => void;
  onScratchEnd?: (snapshot: ScratchSnapshot) => void;
  onReset?: (snapshot: ScratchSnapshot) => void;
  onProgress?: (snapshot: ScratchSnapshot) => void;
  onComplete?: (snapshot: ScratchSnapshot) => void;
}

export interface ScratcherConfig extends ScratchEngineOptions {
  brushSize: number;
  completionThreshold?: number;
  revealOnCompletion?: boolean;
  callbacks?: ScratchControllerCallbacks;
  cover?: string;
}

export interface ScratcherPointerEventType {
  clientX: number;
  clientY: number;
  pointerId: number;
}

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

// HTMLCanvasElement
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
