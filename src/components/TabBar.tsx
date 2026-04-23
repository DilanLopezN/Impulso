import React from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme/ThemeContext';
import type { IconName, TabId } from '@/types';

import { Icon } from './Icon';
import { Mono } from './Typography';

type TabBarProps = {
  active: TabId;
  onChange: (id: TabId) => void;
  bottomInset?: number;
};

const TABS: { id: TabId; icon: IconName; label: string }[] = [
  { id: 'home', icon: 'home', label: 'Home' },
  { id: 'habits', icon: 'flame', label: 'Hábitos' },
  { id: 'rank', icon: 'medal', label: 'Rank' },
  { id: 'achievements', icon: 'trophy', label: 'Conquistas' },
  { id: 'profile', icon: 'user', label: 'Perfil' },
];

export const TabBar = ({ active, onChange, bottomInset = 0 }: TabBarProps) => {
  const { theme } = useTheme();
  return (
    <LinearGradient
      colors={['transparent', theme.bg[0]]}
      locations={[0, 0.4]}
      style={{
        paddingTop: 10,
        paddingBottom: 18 + bottomInset,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: theme.border,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onChange(tab.id)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Icon
                name={tab.icon}
                size={22}
                stroke={isActive ? 2 : 1.6}
                color={isActive ? theme.accent : theme.ink[3]}
              />
              <Mono
                style={{
                  fontSize: 10,
                  fontFamily: 'Geist_600SemiBold',
                  color: isActive ? theme.accent : theme.ink[3],
                  letterSpacing: 0.2,
                }}
              >
                {tab.label}
              </Mono>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
};
