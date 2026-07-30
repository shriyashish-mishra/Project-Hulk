import { View } from 'react-native';

import { spacing, type SpacingToken } from '@/core/theme';

/** A fixed-size gap (`size` from the spacing scale), or a flexible one that grows to fill available space when `size` is omitted. */
export function Spacer({ size }: { size?: SpacingToken }) {
  if (size === undefined) {
    return <View style={{ flex: 1 }} />;
  }
  return <View style={{ width: spacing[size], height: spacing[size] }} />;
}
