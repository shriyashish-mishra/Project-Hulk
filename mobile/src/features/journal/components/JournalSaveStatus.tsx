import { Caption } from '@/components/typography';
import type { AutosaveStatus } from '../draft';

export interface JournalSaveStatusProps {
  state: AutosaveStatus;
}

/** A quiet, easy-to-ignore confirmation that autosave is working — deliberately not a toast or a dialog. Autosave should be invisible; this is just there for the moment someone looks for it. */
export function JournalSaveStatus({ state }: JournalSaveStatusProps) {
  return <Caption color="mutedForeground">{state === 'saving' ? 'Saving…' : 'Saved'}</Caption>;
}
