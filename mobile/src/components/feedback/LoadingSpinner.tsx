import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/core/theme';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  /** Centers the spinner in all available space — use for a full-screen/full-section loading state. */
  fill?: boolean;
}

/** The app's themed loading indicator — mint, matching the accent color rather than the platform default gray. */
export function LoadingSpinner({ size = 'small', fill }: LoadingSpinnerProps) {
  if (fill) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size={size} color={colors.primary} />
      </View>
    );
  }
  return <ActivityIndicator size={size} color={colors.primary} />;
}
