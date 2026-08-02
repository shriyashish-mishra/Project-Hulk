import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, Column, TextArea } from '@/components';
import { Sheet, toast } from '@/components/dialog';
import { clipboard } from '@/core/clipboard';
import { importBackup } from '@/core/backup';

export interface ImportBackupSheetProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * The restore side of the Export/Import pair — paste the JSON text an
 * older install's "Export All Data" produced (from the clipboard, or
 * typed/pasted from wherever it was saved), then write it into this
 * install's own database. On-device only: no server, no file picker, no
 * new native dependency.
 */
export function ImportBackupSheet({ visible, onClose }: ImportBackupSheetProps) {
  const db = useSQLiteContext();
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);

  async function handlePaste() {
    const clipboardText = await clipboard.paste();
    setText(clipboardText);
  }

  async function handleImport() {
    if (!text.trim()) {
      toast.error('Paste your backup text first.');
      return;
    }
    setImporting(true);
    try {
      const summary = await importBackup(db, text);
      toast.success(`Restored ${summary.rowsImported} rows across ${summary.tablesImported.length} tables`);
      setText('');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <Sheet visible={visible} title="Import Data" onClose={onClose}>
      <Column gap="base">
        <TextArea
          value={text}
          onChangeText={setText}
          placeholder="Paste your exported backup text here"
          minHeight={140}
          maxHeight={320}
        />
        <Button variant="secondary" onPress={handlePaste}>
          Paste from Clipboard
        </Button>
        <Button onPress={handleImport} loading={importing} fullWidth>
          Restore
        </Button>
      </Column>
    </Sheet>
  );
}
