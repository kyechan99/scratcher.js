import { Point, ScratcherCanvasType, ScratcherPointerEventType, ScratchSnapshot } from './types';

export interface ScratchInteractionPort {
  readonly isDrawing: boolean;
  readonly isCompleted: boolean;
  readonly shouldRevealOnCompletion: boolean;
  readonly currentBrushSize: number;
  start(point: Point): ScratchSnapshot;
  move(point: Point): ScratchSnapshot;
  end(): ScratchSnapshot;
}

export type ScratchCanvasAdapterOptions = {
  canvas: ScratcherCanvasType;
  interaction: ScratchInteractionPort;
  cover?: string;
  width: number;
  height: number;
  mapPoint?: (e: ScratcherPointerEventType, canvas: ScratcherCanvasType) => Point;
  renderAtPoint?: (x: number, y: number, brushSize: number, canvas: ScratcherCanvasType) => void;
  renderCover?: (
    canvas: ScratcherCanvasType,
    width: number,
    height: number,
    cover: string | undefined,
  ) => void | Promise<void>;
  /**
   * Notified after the cover finishes painting on the canvas. Invoked
   * synchronously for sync render functions and after the returned promise
   * settles for async ones. Stale invocations (e.g. after `unbind` or another
   * `renderCover` call) are suppressed.
   */
  onCoverReady?: () => void;
};

export class ScratchCanvasAdapter {
  private readonly canvas: ScratcherCanvasType;
  private readonly interaction: ScratchInteractionPort;
  private readonly cover: string | undefined;
  private readonly width: number;
  private readonly height: number;
  private readonly mapPoint: (e: ScratcherPointerEventType, canvas: ScratcherCanvasType) => Point;
  private readonly renderAtPoint: (
    x: number,
    y: number,
    brushSize: number,
    canvas: ScratcherCanvasType,
  ) => void;
  private readonly _renderCover: (
    canvas: ScratcherCanvasType,
    width: number,
    height: number,
    cover: string | undefined,
  ) => void | Promise<void>;
  private readonly onCoverReady?: () => void;
  private renderGeneration: number;
  private coverReady: boolean;
  private cleanup: (() => void) | null;

  constructor(options: ScratchCanvasAdapterOptions) {
    this.canvas = options.canvas;
    this.interaction = options.interaction;
    this.cover = options.cover;
    this.width = options.width;
    this.height = options.height;
    this.mapPoint = options.mapPoint ?? this.defaultMapPoint;
    this.renderAtPoint = options.renderAtPoint ?? this.defaultRenderAtPoint;
    this._renderCover = options.renderCover ?? this.defaultRenderCover;
    this.onCoverReady = options.onCoverReady;
    this.renderGeneration = 0;
    this.coverReady = false;
    this.cleanup = null;
  }

  bind(): void {
    this.unbind();
    this.renderCover(this.canvas, this.width, this.height, this.cover);

    const onPointerDown = (e: unknown) => {
      // Drop strokes that arrive before the cover render has finalized: the
      // composite mode is still `source-over`, so renderAtPoint would paint
      if (!this.coverReady) return;

      const event = e as ScratcherPointerEventType;
      this.canvas.setPointerCapture?.(event.pointerId);
      const point = this.mapPoint(event, this.canvas);
      this.renderAtPoint(point.x, point.y, this.interaction.currentBrushSize, this.canvas);
      const wasCompleted = this.interaction.isCompleted;
      this.interaction.start(point);
      this.syncRevealIfCompleted(wasCompleted);
    };

    const onPointerMove = (e: unknown) => {
      if (!this.coverReady) return;
      if (!this.interaction.isDrawing) {
        return;
      }

      const event = e as ScratcherPointerEventType;
      const point = this.mapPoint(event, this.canvas);
      this.renderAtPoint(point.x, point.y, this.interaction.currentBrushSize, this.canvas);
      const wasCompleted = this.interaction.isCompleted;
      this.interaction.move(point);
      this.syncRevealIfCompleted(wasCompleted);
    };

    const onPointerEnd = () => {
      this.interaction.end();
    };

    this.canvas.addEventListener('pointerdown', onPointerDown);
    this.canvas.addEventListener('pointermove', onPointerMove);
    this.canvas.addEventListener('pointerup', onPointerEnd);
    this.canvas.addEventListener('pointerleave', onPointerEnd);
    this.canvas.addEventListener('pointercancel', onPointerEnd);

    this.cleanup = () => {
      this.canvas.removeEventListener('pointerdown', onPointerDown);
      this.canvas.removeEventListener('pointermove', onPointerMove);
      this.canvas.removeEventListener('pointerup', onPointerEnd);
      this.canvas.removeEventListener('pointerleave', onPointerEnd);
      this.canvas.removeEventListener('pointercancel', onPointerEnd);
    };
  }

  resetCover(): void {
    this.renderCover(this.canvas, this.width, this.height, this.cover);
  }

  unbind(): void {
    this.renderGeneration++;
    this.coverReady = false;
    this.cleanup?.();
    this.cleanup = null;
  }

  private syncRevealIfCompleted(wasCompleted: boolean): void {
    if (
      !wasCompleted &&
      this.interaction.isCompleted &&
      this.interaction.shouldRevealOnCompletion
    ) {
      this.clearCover();
    }
  }

  private clearCover(): void {
    const ctx = this.canvas.getContext?.('2d');
    if (!ctx) {
      return;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect?.(0, 0, this.width, this.height);
    ctx.globalCompositeOperation = 'destination-out';
  }

  private defaultMapPoint(e: ScratcherPointerEventType, target: ScratcherCanvasType): Point {
    const rect = target.getBoundingClientRect();
    // Map CSS coords to drawing-buffer coords so strokes stay aligned with the
    // pointer when the canvas is CSS-scaled (e.g. responsive layouts). rect's
    // width/height may be undefined for non-DOM ScratcherCanvasType impls; in
    // that case (and for detached canvases reporting 0) fall back to scale=1.
    const rectWidth = rect.width ?? 0;
    const rectHeight = rect.height ?? 0;
    const scaleX = rectWidth > 0 ? this.width / rectWidth : 1;
    const scaleY = rectHeight > 0 ? this.height / rectHeight : 1;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
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
    width: number,
    height: number,
    cover: string | undefined,
  ): void {
    const ctx = canvas.getContext?.('2d');
    if (!ctx) return;
    ctx.clearRect?.(0, 0, width, height);
    if (ctx.fillRect) {
      ctx.fillStyle = cover ?? '#b9c2ce';
      ctx.fillRect(0, 0, width, height);
    }
  }

  private renderCover(
    canvas: ScratcherCanvasType,
    width: number,
    height: number,
    cover: string | undefined,
  ): void {
    const ctx = canvas.getContext?.('2d');
    if (!ctx) return;

    const generation = ++this.renderGeneration;
    this.coverReady = false;
    ctx.globalCompositeOperation = 'source-over';
    const result = this._renderCover(canvas, width, height, cover); // call custom-renderCover or default-renderCover

    const finalize = () => {
      // Suppress stale callbacks from a superseded or unbound render.
      if (generation !== this.renderGeneration) return;
      ctx.globalCompositeOperation = 'destination-out';
      this.coverReady = true;
      this.onCoverReady?.();
    };

    if (result && typeof (result as Promise<void>).then === 'function') {
      (result as Promise<void>).then(finalize, finalize);
    } else {
      finalize();
    }
  }
}
