import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import {
  Body,
  Card,
  Eyebrow,
  H1,
  Icon,
  Mono,
  Small,
} from '@/components';
import { useTheme } from '@/theme/ThemeContext';
import type { ThemeTokens } from '@/theme/tokens';
import type { IconName } from '@/types';

type Filter = 'seguindo' | 'todos' | 'marcos' | 'reflexoes';

type PostUser = {
  name: string;
  handle: string;
  avatar: string;
  level: number;
  supporter: boolean;
};

type Milestone = {
  title: string;
  category: string;
  icon: IconName;
  color: string;
  xp: string;
};

type Streak = {
  days: number;
  habit: string;
};

type GoalCard = {
  title: string;
  progress: number;
  color: string;
};

type Post =
  | {
      id: number;
      type: 'milestone';
      user: PostUser;
      time: string;
      content: string;
      milestone: Milestone;
      likes: number;
      comments: number;
      supports: number;
    }
  | {
      id: number;
      type: 'streak';
      user: PostUser;
      time: string;
      content: string;
      streak: Streak;
      likes: number;
      comments: number;
      supports: number;
    }
  | {
      id: number;
      type: 'goal_complete';
      user: PostUser;
      time: string;
      content: string;
      goalCard: GoalCard;
      likes: number;
      comments: number;
      supports: number;
    }
  | {
      id: number;
      type: 'reflection';
      user: PostUser;
      time: string;
      content: string;
      likes: number;
      comments: number;
      supports: number;
    }
  | {
      id: number;
      type: 'ad';
      sponsor: string;
      content: string;
      cta: string;
    };

const POSTS: Post[] = [
  {
    id: 1,
    type: 'milestone',
    user: { name: 'Lucas Mendes', handle: 'lucasm', avatar: 'L', level: 14, supporter: true },
    time: '2h',
    content:
      'Acabei de completar minha primeira meia-maratona! 21km em 1h54. Há 6 meses não conseguia correr 2km sem parar. Consistência > intensidade.',
    milestone: {
      title: 'Meia-maratona',
      category: 'Fitness',
      icon: 'run',
      color: '#F4936B',
      xp: '+500 XP',
    },
    likes: 142,
    comments: 18,
    supports: 24,
  },
  {
    id: 2,
    type: 'streak',
    user: { name: 'Julia Santos', handle: 'juliaas', avatar: 'J', level: 10, supporter: false },
    time: '4h',
    content:
      '30 dias meditando todo dia. Comecei achando que ia desistir na primeira semana. O segredo? Reduzir a meta — 5 minutos é melhor que 0.',
    streak: { days: 30, habit: 'Meditar diariamente' },
    likes: 89,
    comments: 12,
    supports: 8,
  },
  {
    id: 3,
    type: 'ad',
    sponsor: 'Cursos Alura',
    content: 'Domine React em 30 dias com mentoria 1:1.',
    cta: 'Saber mais',
  },
  {
    id: 4,
    type: 'goal_complete',
    user: { name: 'Rafael Costa', handle: 'rafac', avatar: 'R', level: 12, supporter: true },
    time: '8h',
    content:
      'Curso de Design Systems FINALIZADO 🎯 4 meses, 38 aulas, 1 projeto final. Próxima parada: aplicar isso no trabalho.',
    goalCard: { title: 'Curso Design Systems', progress: 1.0, color: '#9DA8E8' },
    likes: 234,
    comments: 41,
    supports: 67,
  },
  {
    id: 5,
    type: 'reflection',
    user: { name: 'Carla Duarte', handle: 'carlad', avatar: 'C', level: 9, supporter: false },
    time: '1d',
    content:
      'Reflexão da semana: não consegui bater todas as metas, mas mantive 5 de 7 dias ativos. Antes eu desistiria. Hoje, sei que progresso é progresso.',
    likes: 67,
    comments: 9,
    supports: 4,
  },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'seguindo', label: 'Seguindo' },
  { id: 'todos', label: 'Descobrir' },
  { id: 'marcos', label: 'Marcos' },
  { id: 'reflexoes', label: 'Reflexões' },
];

export const Feed = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<Filter>('seguindo');

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
          paddingBottom: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Eyebrow style={{ marginBottom: 6 }}>FEED</Eyebrow>
          <H1>Comunidade</H1>
        </View>
        <Pressable
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: theme.glassStrong,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="search" size={18} stroke={2} color={theme.ink[1]} />
        </Pressable>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          gap: 8,
        }}
      >
        {FILTERS.map((o) => {
          const active = filter === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => setFilter(o.id)}
              style={{
                paddingVertical: 7,
                paddingHorizontal: 12,
                borderRadius: 999,
                backgroundColor: active ? theme.accent : theme.glassStrong,
                borderWidth: 1,
                borderColor: active ? theme.accent : theme.border,
                ...(active
                  ? {
                      shadowColor: theme.accent,
                      shadowOpacity: 0.5,
                      shadowRadius: 14,
                      shadowOffset: { width: 0, height: 0 },
                    }
                  : null),
              }}
            >
              <Small
                style={{
                  fontFamily: 'Geist_600SemiBold',
                  color: active ? theme.accentInk : theme.ink[1],
                }}
              >
                {o.label}
              </Small>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Compose */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
        <Pressable>
          <Card
            style={{
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                backgroundColor: theme.bg[3],
                borderWidth: 1,
                borderColor: theme.borderStrong,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mono
                style={{
                  fontFamily: 'GeistMono_500Medium',
                  fontSize: 14,
                  color: theme.accent,
                }}
              >
                M
              </Mono>
            </View>
            <Small style={{ color: theme.ink[3], flex: 1 }}>
              Compartilhe sua jornada...
            </Small>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: theme.accentDim,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="sparkle" size={14} stroke={2} color={theme.accent} />
            </View>
          </Card>
        </Pressable>
      </View>

      {/* Posts */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {POSTS.map((p) =>
          p.type === 'ad' ? (
            <AdCard key={p.id} ad={p} />
          ) : (
            <PostCard key={p.id} post={p} />
          ),
        )}
      </View>
    </ScrollView>
  );
};

/* ================== SUB COMPONENTS ================== */

type PostCardProps = {
  post: Exclude<Post, { type: 'ad' }>;
};

const PostCard = ({ post }: PostCardProps) => {
  const { theme } = useTheme();
  const [liked, setLiked] = useState(false);
  const [supported, setSupported] = useState(false);

  return (
    <Card style={{ padding: 0 }}>
      {/* Header */}
      <View
        style={{
          paddingTop: 14,
          paddingHorizontal: 14,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 999,
            backgroundColor: theme.bg[3],
            borderWidth: 1,
            borderColor: theme.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mono
            style={{
              fontFamily: 'GeistMono_500Medium',
              fontSize: 14,
              color: theme.ink[1],
            }}
          >
            {post.user.avatar}
          </Mono>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Body
              style={{
                fontSize: 13,
                fontFamily: 'Geist_600SemiBold',
                color: theme.ink[0],
              }}
            >
              {post.user.name}
            </Body>
            {post.user.supporter ? (
              <View
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  backgroundColor: theme.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: theme.accent,
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 0 },
                }}
              >
                <Icon name="check" size={9} stroke={3.5} color={theme.accentInk} />
              </View>
            ) : null}
            <View
              style={{
                paddingVertical: 1,
                paddingHorizontal: 6,
                borderRadius: 999,
                backgroundColor: theme.glassStrong,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Mono
                style={{
                  fontSize: 9,
                  color: theme.ink[2],
                  fontFamily: 'GeistMono_500Medium',
                }}
              >
                LVL {post.user.level}
              </Mono>
            </View>
          </View>
          <Mono
            style={{
              fontSize: 10,
              color: theme.ink[3],
              marginTop: 1,
              fontFamily: 'GeistMono_500Medium',
            }}
          >
            @{post.user.handle} · há {post.time}
          </Mono>
        </View>
        <Pressable hitSlop={6}>
          <Icon name="dots" size={16} color={theme.ink[3]} />
        </Pressable>
      </View>

      {/* Content */}
      <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
        <Body
          style={{
            fontSize: 14,
            lineHeight: 21,
            color: theme.ink[0],
          }}
        >
          {post.content}
        </Body>
      </View>

      {/* Attachment by type */}
      {post.type === 'milestone' ? (
        <MilestoneAttachment milestone={post.milestone} theme={theme} />
      ) : null}
      {post.type === 'streak' ? (
        <StreakAttachment streak={post.streak} theme={theme} />
      ) : null}
      {post.type === 'goal_complete' ? (
        <GoalAttachment goal={post.goalCard} theme={theme} />
      ) : null}

      {/* Actions */}
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <ActionBtn
          icon="heart"
          label={post.likes + (liked ? 1 : 0)}
          active={liked}
          onPress={() => setLiked((v) => !v)}
          color="#E26B5A"
        />
        <ActionBtn icon="edit" label={post.comments} />
        <ActionBtn
          icon="zap"
          label={post.supports + (supported ? 1 : 0)}
          active={supported}
          onPress={() => setSupported((v) => !v)}
          color={theme.accent}
        />
        <View style={{ flex: 1 }} />
        <Pressable
          hitSlop={6}
          style={{ padding: 8, borderRadius: 8 }}
        >
          <Icon name="share" size={15} stroke={2} color={theme.ink[3]} />
        </Pressable>
      </View>
    </Card>
  );
};

type MilestoneProps = { milestone: Milestone; theme: ThemeTokens };

const MilestoneAttachment = ({ milestone, theme }: MilestoneProps) => (
  <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
    <View
      style={{
        padding: 14,
        borderRadius: 12,
        backgroundColor: `${milestone.color}1F`,
        borderWidth: 1,
        borderColor: `${milestone.color}80`,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: milestone.color,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: milestone.color,
          shadowOpacity: 0.6,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <Icon name={milestone.icon} size={20} stroke={2} color={theme.bg[0]} />
      </View>
      <View style={{ flex: 1 }}>
        <Mono
          style={{
            fontFamily: 'GeistMono_500Medium',
            fontSize: 9,
            letterSpacing: 1.6,
            color: milestone.color,
            marginBottom: 2,
          }}
        >
          MARCO ATINGIDO · {milestone.category.toUpperCase()}
        </Mono>
        <Body
          style={{
            fontSize: 14,
            fontFamily: 'Geist_600SemiBold',
            color: theme.ink[0],
          }}
        >
          {milestone.title}
        </Body>
      </View>
      <Mono
        style={{
          fontSize: 12,
          fontFamily: 'GeistMono_500Medium',
          color: milestone.color,
        }}
      >
        {milestone.xp}
      </Mono>
    </View>
  </View>
);

type StreakProps = { streak: Streak; theme: ThemeTokens };

const StreakAttachment = ({ streak, theme }: StreakProps) => {
  const flameColor = '#F0A56F';
  return (
    <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
      <View
        style={{
          padding: 18,
          borderRadius: 12,
          backgroundColor: `${flameColor}26`,
          borderWidth: 1,
          borderColor: `${flameColor}66`,
          alignItems: 'center',
        }}
      >
        <Body style={{ fontSize: 36, marginBottom: 4 }}>🔥</Body>
        <Mono
          style={{
            fontFamily: 'GeistMono_500Medium',
            fontSize: 32,
            color: flameColor,
            letterSpacing: -1.28,
          }}
        >
          {streak.days} dias
        </Mono>
        <Small style={{ color: theme.ink[2], marginTop: 4 }}>
          {streak.habit}
        </Small>
      </View>
    </View>
  );
};

type GoalProps = { goal: GoalCard; theme: ThemeTokens };

const GoalAttachment = ({ goal, theme }: GoalProps) => (
  <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
    <View
      style={{
        padding: 14,
        borderRadius: 12,
        backgroundColor: `${goal.color}26`,
        borderWidth: 1,
        borderColor: goal.color,
      }}
    >
      <Mono
        style={{
          fontFamily: 'GeistMono_500Medium',
          fontSize: 10,
          letterSpacing: 1.8,
          color: goal.color,
          marginBottom: 8,
        }}
      >
        META CONCLUÍDA
      </Mono>
      <Body
        style={{
          fontSize: 16,
          fontFamily: 'Geist_600SemiBold',
          color: theme.ink[0],
          marginBottom: 10,
        }}
      >
        {goal.title}
      </Body>
      <View
        style={{
          height: 4,
          backgroundColor: theme.border,
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: '100%',
            backgroundColor: goal.color,
            borderRadius: 999,
            shadowColor: goal.color,
            shadowOpacity: 0.5,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      </View>
      <Mono
        style={{
          fontSize: 11,
          fontFamily: 'GeistMono_500Medium',
          color: goal.color,
          marginTop: 8,
        }}
      >
        100% · CONCLUÍDA EM 4 MESES
      </Mono>
    </View>
  </View>
);

type ActionBtnProps = {
  icon: IconName;
  label: number | string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
};

const ActionBtn = ({ icon, label, active = false, onPress, color }: ActionBtnProps) => {
  const { theme } = useTheme();
  const accentColor = color ?? theme.ink[2];
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: active ? `${accentColor}1F` : 'transparent',
      }}
    >
      <Icon
        name={icon}
        size={15}
        stroke={active ? 2.4 : 1.8}
        color={active ? accentColor : theme.ink[2]}
      />
      <Mono
        style={{
          fontSize: 12,
          fontFamily: 'GeistMono_500Medium',
          color: active ? accentColor : theme.ink[2],
        }}
      >
        {label}
      </Mono>
    </Pressable>
  );
};

type AdCardProps = {
  ad: Extract<Post, { type: 'ad' }>;
};

const AdCard = ({ ad }: AdCardProps) => {
  const { theme } = useTheme();
  return (
    <Card style={{ padding: 14 }}>
      <Mono
        style={{
          fontFamily: 'GeistMono_500Medium',
          fontSize: 9,
          letterSpacing: 1.6,
          color: theme.ink[3],
          marginBottom: 8,
        }}
      >
        ANÚNCIO · {ad.sponsor}
      </Mono>
      <Body
        style={{
          fontSize: 14,
          fontFamily: 'Geist_600SemiBold',
          color: theme.ink[0],
          marginBottom: 4,
        }}
      >
        {ad.content}
      </Body>
      <Pressable hitSlop={4}>
        <Small style={{ color: theme.accent, fontFamily: 'Geist_600SemiBold' }}>
          {ad.cta} →
        </Small>
      </Pressable>
    </Card>
  );
};
