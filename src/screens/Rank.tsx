import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
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
import {
  gamificationService,
  type RankingEntry,
  type RankingPeriod,
  type RankingScope,
} from '@/services/gamification.service';
import { useTheme } from '@/theme/ThemeContext';
import { TIER_COLORS } from '@/theme/colors';

const toShort = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((chunk) => chunk[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

const levelFromXp = (xp: number): number => Math.max(1, Math.floor(Math.sqrt(Math.max(xp, 0) / 100)) + 1);

export const Rank = () => {
  const { theme } = useTheme();
  const { tokens, user } = useAuth();
  const [scope, setScope] = useState<RankingScope>('global');
  const [period, setPeriod] = useState<RankingPeriod>('weekly');
  const [items, setItems] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = tokens?.accessToken;
    if (!accessToken) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    gamificationService
      .rankings(accessToken, { period, scope, limit: 30 })
      .then((result) => {
        if (!cancelled) setItems(result.items);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Falha ao carregar ranking.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tokens?.accessToken, period, scope]);

  const podium = items.slice(0, 3);
  const rest = items.slice(3);
  const me = useMemo(() => items.find((entry) => entry.userId === user?.id), [items, user?.id]);
  const topXp = podium[0]?.totalXp ?? 0;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 6 }}>RANK</Eyebrow>
        <H1>Liga do Impulso</H1>
        <Body style={{ color: theme.ink[2], marginTop: 6 }}>
          Ranking atualizado pelo worker em Go e entregue com cache Redis.
        </Body>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', gap: 8 }}>
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
            { id: 'weekly', label: 'Semana' },
            { id: 'monthly', label: 'Mês' },
            { id: 'all_time', label: 'Geral' },
          ]}
          style={{ flex: 1 }}
        />
      </View>

      {loading ? (
        <View style={{ paddingTop: 28, alignItems: 'center' }}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : null}

      {error ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Card style={{ padding: 14, borderColor: '#F2947A', backgroundColor: 'rgba(242, 148, 122, 0.12)' }}>
            <Small style={{ color: '#F2947A' }}>{error}</Small>
          </Card>
        </View>
      ) : null}

      {podium.length === 3 ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Card style={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 18 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
              <PodiumSlot leader={podium[1]!} rank={2} height={108} color={TIER_COLORS.silver} />
              <PodiumSlot leader={podium[0]!} rank={1} height={140} color={TIER_COLORS.gold} crown />
              <PodiumSlot leader={podium[2]!} rank={3} height={88} color={TIER_COLORS.bronze} />
            </View>
          </Card>
        </View>
      ) : null}

      {me ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
          <Card accent style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.accentDim }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Mono style={{ color: theme.accentInk, fontSize: 16, fontFamily: 'Geist_600SemiBold' }}>#{me.position}</Mono>
            </View>
            <View style={{ flex: 1 }}>
              <Body style={{ fontFamily: 'Geist_600SemiBold', color: theme.ink[0] }}>
                Você está a <Neon>{Math.max(topXp - me.totalXp, 0)} XP</Neon> do topo
              </Body>
              <Small style={{ color: theme.ink[2], marginTop: 2 }}>
                {me.totalXp} XP · {me.checkinsCount} check-ins
              </Small>
            </View>
            <Icon name="trend" size={18} stroke={2} color={theme.accent} />
          </Card>
        </View>
      ) : null}

      {rest.length > 0 ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Eyebrow style={{ marginBottom: 12 }}>RANKING COMPLETO</Eyebrow>
          <Card>
            {rest.map((p, i) => (
              <RankRow key={p.userId} player={p} rank={i + 4} last={i === rest.length - 1} />
            ))}
          </Card>
        </View>
      ) : null}
    </ScrollView>
  );
};

type SegmentedProps<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  style?: any;
};

function Segmented<T extends string>({ value, onChange, options, style }: SegmentedProps<T>) {
  const { theme } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: theme.glassStrong, borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 3 }, style]}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 6, borderRadius: 7, alignItems: 'center', backgroundColor: active ? theme.accent : 'transparent' }}
          >
            <Small style={{ color: active ? theme.accentInk : theme.ink[2], fontSize: 11, fontFamily: 'Geist_600SemiBold' }}>{o.label}</Small>
          </Pressable>
        );
      })}
    </View>
  );
}

type PodiumSlotProps = {
  leader: RankingEntry;
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
        <View style={{ width: '100%', height: '100%', borderRadius: 28, backgroundColor: `${color}26`, borderWidth: 1, borderColor: `${color}90`, alignItems: 'center', justifyContent: 'center' }}>
          <Mono style={{ fontSize: 20, fontFamily: 'Geist_600SemiBold', color }}>{toShort(leader.displayName)}</Mono>
        </View>
      </View>
      <Small style={{ color: theme.ink[3], marginBottom: 2 }}>#{rank}</Small>
      <Body numberOfLines={1} style={{ fontFamily: 'Geist_600SemiBold', color: theme.ink[0], fontSize: 13, textAlign: 'center' }}>{leader.displayName}</Body>
      <Mono style={{ color, fontSize: 11, marginTop: 2 }}>{leader.totalXp} XP</Mono>
      <View style={{ width: '100%', height, marginTop: 8, borderRadius: 12, backgroundColor: `${color}20`, borderWidth: 1, borderColor: `${color}80`, alignItems: 'center', justifyContent: 'center' }}>
        <Mono style={{ color, fontFamily: 'Geist_600SemiBold', fontSize: 18 }}>LVL {levelFromXp(leader.totalXp)}</Mono>
      </View>
    </View>
  );
};

type RankRowProps = {
  player: RankingEntry;
  rank: number;
  last?: boolean;
};

const RankRow = ({ player, rank, last }: RankRowProps) => {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border }}>
      <Mono style={{ width: 28, color: theme.ink[3], fontSize: 13 }}>#{rank}</Mono>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.bg[2], borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
        <Mono style={{ color: theme.ink[1], fontFamily: 'Geist_600SemiBold' }}>{toShort(player.displayName)}</Mono>
      </View>
      <View style={{ flex: 1 }}>
        <Body style={{ color: theme.ink[0], fontFamily: 'Geist_600SemiBold' }}>{player.displayName}</Body>
        <Small style={{ color: theme.ink[3], marginTop: 1 }}>{player.checkinsCount} check-ins</Small>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Mono style={{ color: theme.accent, fontSize: 13 }}>{player.totalXp} XP</Mono>
        <Small style={{ color: theme.ink[3], marginTop: 1 }}>LVL {levelFromXp(player.totalXp)}</Small>
      </View>
    </View>
  );
};
