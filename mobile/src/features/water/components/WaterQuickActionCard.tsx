import { useState } from 'react';

import { Button, Card, Column, Row } from '@/components';
import { Caption, Heading } from '@/components/typography';
import { haptics } from '@/core/haptics';
import { useWaterLog } from '../hooks';
import { formatLiters } from '../utils';
import { WaterHistorySheet } from './WaterHistorySheet';

const QUICK_ADD_AMOUNTS_ML = [250, 500];

export interface WaterQuickActionCardProps {
  date?: string;
}

/**
 * Self-contained dashboard widget — reads and writes one day's water log.
 * Stays inline rather than behind a `Sheet` like Food/Workout/Sleep:
 * logging water needs to take under two seconds, and an extra
 * tap-to-open step would work against that — mirrors web's one exception
 * to its row-opens-drawer pattern.
 */
export function WaterQuickActionCard({ date }: WaterQuickActionCardProps) {
  const { totalMl, goalMl, entries, addWater, undoLast, setGoal } = useWaterLog(date);
  const [historyVisible, setHistoryVisible] = useState(false);

  async function handleAdd(amountMl: number) {
    await addWater(amountMl);
    haptics.success();
  }

  async function handleUndo() {
    await undoLast();
    haptics.light();
  }

  return (
    <>
      <Card>
        <Column gap="base">
          <Row justify="space-between" align="center">
            <Column gap="xs">
              <Caption color="mutedForeground">Water</Caption>
              <Row align="baseline" gap="xs">
                <Heading>{formatLiters(totalMl)}</Heading>
                <Caption color="mutedForeground">/ {formatLiters(goalMl)}</Caption>
              </Row>
            </Column>
            <Button variant="ghost" size="sm" onPress={() => setHistoryVisible(true)}>
              History
            </Button>
          </Row>
          <Row gap="sm" wrap>
            {QUICK_ADD_AMOUNTS_ML.map((amount) => (
              <Button key={amount} variant="secondary" size="sm" onPress={() => handleAdd(amount)}>
                +{amount}ml
              </Button>
            ))}
            <Button variant="ghost" size="sm" onPress={handleUndo} disabled={entries.length === 0}>
              Undo
            </Button>
          </Row>
        </Column>
      </Card>
      <WaterHistorySheet
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        entries={entries}
        goalMl={goalMl}
        onSetGoal={setGoal}
      />
    </>
  );
}
