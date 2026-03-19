import { ScratchEngine } from './engine';
import { Point, ScratchControllerCallbacks, ScratchSnapshot } from './types';

export type ScratchControllerOptions = {
  engine: ScratchEngine;
  brushSize: number;
  callbacks?: ScratchControllerCallbacks;
  completionThreshold?: number;
};

export class ScratchController {
  private readonly engine: ScratchEngine;
  private brushSize: number;
  private callbacks: ScratchControllerCallbacks;
  private completionThreshold: number;
  private drawing: boolean;
  private completed: boolean;
  private currentSnapshot: ScratchSnapshot;

  constructor(options: ScratchControllerOptions) {
    this.engine = options.engine;
    this.brushSize = Math.max(1, options.brushSize);
    this.callbacks = options.callbacks ?? {};
    this.completionThreshold = options.completionThreshold ?? 0.7;
    this.drawing = false;
    this.completed = false;
    this.currentSnapshot = this.engine.snapshot();
  }

  get snapshot(): ScratchSnapshot {
    return this.currentSnapshot;
  }

  get isDrawing(): boolean {
    return this.drawing;
  }

  get currentBrushSize(): number {
    return this.brushSize;
  }

  setBrushSize(size: number): void {
    this.brushSize = Math.max(1, size);
  }

  setCallbacks(callbacks?: ScratchControllerCallbacks): void {
    this.callbacks = callbacks ?? {};
  }

  start(point: Point): ScratchSnapshot {
    this.drawing = true;
    const snapshot = this.apply(point);
    this.callbacks.onStrokeStart?.(point, snapshot);
    return snapshot;
  }

  move(point: Point): ScratchSnapshot {
    if (!this.drawing) {
      return this.currentSnapshot;
    }

    const snapshot = this.apply(point);
    this.callbacks.onStrokeMove?.(point, snapshot);
    return snapshot;
  }

  end(): ScratchSnapshot {
    if (!this.drawing) {
      return this.currentSnapshot;
    }

    this.drawing = false;
    this.callbacks.onStrokeEnd?.(this.currentSnapshot);
    return this.currentSnapshot;
  }

  reset(): ScratchSnapshot {
    this.drawing = false;
    this.completed = false;
    this.currentSnapshot = this.engine.reset();
    this.callbacks.onReset?.(this.currentSnapshot);
    this.callbacks.onProgress?.(this.currentSnapshot);
    return this.currentSnapshot;
  }

  private apply(point: Point): ScratchSnapshot {
    const snapshot = this.engine.applyStroke({
      size: this.brushSize,
      points: [point],
    });

    this.currentSnapshot = snapshot;
    this.callbacks.onProgress?.(snapshot);

    if (!this.completed && snapshot.progress >= this.completionThreshold) {
      this.completed = true;
      this.callbacks.onComplete?.(snapshot);
    }

    return snapshot;
  }
}
