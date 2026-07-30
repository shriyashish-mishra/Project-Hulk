/**
 * Ported 1:1 from the web app's `src/app/globals.css` (OKLCH custom
 * properties, converted to sRGB hex since React Native's StyleSheet
 * doesn't support `oklch()`). Single dark theme — the web app has no
 * light mode either, so neither does this. Do not hand-tune these:
 * if the web palette changes, recompute from globals.css, don't eyeball
 * a new value here.
 */
export const colors = {
  background: '#060606',
  foreground: '#f5f5f5',

  card: '#0f0f0f',
  cardForeground: '#f5f5f5',

  popover: '#181818',
  popoverForeground: '#f5f5f5',

  /** The one mint accent — doubles as "success" and the brand color, same as the web app. */
  primary: '#57e5a9',
  primaryForeground: '#020202',
  accent: '#57e5a9',
  accentForeground: '#020202',
  success: '#57e5a9',

  secondary: '#181818',
  secondaryForeground: '#f5f5f5',

  muted: '#141414',
  mutedForeground: '#898989',

  destructive: '#f75d59',
  warning: '#f0b135',

  /** Alpha-blended against black in the web app (`oklch(1 0 0 / 8%)`) — expressed as 8-digit hex here (RRGGBBAA). */
  border: '#ffffff14',
  input: '#ffffff1a',
  ring: '#57e5a98c',

  chart1: '#57e5a9',
  chart2: '#9e9e9e',
  chart3: '#717171',
  chart4: '#4d4d4d',
  chart5: '#2e2e2e',
} as const;

export type ColorToken = keyof typeof colors;
