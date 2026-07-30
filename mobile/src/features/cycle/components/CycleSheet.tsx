import { useState } from 'react';

import { Button, Column, Icon, Row } from '@/components';
import { ConfirmationDialog, Sheet, toast } from '@/components/dialog';
import { Body, Caption } from '@/components/typography';
import { haptics } from '@/core/haptics';
import { useCycleLog } from '../hooks';

export interface CycleSheetProps {
  visible: boolean;
  onClose: () => void;
}

function formatRange(startDate: string, endDate: string | null): string {
  const start = new Date(`${startDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  if (!endDate) return `${start} – ongoing`;
  const end = new Date(`${endDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${start} – ${end}`;
}

/** Manual start/end logging only — no phase math, no predictions, no notifications. */
export function CycleSheet({ visible, onClose }: CycleSheetProps) {
  const { activeLog, recentLogs, loading, startPeriod, endPeriod, deletePeriod } = useCycleLog();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  async function handlePress() {
    if (activeLog) {
      await endPeriod();
      toast.success('Period ended');
    } else {
      await startPeriod();
      toast.success('Period started');
    }
    haptics.success();
  }

  async function handleConfirmDelete() {
    if (pendingDeleteId === null) return;
    await deletePeriod(pendingDeleteId);
    setPendingDeleteId(null);
    haptics.light();
  }

  return (
    <Sheet visible={visible} title="Cycle Tracking" onClose={onClose}>
      <Column gap="lg">
        <Button onPress={handlePress} loading={loading} fullWidth>
          {activeLog ? 'End Period' : 'Start Period'}
        </Button>

        <Column gap="sm">
          <Caption color="mutedForeground">Recent</Caption>
          {!loading && recentLogs.length === 0 && <Body color="mutedForeground">Nothing logged yet.</Body>}
          {recentLogs.map((log) => (
            <Row key={log.id} justify="space-between" align="center">
              <Body>{formatRange(log.startDate, log.endDate)}</Body>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setPendingDeleteId(log.id)}
                accessibilityLabel={`Delete period logged ${formatRange(log.startDate, log.endDate)}`}
                leftIcon={<Icon name="trash" size={16} />}
              />
            </Row>
          ))}
        </Column>
      </Column>

      <ConfirmationDialog
        visible={pendingDeleteId !== null}
        title="Delete this entry?"
        description="This removes the logged period entirely. This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </Sheet>
  );
}
