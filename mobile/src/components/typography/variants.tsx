import { Text, type TextProps } from './Text';

/** Thin, named `Text` presets — each just fixes `variant`, so there's one real implementation (`Text`) to maintain. */
type VariantProps = Omit<TextProps, 'variant'>;

export const Heading = (props: VariantProps) => <Text variant="heading" {...props} />;
export const Title = (props: VariantProps) => <Text variant="title" {...props} />;
export const Subtitle = (props: VariantProps) => <Text variant="subtitle" {...props} />;
export const Body = (props: VariantProps) => <Text variant="body" {...props} />;
export const Caption = (props: VariantProps) => <Text variant="caption" {...props} />;
export const Label = (props: VariantProps) => <Text variant="label" {...props} />;
