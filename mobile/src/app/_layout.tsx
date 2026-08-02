import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack, ThemeProvider, type Theme } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
// eslint-disable-next-line no-restricted-imports -- the fonts-loading fallback must render before any design-system component (which depends on these fonts) is safe to use
import { Text, View } from 'react-native';

import { CrashBoundary } from '@/components/CrashBoundary';
import { ToastHost } from '@/components/dialog';
import { colors } from '@/core/theme';
import { DATABASE_NAME, runMigrations } from '@/core/storage';

/**
 * Belt-and-suspenders alongside `CrashBoundary`: React error boundaries
 * only catch render-phase throws, not errors from timers, unawaited
 * promises, or native-module callbacks. This surfaces those too, since
 * the alternative in a release build is a silent hang with nothing on
 * screen and nothing in reach without a USB/network debugging setup.
 */
if (typeof ErrorUtils !== 'undefined') {
  const previousHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    previousHandler?.(error, isFatal);
  });
}

/**
 * Single dark theme, always — the web app has no light mode either (see
 * `globals.css`: ".dark mirrors :root so nothing regresses"). No
 * `useColorScheme()` branching here on purpose: recreating the design
 * language faithfully means not inventing a light mode it doesn't have.
 */
const projectHulkTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.foreground,
    border: colors.border,
    notification: colors.destructive,
  },
  fonts: {
    regular: { fontFamily: 'Poppins_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'Poppins_500Medium', fontWeight: '500' },
    bold: { fontFamily: 'Poppins_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'Poppins_900Black', fontWeight: '900' },
  },
};

/**
 * Root Stack — its only screens are the `(tabs)` group (the app's real
 * navigation, defined in `app/(tabs)/_layout.tsx` via `NativeTabs`) and any
 * modal/detail routes that should cover the tab bar, like `showcase`.
 *
 * No native splash screen — removed deliberately, so a fresh launch
 * shows real content (or a real error, via `CrashBoundary`) immediately
 * rather than a static image that can outlast whatever's happening
 * underneath it.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#060606', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#ffffff' }}>Loading…</Text>
      </View>
    );
  }

  return (
    <CrashBoundary>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={runMigrations}>
        <ThemeProvider value={projectHulkTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <ToastHost />
        </ThemeProvider>
      </SQLiteProvider>
    </CrashBoundary>
  );
}
