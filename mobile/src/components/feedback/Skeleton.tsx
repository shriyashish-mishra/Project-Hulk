import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius, type RadiusToken } from '@/core/theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: RadiusToken;
}

/** A pulsing placeholder block for loading states — used by `Card`'s `loading` prop, or directly wherever content isn't ready yet. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius: radiusToken = 'sm',
}: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius[radiusToken], backgroundColor: colors.muted },
        animatedStyle,
      ]}
    />
  );
}
