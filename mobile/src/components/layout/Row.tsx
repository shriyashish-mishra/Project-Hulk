import { Stack, type StackProps } from './Stack';

/** `Stack` with `direction="row"` fixed — see `Stack` for the actual implementation. */
export function Row(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="row" {...props} />;
}
