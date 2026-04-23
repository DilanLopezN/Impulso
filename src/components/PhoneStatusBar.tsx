import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeContext';

import { Mono } from './Typography';

type Props = {
  topInset?: number;
};

export const PhoneStatusBar = ({ topInset = 0 }: Props) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingTop: topInset + 10,
        paddingHorizontal: 28,
        paddingBottom: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <Mono
        style={{
          fontSize: 15,
          fontFamily: 'Geist_600SemiBold',
          color: theme.ink[0],
        }}
      >
        9:41
      </Mono>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Svg width={16} height={11} viewBox="0 0 20 12">
          <Rect x={0} y={7} width={3} height={5} rx={0.5} fill={theme.ink[0]} />
          <Rect x={5} y={5} width={3} height={7} rx={0.5} fill={theme.ink[0]} />
          <Rect x={10} y={2} width={3} height={10} rx={0.5} fill={theme.ink[0]} />
          <Rect x={15} y={0} width={3} height={12} rx={0.5} fill={theme.ink[0]} />
        </Svg>
        <Svg width={16} height={11} viewBox="0 0 16 12">
          <Path
            d="M8 3c2 0 4 1 5 2l-1 1c-1-1-2-2-4-2s-3 1-4 2L3 5c1-1 3-2 5-2zm0-3c3 0 6 1 8 3l-1 1c-2-2-4-2-7-2S4 3 2 5L1 3c2-2 5-3 7-3z"
            fill={theme.ink[0]}
          />
          <Circle cx={8} cy={9} r={1.5} fill={theme.ink[0]} />
        </Svg>
        <Svg width={26} height={11} viewBox="0 0 26 11">
          <Rect
            x={0.5}
            y={0.5}
            width={22}
            height={10}
            rx={2.5}
            stroke={theme.ink[0]}
            strokeOpacity={0.6}
            fill="none"
          />
          <Rect
            x={24}
            y={4}
            width={1.5}
            height={3}
            rx={0.5}
            fill={theme.ink[0]}
            opacity={0.6}
          />
          <Rect x={2} y={2} width={18} height={7} rx={1.5} fill={theme.ink[0]} />
        </Svg>
      </View>
    </View>
  );
};
