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
  ) => void;
};
export declare class ScratchCanvasAdapter {
  private readonly canvas;
  private readonly interaction;
  private readonly cover;
  private readonly width;
  private readonly height;
  private readonly mapPoint;
  private readonly renderAtPoint;
  private readonly _renderCover;
  private cleanup;
  constructor(options: ScratchCanvasAdapterOptions);
  bind(): void;
  resetCover(): void;
  unbind(): void;
  private syncRevealIfCompleted;
  private clearCover;
  private defaultMapPoint;
  private defaultRenderAtPoint;
  private defaultRenderCover;
  private renderCover;
}
//# sourceMappingURL=canvas.d.ts.map
