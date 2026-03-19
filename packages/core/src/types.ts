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

export interface ScratchControllerCallbacks {
  onStrokeStart?: (point: Point, snapshot: ScratchSnapshot) => void;
  onStrokeMove?: (point: Point, snapshot: ScratchSnapshot) => void;
  onStrokeEnd?: (snapshot: ScratchSnapshot) => void;
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

export type ScratcherCanvasContextType = {
  beginPath: () => void;
  arc: (x: number, y: number, radius: number, startAngle: number, endAngle: number) => void;
  fill: () => void;
  clearRect?: (x: number, y: number, width: number, height: number) => void;
  fillRect?: (x: number, y: number, width: number, height: number) => void;
  fillStyle?: unknown;
  globalCompositeOperation?: string;
};

export type ScratcherCanvasType = {
  addEventListener: (type: string, listener: (e: unknown) => void) => void;
  removeEventListener: (type: string, listener: (e: unknown) => void) => void;
  getBoundingClientRect: () => ScratcherCanvasRectType;
  setPointerCapture?: (pointerId: number) => void;
  getContext?: (contextId: '2d') => ScratcherCanvasContextType | null;
};

export type ScratcherCanvasBindingOptions = {
  mapPoint?: (e: ScratcherPointerEventType, canvas: ScratcherCanvasType) => Point;
  renderAtPoint?: (x: number, y: number, brushSize: number, canvas: ScratcherCanvasType) => void;
  renderCover?: (
    canvas: ScratcherCanvasType,
    cover: string | undefined,
    width: number,
    height: number,
  ) => void;
};
