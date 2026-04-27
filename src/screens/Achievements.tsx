import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
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
import { useGamification } from '@/gamification/GamificationContext';
import { useTheme } from '@/theme/ThemeContext';
import { TIER_COLORS } from '@/theme/colors';
import type {
  AchievementCategory,
  AchievementView,
} from '@/services/gamification.service';
import type { IconName } from '@/types';

type Tier = keyof typeof TIER_COLORS;

const KNOWN_ICONS: ReadonlyArray<IconName> = [
  'home', 'target', 'flame', 'trophy', 'user', 'plus', 'chevron', 'chevronL',
  'close', 'check', 'bell', 'sparkle', 'book', 'run', 'wallet', 'zap',
  'calendar', 'moon', 'settings', 'share', 'dots', 'clock', 'edit', 'search',
  'arrow', 'trend', 'lock', 'medal', 'heart', 'filter', 'star',
];

// Server icon names live in a wider catalog (eg. "fire", "spark", "crown");
// fall back to the closest visual when we don't have a 1:1 match.
const ICON_ALIASES: Record<string, IconName> = {
  fire: 'flame',
  spark: 'sparkle',
  crown: 'trophy',
};

const resolveIcon = (raw: string | null): IconName => {
  if (!raw) return 'medal';
  if ((KNOWN_ICONS as readonly string[]).includes(raw)) return raw as IconName;
  return ICON_ALIASES[raw] ?? 'medal';
};

// Tier is a presentation concept — derive it from XP reward bands so the
// UI keeps its bronze/silver/gold language without backend coupling.
const tierForReward = (xp: number): Tier => {
  if (xp >= 400) return 'gold';
  if (xp >= 150) return 'silver';
  return 'bronze';
};

const CATEGORY_OPTIONS: {
  id: AchievementCategory | 'ALL';
  label: string;
}[] = [
  { id: 'ALL', label: 'Todas' },
  { id: 'STREAKS', label: 'Sequências' },
  { id: 'HABITS', label: 'Hábitos' },
  { id: 'GOALS', label: 'Metas' },
  { id: 'XP', label: 'XP' },
];

const formatDateBR = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`;
};

export const Achievements = () => {
  const { theme } = useTheme();
  const { achievements, summary, loading, refresh } = useGamification();
  const [filter, setFilter] = useState<AchievementCategory | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return achievements;
    return achievements.filter((a) => a.category === filter);
  }, [achievements, filter]);

  const earned = useMemo(
    () => filtered.filter((a) => a.unlocked),
    [filtered],
  );
  const locked = useMemo(
    () => filtered.filter((a) => !a.unlocked),
    [filtered],
  );

  const featured = useMemo<AchievementView | null>(() => {
    const earnedSorted = achievements
      .filter((a) => a.unlocked && a.unlockedAt)
      .sort((a, b) => (b.unlockedAt ?? '').localeCompare(a.unlockedAt ?? ''));
    return earnedSorted[0] ?? null;
  }, [achievements]);

  const totalUnlocked = summary?.achievementsUnlocked ?? earned.length;
  const totalCatalog = achievements.length;
  const ratio = totalCatalog > 0 ? totalUnlocked / totalCatalog : 0;

  if (loading && achievements.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refresh}
          tintColor={theme.accent}
          colors={[theme.accent]}
        />
      }
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
            {totalUnlocked}
          </Mono>
          <Mono style={{ fontSize: 16, color: theme.ink[3] }}>
            / {totalCatalog}
          </Mono>
          <View style={{ marginLeft: 'auto' }}>
            <Chip>
              <Small style={{ color: theme.ink[1], fontSize: 11 }}>
                {Math.round(ratio * 100)}% desbloqueado
              </Small>
            </Chip>
          </View>
        </View>
        <ProgressBar value={ratio} style={{ marginTop: 10 }} />
      </View>

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
          paddingBottom: 20,
        }}
      >
        {CATEGORY_OPTIONS.map((c) => {
          const active = filter === c.id;
          return (
            <Pressable key={c.id} onPress={() => setFilter(c.id)}>
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
                  {c.label}
                </Small>
              </Chip>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Featured */}
      {featured ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Eyebrow style={{ marginBottom: 12 }}>
            DESBLOQUEADA RECENTEMENTE
          </Eyebrow>
          <Card
            accent
            style={{
              padding: 22,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <BadgeBig
              tier={tierForReward(featured.xpReward)}
              icon={resolveIcon(featured.icon)}
            />
            <View style={{ flex: 1 }}>
              <Eyebrow style={{ color: theme.accent, marginBottom: 4 }}>
                {tierForReward(featured.xpReward).toUpperCase()} ·{' '}
                {featured.unlockedAt ? formatDateBR(featured.unlockedAt) : ''}
              </Eyebrow>
              <H3 style={{ marginBottom: 4 }}>{featured.title}</H3>
              <Small style={{ color: theme.ink[2] }}>
                {featured.description}
              </Small>
              <Mono
                style={{
                  fontSize: 11,
                  color: theme.accent,
                  marginTop: 8,
                  fontFamily: 'Geist_600SemiBold',
                }}
              >
                +{featured.xpReward} XP
              </Mono>
            </View>
          </Card>
        </View>
      ) : null}

      {earned.length > 0 ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <Eyebrow style={{ marginBottom: 12 }}>
            CONQUISTADAS · {earned.length}
          </Eyebrow>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {earned.map((a) => (
              <EarnedCard key={a.id} achievement={a} />
            ))}
          </View>
        </View>
      ) : null}

      {locked.length > 0 ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <Eyebrow style={{ marginBottom: 12 }}>EM PROGRESSO</Eyebrow>
          <View style={{ gap: 10 }}>
            {locked.map((a) => (
              <LockedRow key={a.id} achievement={a} />
            ))}
          </View>
        </View>
      ) : null}

      {achievements.length === 0 ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Card style={{ padding: 22, alignItems: 'center' }}>
            <Small style={{ color: theme.ink[2], textAlign: 'center' }}>
              Nada por aqui ainda. Conquiste seu primeiro hábito ou meta para
              desbloquear medalhas.
            </Small>
          </Card>
        </View>
      ) : null}
    </ScrollView>
  );
};

/* ================== CARDS ================== */

const EarnedCard = ({ achievement }: { achievement: AchievementView }) => {
  const { theme } = useTheme();
  const tier = tierForReward(achievement.xpReward);
  return (
    <Card style={{ padding: 16, width: '48%', alignItems: 'center' }}>
      <View style={{ marginBottom: 10 }}>
        <BadgeSmall tier={tier} icon={resolveIcon(achievement.icon)} />
      </View>
      <Body
        style={{
          fontSize: 13,
          fontFamily: 'Geist_600SemiBold',
          color: theme.ink[0],
          marginBottom: 2,
        }}
        numberOfLines={1}
      >
        {achievement.title}
      </Body>
      <Small
        style={{
          color: theme.ink[3],
          fontSize: 10,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {achievement.description}
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
          {achievement.unlockedAt ? formatDateBR(achievement.unlockedAt) : ''}
        </Mono>
        <Mono
          style={{
            fontSize: 10,
            color: TIER_COLORS[tier],
            fontFamily: 'Geist_600SemiBold',
          }}
        >
          +{achievement.xpReward} XP
        </Mono>
      </View>
    </Card>
  );
};

const LockedRow = ({ achievement }: { achievement: AchievementView }) => {
  const { theme } = useTheme();
  return (
    <Card
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
          {achievement.title}
        </Body>
        <Small style={{ color: theme.ink[3] }}>{achievement.description}</Small>
      </View>
      <Mono
        style={{
          fontSize: 10,
          color: theme.ink[2],
          fontFamily: 'Geist_600SemiBold',
        }}
      >
        +{achievement.xpReward}
      </Mono>
    </Card>
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
