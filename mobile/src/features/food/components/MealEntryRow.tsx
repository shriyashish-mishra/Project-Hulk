import { useState } from 'react';

import { Button, Column, Icon, Row, TextArea } from '@/components';
import { Label } from '@/components/typography';
import { haptics } from '@/core/haptics';
import type { FoodLog, MealType } from '../types';

export interface MealEntryRowProps {
  mealType: MealType;
  label: string;
  entry: FoodLog | null;
  onSave: (mealType: MealType, rawText: string) => Promise<void>;
  onDelete: (mealType: MealType) => Promise<void>;
}

/** One meal slot inside the Food sheet — saves on blur rather than needing its own button, so filling in all four feels like one continuous action. */
export function MealEntryRow({ mealType, label, entry, onSave, onDelete }: MealEntryRowProps) {
  const [draft, setDraft] = useState(entry?.rawText ?? '');

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

  return (
    <Column gap="xs">
      <Row justify="space-between" align="center">
        <Label color="mutedForeground">{label}</Label>
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
      <TextArea
        value={draft}
        onChangeText={setDraft}
        onBlur={handleBlur}
        placeholder="e.g. 250g chicken, rice, salad"
        minHeight={48}
        maxHeight={160}
      />
    </Column>
  );
}
