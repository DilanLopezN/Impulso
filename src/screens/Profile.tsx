import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  Body,
  Card,
  Eyebrow,
  H2,
  Icon,
  Mono,
  ProgressBar,
  ProgressRing,
  Small,
} from '@/components';
import { useAuth } from '@/auth/AuthContext';
import { useGamification } from '@/gamification/GamificationContext';
import { useGoals } from '@/goals/GoalsContext';
import { useHabits } from '@/habits/HabitsContext';
import { useTheme } from '@/theme/ThemeContext';
import type { IconName } from '@/types';

type ProfileProps = {
  name: string;
  onOpenOnboarding: () => void;
  onOpenSecurity: () => void;
};

const formatXp = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
};

export const Profile = ({
  name,
  onOpenOnboarding,
  onOpenSecurity,
}: ProfileProps) => {
  const { theme } = useTheme();
  const { logout, user } = useAuth();
  const { summary } = useGamification();
  const { habits } = useHabits();
  const { goals } = useGoals();

  const level = summary?.level ?? 1;
  const xp = summary?.xpIntoLevel ?? 0;
  const xpToNext = (summary?.xpIntoLevel ?? 0) + (summary?.xpToNext ?? 100);
  const streak = summary?.longestStreak ?? 0;
  const totalXp = summary?.totalXp ?? 0;

  const completedGoals = goals.filter((g) => g.progress >= 1).length;
  const totalGoals = goals.length;
  const activeHabits = habits.filter((h) => !h.archivedAt).length;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const stats = [
    {
      label: 'METAS CONCLUÍDAS',
      value: String(completedGoals),
      sub: `de ${totalGoals} criadas`,
    },
    {
      label: 'HÁBITOS ATIVOS',
      value: String(activeHabits),
      sub: 'em rotina',
    },
    {
      label: 'XP TOTAL',
      value: formatXp(totalXp),
      sub: `nível ${level}`,
    },
    {
      label: 'CONQUISTAS',
      value: String(summary?.achievementsUnlocked ?? 0),
      sub: 'desbloqueadas',
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Eyebrow>PERFIL</Eyebrow>
        <Pressable>
          <Icon name="settings" size={20} color={theme.ink[2]} />
        </Pressable>
      </View>

      {/* Hero */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          alignItems: 'center',
        }}
      >
        <View style={{ marginBottom: 16 }}>
          <ProgressRing value={xp / xpToNext} size={144} stroke={6}>
            <View
              style={{
                width: 116,
                height: 116,
                borderRadius: 58,
                backgroundColor: theme.bg[2],
                borderWidth: 1,
                borderColor: theme.borderStrong,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mono
                style={{
                  fontSize: 48,
                  color: theme.accent,
                  fontFamily: 'Geist_600SemiBold',
                  letterSpacing: -1.92,
                }}
              >
                {name[0]}
              </Mono>
            </View>
          </ProgressRing>

          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              minWidth: 40,
              height: 28,
              paddingHorizontal: 10,
              borderRadius: 14,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: theme.bg[0],
            }}
          >
            <Mono
              style={{
                color: theme.accentInk,
                fontSize: 12,
                fontFamily: 'Geist_600SemiBold',
              }}
            >
              LVL {level}
            </Mono>
          </View>
        </View>

        <H2 style={{ marginBottom: 4 }}>{name}</H2>
        <Small style={{ color: theme.ink[2] }}>
          @{name.toLowerCase().replace(/\s+/g, '')} · Desde {memberSince}
        </Small>

        <View style={{ maxWidth: 240, width: '100%', marginTop: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <Mono style={{ color: theme.ink[2], fontSize: 10 }}>
              NÍVEL {level}
            </Mono>
            <Mono style={{ color: theme.accent, fontSize: 10 }}>
              {xp} / {xpToNext} XP
            </Mono>
          </View>
          <ProgressBar value={xp / xpToNext} />
          <Mono style={{ color: theme.ink[3], fontSize: 10, marginTop: 6 }}>
            {xpToNext - xp} XP para nível {level + 1}
          </Mono>
        </View>
      </View>

      {/* Stats grid */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {stats.map((s) => (
            <Card key={s.label} style={{ padding: 16, width: '48%' }}>
              <Eyebrow style={{ fontSize: 9, marginBottom: 6 }}>
                {s.label}
              </Eyebrow>
              <Mono
                style={{
                  fontSize: 26,
                  color: theme.ink[0],
                  letterSpacing: -0.78,
                  fontFamily: 'GeistMono_500Medium',
                }}
              >
                {s.value}
              </Mono>
              <Small style={{ color: theme.ink[3], fontSize: 10, marginTop: 2 }}>
                {s.sub}
              </Small>
            </Card>
          ))}
        </View>
      </View>

      {/* Streak card */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Card
          style={{
            padding: 18,
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
              backgroundColor: 'rgba(255, 140, 50, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(255, 120, 50, 0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 24 }}>🔥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Body
              style={{
                fontFamily: 'Geist_600SemiBold',
                color: theme.ink[0],
              }}
            >
              Sequência mais longa
            </Body>
            <Mono style={{ color: theme.ink[3], fontSize: 12, marginTop: 2 }}>
              {streak > 0
                ? `Você está em ${streak} dias consecutivos`
                : 'Comece um hábito e construa sua sequência'}
            </Mono>
          </View>
          <Mono
            style={{
              fontSize: 22,
              color: theme.accent,
              fontFamily: 'GeistMono_500Medium',
            }}
          >
            {streak}d
          </Mono>
        </Card>
      </View>

      {/* Menu */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Eyebrow style={{ marginBottom: 12 }}>AJUSTES</Eyebrow>
        <Card>
          <MenuRow icon="bell" label="Notificações" right="Ativas" />
          <MenuRow icon="moon" label="Aparência" right="Escuro" />
          <MenuRow
            icon="calendar"
            label="Integração com Calendário"
            right="Google"
          />
          <MenuRow icon="heart" label="Apoiar Impulso" right="Pro" rightAccent />
          <MenuRow icon="share" label="Convidar amigos" />
          <MenuRow
            icon="sparkle"
            label="Revisitar onboarding"
            onPress={onOpenOnboarding}
          />
          <MenuRow
            icon="lock"
            label="Conta e segurança"
            onPress={onOpenSecurity}
          />
          <MenuRow
            icon="close"
            label="Sair"
            onPress={() => {
              void logout();
            }}
            last
          />
        </Card>
      </View>

    </ScrollView>
  );
};

type MenuRowProps = {
  icon: IconName;
  label: string;
  right?: string;
  rightAccent?: boolean;
  onPress?: () => void;
  last?: boolean;
};

const MenuRow = ({
  icon,
  label,
  right,
  rightAccent,
  onPress,
  last,
}: MenuRowProps) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: theme.border,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: theme.glassStrong,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={14} stroke={1.8} color={theme.ink[1]} />
        </View>
        <Body style={{ flex: 1, fontFamily: 'Geist_500Medium' }}>{label}</Body>
        {right ? (
          <Mono
            style={{
              color: rightAccent ? theme.accent : theme.ink[3],
              fontSize: 11,
              fontFamily: 'Geist_600SemiBold',
            }}
          >
            {right}
          </Mono>
        ) : null}
        <Icon name="chevron" size={12} stroke={2} color={theme.ink[3]} />
      </View>
    </Pressable>
  );
};
