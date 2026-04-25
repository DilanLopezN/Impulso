import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import {
  Body,
  Card,
  Chip,
  Eyebrow,
  H2,
  Icon,
  IconButton,
  Mono,
  Neon,
  ProgressBar,
  ProgressRing,
  SectionHead,
  Small,
  WeekBars,
} from '@/components';
import { useTheme } from '@/theme/ThemeContext';
import type { AppState, Goal, IconName } from '@/types';

type Action = { type: 'toggle'; key: string };

type HomeProps = {
  state: AppState;
  dispatch: (action: Action) => void;
  openGoal: (id: string) => void;
};

export const Home = ({ state, dispatch, openGoal }: HomeProps) => {
  const { theme } = useTheme();
  const { goals, streak, xp, level, xpToNext, todayDone, todayTotal, weekDays, name } =
    state;

  const momentum =
    goals.length === 0
      ? 0
      : Math.round(
          (goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) * 100,
        );

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ==== HERO ==== */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1 }}>
            <Eyebrow style={{ marginBottom: 6 }}>TERÇA · 23 ABR</Eyebrow>
            <H2 style={{ lineHeight: 30 }}>
              Bom dia, <Neon>{name}</Neon>
            </H2>
            <Body style={{ marginTop: 4, color: theme.ink[2] }}>
              {todayDone}/{todayTotal} tarefas para hoje
            </Body>
          </View>
          <IconButton icon="bell" size={40} iconSize={18} stroke={1.8}>
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 9,
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: theme.accent,
              }}
            />
          </IconButton>
        </View>
      </View>

      {/* ==== MOMENTUM HUD ==== */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Card style={{ padding: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <ProgressRing value={momentum / 100} size={108} stroke={7}>
              <View style={{ alignItems: 'center' }}>
                <Mono
                  style={{
                    fontSize: 30,
                    letterSpacing: -1.2,
                    color: theme.ink[0],
                    fontFamily: 'GeistMono_500Medium',
                  }}
                >
                  {momentum}
                  <Mono style={{ fontSize: 14, color: theme.ink[3] }}>%</Mono>
                </Mono>
                <Eyebrow style={{ fontSize: 8, color: theme.ink[3] }}>
                  MOMENTUM
                </Eyebrow>
              </View>
            </ProgressRing>

            <View style={{ flex: 1, gap: 10 }}>
              <StatRow
                label="Nível"
                value={String(level)}
                sub={`${xp} / ${xpToNext} XP`}
                pill={
                  <Chip accent>
                    <Mono
                      style={{
                        fontSize: 11,
                        fontFamily: 'Geist_600SemiBold',
                        color: theme.accent,
                      }}
                    >
                      LVL {level}
                    </Mono>
                  </Chip>
                }
              />
              <View style={{ height: 1, backgroundColor: theme.border }} />
              <StatRow
                label="Sequência"
                value={`${streak}d`}
                sub="Melhor: 31d"
                emoji="🔥"
              />
              <View style={{ height: 1, backgroundColor: theme.border }} />
              <StatRow
                label="XP Hoje"
                value="+180"
                sub="↑ 32% vs. ontem"
                icon="zap"
              />
            </View>
          </View>

          <View
            style={{
              marginTop: 20,
              paddingTop: 18,
              borderTopWidth: 1,
              borderTopColor: theme.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <Eyebrow>ESTA SEMANA</Eyebrow>
              <Mono style={{ fontSize: 12, color: theme.accent }}>
                5/7 dias ativos
              </Mono>
            </View>
            <WeekBars days={weekDays} height={40} />
          </View>
        </Card>
      </View>

      {/* ==== TODAY FOCUS ==== */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <SectionHead
          eyebrow="FOCO DE HOJE"
          title="3 impulsos para agora"
          action="Ver tudo"
        />
        <View style={{ gap: 10 }}>
          <TodayItem
            icon="run"
            label="Correr 5km"
            sub="Parque Ibirapuera · 30min"
            done={todayDone >= 1}
            onToggle={() => dispatch({ type: 'toggle', key: 'run' })}
            chip="+50 XP"
          />
          <TodayItem
            icon="book"
            label="Estudar React — 2 aulas"
            sub="Curso Avançado · 45min"
            done={todayDone >= 2}
            onToggle={() => dispatch({ type: 'toggle', key: 'study' })}
            chip="+80 XP"
          />
          <TodayItem
            icon="sparkle"
            label="Journal da noite"
            sub="Reflexão + 3 gratidões"
            done={todayDone >= 3}
            onToggle={() => dispatch({ type: 'toggle', key: 'journal' })}
            chip="+30 XP"
          />
        </View>
      </View>

      {/* ==== METAS ATIVAS ==== */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <SectionHead
          eyebrow="METAS ATIVAS"
          title={`${goals.length} em progresso`}
          action="Filtrar"
        />
        <View style={{ gap: 12 }}>
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => openGoal(goal.id)}
            />
          ))}
        </View>
      </View>

      {/* ==== INSIGHT ==== */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Card
          style={{
            padding: 18,
            borderColor: theme.accent,
            backgroundColor: theme.accentDim,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: theme.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                name="trend"
                size={18}
                stroke={2.2}
                color={theme.accentInk}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow style={{ color: theme.accent, marginBottom: 4 }}>
                COACH INSIGHT
              </Eyebrow>
              <Body style={{ color: theme.ink[0] }}>
                Você está{' '}
                <Body style={{ fontFamily: 'Geist_600SemiBold' }}>3 dias</Body>{' '}
                do seu recorde pessoal de sequência. Se mantiver até domingo,
                desbloqueia a <Neon>medalha Inabalável</Neon>.
              </Body>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

/* ================== SUBCOMPONENTS ================== */

type StatRowProps = {
  label: string;
  value: string;
  sub?: string;
  pill?: React.ReactNode;
  icon?: IconName;
  emoji?: string;
};

const StatRow = ({ label, value, sub, pill, icon, emoji }: StatRowProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1 }}>
        <Small
          style={{
            color: theme.ink[3],
            fontSize: 10,
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontFamily: 'Geist_600SemiBold',
          }}
        >
          {label}
        </Small>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Mono
            style={{
              fontSize: 18,
              fontFamily: 'GeistMono_500Medium',
              color: theme.ink[0],
            }}
          >
            {value}
          </Mono>
          {sub ? (
            <Small style={{ fontSize: 10, color: theme.ink[3] }}>{sub}</Small>
          ) : null}
        </View>
      </View>
      {pill}
      {!pill && emoji ? (
        <Mono style={{ fontSize: 18 }}>{emoji}</Mono>
      ) : null}
      {!pill && !emoji && icon ? (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: theme.accentDim,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={14} stroke={2} color={theme.accent} />
        </View>
      ) : null}
    </View>
  );
};

type TodayItemProps = {
  icon: IconName;
  label: string;
  sub: string;
  done: boolean;
  chip: string;
  onToggle: () => void;
};

const TodayItem = ({ icon, label, sub, done, chip, onToggle }: TodayItemProps) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onToggle}>
      <Card
        style={{
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          opacity: done ? 0.55 : 1,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: done ? theme.accent : theme.glassStrong,
            borderWidth: 1,
            borderColor: done ? theme.accent : theme.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: done ? theme.accent : 'transparent',
            shadowOpacity: done ? 0.45 : 0,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Icon
            name={done ? 'check' : icon}
            size={18}
            stroke={2}
            color={done ? theme.accentInk : theme.ink[1]}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Body
            style={{
              color: theme.ink[0],
              fontFamily: 'Geist_600SemiBold',
              textDecorationLine: done ? 'line-through' : 'none',
            }}
          >
            {label}
          </Body>
          <Small style={{ color: theme.ink[3], marginTop: 2 }}>{sub}</Small>
        </View>
        <Chip>
          <Mono style={{ fontSize: 10, color: theme.ink[1] }}>{chip}</Mono>
        </Chip>
      </Card>
    </Pressable>
  );
};

type GoalCardProps = {
  goal: Goal;
  onPress: () => void;
};

const GoalCard = ({ goal, onPress }: GoalCardProps) => {
  const { theme } = useTheme();
  const pct = Math.round(goal.progress * 100);
  return (
    <Pressable onPress={onPress}>
      <Card style={{ padding: 16, gap: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              alignItems: 'center',
              flex: 1,
              minWidth: 0,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${goal.color}22`,
                borderWidth: 1,
                borderColor: `${goal.color}80`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={goal.icon} size={20} stroke={1.8} color={goal.color} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Eyebrow style={{ fontSize: 9, marginBottom: 2 }}>
                {goal.category}
              </Eyebrow>
              <Body
                style={{
                  fontSize: 15,
                  color: theme.ink[0],
                  fontFamily: 'Geist_600SemiBold',
                }}
                numberOfLines={1}
              >
                {goal.title}
              </Body>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Mono
              style={{
                fontSize: 20,
                color: theme.accent,
                fontFamily: 'GeistMono_500Medium',
              }}
            >
              {pct}
              <Mono style={{ fontSize: 11, color: theme.ink[3] }}>%</Mono>
            </Mono>
            <Mono
              style={{ fontSize: 9, color: theme.ink[3], marginTop: 2 }}
            >
              {goal.deadline}
            </Mono>
          </View>
        </View>

        <ProgressBar value={goal.progress} color={goal.color} />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 6, flex: 1, flexWrap: 'wrap' }}>
            <Chip>
              <Icon name="clock" size={10} stroke={2} color={theme.ink[1]} />
              <Mono style={{ fontSize: 10, color: theme.ink[1] }}>
                {goal.next}
              </Mono>
            </Chip>
            {goal.streak ? (
              <Chip>
                <Mono style={{ fontSize: 10, color: theme.ink[1] }}>
                  🔥 {goal.streak}d
                </Mono>
              </Chip>
            ) : null}
          </View>
          <Icon name="chevron" size={14} stroke={2} color={theme.ink[3]} />
        </View>
      </Card>
    </Pressable>
  );
};
