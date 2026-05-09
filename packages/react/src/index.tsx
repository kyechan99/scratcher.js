import {
  ScratcherConfig,
  ScratchControllerCallbacks,
  Scratcher as CoreScratcher,
} from '@scratcher.js/core';
import { CSSProperties, ReactNode, useEffect, useMemo, useRef } from 'react';

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
  cellSize,
  brushSize,
  completionThreshold,
  revealOnCompletion,
  callbacks,
  cover,
  area,
  mapPoint,
  renderAtPoint,
  renderCover,
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
        cellSize,
        brushSize,
        cover,
        area,
        completionThreshold,
        revealOnCompletion,
        mapPoint,
        renderAtPoint,
        renderCover,
      }),
    // area / mapPoint / renderAtPoint / renderCover are intentionally excluded:
    // area is updated via the setArea effect below; the render fns are captured
    // at construction time to match the Vue binding's behavior.
    [width, height, cellSize, cover, completionThreshold, revealOnCompletion],
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
    scratcher.setArea(area);
  }, [scratcher, area]);

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
