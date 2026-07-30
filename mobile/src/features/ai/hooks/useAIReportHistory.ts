import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { AIReportService } from '../services';
import type { AIReport, AIReportScores } from '../types';

export interface UseAIReportHistoryResult {
  reports: AIReport[];
  weeklyAverage: AIReportScores | null;
  loading: boolean;
  deleteReport: (id: number) => Promise<void>;
}

/** Powers the Insights screen — recent report history plus a simple this-week average, nothing else. */
export function useAIReportHistory(): UseAIReportHistoryResult {
  const db = useSQLiteContext();
  const [reports, setReports] = useState<AIReport[]>([]);
  const [weeklyAverage, setWeeklyAverage] = useState<AIReportScores | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    Promise.all([AIReportService.getRecentReports(db), AIReportService.getWeeklyAverageScores(db)]).then(
      ([recentReports, average]) => {
        setReports(recentReports);
        setWeeklyAverage(average);
        setLoading(false);
      },
    );
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteReport = useCallback(
    async (id: number) => {
      await AIReportService.deleteReport(db, id);
      refresh();
    },
    [db, refresh],
  );

  return { reports, weeklyAverage, loading, deleteReport };
}
