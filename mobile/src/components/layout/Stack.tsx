import { View, type ViewProps, type ViewStyle } from 'react-native';

import { spacing, type SpacingToken } from '@/core/theme';

export interface StackProps extends ViewProps {
  direction?: 'row' | 'column';
  /** Gap between children, from the spacing scale. Defaults to no gap. */
  gap?: SpacingToken;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
}

/**
 * The one flex-container primitive everything else in `layout/` is built
 * from — `Row` and `Column` are just `Stack` with `direction` fixed, so
 * there's a single implementation to maintain, not three.
 */
export function Stack({
  direction = 'column',
  gap = 'none',
  align,
  justify,
  wrap,
  style,
  ...rest
}: StackProps) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: spacing[gap],
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
      {...rest}
    />
  );
}
