import { ScratchController, ScratchControllerOptions } from './controller';
import { ScratchEngine } from './engine';
import {
  ScratcherCanvasType,
  Point,
  ScratchControllerCallbacks,
  ScratcherCanvasBindingOptions,
  ScratcherConfig,
  ScratcherPointerEventType,
  ScratchSnapshot,
} from './types';

export type ScratcherOptions = ScratcherConfig;

type MapPointHandler = (e: ScratcherPointerEventType, canvas: ScratcherCanvasType) => Point;

type RenderAtPointHandler = (
  x: number,
  y: number,
  brushSize: number,
  canvas: ScratcherCanvasType,
) => void;

type RenderCoverHandler = (
  canvas: ScratcherCanvasType,
  cover: string | undefined,
  width: number,
  height: number,
) => void;

interface ScratcherCanvasBindingState {
  canvas: ScratcherCanvasType;
  renderCover: RenderCoverHandler;
  cleanup: () => void;
}

export class Scratcher {
  readonly engine: ScratchEngine;
  readonly controller: ScratchController;
  private canvasBinding: ScratcherCanvasBindingState | null;
  private readonly cover: string | undefined;
  private readonly canvasWidth: number;
  private readonly canvasHeight: number;

  constructor(options: ScratcherConfig) {
    this.cover = options.cover;

    this.engine = new ScratchEngine({
      width: options.width,
      height: options.height,
      coverage: options.coverage,
    });

    const controllerOptions: ScratchControllerOptions = {
      engine: this.engine,
      brushSize: options.brushSize,
      callbacks: options.callbacks,
      completionThreshold: options.completionThreshold,
      revealOnCompletion: options.revealOnCompletion,
    };

    this.controller = new ScratchController(controllerOptions);
    this.canvasBinding = null;
    this.canvasWidth = options.width;
    this.canvasHeight = options.height;
  }

  get snapshot(): ScratchSnapshot {
    return this.controller.snapshot;
  }

  get isDrawing(): boolean {
    return this.controller.isDrawing;
  }

  start(point: Point): ScratchSnapshot {
    return this.controller.start(point);
  }

  move(point: Point): ScratchSnapshot {
    return this.controller.move(point);
  }

  end(): ScratchSnapshot {
    return this.controller.end();
  }

  reset(): ScratchSnapshot {
    if (this.canvasBinding) {
      this.canvasBinding.renderCover(
        this.canvasBinding.canvas,
        this.cover,
        this.canvasWidth,
        this.canvasHeight,
      );
    }
    return this.controller.reset();
  }

  setBrushSize(size: number): void {
    this.controller.setBrushSize(size);
  }

  setCallbacks(callbacks?: ScratchControllerCallbacks): void {
    this.controller.setCallbacks(callbacks);
  }

  bindCanvas(canvas: ScratcherCanvasType, options?: ScratcherCanvasBindingOptions): () => void {
    this.unbindCanvas();
    const mapPoint = options?.mapPoint ?? this.defaultMapPoint;
    const renderAtPoint = options?.renderAtPoint ?? this.defaultRenderAtPoint;
    const renderCover = options?.renderCover ?? this.defaultRenderCover;

    renderCover(canvas, this.cover, this.canvasWidth, this.canvasHeight);
    const cleanup = this.attachEventListener(canvas, mapPoint, renderAtPoint);

    this.canvasBinding = {
      canvas,
      renderCover,
      cleanup,
    };

    return cleanup;
  }

  unbindCanvas(): void {
    this.canvasBinding?.cleanup();
    this.canvasBinding = null;
  }

  private defaultMapPoint(event: ScratcherPointerEventType, target: ScratcherCanvasType): Point {
    const rect = target.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private defaultRenderAtPoint(
    x: number,
    y: number,
    brushSize: number,
    canvas: ScratcherCanvasType,
  ): void {
    const ctx = canvas.getContext?.('2d');
    if (!ctx) {
      return;
    }

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private defaultRenderCover(
    canvas: ScratcherCanvasType,
    cover: string | undefined,
    width: number,
    height: number,
  ): void {
    const ctx = canvas.getContext?.('2d');
    if (!ctx) {
      return;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect?.(0, 0, width, height);
    if (ctx.fillRect) {
      ctx.fillStyle = cover ?? '#b9c2ce';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.globalCompositeOperation = 'destination-out';
  }

  private clearCover(canvas: ScratcherCanvasType): void {
    const ctx = canvas.getContext?.('2d');
    if (!ctx) {
      return;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect?.(0, 0, this.canvasWidth, this.canvasHeight);
    ctx.globalCompositeOperation = 'destination-out';
  }

  private syncRevealIfCompleted(canvas: ScratcherCanvasType, wasCompleted: boolean): void {
    if (!wasCompleted && this.controller.isCompleted && this.controller.shouldRevealOnCompletion) {
      this.clearCover(canvas);
    }
  }

  private attachEventListener(
    canvas: ScratcherCanvasType,
    mapPoint: MapPointHandler,
    renderAtPoint: RenderAtPointHandler,
  ): () => void {
    const onPointerDown = (e: unknown) => {
      const event = e as ScratcherPointerEventType;
      canvas.setPointerCapture?.(event.pointerId);
      const point = mapPoint(event, canvas);
      renderAtPoint(point.x, point.y, this.controller.currentBrushSize, canvas);
      const wasCompleted = this.controller.isCompleted;
      this.start(point);
      this.syncRevealIfCompleted(canvas, wasCompleted);
    };

    const onPointerMove = (e: unknown) => {
      if (!this.isDrawing) {
        return;
      }

      const event = e as ScratcherPointerEventType;
      const point = mapPoint(event, canvas);
      renderAtPoint(point.x, point.y, this.controller.currentBrushSize, canvas);
      const wasCompleted = this.controller.isCompleted;
      this.move(point);
      this.syncRevealIfCompleted(canvas, wasCompleted);
    };

    const onPointerEnd = () => {
      this.end();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerEnd);
    canvas.addEventListener('pointerleave', onPointerEnd);
    canvas.addEventListener('pointercancel', onPointerEnd);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerEnd);
      canvas.removeEventListener('pointerleave', onPointerEnd);
      canvas.removeEventListener('pointercancel', onPointerEnd);
    };
  }
}
