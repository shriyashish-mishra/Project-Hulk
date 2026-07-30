import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import type { ViewProps } from 'react-native';

import { Screen } from './Screen';

export interface SafeScreenProps extends ViewProps {
  /** Which sides to apply safe-area insets to. Defaults to all — narrow this for screens with their own header. */
  edges?: Edge[];
}

/**
 * `Screen` plus safe-area insets — handles the Dynamic Island, notches, and
 * Android cutouts correctly via `react-native-safe-area-context` (no manual
 * padding numbers). This is the default for ordinary screens.
 */
export function SafeScreen({ style, edges, children, ...rest }: SafeScreenProps) {
  return (
    <Screen {...rest}>
      <SafeAreaView style={[{ flex: 1 }, style]} edges={edges}>
        {children}
      </SafeAreaView>
    </Screen>
  );
}
