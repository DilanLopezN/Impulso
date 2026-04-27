import React from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

import { Icon } from './Icon';

type FABProps = {
  onPress: () => void;
  bottom: number;
};

export const FAB = ({ onPress, bottom }: FABProps) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Criar nova meta"
      style={({ pressed }) => ({
        position: 'absolute',
        right: 20,
        bottom,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.accent,
        shadowOpacity: 0.6,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
        ...(pressed ? { transform: [{ scale: 0.94 }] } : {}),
      })}
    >
      <Icon name="plus" size={24} stroke={2.4} color={theme.accentInk} />
    </Pressable>
  );
};
