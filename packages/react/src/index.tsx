import {
  ScratcherConfig,
  ScratchControllerCallbacks,
  Scratcher as CoreScratcher,
} from '@scratcher/core';
import { CSSProperties, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';

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
  brushSize,
  completionThreshold,
  revealOnCompletion,
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
        brushSize,
        cover,
        completionThreshold,
        revealOnCompletion,
      }),
    [width, height, coverage, cover, completionThreshold, revealOnCompletion],
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
