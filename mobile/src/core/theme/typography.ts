/**
 * The web app sets `--font-poppins` as the sole sans font (`globals.css`
 * `html { font-family: var(--font-poppins), ... }`) and leans on Tailwind's
 * `text-*`/`font-*` utilities ad hoc rather than a named type scale.
 * `fontFamily` values here match `@expo-google-fonts/poppins`'s export
 * names — load them via `useFonts` before rendering (see `app/_layout.tsx`).
 */
export const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  black: 'Poppins_900Black',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

/**
 * The six semantic levels the design system's `Text` component exposes
 * (`Heading`/`Title`/`Subtitle`/`Body`/`Caption`/`Label`). Matches the web
 * app's recurring patterns: bold black-weight page titles, a tracked
 * uppercase "eyebrow" label (`Label`), regular body copy, and muted small
 * text (`Caption`). Do not add arbitrary one-off sizes elsewhere — extend
 * this scale instead.
 */
export const typography = {
  heading: {
    fontFamily: fontFamily.black,
    fontSize: fontSize['4xl'],
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: fontFamily.black,
    fontSize: fontSize['3xl'],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: fontSize.xs * 0.18, // tracking-[0.18em], matches web's eyebrow labels
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyToken = keyof typeof typography;
