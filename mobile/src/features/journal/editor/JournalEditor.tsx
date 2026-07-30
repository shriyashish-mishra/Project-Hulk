import { KeyboardAvoidingView, Platform } from 'react-native';

import { ScrollScreen, TextArea } from '@/components';
import { Title } from '@/components/typography';
import { JournalSaveStatus } from '../components';
import { useJournalEntry } from '../hooks';

/**
 * The Journal's entire writing surface — self-contained (calls its own
 * hook, like the Home quick-action cards) so the route file is pure
 * composition. Opens straight into an editable, autofocused canvas: no
 * create-entry step, no save button, nothing between the user and typing.
 *
 * `maxHeight` is set far beyond any realistic entry so `TextArea` never
 * clamps its own height — the surrounding `ScrollScreen` is what scrolls,
 * matching a notes app rather than a scrollbox-within-a-page.
 */
export function JournalEditor() {
  const { body, setBody, loading, saveStatus } = useJournalEntry();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollScreen edges={['top', 'left', 'right']} keyboardDismissMode="interactive">
        <Title>Journal</Title>
        {!loading && (
          <TextArea
            autoFocus
            value={body}
            onChangeText={setBody}
            placeholder="Write about today…"
            minHeight={320}
            maxHeight={100000}
          />
        )}
        <JournalSaveStatus state={saveStatus} />
      </ScrollScreen>
    </KeyboardAvoidingView>
  );
}
