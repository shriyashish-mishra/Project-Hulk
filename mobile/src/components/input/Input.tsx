import { forwardRef, useState, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing } from '@/core/theme';
import { Column } from '../layout/Column';
import { Caption, Label } from '../typography';

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  /** Replaces `helperText` with an error message and switches the border/text to the destructive color. */
  error?: string;
  /** Rendered inside the field, before the text (e.g. a search icon). See `SearchInput`. */
  leftAdornment?: ReactNode;
  /** Rendered inside the field, after the text (e.g. a clear button). See `SearchInput`. */
  rightAdornment?: ReactNode;
}

/**
 * The app's single-line text field. `TextArea`, `NumberInput`, and
 * `SearchInput` are all built on this — see those files rather than
 * duplicating the label/helper/error/focus handling here.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    helperText,
    error,
    editable = true,
    leftAdornment,
    rightAdornment,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = error ? colors.destructive : isFocused ? colors.primary : colors.border;

  return (
    <Column gap="xs">
      {label && <Label color="mutedForeground">{label}</Label>}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          height: 48,
          paddingHorizontal: spacing.base,
          gap: spacing.sm,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor,
          backgroundColor: colors.card,
          opacity: editable ? 1 : 0.5,
        }}
      >
        {leftAdornment}
        <TextInput
          ref={ref}
          editable={editable}
          placeholderTextColor={colors.mutedForeground}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              flex: 1,
              height: '100%',
              color: colors.foreground,
              fontSize: 16,
              fontFamily: 'Poppins_500Medium',
            },
            style,
          ]}
          {...rest}
        />
        {rightAdornment}
      </View>
      {(helperText || error) && (
        <Caption color={error ? 'destructive' : 'mutedForeground'}>{error ?? helperText}</Caption>
      )}
    </Column>
  );
});
