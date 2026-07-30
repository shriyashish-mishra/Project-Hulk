import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { durations } from '@/core/theme';

export interface PressScaleOptions {
  /** How far to scale down on press. Defaults to 0.97 — keep this subtle; see the design system's "calm, not springy" rule. */
  scaleTo?: number;
  disabled?: boolean;
}

/**
 * The app's one press-feedback animation — `Button` and `Card` both used
 * to duplicate this exact shared-value + `onPressIn`/`onPressOut` pattern;
 * this hook is the single implementation. Spread `handlers` onto a
 * `Pressable` (or `Animated.createAnimatedComponent(Pressable)`) and apply
 * `animatedStyle`.
 */
export function usePressScale({ scaleTo = 0.97, disabled = false }: PressScaleOptions = {}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlers = {
    onPressIn: () => {
      if (disabled) return;
      // Reanimated shared values are intentionally mutated via `.value` —
      // this is the documented API, not a React state/props mutation the
      // React Compiler lint rule is meant to catch.
      // eslint-disable-next-line react-hooks/immutability
      scale.value = withTiming(scaleTo, { duration: durations.fast });
    },
    onPressOut: () => {
      // eslint-disable-next-line react-hooks/immutability
      scale.value = withTiming(1, { duration: durations.fast });
    },
  };

  return { animatedStyle, handlers };
}
