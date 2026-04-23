import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import type { IconName } from '@/types';

import { Icon } from './Icon';

type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  stroke?: number;
  color?: string;
  background?: string;
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export const IconButton = ({
  icon,
  onPress,
  size = 40,
  iconSize = 18,
  stroke = 1.8,
  color,
  background,
  borderColor,
  style,
  children,
}: IconButtonProps) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: 12,
          backgroundColor: background ?? theme.glassStrong,
          borderWidth: 1,
          borderColor: borderColor ?? theme.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Icon
        name={icon}
        size={iconSize}
        stroke={stroke}
        color={color ?? theme.ink[0]}
      />
      {children}
    </Pressable>
  );
};
