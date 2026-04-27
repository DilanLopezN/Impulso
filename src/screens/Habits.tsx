import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  Body,
  Card,
  Eyebrow,
  H1,
  Icon,
  IconButton,
  Mono,
  Small,
} from '@/components';
import { CreateHabitModal } from '@/habits/CreateHabitModal';
import {
  buildHeatmap,
  buildWeekMask,
  frequencyLabel,
  habitColor,
  habitIcon,
  longestStreakAcross,
} from '@/habits/adapters';
import { useHabits } from '@/habits/HabitsContext';
import { useGamification } from '@/gamification/GamificationContext';
import { formatHeaderDate, todayLocal } from '@/data/calendar';
import { useTheme } from '@/theme/ThemeContext';
import type { HabitView } from '@/services/habits.service';

const HEATMAP_DAYS = 30;
const WEEK_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const todayWeekdayIdx = (): number => {
  const [y, m, d] = todayLocal().split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
};

export const Habits = () => {
  const { theme } = useTheme();
  const {
    habits,
    loading,
    refreshing,
    error,
    checkinsByHabit,
    refresh,
    toggleCheckin,
  } = useHabits();
  const { summary, refresh: refreshGamification } = useGamification();

  const [createOpen, setCreateOpen] = useState(false);

  const activeHabits = useMemo(
    () => habits.filter((h) => !h.archivedAt),
    [habits],
  );
  const totalDone = useMemo(
    () => activeHabits.filter((h) => h.todayDone).length,
    [activeHabits],
  );
  const heatmap = useMemo(
    () => buildHeatmap(activeHabits, checkinsByHabit, HEATMAP_DAYS),
    [activeHabits, checkinsByHabit],
  );
  const currentStreak = useMemo(
    () => longestStreakAcross(activeHabits),
    [activeHabits],
  );
  const longestRecord = summary?.longestStreak ?? currentStreak;
  const distanceToRecord = Math.max(0, longestRecord - currentStreak);
  const todayWeekday = todayWeekdayIdx();

  const handleToggle = useCallback(
    (id: string) => {
      void toggleCheckin(id).catch(() => {
        // Error already surfaced via context; nothing to add here.
      });
    },
    [toggleCheckin],
  );

  const handleRefresh = useCallback(() => {
    void Promise.all([refresh(), refreshGamification()]);
  }, [refresh, refreshGamification]);

  if (loading && activeHabits.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: 20,
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Eyebrow style={{ marginBottom: 6 }}>HÁBITOS</Eyebrow>
            <H1>Ritual diário</H1>
            <Body style={{ color: theme.ink[2], marginTop: 6 }}>
              {totalDone} de {activeHabits.length} concluídos hoje
            </Body>
          </View>
          <IconButton
            icon="plus"
            size={40}
            iconSize={20}
            stroke={2}
            onPress={() => setCreateOpen(true)}
          />
        </View>

        {error ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
            <Card
              style={{
                padding: 12,
                borderColor: '#F2947A',
                backgroundColor: 'rgba(242, 148, 122, 0.12)',
              }}
            >
              <Small style={{ color: '#F2947A' }}>{error}</Small>
            </Card>
          </View>
        ) : null}

        {activeHabits.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <>
            {/* Big streak card with real heatmap */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <Card style={{ padding: 22, alignItems: 'center' }}>
                <Text style={{ fontSize: 56 }}>🔥</Text>
                <Mono
                  style={{
                    fontSize: 64,
                    letterSpacing: -2.56,
                    color: theme.accent,
                    fontFamily: 'GeistMono_500Medium',
                  }}
                >
                  {currentStreak}
                </Mono>
                <Eyebrow style={{ marginTop: 6, color: theme.accent }}>
                  DIAS DE SEQUÊNCIA
                </Eyebrow>
                <Body
                  style={{
                    marginTop: 12,
                    textAlign: 'center',
                    color: theme.ink[1],
                  }}
                >
                  {distanceToRecord > 0 ? (
                    <>
                      {distanceToRecord} dias para igualar seu recorde (
                      <Mono style={{ color: theme.ink[1] }}>
                        {longestRecord}d
                      </Mono>
                      )
                    </>
                  ) : (
                    <>Você está no melhor da sua vida.</>
                  )}
                </Body>

                <Heatmap data={heatmap} />

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    width: '100%',
                  }}
                >
                  <Mono style={{ fontSize: 11, color: theme.ink[3] }}>
                    há {HEATMAP_DAYS} dias
                  </Mono>
                  <Mono style={{ fontSize: 11, color: theme.ink[3] }}>hoje</Mono>
                </View>
              </Card>
            </View>

            {/* Today list */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
              <Eyebrow style={{ marginBottom: 12 }}>
                HOJE · {formatHeaderDate()}
              </Eyebrow>
              <View style={{ gap: 10 }}>
                {activeHabits.map((h) => (
                  <HabitRow key={h.id} habit={h} onToggle={handleToggle} />
                ))}
              </View>
            </View>

            {/* Weekly grid */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <Eyebrow style={{ marginBottom: 12 }}>VISÃO SEMANAL</Eyebrow>
              <Card style={{ padding: 18 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <View style={{ width: 80 }} />
                  {WEEK_LABELS.map((d, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                      <Mono
                        style={{
                          fontSize: 10,
                          color:
                            i === todayWeekday ? theme.accent : theme.ink[3],
                          fontFamily: 'Geist_600SemiBold',
                        }}
                      >
                        {d}
                      </Mono>
                    </View>
                  ))}
                </View>
                {activeHabits.slice(0, 6).map((h) => (
                  <WeekRow
                    key={h.id}
                    habit={h}
                    week={buildWeekMask(h.id, checkinsByHabit)}
                    todayIdx={todayWeekday}
                  />
                ))}
              </Card>
            </View>
          </>
        )}
      </ScrollView>

      <CreateHabitModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
};

/* ================== EMPTY STATE ================== */

const EmptyState = ({ onCreate }: { onCreate: () => void }) => {
  const { theme } = useTheme();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
      <Card
        style={{
          padding: 24,
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: theme.accentDim,
            borderWidth: 1,
            borderColor: theme.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="flame" size={28} stroke={1.8} color={theme.accent} />
        </View>
        <Body
          style={{
            fontFamily: 'Geist_600SemiBold',
            color: theme.ink[0],
            textAlign: 'center',
          }}
        >
          Comece seu primeiro hábito
        </Body>
        <Small style={{ color: theme.ink[2], textAlign: 'center' }}>
          Hábitos consistentes são o motor do progresso. Crie um agora — começa
          pequeno e cresce com a sequência.
        </Small>
        <Pressable
          onPress={onCreate}
          style={({ pressed }) => ({
            marginTop: 6,
            paddingHorizontal: 18,
            paddingVertical: 12,
            backgroundColor: theme.accent,
            borderRadius: 14,
            opacity: pressed ? 0.92 : 1,
            transform: pressed ? [{ scale: 0.97 }] : undefined,
          })}
        >
          <Body
            style={{
              color: theme.accentInk,
              fontFamily: 'Geist_600SemiBold',
            }}
          >
            Criar hábito
          </Body>
        </Pressable>
      </Card>
    </View>
  );
};

/* ================== HEATMAP ================== */

const Heatmap = memo(
  ({ data }: { data: { date: string; ratio: number }[] }) => {
    const { theme } = useTheme();
    const today = todayLocal();
    return (
      <View
        style={{
          marginTop: 20,
          width: '100%',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        {data.map((cell) => {
          const isToday = cell.date === today;
          const intensity = cell.ratio === 0 ? 0 : 0.25 + cell.ratio * 0.75;
          const alpha = Math.round(intensity * 255)
            .toString(16)
            .padStart(2, '0');
          return (
            <View
              key={cell.date}
              style={{
                width: '6.1%',
                aspectRatio: 1,
                borderRadius: 3,
                backgroundColor:
                  cell.ratio > 0
                    ? `${theme.accent}${alpha}`
                    : theme.borderStrong,
                borderWidth: isToday ? 1 : 0,
                borderColor: theme.accent,
              }}
            />
          );
        })}
      </View>
    );
  },
);
Heatmap.displayName = 'Heatmap';

/* ================== HABIT ROW ================== */

type HabitRowProps = {
  habit: HabitView;
  onToggle: (id: string) => void;
};

const HabitRow = memo(({ habit, onToggle }: HabitRowProps) => {
  const { theme } = useTheme();
  const done = habit.todayDone;
  const color = habitColor(habit.color);
  const icon = habitIcon(habit.icon);

  // Toggle bounce — gives the tap a tactile feel that is now sourced from
  // a real network round-trip but stays instant on screen.
  const scale = useRef(new Animated.Value(1)).current;
  const lastDoneRef = useRef(done);
  useEffect(() => {
    if (done !== lastDoneRef.current) {
      lastDoneRef.current = done;
      Animated.sequence([
        Animated.timing(scale, {
          toValue: done ? 1.18 : 0.92,
          duration: 130,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 140,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [done, scale]);

  const handlePress = useCallback(() => onToggle(habit.id), [onToggle, habit.id]);

  return (
    <Pressable onPress={handlePress}>
      <Card
        style={{
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderColor: done ? color : theme.border,
          backgroundColor: done ? `${color}1A` : theme.glassStrong,
        }}
      >
        <Animated.View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: done ? color : `${color}26`,
            borderWidth: 1,
            borderColor: done ? color : theme.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale }],
          }}
        >
          <Icon
            name={done ? 'check' : icon}
            size={20}
            stroke={2}
            color={done ? theme.accentInk : color}
          />
        </Animated.View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Body
            style={{
              fontSize: 15,
              fontFamily: 'Geist_600SemiBold',
              color: theme.ink[0],
            }}
            numberOfLines={1}
          >
            {habit.title}
          </Body>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 3,
            }}
          >
            <Mono style={{ color: theme.ink[3], fontSize: 11 }}>
              {frequencyLabel(habit)}
            </Mono>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: theme.ink[4],
              }}
            />
            <Mono style={{ color, fontSize: 11 }}>
              🔥 {habit.streak}d
            </Mono>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: theme.ink[4],
              }}
            />
            <Mono style={{ color: theme.ink[3], fontSize: 11 }}>
              +{habit.xpPerCheckin} XP
            </Mono>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Mono style={{ fontSize: 12, color: theme.ink[3] }}>
            {habit.weekDone}/{habit.weekTarget}
          </Mono>
          <View
            style={{
              width: 40,
              height: 3,
              backgroundColor: theme.border,
              borderRadius: 999,
              marginTop: 4,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${Math.min(100, (habit.weekDone / Math.max(1, habit.weekTarget)) * 100)}%`,
                height: '100%',
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
});
HabitRow.displayName = 'HabitRow';

/* ================== WEEK GRID ROW ================== */

type WeekRowProps = {
  habit: HabitView;
  week: number[];
  todayIdx: number;
};

const WeekRow = memo(({ habit, week, todayIdx }: WeekRowProps) => {
  const { theme } = useTheme();
  const color = habitColor(habit.color);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          width: 80,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            backgroundColor: color,
          }}
        />
        <Small
          style={{ color: theme.ink[1], fontSize: 11 }}
          numberOfLines={1}
        >
          {habit.title}
        </Small>
      </View>
      {week.map((done, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={{
              width: '80%',
              aspectRatio: 1,
              borderRadius: 4,
              backgroundColor: done ? color : theme.borderStrong,
              opacity: done ? 1 : 0.5,
              borderWidth: i === todayIdx ? 1 : 0,
              borderColor: theme.ink[3],
            }}
          />
        </View>
      ))}
    </View>
  );
});
WeekRow.displayName = 'WeekRow';
