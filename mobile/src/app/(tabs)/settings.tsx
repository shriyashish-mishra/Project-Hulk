import { useState } from 'react';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, Column, Row, ScrollScreen, Section } from '@/components';
import { Body, Caption } from '@/components/typography';
import { toast } from '@/components/dialog';
import { ImportBackupSheet } from '@/components/backup';
import { exportBackup } from '@/core/backup';
import { clipboard } from '@/core/clipboard';
import { CycleSheet } from '@/features/cycle/components';
import { useCycleSettings } from '@/features/cycle/hooks';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { enabled, loading, setEnabled } = useCycleSettings();
  const [cycleSheetVisible, setCycleSheetVisible] = useState(false);
  const [importSheetVisible, setImportSheetVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const json = await exportBackup(db);
      await clipboard.copy(json);
      toast.success('Copied to clipboard — paste it somewhere safe (Notes, email to yourself, etc.)');
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollScreen edges={['top', 'left', 'right']}>
      <Section title="Backup & Restore">
        <Body color="mutedForeground">
          Moving to a new install of the app? Export copies everything (except progress photo images)
          to your clipboard as text — paste it into the new install&apos;s Import to bring it all over.
        </Body>
        <Row gap="sm">
          <Button variant="secondary" onPress={handleExport} loading={exporting} style={{ flex: 1 }}>
            Export All Data
          </Button>
          <Button variant="secondary" onPress={() => setImportSheetVisible(true)} style={{ flex: 1 }}>
            Import Data
          </Button>
        </Row>
      </Section>

      <Section title="Health">
        <Row justify="space-between" align="center">
          <Column gap="xs" style={{ flex: 1 }}>
            <Body>Cycle Tracking</Body>
            <Caption color="mutedForeground">
              Opt-in, local-only manual period logging. No predictions, no reminders.
            </Caption>
          </Column>
          <Button
            variant={enabled ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setEnabled(!enabled)}
            disabled={loading}
          >
            {enabled ? 'On' : 'Off'}
          </Button>
        </Row>
        {enabled && (
          <Button variant="ghost" onPress={() => setCycleSheetVisible(true)}>
            Log a Period
          </Button>
        )}
      </Section>

      <Section title="Developer">
        <Link href="/showcase" asChild>
          <Button variant="secondary">Open Design System Showcase</Button>
        </Link>
      </Section>

      <CycleSheet visible={cycleSheetVisible} onClose={() => setCycleSheetVisible(false)} />
      <ImportBackupSheet visible={importSheetVisible} onClose={() => setImportSheetVisible(false)} />
    </ScrollScreen>
  );
}
