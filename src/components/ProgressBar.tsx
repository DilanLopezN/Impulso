import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

type ProgressBarProps = {
  value: number;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export const ProgressBar = ({
  value,
  color,
  height = 6,
  style,
}: ProgressBarProps) => {
  const { theme } = useTheme();
  const fillColor = color ?? theme.accent;
  const pct = `${Math.max(0, Math.min(1, value)) * 100}%` as const;
  return (
    <View
      style={[
        {
          height,
          backgroundColor: theme.border,
          borderRadius: 999,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: pct,
          backgroundColor: fillColor,
          borderRadius: 999,
          shadowColor: fillColor,
          shadowOpacity: 0.5,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
        }}
      />
    </View>
  );
};
