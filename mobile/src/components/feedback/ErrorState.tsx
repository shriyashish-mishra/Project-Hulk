import { StateMessage, type StateMessageProps } from './StateMessage';

/** For "something went wrong" — e.g. a failed save, typically paired with a `actionLabel="Retry"`. */
export function ErrorState(props: StateMessageProps) {
  return <StateMessage icon="alertTriangle" iconColor="destructive" {...props} />;
}
