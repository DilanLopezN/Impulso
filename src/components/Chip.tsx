import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

type ChipProps = {
  children?: React.ReactNode;
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
  background?: string;
  borderColor?: string;
};

export const Chip = ({
  children,
  accent = false,
  style,
  background,
  borderColor,
}: ChipProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 999,
          borderWidth: 1,
          backgroundColor:
            background ?? (accent ? theme.accentDim : theme.glassStrong),
          borderColor: borderColor ?? (accent ? theme.accent : theme.border),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
