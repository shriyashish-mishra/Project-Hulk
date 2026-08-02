import { useState } from 'react';
import { Pressable } from 'react-native';

import { Sheet } from '@/components/dialog';
import { colors, spacing } from '@/core/theme';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Input } from '../input/Input';
import { Column } from '../layout/Column';
import { Row } from '../layout/Row';
import { Body } from '../typography';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface DateNavHeaderProps {
  /** The formatted label shown between the arrows, e.g. "Today, Aug 2", "Aug 3 – Aug 9", or "August 2026". */
  label: string;
  onPrev: () => void;
  onNext: () => void;
  /** Grays out and disables the next arrow — used once navigation would move into the future. */
  nextDisabled?: boolean;
  /** The current period's own date, pre-filling the jump-to-date field — always a plain `YYYY-MM-DD` day, even when `label` describes a week/month. */
  jumpDateValue: string;
  onJumpToDate: (date: string) => void;
}

/**
 * The one prev/next/jump-to-date control used everywhere a screen
 * navigates by date — the Journal dashboard's header and every Progress
 * view. Mirrors web's `date-nav.tsx` interaction (chevrons step the
 * period, tapping the label opens a picker), but uses a plain `YYYY-MM-DD`
 * text field instead of a native date input — React Native has no
 * built-in equivalent, and a plain text field already the established
 * convention in this app (see `ProfileSheet`'s date-of-birth field)
 * rather than adding a native date-picker dependency for this alone.
 */
export function DateNavHeader({ label, onPrev, onNext, nextDisabled, jumpDateValue, onJumpToDate }: DateNavHeaderProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draft, setDraft] = useState(jumpDateValue);
  const [error, setError] = useState<string | null>(null);

  function openPicker() {
    setDraft(jumpDateValue);
    setError(null);
    setPickerVisible(true);
  }

  function handleGo() {
    const trimmed = draft.trim();
    if (!DATE_PATTERN.test(trimmed)) {
      setError('Use YYYY-MM-DD, e.g. 2026-08-02');
      return;
    }
    onJumpToDate(trimmed);
    setPickerVisible(false);
  }

  return (
    <>
      <Row align="center" justify="space-between">
        <Pressable onPress={onPrev} hitSlop={10} accessibilityRole="button" accessibilityLabel="Previous">
          <Icon name="chevronLeft" size={22} color={colors.mutedForeground} />
        </Pressable>
        <Pressable onPress={openPicker} accessibilityRole="button" accessibilityLabel="Jump to date">
          <Body weight="semiBold">{label}</Body>
        </Pressable>
        <Pressable
          onPress={nextDisabled ? undefined : onNext}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Next"
          disabled={nextDisabled}
        >
          <Icon name="chevronRight" size={22} color={nextDisabled ? colors.border : colors.mutedForeground} />
        </Pressable>
      </Row>

      <Sheet visible={pickerVisible} title="Jump to Date" onClose={() => setPickerVisible(false)}>
        <Column gap="base">
          <Input
            value={draft}
            onChangeText={(text) => {
              setDraft(text);
              setError(null);
            }}
            placeholder="2026-08-02"
            error={error ?? undefined}
            autoFocus
          />
          <Button onPress={handleGo} fullWidth style={{ marginTop: spacing.xs }}>
            Go
          </Button>
        </Column>
      </Sheet>
    </>
  );
}
