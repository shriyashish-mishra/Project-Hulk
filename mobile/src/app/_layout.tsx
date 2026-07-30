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
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ToastHost } from '@/components/dialog';
import { colors } from '@/core/theme';
import { DATABASE_NAME, runMigrations } from '@/core/storage';

SplashScreen.preventAutoHideAsync();

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
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={runMigrations}>
      <ThemeProvider value={projectHulkTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        <ToastHost />
      </ThemeProvider>
    </SQLiteProvider>
  );
}
