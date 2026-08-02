import { useState } from 'react';

import { Button, Column, NumberInput, Row } from '@/components';
import { Sheet, toast } from '@/components/dialog';
import { Caption } from '@/components/typography';
import { haptics } from '@/core/haptics';
import { useWeightLog } from '../hooks';
import { WeightHistorySheet } from './WeightHistorySheet';

export interface WeightSheetProps {
  visible: boolean;
  onClose: () => void;
  date: string;
}

/** The Journal dashboard's Weight row, opened as a sheet — same log/History actions the old always-visible Home card had, just behind a tap instead of inline. */
export function WeightSheet({ visible, onClose, date }: WeightSheetProps) {
  const { weightLog, loading, saveWeight } = useWeightLog(date);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  if (!loading && !hydrated) {
    setHydrated(true);
    setDraft(weightLog ? String(weightLog.weightKg) : '');
  }

  async function handleSave() {
    const weightKg = Number(draft);
    if (!draft || Number.isNaN(weightKg) || weightKg <= 0) return;
    setSaving(true);
    try {
      await saveWeight(weightKg);
      haptics.success();
      toast.success('Weight logged');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setHydrated(false);
    onClose();
  }

  return (
    <>
      <Sheet visible={visible} title="Weight" onClose={handleClose}>
        <Column gap="lg">
          <Row justify="space-between" align="center">
            <Caption color="mutedForeground">
              {weightLog ? `Logged: ${weightLog.weightKg} kg` : 'Not logged for this day'}
            </Caption>
            <Button variant="ghost" size="sm" onPress={() => setHistoryVisible(true)}>
              History
            </Button>
          </Row>
          <Row gap="sm" align="center">
            <Column style={{ flex: 1 }}>
              <NumberInput value={draft} onChangeText={setDraft} allowDecimal placeholder="kg" />
            </Column>
            <Button onPress={handleSave} loading={saving} disabled={!draft}>
              Log
            </Button>
          </Row>
        </Column>
      </Sheet>
      <WeightHistorySheet visible={historyVisible} onClose={() => setHistoryVisible(false)} />
    </>
  );
}
