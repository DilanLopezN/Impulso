import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

import { Eyebrow, H3, Small } from './Typography';

type SectionHeadProps = {
  eyebrow?: string;
  title: string;
  action?: string;
  onActionPress?: () => void;
};

export const SectionHead = ({
  eyebrow,
  title,
  action,
  onActionPress,
}: SectionHeadProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}
    >
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Eyebrow style={{ marginBottom: 4 }}>{eyebrow}</Eyebrow>
        ) : null}
        <H3>{title}</H3>
      </View>
      {action ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Small
            style={{
              color: theme.accent,
              fontFamily: 'Geist_600SemiBold',
            }}
          >
            {action}
          </Small>
        </Pressable>
      ) : null}
    </View>
  );
};
