import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

import { PhoneStatusBar } from './PhoneStatusBar';

type ScreenShellProps = {
  children: React.ReactNode;
  topInset?: number;
  style?: StyleProp<ViewStyle>;
};

export const ScreenShell = ({ children, topInset, style }: ScreenShellProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.bg[0],
        },
        style,
      ]}
    >
      <PhoneStatusBar topInset={topInset} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};
