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
import { useState } from 'react';
// eslint-disable-next-line no-restricted-imports -- diagnostic overlay must render with zero design-system dependency, in case that's what's broken
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
 * TEMPORARY diagnostic overlay — always rendered, on top of everything,
 * using only bare RN primitives (no custom font, no design system) so it
 * stays visible even if something below it hangs or fails to paint.
 * Remove once the real cause of the launch hang is found.
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
 *
 * No native splash screen — removed entirely (along with the
 * `reactCompiler` experiment in `app.json`) while tracking down a launch
 * hang, so there's nothing hiding whatever state the app is actually in.
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
