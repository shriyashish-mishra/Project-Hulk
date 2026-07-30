import { forwardRef } from 'react';
import { Pressable, type TextInput } from 'react-native';

import { colors } from '@/core/theme';
import { Icon } from '../icon/Icon';
import { Input, type InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'leftAdornment' | 'rightAdornment'> {
  onClear?: () => void;
}

/** `Input` with a search icon and a clear button — a thin composition over `Input`'s adornment slots, not a separate field implementation. */
export const SearchInput = forwardRef<TextInput, SearchInputProps>(function SearchInput(
  { value, onClear, placeholder = 'Search', ...rest },
  ref,
) {
  return (
    <Input
      ref={ref}
      value={value}
      placeholder={placeholder}
      leftAdornment={<Icon name="search" size={18} color={colors.mutedForeground} />}
      rightAdornment={
        value && onClear ? (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={8}
          >
            <Icon name="close" size={18} color={colors.mutedForeground} />
          </Pressable>
        ) : undefined
      }
      {...rest}
    />
  );
});
