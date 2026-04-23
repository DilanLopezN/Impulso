import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

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
import type { Habit } from '@/types';

type HabitsProps = {
  habits: Habit[];
  toggleHabit: (id: string) => void;
};

// Stable pseudo-random values so the heatmap doesn't jitter per render
const HEATMAP = Array.from({ length: 30 }).map((_, i) => {
  const seed = Math.sin(i * 12.9898) * 43758.5453;
  const rand = seed - Math.floor(seed);
  return rand > 0.2 ? rand : 0;
});

export const Habits = ({ habits, toggleHabit }: HabitsProps) => {
  const { theme } = useTheme();
  const totalDone = useMemo(
    () => habits.filter((h) => h.todayDone).length,
    [habits],
  );
  const totalHabits = habits.length;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 }}>
        <Eyebrow style={{ marginBottom: 6 }}>HÁBITOS</Eyebrow>
        <H1>Ritual diário</H1>
        <Body style={{ color: theme.ink[2], marginTop: 6 }}>
          {totalDone} de {totalHabits} concluídos hoje
        </Body>
      </View>

      {/* Big streak card */}
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
            28
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
            3 dias para quebrar seu recorde pessoal (
            <Mono style={{ color: theme.ink[1] }}>31d</Mono>)
          </Body>

          {/* 30-day heatmap */}
          <View
            style={{
              marginTop: 20,
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            {HEATMAP.map((v, i) => {
              const isToday = i === 29;
              const intensity = 0.2 + v * 0.8;
              return (
                <View
                  key={i}
                  style={{
                    width: '6.1%',
                    aspectRatio: 1,
                    borderRadius: 3,
                    backgroundColor:
                      v > 0
                        ? `${theme.accent}${Math.round(intensity * 255)
                            .toString(16)
                            .padStart(2, '0')}`
                        : theme.borderStrong,
                    borderWidth: isToday ? 1 : 0,
                    borderColor: theme.accent,
                  }}
                />
              );
            })}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              width: '100%',
            }}
          >
            <Mono style={{ fontSize: 11, color: theme.ink[3] }}>há 30 dias</Mono>
            <Mono style={{ fontSize: 11, color: theme.ink[3] }}>hoje</Mono>
          </View>
        </Card>
      </View>

      {/* Today list */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 12 }}>HOJE · TERÇA, 23 ABR</Eyebrow>
        <View style={{ gap: 10 }}>
          {habits.map((h) => (
            <HabitRow key={h.id} habit={h} onToggle={() => toggleHabit(h.id)} />
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
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Mono
                  style={{
                    fontSize: 10,
                    color: i === 2 ? theme.accent : theme.ink[3],
                    fontFamily: 'Geist_600SemiBold',
                  }}
                >
                  {d}
                </Mono>
              </View>
            ))}
          </View>
          {habits.slice(0, 4).map((h) => (
            <View
              key={h.id}
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
                    backgroundColor: h.color,
                  }}
                />
                <Small
                  style={{ color: theme.ink[1], fontSize: 11 }}
                  numberOfLines={1}
                >
                  {h.short}
                </Small>
              </View>
              {h.week.map((done, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <View
                    style={{
                      width: '80%',
                      aspectRatio: 1,
                      borderRadius: 4,
                      backgroundColor: done ? h.color : theme.borderStrong,
                      opacity: done ? 1 : 0.5,
                      borderWidth: i === 2 ? 1 : 0,
                      borderColor: theme.ink[3],
                    }}
                  />
                </View>
              ))}
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
};

type HabitRowProps = {
  habit: Habit;
  onToggle: () => void;
};

const HabitRow = ({ habit, onToggle }: HabitRowProps) => {
  const { theme } = useTheme();
  const done = habit.todayDone;
  return (
    <Pressable onPress={onToggle}>
      <Card
        style={{
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderColor: done ? habit.color : theme.border,
          backgroundColor: done ? `${habit.color}1A` : theme.glassStrong,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: done ? habit.color : `${habit.color}26`,
            borderWidth: 1,
            borderColor: done ? habit.color : theme.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={done ? 'check' : habit.icon}
            size={20}
            stroke={2}
            color={done ? theme.accentInk : habit.color}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Body
            style={{
              fontSize: 15,
              fontFamily: 'Geist_600SemiBold',
              color: theme.ink[0],
            }}
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
            <Mono style={{ color: theme.ink[3], fontSize: 11 }}>{habit.time}</Mono>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: theme.ink[4],
              }}
            />
            <Mono style={{ color: habit.color, fontSize: 11 }}>
              🔥 {habit.streak}d
            </Mono>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Mono style={{ fontSize: 12, color: theme.ink[3] }}>
            {habit.weekDone}/7
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
                width: `${(habit.weekDone / 7) * 100}%`,
                height: '100%',
                backgroundColor: habit.color,
              }}
            />
          </View>
        </View>
      </Card>
    </Pressable>
  );
};
