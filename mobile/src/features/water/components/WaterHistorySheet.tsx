import { useState } from 'react';

import { Button, Column, NumberInput, Row } from '@/components';
import { Sheet } from '@/components/dialog';
import { Body, Caption } from '@/components/typography';
import type { WaterEntry } from '../types';
import { formatLiters } from '../utils';

export interface WaterHistorySheetProps {
  visible: boolean;
  onClose: () => void;
  entries: WaterEntry[];
  goalMl: number;
  onSetGoal: (goalMl: number) => Promise<void>;
}

function formatTime(sqliteTimestamp: string): string {
  // SQLite's datetime('now') is UTC with no timezone suffix — make that explicit before parsing.
  const date = new Date(`${sqliteTimestamp.replace(' ', 'T')}Z`);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Today's individual water entries plus the goal editor — the detail view the inline Home card doesn't have room for. */
export function WaterHistorySheet({ visible, onClose, entries, goalMl, onSetGoal }: WaterHistorySheetProps) {
  const [goalDraft, setGoalDraft] = useState(String(goalMl));

  // Re-sync the draft every time the sheet opens, so it always reflects
  // the current goal rather than whatever was typed the last time it was
  // open (React's "adjust state during render" pattern, not an effect).
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setGoalDraft(String(goalMl));
    }
  }

  async function handleSaveGoal() {
    const parsed = Number(goalDraft);
    if (!goalDraft || Number.isNaN(parsed) || parsed <= 0) return;
    await onSetGoal(parsed);
  }

  return (
    <Sheet visible={visible} title="Water History" onClose={onClose}>
      <Column gap="lg">
        <Column gap="sm">
          <Caption color="mutedForeground">Daily goal (ml)</Caption>
          <Row gap="sm" align="center">
            <Column style={{ flex: 1 }}>
              <NumberInput value={goalDraft} onChangeText={setGoalDraft} placeholder="ml" />
            </Column>
            <Button size="sm" onPress={handleSaveGoal}>
              Save
            </Button>
          </Row>
        </Column>

        <Column gap="sm">
          <Caption color="mutedForeground">Today</Caption>
          {entries.length === 0 ? (
            <Body color="mutedForeground">Nothing logged yet today.</Body>
          ) : (
            entries
              .slice()
              .reverse()
              .map((entry) => (
                <Row key={entry.id} justify="space-between">
                  <Body>{formatLiters(entry.amountMl)}</Body>
                  <Caption color="mutedForeground">{formatTime(entry.createdAt)}</Caption>
                </Row>
              ))
          )}
        </Column>
      </Column>
    </Sheet>
  );
}
