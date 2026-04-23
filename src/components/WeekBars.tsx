import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import type { WeekDay } from '@/types';

import { Mono } from './Typography';

type WeekBarsProps = {
  days: WeekDay[];
  height?: number;
};

export const WeekBars = ({ days, height = 44 }: WeekBarsProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
        height,
      }}
    >
      {days.map((day, i) => {
        const barHeight = Math.max(8, day.value * height);
        return (
          <View
            key={`${day.label}-${i}`}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: 6,
            }}
          >
            <View
              style={{
                width: '100%',
                height: barHeight,
                minHeight: 6,
                borderRadius: 2,
                backgroundColor: day.done ? theme.accent : theme.borderStrong,
                ...(day.done
                  ? {
                      shadowColor: theme.accent,
                      shadowOpacity: 0.6,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 0 },
                    }
                  : null),
              }}
            />
            <Mono
              style={{
                fontSize: 9,
                color: day.today ? theme.accent : theme.ink[3],
                letterSpacing: 0.5,
              }}
            >
              {day.label}
            </Mono>
          </View>
        );
      })}
    </View>
  );
};
