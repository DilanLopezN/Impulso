import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  Body,
  Card,
  Eyebrow,
  H1,
  Icon,
  Mono,
  Neon,
  Small,
} from '@/components';
import { useTheme } from '@/theme/ThemeContext';
import { TIER_COLORS } from '@/theme/colors';

type Leader = {
  id: number;
  name: string;
  handle: string;
  xp: number;
  level: number;
  streak: number;
  avatar: string;
  trend: string;
  you?: boolean;
};

const LEADERS: Leader[] = [
  { id: 1, name: 'Lucas Mendes', handle: 'lucasm', xp: 8420, level: 14, streak: 62, avatar: 'L', trend: '+340' },
  { id: 2, name: 'Marina Ribeiro', handle: 'marina', xp: 7180, level: 12, streak: 28, avatar: 'M', trend: '+280', you: true },
  { id: 3, name: 'Rafael Costa', handle: 'rafac', xp: 6940, level: 12, streak: 19, avatar: 'R', trend: '+210' },
];

const REST: Leader[] = [
  { id: 4, name: 'Julia Santos', handle: 'juliaas', xp: 5820, level: 10, streak: 14, avatar: 'J', trend: '+160' },
  { id: 5, name: 'André Oliveira', handle: 'andreo', xp: 5410, level: 10, streak: 22, avatar: 'A', trend: '+140' },
  { id: 6, name: 'Carla Duarte', handle: 'carlad', xp: 4980, level: 9, streak: 8, avatar: 'C', trend: '+120' },
  { id: 7, name: 'Pedro Almeida', handle: 'pedroa', xp: 4720, level: 9, streak: 31, avatar: 'P', trend: '+95' },
  { id: 8, name: 'Beatriz Lima', handle: 'bealima', xp: 4510, level: 8, streak: 11, avatar: 'B', trend: '+80' },
  { id: 9, name: 'Felipe Rocha', handle: 'feliper', xp: 4230, level: 8, streak: 6, avatar: 'F', trend: '+65' },
  { id: 10, name: 'Sofia Martins', handle: 'sofiam', xp: 3980, level: 7, streak: 17, avatar: 'S', trend: '+50' },
];

type Scope = 'global' | 'friends';
type Period = 'week' | 'month' | 'all';

export const Rank = () => {
  const { theme } = useTheme();
  const [scope, setScope] = useState<Scope>('global');
  const [period, setPeriod] = useState<Period>('week');

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 6 }}>RANK</Eyebrow>
        <H1>Liga do Impulso</H1>
        <Body style={{ color: theme.ink[2], marginTop: 6 }}>
          Suba posições acumulando XP — a semana reinicia domingo
        </Body>
      </View>

      {/* Filters */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { id: 'global', label: 'Global' },
            { id: 'friends', label: 'Amigos' },
          ]}
          style={{ flex: 1 }}
        />
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { id: 'week', label: 'Semana' },
            { id: 'month', label: 'Mês' },
            { id: 'all', label: 'Geral' },
          ]}
          style={{ flex: 1 }}
        />
      </View>

      {/* Podium */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Card style={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 18 }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'flex-end',
            }}
          >
            <PodiumSlot
              leader={LEADERS[1]!}
              rank={2}
              height={108}
              color={TIER_COLORS.silver}
            />
            <PodiumSlot
              leader={LEADERS[0]!}
              rank={1}
              height={140}
              color={TIER_COLORS.gold}
              crown
            />
            <PodiumSlot
              leader={LEADERS[2]!}
              rank={3}
              height={88}
              color={TIER_COLORS.bronze}
            />
          </View>
        </Card>
      </View>

      {/* Your position */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <Card
          accent
          style={{
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: theme.accentDim,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.accent,
              shadowOpacity: 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <Mono
              style={{
                color: theme.accentInk,
                fontSize: 16,
                fontFamily: 'Geist_600SemiBold',
              }}
            >
              #2
            </Mono>
          </View>
          <View style={{ flex: 1 }}>
            <Body
              style={{
                fontFamily: 'Geist_600SemiBold',
                color: theme.ink[0],
              }}
            >
              Você está a <Neon>1.240 XP</Neon> do topo
            </Body>
            <Small style={{ color: theme.ink[2], marginTop: 2 }}>
              Mantendo seu ritmo, você ultrapassa em{' '}
              <Mono style={{ color: theme.ink[2] }}>4 dias</Mono>
            </Small>
          </View>
          <Icon name="trend" size={18} stroke={2} color={theme.accent} />
        </Card>
      </View>

      {/* Full list */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 12 }}>RANKING COMPLETO</Eyebrow>
        <Card>
          {REST.map((p, i) => (
            <RankRow
              key={p.id}
              player={p}
              rank={i + 4}
              last={i === REST.length - 1}
            />
          ))}
        </Card>
      </View>

      {/* Season reward */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Card
          style={{
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: `${TIER_COLORS.gold}33`,
              borderWidth: 1,
              borderColor: `${TIER_COLORS.gold}80`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="medal" size={20} stroke={1.8} color={TIER_COLORS.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Body
              style={{
                fontFamily: 'Geist_600SemiBold',
                color: theme.ink[0],
              }}
            >
              Recompensa da temporada
            </Body>
            <Small style={{ color: theme.ink[3], marginTop: 2 }}>
              Termina em{' '}
              <Mono style={{ color: theme.accent }}>4d 11h</Mono> · Top 10
              ganham badge exclusivo
            </Small>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

/* ================== SUB COMPONENTS ================== */

type SegmentedProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  style?: any;
};

function Segmented<T extends string>({
  value,
  onChange,
  options,
  style,
}: SegmentedProps<T>) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: theme.glassStrong,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 10,
          padding: 3,
        },
        style,
      ]}
    >
      {options.map((o) => {
        const active = value === o.id;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 6,
              borderRadius: 7,
              alignItems: 'center',
              backgroundColor: active ? theme.accent : 'transparent',
            }}
          >
            <Small
              style={{
                color: active ? theme.accentInk : theme.ink[2],
                fontSize: 11,
                fontFamily: 'Geist_600SemiBold',
              }}
            >
              {o.label}
            </Small>
          </Pressable>
        );
      })}
    </View>
  );
}

type PodiumSlotProps = {
  leader: Leader;
  rank: number;
  height: number;
  color: string;
  crown?: boolean;
};

const PodiumSlot = ({ leader, rank, height, color, crown }: PodiumSlotProps) => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {crown ? <Text style={{ fontSize: 20, marginBottom: 4 }}>👑</Text> : null}
      <View style={{ width: 56, height: 56, marginBottom: 8 }}>
        <View
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 28,
            backgroundColor: `${color}CC`,
            borderWidth: 2,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mono
            style={{
              fontSize: 22,
              color: theme.bg[0],
              fontFamily: 'Geist_600SemiBold',
            }}
          >
            {leader.avatar}
          </Mono>
        </View>
        <View
          style={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: theme.bg[1],
          }}
        >
          <Mono
            style={{
              fontSize: 11,
              color: theme.bg[0],
              fontFamily: 'Geist_600SemiBold',
            }}
          >
            {rank}
          </Mono>
        </View>
      </View>
      <Body
        style={{
          fontSize: 12,
          fontFamily: 'Geist_600SemiBold',
          color: theme.ink[0],
          marginBottom: 2,
        }}
        numberOfLines={1}
      >
        {leader.name.split(' ')[0]}
      </Body>
      <Mono
        style={{
          fontSize: 11,
          color,
          fontFamily: 'Geist_600SemiBold',
          marginBottom: 10,
        }}
      >
        {leader.xp.toLocaleString('pt-BR')} XP
      </Mono>
      <View
        style={{
          alignSelf: 'stretch',
          height,
          backgroundColor: `${color}1F`,
          borderWidth: 1,
          borderColor: `${color}80`,
          borderBottomWidth: 0,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          alignItems: 'center',
          paddingTop: 10,
        }}
      >
        <Mono
          style={{
            fontSize: 22,
            color,
            fontFamily: 'Geist_600SemiBold',
            letterSpacing: -0.88,
          }}
        >
          {rank}
        </Mono>
      </View>
    </View>
  );
};

type RankRowProps = {
  player: Leader;
  rank: number;
  last: boolean;
};

const RankRow = ({ player, rank, last }: RankRowProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Mono
        style={{
          width: 28,
          textAlign: 'center',
          fontSize: 13,
          color: theme.ink[3],
          fontFamily: 'Geist_600SemiBold',
        }}
      >
        {rank}
      </Mono>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.bg[2],
          borderWidth: 1,
          borderColor: theme.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Mono
          style={{
            fontSize: 14,
            color: theme.ink[1],
            fontFamily: 'Geist_600SemiBold',
          }}
        >
          {player.avatar}
        </Mono>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Body
          style={{
            fontSize: 13,
            fontFamily: 'Geist_600SemiBold',
            color: theme.ink[0],
          }}
        >
          {player.name}
        </Body>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
          <Mono style={{ fontSize: 10, color: theme.ink[3] }}>
            LVL {player.level}
          </Mono>
          <Mono style={{ fontSize: 10, color: theme.ink[3] }}>
            🔥 {player.streak}d
          </Mono>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Mono
          style={{
            fontSize: 13,
            color: theme.ink[0],
            fontFamily: 'Geist_600SemiBold',
          }}
        >
          {player.xp.toLocaleString('pt-BR')}
        </Mono>
        <Mono style={{ fontSize: 10, color: theme.accent, marginTop: 2 }}>
          {player.trend} XP
        </Mono>
      </View>
    </View>
  );
};
