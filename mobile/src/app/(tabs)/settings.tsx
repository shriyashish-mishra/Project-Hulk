import { useState } from 'react';
import { Link } from 'expo-router';

import { Button, Column, Row, ScrollScreen, Section } from '@/components';
import { Body, Caption } from '@/components/typography';
import { CycleSheet } from '@/features/cycle/components';
import { useCycleSettings } from '@/features/cycle/hooks';

export default function SettingsScreen() {
  const { enabled, loading, setEnabled } = useCycleSettings();
  const [cycleSheetVisible, setCycleSheetVisible] = useState(false);

  return (
    <ScrollScreen edges={['top', 'left', 'right']}>
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
    </ScrollScreen>
  );
}
