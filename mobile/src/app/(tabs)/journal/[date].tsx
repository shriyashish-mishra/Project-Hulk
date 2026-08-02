import { useLocalSearchParams } from 'expo-router';

import { DailyDashboardScreen } from '@/features/daily-dashboard';

/** Any past (or future) day's dashboard — mirrors web's `/log/[date]`. */
export default function BackfillJournalScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  return <DailyDashboardScreen date={date} />;
}
