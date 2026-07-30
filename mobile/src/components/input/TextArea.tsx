import { forwardRef, useState } from 'react';
import {
  TextInput,
  type NativeSyntheticEvent,
  type TextInputContentSizeChangeEventData,
  type TextInputProps,
} from 'react-native';

import { colors, radius, spacing } from '@/core/theme';
import { Column } from '../layout/Column';
import { Caption, Label } from '../typography';

export interface TextAreaProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  minHeight?: number;
  maxHeight?: number;
}

/**
 * The Journal's primary input — this is the component that matters most
 * in the whole design system, since typing there is the core daily
 * interaction. Auto-grows with content (`onContentSizeChange`) between
 * `minHeight`/`maxHeight` rather than scrolling a fixed box, borderless
 * card background so it reads as part of the page rather than a boxy
 * form field, and generous padding/line-height so it feels good to type
 * into.
 */
export const TextArea = forwardRef<TextInput, TextAreaProps>(function TextArea(
  {
    label,
    helperText,
    error,
    minHeight = 120,
    maxHeight = 320,
    style,
    onContentSizeChange,
    ...rest
  },
  ref,
) {
  const [height, setHeight] = useState(minHeight);

  function handleContentSizeChange(
    event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) {
    const nextHeight = Math.min(
      maxHeight,
      Math.max(minHeight, event.nativeEvent.contentSize.height),
    );
    setHeight(nextHeight);
    onContentSizeChange?.(event);
  }

  return (
    <Column gap="xs">
      {label && <Label color="mutedForeground">{label}</Label>}
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        placeholderTextColor={colors.mutedForeground}
        onContentSizeChange={handleContentSizeChange}
        style={[
          {
            height,
            padding: spacing.base,
            borderRadius: radius.lg,
            backgroundColor: colors.card,
            color: colors.foreground,
            fontSize: 16,
            lineHeight: 24,
            fontFamily: 'Poppins_500Medium',
          },
          style,
        ]}
        {...rest}
      />
      {(helperText || error) && (
        <Caption color={error ? 'destructive' : 'mutedForeground'}>{error ?? helperText}</Caption>
      )}
    </Column>
  );
});
