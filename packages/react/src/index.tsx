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
  responsive?: boolean;
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
  cover,
  area,
  onScratchStart,
  onScratchMove,
  onScratchEnd,
  onReset,
  onProgress,
  onComplete,
  mapPoint,
  renderAtPoint,
  renderCover,
  className,
  style,
  canvasClassName,
  rewardClassName,
  responsive = false,
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
        onScratchStart,
        onScratchMove,
        onScratchEnd,
        onReset,
        onProgress,
        onComplete,
        mapPoint,
        renderAtPoint,
        renderCover,
      }),
    // area / callbacks / mapPoint / renderAtPoint / renderCover are intentionally
    // excluded — area is updated via setArea, callbacks are updated via
    // setCallbacks, and the render fns are captured at construction time to
    // match the Vue binding's behavior.
    [width, height, cellSize, cover, completionThreshold, revealOnCompletion],
  );

  useEffect(() => {
    const callbacks: ScratchControllerCallbacks = {
      onScratchStart,
      onScratchMove,
      onScratchEnd,
      onReset,
      onProgress,
      onComplete,
    };
    scratcher.setCallbacks(callbacks);
  }, [scratcher, onScratchStart, onScratchMove, onScratchEnd, onReset, onProgress, onComplete]);

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

  const wrapperStyle: CSSProperties = responsive
    ? {
        position: 'relative',
        width,
        maxWidth: '100%',
        minWidth: 0,
        aspectRatio: `${width} / ${height}`,
        overflow: 'hidden',
        touchAction: 'none',
        ...style,
      }
    : {
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
