import { colors, durations, easing, radius, spacing, typography } from '@/core/theme';

export type TokenGroupName = 'color' | 'spacing' | 'radius' | 'typography' | 'duration' | 'easing';

export interface TokenGroup {
  name: TokenGroupName;
  /** Derived from the real token objects via `Object.keys` — never hand-duplicated, so this can't drift from `core/theme`. */
  keys: string[];
}

/**
 * Introspectable list of token group names for design-system tooling (e.g.
 * the showcase screen's token section, or a future lint rule that checks a
 * hardcoded color/spacing value against this list). The values themselves
 * still live in `core/theme` — this only lists what exists.
 */
export const TOKEN_GROUPS: TokenGroup[] = [
  { name: 'color', keys: Object.keys(colors) },
  { name: 'spacing', keys: Object.keys(spacing) },
  { name: 'radius', keys: Object.keys(radius) },
  { name: 'typography', keys: Object.keys(typography) },
  { name: 'duration', keys: Object.keys(durations) },
  { name: 'easing', keys: Object.keys(easing) },
];
