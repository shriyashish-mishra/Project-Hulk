import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { AIReportService } from '../services';
import type { AIReport, ClaudePromptPackage } from '../types';

export interface UseAIReportResult {
  latestReport: AIReport | null;
  loading: boolean;
  preparing: boolean;
  /** Builds today's context and prompt — call this first, then hand the result to `submitResponse` once the user pastes Claude's reply back. */
  prepareReport: () => Promise<ClaudePromptPackage>;
  submitResponse: (
    promptPackage: ClaudePromptPackage,
    rawResponse: string,
  ) => Promise<{ report: AIReport; parseWarnings: string[] }>;
  /** Re-fetches without a fresh mount — for a sibling `AIReportSheet` instance (its own hook instance) that just saved a report this caller needs to reflect. */
  refresh: () => void;
}

/** Powers the "Generate Today's Report" flow — the AI feature's only public hook. */
export function useAIReport(date: string = getTodayDateString()): UseAIReportResult {
  const db = useSQLiteContext();
  const [latestReport, setLatestReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    AIReportService.getLatestReport(db, date).then((report) => {
      setLatestReport(report);
      setLoading(false);
    });
  }, [db, date]);

  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const prepareReport = useCallback(async () => {
    setPreparing(true);
    try {
      return await AIReportService.prepareReport(db, date);
    } finally {
      setPreparing(false);
    }
  }, [db, date]);

  const submitResponse = useCallback(
    async (promptPackage: ClaudePromptPackage, rawResponse: string) => {
      const { report, parseWarnings } = await AIReportService.submitResponse(db, date, promptPackage, rawResponse);
      setLatestReport(report);
      return { report, parseWarnings };
    },
    [db, date],
  );

  return { latestReport, loading, preparing, prepareReport, submitResponse, refresh };
}
