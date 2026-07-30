import { StateMessage, type StateMessageProps } from './StateMessage';

/** For "nothing here yet" — e.g. no journal entries today. Defaults to a neutral `info` icon; pass `icon` to override. */
export function EmptyState(props: StateMessageProps) {
  return <StateMessage icon="info" iconColor="mutedForeground" {...props} />;
}
