import { Redirect } from 'expo-router';

/**
 * The `(tabs)` group's own root — reached at the bare `/` path, which
 * every cold app launch resolves to first. None of the three tabs
 * (`journal`/`workouts`/`progress`) is itself named `index`, so without
 * this file `/` matches nothing and the app opens straight into Expo
 * Router's "Unmatched Route" screen. This exists purely to redirect to
 * the default tab; it is never itself shown.
 */
export default function TabsIndexRedirect() {
  return <Redirect href="/journal" />;
}
