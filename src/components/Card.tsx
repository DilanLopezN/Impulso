import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

type CardProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
};

export const Card = ({ children, style, accent = false }: CardProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.glassStrong,
          borderWidth: 1,
          borderColor: accent ? theme.accent : theme.border,
          borderRadius: theme.radius.md,
          overflow: 'hidden',
          ...(accent
            ? {
                shadowColor: theme.accent,
                shadowOpacity: 0.4,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 0 },
              }
            : null),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
