import { getTodayDateString } from '@/core/utils';
import { DailyDashboardScreen } from '@/features/daily-dashboard';

/** Today's dashboard — mirrors web's `/`. Backfilled days render through the sibling `[date]` route instead. */
export default function TodayJournalScreen() {
  return <DailyDashboardScreen date={getTodayDateString()} />;
}
