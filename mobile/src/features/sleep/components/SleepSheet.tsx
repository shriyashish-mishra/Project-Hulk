import { useState } from 'react';

import { Button, Column, Input, Row } from '@/components';
import { Sheet, toast } from '@/components/dialog';
import { Caption } from '@/components/typography';
import { haptics } from '@/core/haptics';
import { useSleepLog } from '../hooks';
import { SLEEP_QUALITIES, SLEEP_QUALITY_LABELS, type SleepQuality } from '../types';
import { formatDuration, isValidTimeFormat } from '../utils';

export interface SleepSheetProps {
  visible: boolean;
  onClose: () => void;
}

const TIME_FORMAT_ERROR = 'Use 24-hour HH:MM, e.g. 22:30';

/** Bedtime, wake time, and a quality rating — duration is derived, never entered by hand. */
export function SleepSheet({ visible, onClose }: SleepSheetProps) {
  const { sleepLog, loading, saveSleep } = useSleepLog();
  const [saving, setSaving] = useState(false);
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState<SleepQuality | null>(null);
  const [bedtimeError, setBedtimeError] = useState<string | null>(null);
  const [wakeTimeError, setWakeTimeError] = useState<string | null>(null);

  const [hydrated, setHydrated] = useState(false);
  if (!loading && !hydrated) {
    setHydrated(true);
    setBedtime(sleepLog?.bedtime ?? '');
    setWakeTime(sleepLog?.wakeTime ?? '');
    setQuality(sleepLog?.quality ?? null);
  }

  /** Returns whether the current fields are valid — an empty field is valid (nothing to derive), a non-empty one must be a real HH:MM. */
  function validate(): boolean {
    const trimmedBedtime = bedtime.trim();
    const trimmedWakeTime = wakeTime.trim();
    const nextBedtimeError = trimmedBedtime && !isValidTimeFormat(trimmedBedtime) ? TIME_FORMAT_ERROR : null;
    const nextWakeTimeError = trimmedWakeTime && !isValidTimeFormat(trimmedWakeTime) ? TIME_FORMAT_ERROR : null;
    setBedtimeError(nextBedtimeError);
    setWakeTimeError(nextWakeTimeError);
    return !nextBedtimeError && !nextWakeTimeError;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await saveSleep({ bedtime: bedtime.trim() || null, wakeTime: wakeTime.trim() || null, quality });
      haptics.success();
      toast.success('Sleep logged');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet visible={visible} title="Sleep" onClose={onClose}>
      <Column gap="base">
        {sleepLog?.durationMinutes != null && (
          <Caption color="mutedForeground">Last saved: {formatDuration(sleepLog.durationMinutes)}</Caption>
        )}
        <Row gap="sm">
          <Column style={{ flex: 1 }}>
            <Input
              label="Bedtime"
              value={bedtime}
              onChangeText={(text) => {
                setBedtime(text);
                setBedtimeError(null);
              }}
              placeholder="22:30"
              error={bedtimeError ?? undefined}
            />
          </Column>
          <Column style={{ flex: 1 }}>
            <Input
              label="Wake time"
              value={wakeTime}
              onChangeText={(text) => {
                setWakeTime(text);
                setWakeTimeError(null);
              }}
              placeholder="07:00"
              error={wakeTimeError ?? undefined}
            />
          </Column>
        </Row>
        <Column gap="xs">
          <Caption color="mutedForeground">Quality</Caption>
          <Row gap="sm" wrap>
            {SLEEP_QUALITIES.map((option) => (
              <Button
                key={option}
                variant={quality === option ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setQuality(option)}
              >
                {SLEEP_QUALITY_LABELS[option]}
              </Button>
            ))}
          </Row>
        </Column>
        <Button onPress={handleSave} loading={saving} fullWidth>
          Save Sleep
        </Button>
      </Column>
    </Sheet>
  );
}
