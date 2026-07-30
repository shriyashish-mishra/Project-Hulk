import { ScrollView, type ScrollViewProps } from 'react-native';

import { spacing } from '@/core/theme';
import { SafeScreen, type SafeScreenProps } from './SafeScreen';

export interface ScrollScreenProps extends ScrollViewProps {
  edges?: SafeScreenProps['edges'];
}

/**
 * `SafeScreen` plus a `ScrollView` with the app's standard content padding
 * and gap already applied — the default for any screen with more content
 * than fits on one page. `keyboardShouldPersistTaps="handled"` so tapping
 * a button doesn't require an extra tap to dismiss the keyboard first.
 */
export function ScrollScreen({
  edges,
  contentContainerStyle,
  children,
  ...rest
}: ScrollScreenProps) {
  return (
    <SafeScreen edges={edges}>
      <ScrollView
        contentContainerStyle={[{ padding: spacing.lg, gap: spacing.lg }, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        {...rest}
      >
        {children}
      </ScrollView>
    </SafeScreen>
  );
}
