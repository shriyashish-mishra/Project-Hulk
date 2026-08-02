import { useState } from 'react';
import { View, type GestureResponderEvent } from 'react-native';

import { Button, Card, Column, Icon, Row } from '@/components';
import { Body, Caption } from '@/components/typography';
import { colors, radius } from '@/core/theme';
import { useWaterLog } from '../hooks';
import { WaterHistorySheet } from './WaterHistorySheet';

/** Matches web's default glass size (`water_logs.glass_size_ml` default) — the unit both the +/− steppers and the dot grid count in. */
const GLASS_SIZE_ML = 250;

export interface WaterQuickActionCardProps {
  date?: string;
}

/**
 * Self-contained dashboard widget — reads and writes one day's water log.
 * Rebuilt to match web's `WaterRow` exactly: count in glasses (not raw
 * ml), a dot grid showing progress toward the target, and +/− stepping
 * one glass at a time — rather than mobile's earlier +250ml/+500ml
 * quick-add buttons, which was a different interaction model for the
 * same feature. Stays inline rather than behind a `Sheet` like
 * Food/Workout/Sleep, matching web's one exception to its
 * row-opens-drawer pattern: logging water needs to take under a second.
 */
export function WaterQuickActionCard({ date }: WaterQuickActionCardProps) {
  const { totalMl, goalMl, entries, addWater, undoLast, setGoal } = useWaterLog(date);
  const [historyVisible, setHistoryVisible] = useState(false);

  const glassCount = Math.round(totalMl / GLASS_SIZE_ML);
  const targetGlasses = Math.max(1, Math.round(goalMl / GLASS_SIZE_ML));
  const dotCount = Math.max(targetGlasses, glassCount);
  const liters = totalMl / 1000;

  async function handleAdd(event: GestureResponderEvent) {
    event.stopPropagation();
    await addWater(GLASS_SIZE_ML);
  }

  async function handleRemove(event: GestureResponderEvent) {
    event.stopPropagation();
    if (entries.length === 0) return;
    await undoLast();
  }

  return (
    <>
      <Card pressable onPress={() => setHistoryVisible(true)} accessibilityLabel="Water history and goal">
        <Column gap="base">
          <Row justify="space-between" align="center">
            <Body weight="semiBold">Water</Body>
            <Row gap="md" align="center">
              <Button
                variant="secondary"
                size="sm"
                onPress={handleRemove}
                disabled={entries.length === 0}
                accessibilityLabel="Remove a glass"
                leftIcon={<Icon name="close" size={16} color={colors.mutedForeground} />}
              />
              <Button
                variant="primary"
                size="sm"
                onPress={handleAdd}
                accessibilityLabel="Add a glass"
                leftIcon={<Icon name="plus" size={16} color={colors.primaryForeground} />}
              />
            </Row>
          </Row>

          <Row gap="xs" wrap>
            {Array.from({ length: dotCount }, (_, index) => (
              <View
                key={index}
                style={[styles.dot, index < glassCount ? styles.dotFilled : styles.dotEmpty]}
              />
            ))}
          </Row>

          <Caption color="mutedForeground">
            {glassCount} {glassCount === 1 ? 'glass' : 'glasses'} · {liters.toFixed(1)} L
          </Caption>
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

const styles = {
  dot: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: 2,
  },
  dotFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  dotEmpty: {
    borderColor: colors.muted,
    backgroundColor: colors.muted,
  },
};
