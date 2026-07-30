import { useState } from 'react';

import { Button, Column, TextArea } from '@/components';
import { Sheet, toast } from '@/components/dialog';
import { Body } from '@/components/typography';
import { clipboard } from '@/core/clipboard';
import { haptics } from '@/core/haptics';
import { useAIReport } from '../hooks';
import type { AIReport, ClaudePromptPackage } from '../types';
import { AIReportSummary } from './AIReportSummary';

export interface AIReportSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Built by Home right before opening this sheet — `null` only for the brief moment before that finishes. */
  promptPackage: ClaudePromptPackage | null;
}

interface SubmittedResult {
  report: AIReport;
  parseWarnings: string[];
}

/**
 * The paste-back half of the report flow: Home already built the prompt,
 * copied it, and opened the share sheet before this ever appears. All
 * that's left is pasting Claude's reply back in and saving it.
 */
export function AIReportSheet({ visible, onClose, promptPackage }: AIReportSheetProps) {
  const { submitResponse } = useAIReport();
  const [responseDraft, setResponseDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmittedResult | null>(null);

  function handleClose() {
    setResponseDraft('');
    setResult(null);
    onClose();
  }

  async function handleCopyAgain() {
    if (!promptPackage) return;
    await clipboard.copy(promptPackage.text);
    toast.show('Prompt copied');
  }

  async function handleSave() {
    if (!promptPackage || !responseDraft.trim()) return;
    setSubmitting(true);
    try {
      const { report, parseWarnings } = await submitResponse(promptPackage, responseDraft);
      setResult({ report, parseWarnings });
      haptics.success();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet visible={visible} title="Today's Report" onClose={handleClose}>
      {result ? (
        <Column gap="lg">
          <AIReportSummary report={result.report} parseWarnings={result.parseWarnings} />
          <Button onPress={handleClose} fullWidth>
            Done
          </Button>
        </Column>
      ) : (
        <Column gap="base">
          <Body color="mutedForeground">
            Your prompt is ready and copied — open Claude, paste it in, then bring the reply back here.
          </Body>
          <TextArea
            value={responseDraft}
            onChangeText={setResponseDraft}
            placeholder="Paste Claude's response here"
            minHeight={160}
            maxHeight={400}
          />
          <Button variant="ghost" size="sm" onPress={handleCopyAgain}>
            Copy Prompt Again
          </Button>
          <Button onPress={handleSave} loading={submitting} disabled={!responseDraft.trim()} fullWidth>
            Save Report
          </Button>
        </Column>
      )}
    </Sheet>
  );
}
