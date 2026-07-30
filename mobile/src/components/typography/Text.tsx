import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import {
  colors,
  type ColorToken,
  fontFamily,
  typography,
  type TypographyToken,
} from '@/core/theme';

export interface TextProps extends RNTextProps {
  /** Which of the six type-scale levels to render as. Defaults to `body`. */
  variant?: TypographyToken;
  /** Overrides the variant's default weight without changing its size. */
  weight?: keyof typeof fontFamily;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
}

/**
 * The one text primitive in the app — every size/weight/color combination
 * must go through this (see `Heading`/`Title`/`Subtitle`/`Body`/`Caption`/
 * `Label` for the ergonomic named wrappers). Never hardcode a `fontSize` at
 * a call site; extend `core/theme/typography.ts` instead.
 */
export function Text({
  variant = 'body',
  weight,
  color = 'foreground',
  align,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        typography[variant],
        weight && { fontFamily: fontFamily[weight] },
        { color: colors[color] },
        align && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}
