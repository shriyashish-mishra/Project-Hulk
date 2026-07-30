/**
 * Ported from `globals.css`: `--radius: 1rem` (16px at the browser's 16px
 * root font size) plus its derived scale (`--radius-sm` through
 * `--radius-4xl`, each a multiplier of the base). Large radii are a
 * deliberate part of the web app's look — keep these multipliers in sync
 * if `--radius` or its scale ever changes on web.
 */
const BASE = 16;

export const radius = {
  sm: BASE * 0.55, // 8.8
  md: BASE * 0.75, // 12
  lg: BASE, // 16 — the "--radius" default
  xl: BASE * 1.35, // 21.6
  '2xl': BASE * 1.7, // 27.2
  '3xl': BASE * 2.05, // 32.8
  '4xl': BASE * 2.4, // 38.4
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
