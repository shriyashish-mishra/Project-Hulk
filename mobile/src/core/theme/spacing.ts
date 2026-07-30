/**
 * The web app has no centralized spacing scale of its own — it uses
 * Tailwind's utility classes ad hoc (`gap-3`, `px-5`, `pb-28`, etc.), all
 * on Tailwind's default 4px base unit. This mirrors that same base unit
 * as an explicit scale, since React Native has no utility-class system to
 * lean on — pick the token whose value matches the Tailwind class you'd
 * have reached for on web (`spacing.md` ≈ `gap-3`, `spacing.lg` ≈ `px-5`).
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export type SpacingToken = keyof typeof spacing;
