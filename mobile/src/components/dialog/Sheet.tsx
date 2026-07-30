import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/core/theme';
import { Icon } from '../icon/Icon';
import { Button } from '../button/Button';
import { Row } from '../layout/Row';
import { Subtitle } from '../typography';

export interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The app's one bottom-sheet primitive — a `Modal` with the OS's native
 * slide-up transition (`animationType="slide"`), not a hand-rolled
 * gesture-driven sheet. That's a deliberate scope choice: drag-to-dismiss
 * and snap points would pull in a much bigger dependency for a feature
 * this app doesn't need yet. Used for focused, single-purpose entry
 * (logging a meal, a workout, a night's sleep) that's a bit too much for
 * an inline Home card, but doesn't deserve a whole new screen either.
 */
export function Sheet({ visible, title, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <Row justify="space-between" align="center" style={{ marginBottom: spacing.base }}>
              <Subtitle>{title}</Subtitle>
              <Button
                variant="ghost"
                size="sm"
                onPress={onClose}
                accessibilityLabel="Close"
                leftIcon={<Icon name="close" />}
              />
            </Row>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.popover,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
});
