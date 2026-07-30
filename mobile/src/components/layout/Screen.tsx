import { View, type ViewProps } from 'react-native';

import { colors } from '@/core/theme';

/**
 * The base full-bleed screen wrapper — background color only, no safe-area
 * insets. Use this only when a screen genuinely wants to draw under the
 * status bar / home indicator (e.g. a full-screen media view); everything
 * else should use `SafeScreen` or `ScrollScreen`.
 */
export function Screen({ style, ...rest }: ViewProps) {
  return <View style={[{ flex: 1, backgroundColor: colors.background }, style]} {...rest} />;
}
