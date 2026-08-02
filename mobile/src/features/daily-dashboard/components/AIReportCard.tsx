import { useState } from 'react';

import { Button, Card, Column, Row, StatCard } from '@/components';
import { Body, Subtitle } from '@/components/typography';
import { clipboard } from '@/core/clipboard';
import { sharing } from '@/core/sharing';
import { AIReportSheet, ViewReportSheet } from '@/features/ai/components';
import { useAIReport } from '@/features/ai/hooks';
import type { ClaudePromptPackage } from '@/features/ai/types';

export interface AIReportCardProps {
  date: string;
}

/**
 * The Journal dashboard's bottom card — matches web's `NightlyReportCard`:
 * once a report exists for `date` it shows the summary and scores plus a
 * way to re-read or regenerate it, rather than just a bare "Generate"
 * button forever.
 */
export function AIReportCard({ date }: AIReportCardProps) {
  const { latestReport, loading, preparing, prepareReport, refresh } = useAIReport(date);
  const [promptPackage, setPromptPackage] = useState<ClaudePromptPackage | null>(null);
  const [pasteSheetVisible, setPasteSheetVisible] = useState(false);
  const [viewSheetVisible, setViewSheetVisible] = useState(false);

  function handlePasteSheetClose() {
    setPasteSheetVisible(false);
    refresh();
  }

  async function handleGenerate() {
    const nextPromptPackage = await prepareReport();
    await clipboard.copy(nextPromptPackage.text);
    setPromptPackage(nextPromptPackage);
    setPasteSheetVisible(true);
    // Fire-and-forget — if the user cancels the share sheet the prompt is
    // already on their clipboard, so there's nothing to recover from.
    sharing.share(nextPromptPackage.text);
  }

  return (
    <Card>
      <Column gap="base">
        <Subtitle>AI Report</Subtitle>

        {!loading && latestReport ? (
          <>
            <Body color="mutedForeground" numberOfLines={3}>
              {latestReport.summary}
            </Body>
            <Row gap="sm">
              <Column style={{ flex: 1 }}>
                <StatCard label="Nutrition" value={latestReport.scores.nutrition} unit="/ 100" />
              </Column>
              <Column style={{ flex: 1 }}>
                <StatCard label="Activity" value={latestReport.scores.activity} unit="/ 100" />
              </Column>
              <Column style={{ flex: 1 }}>
                <StatCard label="Recovery" value={latestReport.scores.recovery} unit="/ 100" />
              </Column>
            </Row>
            <Row gap="sm">
              <Button variant="secondary" size="sm" onPress={() => setViewSheetVisible(true)} style={{ flex: 1 }}>
                View Full Report
              </Button>
              <Button variant="ghost" size="sm" onPress={handleGenerate} loading={preparing} style={{ flex: 1 }}>
                Regenerate
              </Button>
            </Row>
          </>
        ) : (
          <>
            <Body color="mutedForeground">
              Turn this day&apos;s journal, meals, and activity into a short coaching report from Claude.
            </Body>
            <Button onPress={handleGenerate} loading={preparing} fullWidth>
              Generate Report
            </Button>
          </>
        )}
      </Column>

      <AIReportSheet
        visible={pasteSheetVisible}
        onClose={handlePasteSheetClose}
        promptPackage={promptPackage}
        date={date}
      />
      <ViewReportSheet visible={viewSheetVisible} onClose={() => setViewSheetVisible(false)} report={latestReport} />
    </Card>
  );
}
