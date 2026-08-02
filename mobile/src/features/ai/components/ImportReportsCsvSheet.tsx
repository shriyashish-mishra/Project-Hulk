import { useState } from 'react';
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

/**
 * Backfills historical AI reports from the web app's `/report/export`
 * CSV — paste the exported file's raw text (from the clipboard, or
 * wherever it was saved) and this parses every row, skipping any date
 * that already has a report so it's always safe to re-run. This is a
 * one-time bridge between the two apps' independently-evolved report
 * schemas, not a general-purpose sync.
 */
export function ImportReportsCsvSheet({ visible, onClose }: ImportReportsCsvSheetProps) {
  const db = useSQLiteContext();
  const [text, setText] = useState('');
  const [importing, setImporting] = useState(false);

  async function handlePaste() {
    const clipboardText = await clipboard.paste();
    setText(clipboardText);
  }

  async function handleImport() {
    if (!text.trim()) {
      toast.error('Paste the exported CSV text first.');
      return;
    }
    setImporting(true);
    try {
      const summary = await importReportsFromCsv(db, text);
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

  return (
    <Sheet visible={visible} title="Import Reports (CSV)" onClose={onClose}>
      <Column gap="base">
        <Caption color="mutedForeground">
          Export your reports from the web app at /report/export, then paste the file&apos;s text here. Dates that
          already have a report are skipped, so this is always safe to run again.
        </Caption>
        <TextArea
          value={text}
          onChangeText={setText}
          placeholder="Paste the exported CSV text here"
          minHeight={140}
          maxHeight={320}
        />
        <Button variant="secondary" onPress={handlePaste}>
          Paste from Clipboard
        </Button>
        <Button onPress={handleImport} loading={importing} fullWidth>
          Import Reports
        </Button>
      </Column>
    </Sheet>
  );
}
