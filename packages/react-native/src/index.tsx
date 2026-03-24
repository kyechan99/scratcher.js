import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ViewStyle } from 'react-native';

export interface NativeScratchSurfaceProps {
  width: number;
  height: number;
  style?: ViewStyle;
}

export function NativeScratchSurface({ width, height, style }: NativeScratchSurfaceProps) {
  return <View style={[{ width, height, overflow: 'hidden' }, style]} />;
}
