import { Row, TextArea } from '@/components';
import { Sheet } from '@/components/dialog';
import { useJournalEntry } from '../hooks';
import { JournalSaveStatus } from './JournalSaveStatus';

export interface NotesSheetProps {
  visible: boolean;
  onClose: () => void;
  date: string;
}

/**
 * The free-text Journal feature, relocated from its own tab into a
 * dashboard row — same editor, same autosave engine, just reached
 * through a `Sheet` instead of a dedicated screen. Renamed "Notes" here
 * only because "Journal" now means the whole daily dashboard, matching
 * web's naming.
 */
export function NotesSheet({ visible, onClose, date }: NotesSheetProps) {
  const { body, setBody, loading, saveStatus } = useJournalEntry(date);

  return (
    <Sheet visible={visible} title="Notes" onClose={onClose}>
      {!loading && (
        <TextArea
          autoFocus
          value={body}
          onChangeText={setBody}
          placeholder="Write about today…"
          minHeight={200}
          maxHeight={100000}
        />
      )}
      <Row justify="flex-end">
        <JournalSaveStatus state={saveStatus} />
      </Row>
    </Sheet>
  );
}
