import { Stack, type StackProps } from './Stack';

/** `Stack` with `direction="column"` fixed — see `Stack` for the actual implementation. */
export function Column(props: Omit<StackProps, 'direction'>) {
  return <Stack direction="column" {...props} />;
}
