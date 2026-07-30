import { forwardRef } from 'react';
import type { TextInput } from 'react-native';

import { Input, type InputProps } from './Input';

export interface NumberInputProps extends Omit<InputProps, 'keyboardType' | 'onChangeText'> {
  value?: string;
  onChangeText?: (text: string) => void;
  allowDecimal?: boolean;
}

/** `Input` constrained to numeric entry — strips anything that isn't a digit (and, if `allowDecimal`, a single decimal point) rather than just switching the keyboard, since pasted text can still contain letters. */
export const NumberInput = forwardRef<TextInput, NumberInputProps>(function NumberInput(
  { onChangeText, allowDecimal = false, ...rest },
  ref,
) {
  function handleChangeText(text: string) {
    const pattern = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
    let sanitized = text.replace(pattern, '');
    if (allowDecimal) {
      const firstDot = sanitized.indexOf('.');
      if (firstDot !== -1) {
        sanitized =
          sanitized.slice(0, firstDot + 1) + sanitized.slice(firstDot + 1).replace(/\./g, '');
      }
    }
    onChangeText?.(sanitized);
  }

  return (
    <Input
      ref={ref}
      keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
      onChangeText={handleChangeText}
      {...rest}
    />
  );
});
