import {
  Point,
  ScratcherConfig,
  ScratchControllerCallbacks,
  Scratcher as CoreScratcher,
  ScratchEngine,
  ScratchEngineOptions,
  ScratchSnapshot,
} from '@scratcher/core';
import { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseScratchEngineResult {
  engine: ScratchEngine;
  snapshot: ScratchSnapshot;
  reset: () => void;
}

export function useScratchEngine(options: ScratchEngineOptions): UseScratchEngineResult {
  const engine = useMemo(
    () => new ScratchEngine(options),
    [options.height, options.width, options.coverage, options.gridSize],
  );
  const [snapshot, setSnapshot] = useState<ScratchSnapshot>(engine.snapshot());

  const reset = () => {
    engine.reset();
    setSnapshot(engine.snapshot());
  };

  return {
    engine,
    snapshot,
    reset,
  };
}

export interface UseScratchControllerOptions extends ScratcherConfig {}

export interface UseScratchControllerResult {
  scratcher: CoreScratcher;
  engine: ScratchEngine;
  snapshot: ScratchSnapshot;
  reset: () => void;
  start: (point: Point) => void;
  move: (point: Point) => void;
  end: () => void;
  setBrushSize: (size: number) => void;
}

export function useScratchController(
  options: UseScratchControllerOptions,
): UseScratchControllerResult {
  const scratcher = useMemo(
    () =>
      new CoreScratcher({
        width: options.width,
        height: options.height,
        coverage: options.coverage,
        gridSize: options.gridSize,
        brushSize: options.brushSize,
        cover: options.cover,
        completionThreshold: options.completionThreshold,
      }),
    [
      options.height,
      options.width,
      options.coverage,
      options.gridSize,
      options.cover,
      options.completionThreshold,
    ],
  );
  const engine = scratcher.engine;
  const [snapshot, setSnapshot] = useState<ScratchSnapshot>(engine.snapshot());
  const callbacksRef = useRef<ScratchControllerCallbacks | undefined>(options.callbacks);

  callbacksRef.current = options.callbacks;

  useEffect(() => {
    scratcher.setCallbacks({
      onStrokeStart: (point, next) => callbacksRef.current?.onStrokeStart?.(point, next),
      onStrokeMove: (point, next) => callbacksRef.current?.onStrokeMove?.(point, next),
      onStrokeEnd: next => callbacksRef.current?.onStrokeEnd?.(next),
      onReset: next => callbacksRef.current?.onReset?.(next),
      onProgress: next => {
        setSnapshot(next);
        callbacksRef.current?.onProgress?.(next);
      },
      onComplete: next => callbacksRef.current?.onComplete?.(next),
    });
  }, [scratcher]);

  useEffect(() => {
    scratcher.setBrushSize(options.brushSize);
  }, [scratcher, options.brushSize]);

  const reset = useCallback(() => {
    setSnapshot(scratcher.reset());
  }, [scratcher]);

  const start = useCallback(
    (point: Point) => {
      setSnapshot(scratcher.start(point));
    },
    [scratcher],
  );

  const move = useCallback(
    (point: Point) => {
      setSnapshot(scratcher.move(point));
    },
    [scratcher],
  );

  const end = useCallback(() => {
    setSnapshot(scratcher.end());
  }, [scratcher]);

  const setBrushSize = useCallback(
    (size: number) => {
      scratcher.setBrushSize(size);
    },
    [scratcher],
  );

  return {
    scratcher,
    engine,
    snapshot,
    reset,
    start,
    move,
    end,
    setBrushSize,
  };
}

export interface ScratchSurfaceProps {
  width: number;
  height: number;
  className?: string;
}

export function ScratchSurface({ width, height, className }: ScratchSurfaceProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  return <canvas ref={ref} width={width} height={height} className={className} />;
}

export interface ScratcherProps extends ScratcherConfig {
  className?: string;
  style?: CSSProperties;
  canvasClassName?: string;
  rewardClassName?: string;
  onScratcherReady?: (scratcher: CoreScratcher) => void;
  children?: ReactNode;
}

export function Scratcher({
  width,
  height,
  coverage,
  gridSize,
  brushSize,
  completionThreshold,
  callbacks,
  cover,
  className,
  style,
  canvasClassName,
  rewardClassName,
  onScratcherReady,
  children,
}: ScratcherProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scratcher = useMemo(
    () =>
      new CoreScratcher({
        width,
        height,
        coverage,
        gridSize,
        brushSize,
        cover,
        completionThreshold,
      }),
    [width, height, coverage, gridSize, cover, completionThreshold],
  );
  const callbacksRef = useRef<ScratchControllerCallbacks | undefined>(callbacks);

  callbacksRef.current = callbacks;

  useEffect(() => {
    scratcher.setCallbacks(callbacksRef.current);
  }, [scratcher, callbacks]);

  useEffect(() => {
    scratcher.setBrushSize(brushSize);
  }, [scratcher, brushSize]);

  useEffect(() => {
    onScratcherReady?.(scratcher);
  }, [onScratcherReady, scratcher]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const cleanup = scratcher.bindCanvas(canvas);

    return () => {
      cleanup();
      scratcher.unbindCanvas();
    };
  }, [scratcher]);

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    width,
    height,
    overflow: 'hidden',
    touchAction: 'none',
    ...style,
  };

  const canvasStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    cursor: 'crosshair',
  };

  const rewardLayerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
  };

  return (
    <div className={className} style={wrapperStyle}>
      {children && (
        <div className={rewardClassName} style={rewardLayerStyle}>
          {children}
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={canvasClassName}
        style={canvasStyle}
      />
    </div>
  );
}
