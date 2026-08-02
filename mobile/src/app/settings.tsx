import { useState } from 'react';
import { Link, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, Column, Icon, Row, ScrollScreen, Section } from '@/components';
import { Body, Caption, Title } from '@/components/typography';
import { toast } from '@/components/dialog';
import { ImportBackupSheet } from '@/components/backup';
import { exportBackup } from '@/core/backup';
import { clipboard } from '@/core/clipboard';
import { ImportReportsCsvSheet } from '@/features/ai/components';
import { CycleSheet } from '@/features/cycle/components';
import { useCycleSettings } from '@/features/cycle/hooks';
import { ProfileSheet } from '@/features/profile/components';
import { useProfile } from '@/features/profile/hooks';

function formatTargetsSummary(targets: ReturnType<typeof useProfile>['targets']): string {
  if (!targets?.calorieRangeKcal) return 'Fill in your goal, height, and activity level to see targets.';
  return `${targets.calorieRangeKcal.min}–${targets.calorieRangeKcal.max} kcal · ${targets.proteinTargetG}g protein/day`;
}

/**
 * A stack route (pushed from the gear icon on Journal/Progress headers),
 * not a bottom tab — matches web's Settings/Profile being reached via a
 * header avatar icon rather than a nav destination.
 */
export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { enabled, loading, setEnabled } = useCycleSettings();
  const { targets } = useProfile();
  const [cycleSheetVisible, setCycleSheetVisible] = useState(false);
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);
  const [importSheetVisible, setImportSheetVisible] = useState(false);
  const [csvImportSheetVisible, setCsvImportSheetVisible] = useState(false);
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
    <ScrollScreen>
      <Row align="center" gap="sm">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          accessibilityLabel="Back"
          leftIcon={<Icon name="chevronLeft" size={22} />}
        />
        <Title style={{ fontSize: 24 }}>Settings</Title>
      </Row>

      <Section title="Profile & Targets">
        <Row justify="space-between" align="center">
          <Column gap="xs" style={{ flex: 1 }}>
            <Body>{formatTargetsSummary(targets)}</Body>
          </Column>
          <Button variant="secondary" size="sm" onPress={() => setProfileSheetVisible(true)}>
            Edit
          </Button>
        </Row>
      </Section>

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

      <Section title="Report History">
        <Body color="mutedForeground">
          Have past reports on the web app? Export them as a CSV from /report/export there, then bring them into
          your Progress history here.
        </Body>
        <Button variant="secondary" onPress={() => setCsvImportSheetVisible(true)}>
          Import Reports (CSV)
        </Button>
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
      <ProfileSheet visible={profileSheetVisible} onClose={() => setProfileSheetVisible(false)} />
      <ImportBackupSheet visible={importSheetVisible} onClose={() => setImportSheetVisible(false)} />
      <ImportReportsCsvSheet visible={csvImportSheetVisible} onClose={() => setCsvImportSheetVisible(false)} />
    </ScrollScreen>
  );
}
