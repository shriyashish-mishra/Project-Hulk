import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

export type AutosaveStatus = 'saving' | 'saved';

export interface UseAutosaveEngineOptions {
  /** Frequent, cheap checkpoint for crash recovery — briefly debounced, not literally every keystroke. */
  onDraftSave: (value: string) => void | Promise<void>;
  /** Promotes the draft to the canonical record — fired after a longer idle period, when the app backgrounds, and when the screen loses focus. */
  onCommit: (value: string) => void | Promise<void>;
  draftDelay?: number;
  commitDelay?: number;
  /**
   * False while the initial content is still loading. Prevents the engine
   * from treating "the freshly loaded value differs from the empty string
   * the hook started with" as a real edit worth saving.
   */
  isLoaded?: boolean;
}

export interface UseAutosaveEngineResult {
  status: AutosaveStatus;
}

/**
 * The "Autosave Engine" sitting between a draft and its persisted record.
 * Two tiers, matching how much each is allowed to cost:
 *
 * - A fast, frequent checkpoint into the draft table — the crash-recovery
 *   buffer. The worst-case data-loss window is one `draftDelay`, not an
 *   entire editing session.
 * - A slower promotion into the canonical entry, triggered by idle time,
 *   the app backgrounding, or the screen losing focus (navigating away).
 *
 * Commits are serialized: if the value changes again while a commit is
 * still in flight, the loop below picks up the latest value and commits
 * again right after, rather than racing two writes against the same row.
 */
export function useAutosaveEngine(
  value: string,
  { onDraftSave, onCommit, draftDelay = 500, commitDelay = 1500, isLoaded = true }: UseAutosaveEngineOptions,
): UseAutosaveEngineResult {
  const [status, setStatus] = useState<AutosaveStatus>('saved');

  const valueRef = useRef(value);
  const onDraftSaveRef = useRef(onDraftSave);
  const onCommitRef = useRef(onCommit);

  // Refs are only ever read from callbacks/effects below, never during
  // render — keeping them in sync happens in an effect, not inline.
  useEffect(() => {
    valueRef.current = value;
    onDraftSaveRef.current = onDraftSave;
    onCommitRef.current = onCommit;
  });

  const lastDraftedRef = useRef(value);
  const lastCommittedRef = useRef(value);
  const commitInFlightRef = useRef(false);
  const commitPendingRef = useRef(false);

  // The moment the initial content finishes loading, treat it as the
  // baseline — otherwise the jump from '' to the loaded body would look
  // like an edit and trigger a pointless immediate re-save.
  useEffect(() => {
    if (isLoaded) {
      lastDraftedRef.current = value;
      lastCommittedRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-baseline on the loading transition, not on every keystroke
  }, [isLoaded]);

  const commit = useCallback(() => {
    if (commitInFlightRef.current) {
      commitPendingRef.current = true;
      return;
    }
    if (valueRef.current === lastCommittedRef.current) return;

    commitInFlightRef.current = true;
    setStatus('saving');

    (async () => {
      let keepGoing = true;
      while (keepGoing) {
        const valueToCommit = valueRef.current;
        lastCommittedRef.current = valueToCommit;
        await onCommitRef.current(valueToCommit);

        if (commitPendingRef.current) {
          commitPendingRef.current = false;
          keepGoing = valueRef.current !== lastCommittedRef.current;
        } else {
          keepGoing = false;
        }
      }
      commitInFlightRef.current = false;
      setStatus('saved');
    })();
  }, []);

  // Fast tier: crash-recovery draft checkpoint.
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => {
      if (valueRef.current === lastDraftedRef.current) return;
      lastDraftedRef.current = valueRef.current;
      onDraftSaveRef.current(valueRef.current);
    }, draftDelay);
    return () => clearTimeout(timer);
  }, [value, draftDelay, isLoaded]);

  // Slow tier: idle commit.
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(commit, commitDelay);
    return () => clearTimeout(timer);
  }, [value, commitDelay, commit, isLoaded]);

  // Commit immediately when the app backgrounds — don't wait for the idle timer.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        commit();
      }
    });
    return () => subscription.remove();
  }, [commit]);

  // Commit when the screen loses focus (navigating to another tab).
  useFocusEffect(
    useCallback(() => {
      return commit;
    }, [commit]),
  );

  return { status };
}
