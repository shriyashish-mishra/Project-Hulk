import { useState } from 'react';

import { Button, Caption, Card, Column, Icon, Row, TextArea } from '@/components';
import { Label } from '@/components/typography';
import { colors } from '@/core/theme';
import { haptics } from '@/core/haptics';
import { PresetPickerSheet } from '@/features/presets/components';
import type { UsePresetsResult } from '@/features/presets/hooks';
import type { FoodLog, MealType } from '../types';

const PRESET_PLACEHOLDER = '2 egg omelette\nCoffee\n\nor\n\n1 bowl upma\n1 bowl watermelon';

export interface MealEntryRowProps {
  mealType: MealType;
  label: string;
  entry: FoodLog | null;
  onSave: (mealType: MealType, rawText: string) => Promise<void>;
  onDelete: (mealType: MealType) => Promise<void>;
  /** Shared across all four meal rows — the same saved meal can apply to breakfast or dinner alike. */
  presets: UsePresetsResult;
}

/** One meal slot inside the Food sheet — saves on blur rather than needing its own button, so filling in all four feels like one continuous action. */
export function MealEntryRow({ mealType, label, entry, onSave, onDelete, presets }: MealEntryRowProps) {
  const [draft, setDraft] = useState(entry?.rawText ?? '');
  const [presetPickerVisible, setPresetPickerVisible] = useState(false);

  async function handleBlur() {
    if (draft.trim() === (entry?.rawText ?? '')) return;
    await onSave(mealType, draft);
    if (draft.trim()) haptics.success();
  }

  async function handleDelete() {
    setDraft('');
    await onDelete(mealType);
    haptics.light();
  }

  function handlePickPreset(rawText: string) {
    setDraft((prev) => (prev.trim() ? `${prev}\n${rawText}` : rawText));
  }

  return (
    <Column gap="xs">
      <Row justify="space-between" align="center">
        <Label color="mutedForeground">{label}</Label>
        <Row gap="base" align="center">
          <Card pressable onPress={() => setPresetPickerVisible(true)} padding="none" style={{ backgroundColor: 'transparent' }}>
            <Row gap="xs" align="center">
              <Icon name="bookmark" size={12} color={colors.primary} />
              <Caption weight="semiBold" color="primary">
                Saved
              </Caption>
            </Row>
          </Card>
          {entry && (
            <Button
              variant="ghost"
              size="sm"
              onPress={handleDelete}
              accessibilityLabel={`Delete ${label}`}
              leftIcon={<Icon name="trash" size={16} />}
            />
          )}
        </Row>
      </Row>
      <TextArea
        value={draft}
        onChangeText={setDraft}
        onBlur={handleBlur}
        placeholder="e.g. 250g chicken, rice, salad"
        minHeight={48}
        maxHeight={160}
      />

      <PresetPickerSheet
        visible={presetPickerVisible}
        onClose={() => setPresetPickerVisible(false)}
        title="Saved meals"
        emptyLabel="No saved meals yet. Add the ones you eat often."
        addPlaceholder={PRESET_PLACEHOLDER}
        presets={presets.presets}
        onSelect={handlePickPreset}
        onCreate={presets.create}
        onUpdate={presets.update}
        onDelete={presets.remove}
      />
    </Column>
  );
}
