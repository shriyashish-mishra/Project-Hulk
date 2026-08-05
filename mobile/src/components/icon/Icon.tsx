import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { colors } from '@/core/theme';

/**
 * Curated semantic icon names, each mapped to the real platform symbol
 * (SF Symbols on iOS, Material Symbols on Android/web) — this is
 * `expo-symbols`, Expo's native cross-platform icon primitive, not an
 * icon font. Add new names here as the app needs them rather than
 * threading raw platform symbol names through the app.
 */
const ICONS = {
  plus: { ios: 'plus', android: 'add', web: 'add' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  alertCircle: { ios: 'exclamationmark.circle', android: 'error', web: 'error' },
  alertTriangle: { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  home: { ios: 'house', android: 'home', web: 'home' },
  journal: { ios: 'book', android: 'menu_book', web: 'menu_book' },
  progress: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
  insights: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  camera: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  image: { ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' },
  dumbbell: { ios: 'dumbbell.fill', android: 'fitness_center', web: 'fitness_center' },
  walk: { ios: 'figure.walk', android: 'directions_walk', web: 'directions_walk' },
  moreVertical: { ios: 'ellipsis', android: 'more_vert', web: 'more_vert' },
  arrowUp: { ios: 'arrow.up', android: 'arrow_upward', web: 'arrow_upward' },
  arrowDown: { ios: 'arrow.down', android: 'arrow_downward', web: 'arrow_downward' },
  flame: { ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' },
  bookmark: { ios: 'bookmark', android: 'bookmark', web: 'bookmark' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
} as const;

export type IconName = keyof typeof ICONS;

/** Exposed for `app/(tabs)/_layout.tsx` so tab-bar icons reuse the exact same semantic mapping rather than duplicating platform icon names. */
export { ICONS as ICON_SOURCES };

export interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
}

/** The app's only icon primitive — every icon in the design system goes through this. */
export function Icon({ name, size = 20, color = colors.foreground }: IconProps) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} weight="medium" />;
}
