import { useState } from 'react';

import { Button, Column, EmptyState, Row, ScrollScreen, Section, StatCard } from '@/components';
import { ConfirmationDialog, Sheet } from '@/components/dialog';
import { Body, Title } from '@/components/typography';
import { AIReportHistoryItem, AIReportSummary } from '@/features/ai/components';
import { useAIReportHistory } from '@/features/ai/hooks';
import type { AIReport } from '@/features/ai/types';

export default function InsightsScreen() {
  const { reports, weeklyAverage, loading, deleteReport } = useAIReportHistory();
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleConfirmDelete() {
    if (!selectedReport) return;
    await deleteReport(selectedReport.id);
    setConfirmingDelete(false);
    setSelectedReport(null);
  }

  return (
    <ScrollScreen>
      <Column gap="xs">
        <Title>Insights</Title>
        <Body color="mutedForeground">What your reports have said over time.</Body>
      </Column>

      {!loading && reports.length === 0 ? (
        <EmptyState
          icon="insights"
          title="No reports yet"
          description="Generate your first report from Home to start building a history here."
        />
      ) : (
        <>
          {weeklyAverage && (
            <Section title="This Week">
              <Row gap="base" wrap>
                <Column style={{ flex: 1, minWidth: 100 }}>
                  <StatCard label="Nutrition" value={weeklyAverage.nutrition} unit="/ 100" />
                </Column>
                <Column style={{ flex: 1, minWidth: 100 }}>
                  <StatCard label="Activity" value={weeklyAverage.activity} unit="/ 100" />
                </Column>
                <Column style={{ flex: 1, minWidth: 100 }}>
                  <StatCard label="Recovery" value={weeklyAverage.recovery} unit="/ 100" />
                </Column>
              </Row>
            </Section>
          )}

          <Section title="Reports">
            <Column gap="base">
              {reports.map((report) => (
                <AIReportHistoryItem key={report.id} report={report} onPress={() => setSelectedReport(report)} />
              ))}
            </Column>
          </Section>
        </>
      )}

      <Sheet
        visible={selectedReport !== null}
        title={selectedReport?.date ?? 'Report'}
        onClose={() => setSelectedReport(null)}
      >
        {selectedReport && (
          <Column gap="lg">
            <AIReportSummary report={selectedReport} parseWarnings={[]} />
            <Button variant="destructive" onPress={() => setConfirmingDelete(true)} fullWidth>
              Delete Report
            </Button>
          </Column>
        )}
      </Sheet>

      <ConfirmationDialog
        visible={confirmingDelete}
        title="Delete this report?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </ScrollScreen>
  );
}
