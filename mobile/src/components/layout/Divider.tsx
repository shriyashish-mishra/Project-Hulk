import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '@/core/theme';

/** A single hairline separator using the theme's border color. */
export function Divider({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }, style]}
      {...rest}
    />
  );
}
