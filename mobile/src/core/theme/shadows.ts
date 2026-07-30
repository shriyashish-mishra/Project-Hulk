/**
 * The web app explicitly avoids drop shadows for elevation — see the
 * `globals.css` comment: "Elevation is expressed as a lightness ladder
 * (background < card < popover) rather than drop shadows, which read as
 * muddy on near-black." Faithfully recreating the design language means
 * *not* introducing shadows here either — reach for `colors.card` /
 * `colors.popover` (see `colors.ts`) to indicate elevation instead.
 *
 * This export exists so a screen that genuinely needs a native shadow
 * (rare — e.g. a floating action button that must read as detached from
 * the surface behind it) has one deliberately restrained option, instead
 * of every screen inventing its own shadow values.
 */
export const shadows = {
  none: {},
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6, // Android
  },
} as const;

export type ShadowToken = keyof typeof shadows;
