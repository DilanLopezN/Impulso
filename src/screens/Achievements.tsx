import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Defs, LinearGradient, Polygon, Stop } from 'react-native-svg';

import {
  Body,
  Card,
  Chip,
  Eyebrow,
  H1,
  H3,
  Icon,
  Mono,
  ProgressBar,
  Small,
} from '@/components';
import { useTheme } from '@/theme/ThemeContext';
import { TIER_COLORS } from '@/theme/colors';
import type { IconName } from '@/types';

type Tier = keyof typeof TIER_COLORS;

type Earned = {
  id: number;
  title: string;
  sub: string;
  icon: IconName;
  tier: Tier;
  date: string;
  xp: number;
};

type Locked = {
  id: number;
  title: string;
  sub: string;
  icon: IconName;
  progress: number;
  req: string;
};

const CATEGORIES = ['Todas', 'Sequências', 'Metas', 'Marcos'];

const EARNED: Earned[] = [
  { id: 1, title: 'Primeiro Passo', sub: 'Concluiu primeira meta', icon: 'sparkle', tier: 'bronze', date: '12 Mar', xp: 100 },
  { id: 2, title: 'Semana Perfeita', sub: '7 dias de streak', icon: 'flame', tier: 'silver', date: '18 Mar', xp: 200 },
  { id: 3, title: 'Corredor', sub: 'Correu 50km no total', icon: 'run', tier: 'silver', date: '02 Abr', xp: 250 },
  { id: 4, title: 'Intelecto', sub: 'Finalizou 3 cursos', icon: 'book', tier: 'gold', date: '15 Abr', xp: 500 },
];

const LOCKED: Locked[] = [
  { id: 5, title: 'Inabalável', sub: '30 dias de streak', icon: 'lock', progress: 0.93, req: '28/30' },
  { id: 6, title: 'Maratonista', sub: 'Correr 100km no total', icon: 'lock', progress: 0.42, req: '42/100km' },
  { id: 7, title: 'Centurião', sub: 'Complete 100 tarefas', icon: 'lock', progress: 0.71, req: '71/100' },
  { id: 8, title: 'Lendário', sub: 'Alcance o nível 20', icon: 'lock', progress: 0.6, req: 'LVL 12/20' },
];

export const Achievements = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<string>('Todas');

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}>
        <Eyebrow style={{ marginBottom: 6 }}>CONQUISTAS</Eyebrow>
        <H1>Sua coleção</H1>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 10,
            marginTop: 12,
          }}
        >
          <Mono
            style={{
              fontSize: 28,
              color: theme.accent,
              fontFamily: 'GeistMono_500Medium',
            }}
          >
            12
          </Mono>
          <Mono style={{ fontSize: 16, color: theme.ink[3] }}>/ 48</Mono>
          <View style={{ marginLeft: 'auto' }}>
            <Chip>
              <Small style={{ color: theme.ink[1], fontSize: 11 }}>
                25% desbloqueado
              </Small>
            </Chip>
          </View>
        </View>
        <ProgressBar value={0.25} style={{ marginTop: 10 }} />
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 20 }}
      >
        {CATEGORIES.map((c) => {
          const active = filter === c;
          return (
            <Pressable key={c} onPress={() => setFilter(c)}>
              <Chip
                background={active ? theme.accent : theme.glassStrong}
                borderColor={active ? theme.accent : theme.border}
              >
                <Small
                  style={{
                    color: active ? theme.accentInk : theme.ink[1],
                    fontSize: 11,
                    fontFamily: 'Geist_600SemiBold',
                  }}
                >
                  {c}
                </Small>
              </Chip>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Featured */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 12 }}>DESBLOQUEADA RECENTEMENTE</Eyebrow>
        <Card
          accent
          style={{
            padding: 22,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <BadgeBig tier="gold" icon="book" />
          <View style={{ flex: 1 }}>
            <Eyebrow style={{ color: theme.accent, marginBottom: 4 }}>
              OURO · 15 ABR
            </Eyebrow>
            <H3 style={{ marginBottom: 4 }}>Intelecto</H3>
            <Small style={{ color: theme.ink[2] }}>
              Finalizou 3 cursos completos
            </Small>
            <Mono
              style={{
                fontSize: 11,
                color: theme.accent,
                marginTop: 8,
                fontFamily: 'Geist_600SemiBold',
              }}
            >
              +500 XP
            </Mono>
          </View>
        </Card>
      </View>

      {/* Earned grid */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 12 }}>CONQUISTADAS · 12</Eyebrow>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {EARNED.map((a) => (
            <Card
              key={a.id}
              style={{
                padding: 16,
                width: '48%',
                alignItems: 'center',
              }}
            >
              <View style={{ marginBottom: 10 }}>
                <BadgeSmall tier={a.tier} icon={a.icon} />
              </View>
              <Body
                style={{
                  fontSize: 13,
                  fontFamily: 'Geist_600SemiBold',
                  color: theme.ink[0],
                  marginBottom: 2,
                }}
              >
                {a.title}
              </Body>
              <Small
                style={{
                  color: theme.ink[3],
                  fontSize: 10,
                  textAlign: 'center',
                }}
              >
                {a.sub}
              </Small>
              <View
                style={{
                  height: 1,
                  width: '100%',
                  backgroundColor: theme.borderStrong,
                  marginVertical: 10,
                  opacity: 0.5,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Mono style={{ fontSize: 10, color: theme.ink[3] }}>
                  {a.date}
                </Mono>
                <Mono
                  style={{
                    fontSize: 10,
                    color: TIER_COLORS[a.tier],
                    fontFamily: 'Geist_600SemiBold',
                  }}
                >
                  +{a.xp} XP
                </Mono>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Locked */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 12 }}>EM PROGRESSO</Eyebrow>
        <View style={{ gap: 10 }}>
          {LOCKED.map((a) => (
            <Card
              key={a.id}
              style={{
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: theme.bg[2],
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: theme.borderStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="lock" size={18} color={theme.ink[3]} />
              </View>
              <View style={{ flex: 1 }}>
                <Body
                  style={{
                    fontFamily: 'Geist_600SemiBold',
                    color: theme.ink[1],
                  }}
                >
                  {a.title}
                </Body>
                <Small style={{ color: theme.ink[3], marginBottom: 8 }}>
                  {a.sub}
                </Small>
                <ProgressBar value={a.progress} height={3} />
              </View>
              <Mono
                style={{
                  fontSize: 10,
                  color: theme.ink[2],
                  fontFamily: 'Geist_600SemiBold',
                }}
              >
                {a.req}
              </Mono>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

/* ================== BADGES ================== */

const BadgeBig = ({ tier, icon }: { tier: Tier; icon: IconName }) => {
  const { theme } = useTheme();
  const c = TIER_COLORS[tier];
  return (
    <View style={{ width: 88, height: 96 }}>
      <Svg viewBox="0 0 88 96" width={88} height={96}>
        <Defs>
          <LinearGradient id={`bg-${tier}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={c} stopOpacity={1} />
            <Stop offset="100%" stopColor={c} stopOpacity={0.4} />
          </LinearGradient>
        </Defs>
        <Polygon
          points="44,4 82,24 82,72 44,92 6,72 6,24"
          fill={`url(#bg-${tier})`}
        />
        <Polygon
          points="44,10 76,28 76,68 44,86 12,68 12,28"
          fill={theme.bg[1]}
        />
        <Polygon
          points="44,14 72,30 72,66 44,82 16,66 16,30"
          fill={c}
          opacity={0.15}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={28} stroke={1.8} color={c} />
      </View>
    </View>
  );
};

const BadgeSmall = ({ tier, icon }: { tier: Tier; icon: IconName }) => {
  const { theme } = useTheme();
  const c = TIER_COLORS[tier];
  return (
    <View style={{ width: 56, height: 62 }}>
      <Svg viewBox="0 0 56 62" width={56} height={62}>
        <Polygon
          points="28,2 52,16 52,46 28,60 4,46 4,16"
          fill={c}
          opacity={0.9}
        />
        <Polygon
          points="28,7 47,19 47,43 28,55 9,43 9,19"
          fill={theme.bg[1]}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} stroke={1.8} color={c} />
      </View>
    </View>
  );
};
