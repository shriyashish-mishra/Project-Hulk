import { Easing } from 'react-native-reanimated';

/**
 * Ported from `globals.css`'s motion tokens (`--duration-*`, `--ease-*`).
 * The web app's own rule: "kept short and non-bouncy... almost invisible."
 * Reach for `durations.base` + `easing.outExpo` as the default for any new
 * transition — the same pairing the web app uses for its `fade-up`/`fade-in`
 * keyframes — and only use `easing.spring` where the web app also opts into
 * `--ease-spring` (success/check-pop moments), not as a general default.
 */
export const durations = {
  fast: 150,
  base: 220,
  slow: 400,
} as const;

export const easing = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;
