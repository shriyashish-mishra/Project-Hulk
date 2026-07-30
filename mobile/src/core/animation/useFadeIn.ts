import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { durations, easing } from '@/core/theme';

export interface FadeInOptions {
  /** Matches the web app's staggered card entrance (`animationDelay: "60ms"`, etc.). */
  delay?: number;
  /** Pixels to translate up from — set 0 for a plain fade with no motion, matching the web app's `fade-in` (vs. `fade-up`) keyframe. */
  distance?: number;
}

/**
 * A one-shot entrance animation matching the web app's `fade-up`/`fade-in`
 * keyframes (`globals.css`): opacity 0→1 with a small upward translate,
 * `--duration-base` (220ms) and `--ease-out-expo`. Apply the returned
 * `animatedStyle` to an `Animated.View` wrapping the content that should
 * animate in — typically a screen's title or a list of cards with a small
 * per-item `delay`.
 */
export function useFadeIn({ delay = 0, distance = 6 }: FadeInOptions = {}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: durations.base, easing: easing.outExpo }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `progress` is a stable Reanimated shared value, not reactive state
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }],
  }));

  return animatedStyle;
}
