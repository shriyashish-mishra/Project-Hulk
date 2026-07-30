import { View, type ViewProps } from 'react-native';

import {
  colors,
  radius,
  spacing,
  type ColorToken,
  type RadiusToken,
  type SpacingToken,
} from '@/core/theme';

export interface SurfaceProps extends ViewProps {
  /** Which step of the elevation ladder to render as (background < card < popover). Defaults to `card`. */
  tone?: Extract<ColorToken, 'background' | 'card' | 'popover' | 'secondary' | 'muted'>;
  padding?: SpacingToken;
  radius?: RadiusToken;
}

/**
 * The base themed container — a plain, non-pressable surface. `Card` is
 * this plus press/loading/disabled behavior; anything that just needs a
 * colored, rounded box (no interaction) should use `Surface` directly
 * rather than a `Card` with no `pressable` prop.
 */
export function Surface({
  tone = 'card',
  padding = 'base',
  radius: radiusToken = 'lg',
  style,
  ...rest
}: SurfaceProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors[tone],
          padding: spacing[padding],
          borderRadius: radius[radiusToken],
        },
        style,
      ]}
      {...rest}
    />
  );
}
