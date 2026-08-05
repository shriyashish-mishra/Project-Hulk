import { useState, type ReactNode } from 'react';

import { Body, Button, Caption, Card, Column, Icon, Row, TextArea } from '@/components';
import { Sheet } from '@/components/dialog';
import { colors } from '@/core/theme';
import type { Preset } from '../types';

export interface PresetPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  emptyLabel: string;
  addPlaceholder: string;
  presets: Preset[];
  onSelect: (rawText: string) => void;
  onCreate: (rawText: string) => Promise<Preset>;
  onUpdate: (id: number, rawText: string) => Promise<Preset>;
  onDelete: (id: number) => Promise<void>;
  /** Optional structured preview for a preset's body — falls back to the raw, truncated text when omitted (food presets have no structure to render). */
  renderPresetBody?: (rawText: string) => ReactNode;
}

/**
 * Mirrors the web app's `PresetPickerDrawer`: a list of saved presets
 * (tap to pick, pencil to edit, trash to delete) plus an "Add" editor for
 * a new one. Unlike the web version, there's no local copy of `presets`
 * to reset on open — the `useFoodPresets`/`useWorkoutPresets` hook's own
 * state already stays live, this just renders it.
 */
export function PresetPickerSheet({
  visible,
  onClose,
  title,
  emptyLabel,
  addPlaceholder,
  presets,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  renderPresetBody,
}: PresetPickerSheetProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset the editor fresh every time the sheet opens — otherwise a
  // cancelled edit/add session would still be sitting there next time.
  const [wasVisible, setWasVisible] = useState(false);
  if (visible && !wasVisible) {
    setWasVisible(true);
    setEditingId(null);
    setAdding(false);
    setDraft('');
    setError(null);
  }
  if (!visible && wasVisible) {
    setWasVisible(false);
  }

  const isEditorOpen = adding || editingId !== null;

  function startEdit(preset: Preset) {
    setEditingId(preset.id);
    setAdding(false);
    setDraft(preset.rawText);
    setError(null);
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setDraft('');
    setError(null);
  }

  function cancelEditor() {
    setAdding(false);
    setEditingId(null);
    setDraft('');
    setError(null);
  }

  async function handleSaveDraft() {
    if (!draft.trim()) {
      setError('Write something first.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (editingId !== null) {
        await onUpdate(editingId, draft);
      } else {
        await onCreate(draft);
      }
      cancelEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    setSaving(true);
    try {
      await onDelete(id);
      if (editingId === id) cancelEditor();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setSaving(false);
    }
  }

  function handlePick(rawText: string) {
    onSelect(rawText);
    onClose();
  }

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <Column gap="base">
        {presets.length === 0 && !isEditorOpen && <Caption color="mutedForeground">{emptyLabel}</Caption>}

        {presets.map((preset) =>
          editingId === preset.id ? (
            <Column key={preset.id} gap="sm" style={{ backgroundColor: colors.muted, borderRadius: 16, padding: 12 }}>
              <TextArea value={draft} onChangeText={setDraft} minHeight={96} maxHeight={200} />
              <Row gap="sm">
                <Button size="sm" loading={saving} onPress={handleSaveDraft}>
                  Save
                </Button>
                <Button variant="ghost" size="sm" disabled={saving} onPress={cancelEditor}>
                  Cancel
                </Button>
              </Row>
            </Column>
          ) : (
            <Card key={preset.id}>
              <Row gap="sm" align="center">
                <Card
                  pressable
                  onPress={() => handlePick(preset.rawText)}
                  padding="none"
                  style={{ flex: 1, backgroundColor: 'transparent' }}
                >
                  {renderPresetBody ? (
                    renderPresetBody(preset.rawText)
                  ) : (
                    <Body numberOfLines={2}>{preset.rawText}</Body>
                  )}
                </Card>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => startEdit(preset)}
                  accessibilityLabel="Edit"
                  leftIcon={<Icon name="edit" size={16} color={colors.mutedForeground} />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={saving}
                  onPress={() => handleDelete(preset.id)}
                  accessibilityLabel="Delete"
                  leftIcon={<Icon name="trash" size={16} color={colors.mutedForeground} />}
                />
              </Row>
            </Card>
          ),
        )}

        {adding && (
          <Column gap="sm" style={{ backgroundColor: colors.muted, borderRadius: 16, padding: 12 }}>
            <TextArea value={draft} onChangeText={setDraft} placeholder={addPlaceholder} minHeight={96} maxHeight={200} />
            <Row gap="sm">
              <Button size="sm" loading={saving} onPress={handleSaveDraft}>
                Save
              </Button>
              <Button variant="ghost" size="sm" disabled={saving} onPress={cancelEditor}>
                Cancel
              </Button>
            </Row>
          </Column>
        )}

        {error && <Caption color="destructive">{error}</Caption>}

        {!isEditorOpen && (
          <Button variant="secondary" fullWidth onPress={startAdd} leftIcon={<Icon name="plus" size={16} />}>
            Add
          </Button>
        )}
      </Column>
    </Sheet>
  );
}
