import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/core/theme';
import { Button } from '../button/Button';
import { Column } from '../layout/Column';
import { Row } from '../layout/Row';
import { Body, Subtitle } from '../typography';

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders the confirm button as `destructive` instead of `primary` — for genuinely destructive actions (delete, discard). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A simple centered "are you sure?" dialog, backed by React Native's
 * built-in `Modal` — this is the one exception to "Bottom Sheets and
 * Modals come in the next milestone": a general-purpose reusable Modal
 * primitive is deferred, but a confirmation dialog is common enough
 * (and small enough) to need one now.
 */
export function ConfirmationDialog({
  visible,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Dismiss">
        <Pressable onPress={(event) => event.stopPropagation()} style={styles.cardWrapper}>
          <View style={styles.card}>
            <Column gap="sm">
              <Subtitle>{title}</Subtitle>
              {description && <Body color="mutedForeground">{description}</Body>}
            </Column>
            <Row gap="sm" style={{ marginTop: spacing.lg }}>
              <Button variant="secondary" fullWidth onPress={onCancel} style={{ flex: 1 }}>
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? 'destructive' : 'primary'}
                fullWidth
                onPress={onConfirm}
                style={{ flex: 1 }}
              >
                {confirmLabel}
              </Button>
            </Row>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  card: {
    backgroundColor: colors.popover,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
});
