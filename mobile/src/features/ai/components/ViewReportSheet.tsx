import { Sheet } from '@/components/dialog';
import type { AIReport } from '../types';
import { AIReportSummary } from './AIReportSummary';

export interface ViewReportSheetProps {
  visible: boolean;
  onClose: () => void;
  report: AIReport | null;
}

/** Read-only view of an already-saved report — the Journal dashboard's equivalent of Insights' report-detail sheet, opened from the dashboard's AI Report row instead of a history list. */
export function ViewReportSheet({ visible, onClose, report }: ViewReportSheetProps) {
  return (
    <Sheet visible={visible} title="Report" onClose={onClose}>
      {report && <AIReportSummary report={report} parseWarnings={[]} />}
    </Sheet>
  );
}
