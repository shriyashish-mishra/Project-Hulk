import { useState } from 'react';

import { Button, Card, Column, NumberInput, Row } from '@/components';
import { Caption } from '@/components/typography';
import { haptics } from '@/core/haptics';
import { toast } from '@/components/dialog';
import { useWeightLog } from '../hooks';
import { WeightHistorySheet } from './WeightHistorySheet';

/** Self-contained home-screen widget — weight isn't logged daily, so this always shows the most recent entry, not just today's. */
export function WeightQuickActionCard() {
  const { latestWeightLog, saveWeight } = useWeightLog();
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  async function handleSave() {
    const weightKg = Number(draft);
    if (!draft || Number.isNaN(weightKg) || weightKg <= 0) return;
    setSaving(true);
    try {
      await saveWeight(weightKg);
      haptics.success();
      toast.success('Weight logged');
      setDraft('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card>
        <Column gap="sm">
          <Row justify="space-between" align="center">
            <Caption color="mutedForeground">Weight</Caption>
            <Row gap="sm" align="center">
              {latestWeightLog && (
                <Caption color="mutedForeground">Last: {latestWeightLog.weightKg} kg</Caption>
              )}
              <Button variant="ghost" size="sm" onPress={() => setHistoryVisible(true)}>
                History
              </Button>
            </Row>
          </Row>
          <Row gap="sm" align="center">
            <Column style={{ flex: 1 }}>
              <NumberInput value={draft} onChangeText={setDraft} allowDecimal placeholder="kg" />
            </Column>
            <Button size="sm" onPress={handleSave} loading={saving} disabled={!draft}>
              Log
            </Button>
          </Row>
        </Column>
      </Card>
      <WeightHistorySheet visible={historyVisible} onClose={() => setHistoryVisible(false)} />
    </>
  );
}
