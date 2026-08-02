import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { ICON_SOURCES } from '@/components/icon/Icon';
import { colors } from '@/core/theme';

/**
 * True native tab bars (UITabBarController on iOS, BottomNavigationView on
 * Android) rather than a JS-rendered bar — chosen over a hand-built bottom
 * nav because it's the platform-correct default and comes free with
 * correct safe-area handling, haptics, and scroll-edge behavior. Icons
 * reuse `ICON_SOURCES` so the tab bar and the `Icon` component never drift
 * out of sync on which SF Symbol / Material Symbol a name maps to.
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={colors.primary}
      iconColor={{ default: colors.mutedForeground, selected: colors.primary }}
      backgroundColor={colors.card}
    >
      <NativeTabs.Trigger name="journal">
        <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={ICON_SOURCES.journal.ios} md={ICON_SOURCES.journal.android} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workouts">
        <NativeTabs.Trigger.Label>Workouts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={ICON_SOURCES.dumbbell.ios} md={ICON_SOURCES.dumbbell.android} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={ICON_SOURCES.progress.ios} md={ICON_SOURCES.progress.android} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
