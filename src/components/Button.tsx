import React from 'react';
import {
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

type Variant = 'primary' | 'ghost';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: Variant;
  disabled?: boolean;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
};

export const Button = ({
  label,
  variant = 'primary',
  disabled,
  leftAdornment,
  rightAdornment,
  style,
  backgroundColor,
  ...rest
}: ButtonProps) => {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        {
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : pressed ? 0.92 : 1,
          transform: pressed ? [{ scale: 0.97 }] : undefined,
          ...(isPrimary
            ? {
                backgroundColor: backgroundColor ?? theme.accent,
                shadowColor: backgroundColor ?? theme.accent,
                shadowOpacity: 0.45,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 0 },
              }
            : {
                backgroundColor: theme.glassStrong,
                borderWidth: 1,
                borderColor: theme.border,
              }),
        },
        style,
      ]}
    >
      {leftAdornment ? <View>{leftAdornment}</View> : null}
      <Text
        style={{
          fontFamily: 'Geist_600SemiBold',
          fontSize: 15,
          color: isPrimary ? theme.accentInk : theme.ink[0],
        }}
      >
        {label}
      </Text>
      {rightAdornment ? <View>{rightAdornment}</View> : null}
    </Pressable>
  );
};
