import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack, ThemeProvider, type Theme } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
// eslint-disable-next-line no-restricted-imports -- diagnostic overlay must render with zero design-system dependency, in case that's what's broken
import { Text, View } from 'react-native';

import { CrashBoundary } from '@/components/CrashBoundary';
import { ToastHost } from '@/components/dialog';
import { colors } from '@/core/theme';
import { DATABASE_NAME, runMigrations } from '@/core/storage';

SplashScreen.preventAutoHideAsync();

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
    SplashScreen.hideAsync().catch(() => {});
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
 * TEMPORARY diagnostic overlay — always rendered, on top of everything,
 * using only bare RN primitives (no custom font, no design system) so it
 * stays visible even if something below it hangs or fails to paint. The
 * app was hanging on the native splash screen with no visible error, so
 * this pins down exactly which stage (fonts / DB init / tab mount) is
 * the one that never completes. Remove once the real cause is found.
 */
function StatusOverlay({ text }: { text: string }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 36,
        left: 8,
        right: 8,
        zIndex: 9999,
        backgroundColor: '#000000',
        borderWidth: 1,
        borderColor: '#57e5a9',
        padding: 8,
      }}
      pointerEvents="none"
    >
      <Text style={{ color: '#57e5a9', fontSize: 11 }}>{text}</Text>
    </View>
  );
}

/**
 * Root Stack — its only screens are the `(tabs)` group (the app's real
 * navigation, defined in `app/(tabs)/_layout.tsx` via `NativeTabs`) and any
 * modal/detail routes that should cover the tab bar, like `showcase`.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });
  const [dbStage, setDbStage] = useState('not started');
  const [dbError, setDbError] = useState<string | null>(null);
  const [tabsMounted, setTabsMounted] = useState(false);

  // Hides the native splash the instant JS starts running, regardless of
  // font/DB state — otherwise the splash visually hides this exact
  // diagnostic overlay for however long fonts/DB take, which is the gap
  // that made the previous build's crash boundary invisible.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  async function handleDbInit(db: SQLiteDatabase) {
    setDbStage('running migrations');
    try {
      await runMigrations(db);
      setDbStage('migrations done');
    } catch (e) {
      setDbStage('migrations threw');
      setDbError(e instanceof Error ? e.message : String(e));
      throw e;
    }
  }

  const statusText = `fonts=${fontsLoaded} fontErr=${fontError ? String(fontError).slice(0, 80) : 'none'} db=${dbStage}${dbError ? ' dbErr=' + dbError.slice(0, 200) : ''} tabs=${tabsMounted}`;

  return (
    <CrashBoundary>
      <StatusOverlay text={statusText} />
      {!fontsLoaded ? (
        <View style={{ flex: 1, backgroundColor: '#060606', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#ffffff' }}>Loading fonts…</Text>
        </View>
      ) : (
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={handleDbInit}>
          <ThemeProvider value={projectHulkTheme}>
            <View
              style={{ flex: 1 }}
              onLayout={() => {
                if (!tabsMounted) setTabsMounted(true);
              }}
            >
              <Stack screenOptions={{ headerShown: false }} />
            </View>
            <ToastHost />
          </ThemeProvider>
        </SQLiteProvider>
      )}
    </CrashBoundary>
  );
}
