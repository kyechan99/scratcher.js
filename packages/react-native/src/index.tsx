import {
  Point,
  ScratcherConfig,
  ScratchControllerCallbacks,
  Scratcher,
  ScratchEngine,
  ScratchEngineOptions,
  ScratchSnapshot,
} from '@scratcher/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ViewStyle } from 'react-native';

export interface UseNativeScratchEngineResult {
  engine: ScratchEngine;
  snapshot: ScratchSnapshot;
  reset: () => void;
}

export function useNativeScratchEngine(
  options: ScratchEngineOptions,
): UseNativeScratchEngineResult {
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

export interface UseNativeScratchControllerOptions extends ScratcherConfig {}

export interface UseNativeScratchControllerResult {
  scratcher: Scratcher;
  engine: ScratchEngine;
  snapshot: ScratchSnapshot;
  start: (point: Point) => void;
  move: (point: Point) => void;
  end: () => void;
  reset: () => void;
  setBrushSize: (size: number) => void;
}

export function useNativeScratchController(
  options: UseNativeScratchControllerOptions,
): UseNativeScratchControllerResult {
  const scratcher = useMemo(
    () =>
      new Scratcher({
        width: options.width,
        height: options.height,
        coverage: options.coverage,
        gridSize: options.gridSize,
        brushSize: options.brushSize,
        completionThreshold: options.completionThreshold,
      }),
    [
      options.height,
      options.width,
      options.coverage,
      options.gridSize,
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

  const reset = useCallback(() => {
    setSnapshot(scratcher.reset());
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
    start,
    move,
    end,
    reset,
    setBrushSize,
  };
}

export interface NativeScratchSurfaceProps {
  width: number;
  height: number;
  style?: ViewStyle;
}

export function NativeScratchSurface({ width, height, style }: NativeScratchSurfaceProps) {
  return <View style={[{ width, height, overflow: 'hidden' }, style]} />;
}
