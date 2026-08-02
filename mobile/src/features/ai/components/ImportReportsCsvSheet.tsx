import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, Column, TextArea } from '@/components';
import { Sheet, toast } from '@/components/dialog';
import { Caption } from '@/components/typography';
import { clipboard } from '@/core/clipboard';
import { importReportsFromCsv } from '../services';

export interface ImportReportsCsvSheetProps {
  visible: boolean;
  onClose: () => void;
}

const CSV_MIME_TYPES = ['text/csv', 'text/comma-separated-values', 'application/csv', 'text/plain', '*/*'];

/**
 * Backfills historical AI reports from the web app's `/report/export`
 * CSV. File picking is the primary path — it reads the file's bytes
 * directly, so it can't be corrupted by a phone keyboard's autocorrect
 * (e.g. straight quotes silently turned into curly ones, which would
 * break the CSV parser's quote handling) the way a copy/paste through
 * some intermediate notes app can be. Paste is kept as a fallback for
 * anyone who already has the text somewhere else. Every date that
 * already has a report is skipped, so this is always safe to re-run.
 */
export function ImportReportsCsvSheet({ visible, onClose }: ImportReportsCsvSheetProps) {
  const db = useSQLiteContext();
  const [text, setText] = useState('');
  const [picking, setPicking] = useState(false);
  const [importing, setImporting] = useState(false);

  async function runImport(csvText: string) {
    setImporting(true);
    try {
      const summary = await importReportsFromCsv(db, csvText);
      const parts = [`${summary.imported} imported`];
      if (summary.skipped > 0) parts.push(`${summary.skipped} already had a report`);
      if (summary.failed > 0) parts.push(`${summary.failed} failed`);
      toast.success(parts.join(', '));
      setText('');
      if (summary.failed === 0) onClose();
    } finally {
      setImporting(false);
    }
  }

  async function handlePickFile() {
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: CSV_MIME_TYPES, copyToCacheDirectory: true });
      if (result.canceled) return;

      const asset = result.assets[0];
      const fileText = await new File(asset.uri).text();
      await runImport(fileText);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not read that file.');
    } finally {
      setPicking(false);
    }
  }

  async function handlePaste() {
    const clipboardText = await clipboard.paste();
    setText(clipboardText);
  }

  async function handleImportPastedText() {
    if (!text.trim()) {
      toast.error('Paste the exported CSV text first.');
      return;
    }
    await runImport(text);
  }

  return (
    <Sheet visible={visible} title="Import Reports (CSV)" onClose={onClose}>
      <Column gap="base">
        <Caption color="mutedForeground">
          Export your reports from the web app at /report/export, then choose that file below. Dates that already
          have a report are skipped, so this is always safe to run again.
        </Caption>

        <Button onPress={handlePickFile} loading={picking} fullWidth>
          Choose CSV File
        </Button>

        <Caption color="mutedForeground">Or paste the file&apos;s text instead:</Caption>
        <TextArea
          value={text}
          onChangeText={setText}
          placeholder="Paste the exported CSV text here"
          minHeight={100}
          maxHeight={240}
        />
        <Button variant="secondary" onPress={handlePaste}>
          Paste from Clipboard
        </Button>
        <Button variant="secondary" onPress={handleImportPastedText} loading={importing} fullWidth>
          Import Pasted Text
        </Button>
      </Column>
    </Sheet>
  );
}
