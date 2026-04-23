import React from 'react';
import { Modal, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeContext';

import { Button } from './Button';
import { Icon } from './Icon';
import { Body, Eyebrow, H1, Mono, Neon } from './Typography';

type CelebrationProps = {
  visible: boolean;
  onClose: () => void;
};

export const Celebration = ({ visible, onClose }: CelebrationProps) => {
  const { theme } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(5, 7, 12, 0.92)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          style={{ position: 'absolute' }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const len = 100 + (i % 3) * 40;
            return (
              <Line
                key={i}
                x1={200 + Math.cos(a) * 60}
                y1={200 + Math.sin(a) * 60}
                x2={200 + Math.cos(a) * (60 + len)}
                y2={200 + Math.sin(a) * (60 + len)}
                stroke={theme.accent}
                strokeOpacity={0.1 + (i % 3) * 0.15}
                strokeWidth={1}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>

        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              marginBottom: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.accentDim,
              shadowColor: theme.accent,
              shadowOpacity: 0.55,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: theme.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={44} stroke={3} color={theme.accentInk} />
            </View>
          </View>

          <Eyebrow style={{ color: theme.accent, marginBottom: 10 }}>
            IMPULSO REGISTRADO
          </Eyebrow>
          <H1 style={{ textAlign: 'center', marginBottom: 12 }}>
            Mais perto do <Neon>recorde</Neon>
          </H1>
          <Body
            style={{
              textAlign: 'center',
              maxWidth: 280,
              marginBottom: 24,
            }}
          >
            Você ganhou{' '}
            <Mono style={{ color: theme.accent, fontFamily: 'GeistMono_600SemiBold' }}>
              +80 XP
            </Mono>{' '}
            e manteve sua sequência de{' '}
            <Mono style={{ color: theme.accent }}>28 dias</Mono>.
          </Body>
          <Button
            label="Continuar"
            onPress={onClose}
            style={{ minWidth: 180 }}
          />
        </View>
      </View>
    </Modal>
  );
};
