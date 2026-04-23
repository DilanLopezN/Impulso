import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import {
  Body,
  Button,
  Card,
  Chip,
  Eyebrow,
  H1,
  Icon,
  IconButton,
  Mono,
  ProgressRing,
  SectionHead,
  Small,
} from '@/components';
import { useTheme } from '@/theme/ThemeContext';
import type { Goal } from '@/types';

type GoalDetailProps = {
  goal: Goal | undefined;
  onBack: () => void;
  onToggleMilestone: (index: number) => void;
};

export const GoalDetail = ({
  goal,
  onBack,
  onToggleMilestone,
}: GoalDetailProps) => {
  const { theme } = useTheme();

  if (!goal) return null;
  const pct = Math.round(goal.progress * 100);

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 32 }}
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
        }}
      >
        <IconButton
          icon="chevronL"
          onPress={onBack}
          size={40}
          iconSize={18}
          stroke={2}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton icon="share" size={40} iconSize={16} stroke={2} />
          <IconButton icon="dots" size={40} iconSize={18} stroke={2} />
        </View>
      </View>

      {/* Hero */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' }}>
        <View style={{ marginBottom: 16 }}>
          <ProgressRing value={goal.progress} size={200} stroke={8} color={goal.color}>
            <View style={{ alignItems: 'center' }}>
              <Icon
                name={goal.icon}
                size={28}
                stroke={1.5}
                color={goal.color}
              />
              <Mono
                style={{
                  fontSize: 42,
                  letterSpacing: -1.68,
                  marginTop: 4,
                  color: theme.ink[0],
                  fontFamily: 'GeistMono_500Medium',
                }}
              >
                {pct}
                <Mono style={{ fontSize: 18, color: theme.ink[3] }}>%</Mono>
              </Mono>
              <Eyebrow style={{ fontSize: 9, color: theme.ink[3], marginTop: 4 }}>
                CONCLUÍDO
              </Eyebrow>
            </View>
          </ProgressRing>
        </View>
        <Eyebrow style={{ marginBottom: 6, color: goal.color }}>
          {goal.category}
        </Eyebrow>
        <H1 style={{ marginBottom: 8, textAlign: 'center' }}>{goal.title}</H1>
        <Body
          style={{
            color: theme.ink[2],
            maxWidth: 300,
            textAlign: 'center',
          }}
        >
          {goal.description}
        </Body>
      </View>

      {/* Stats strip */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <Card style={{ flexDirection: 'row' }}>
          {[
            {
              label: 'PRAZO',
              value: goal.deadline,
              sub: `${goal.daysLeft}d restantes`,
            },
            {
              label: 'SEQUÊNCIA',
              value: `${goal.streak ?? 12}d`,
              sub: 'de 21 dias',
            },
            {
              label: 'XP GANHO',
              value: `${goal.xp}`,
              sub: `de ${goal.xpTotal}`,
            },
          ].map((s, i) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                paddingVertical: 16,
                paddingHorizontal: 12,
                alignItems: 'center',
                borderRightWidth: i < 2 ? 1 : 0,
                borderRightColor: theme.border,
              }}
            >
              <Eyebrow style={{ fontSize: 9, marginBottom: 4 }}>
                {s.label}
              </Eyebrow>
              <Mono
                style={{
                  fontSize: 16,
                  color: theme.ink[0],
                  fontFamily: 'GeistMono_500Medium',
                }}
              >
                {s.value}
              </Mono>
              <Mono
                style={{
                  fontSize: 9,
                  color: theme.ink[3],
                  marginTop: 2,
                }}
              >
                {s.sub}
              </Mono>
            </View>
          ))}
        </Card>
      </View>

      {/* Milestones */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <SectionHead eyebrow="MARCOS" title="Jornada" action="Editar" />
        <View>
          {goal.milestones.map((m, i) => {
            const isLast = i === goal.milestones.length - 1;
            return (
              <View key={`${m.title}-${i}`} style={{ flexDirection: 'row', gap: 14 }}>
                <View style={{ alignItems: 'center', width: 28 }}>
                  <Pressable onPress={() => onToggleMilestone(i)}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderWidth: 2,
                        backgroundColor: m.done ? goal.color : theme.bg[2],
                        borderColor: m.done ? goal.color : theme.borderStrong,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {m.done ? (
                        <Icon
                          name="check"
                          size={14}
                          stroke={3}
                          color={theme.accentInk}
                        />
                      ) : (
                        <Mono
                          style={{
                            fontSize: 11,
                            color: theme.ink[3],
                            fontFamily: 'Geist_600SemiBold',
                          }}
                        >
                          {i + 1}
                        </Mono>
                      )}
                    </View>
                  </Pressable>
                  {!isLast ? (
                    <View
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 44,
                        backgroundColor: m.done ? goal.color : theme.borderStrong,
                        opacity: m.done ? 0.4 : 0.6,
                      }}
                    />
                  ) : null}
                </View>

                <View
                  style={{
                    flex: 1,
                    paddingBottom: isLast ? 0 : 20,
                    paddingTop: 2,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Body
                        style={{
                          fontFamily: 'Geist_600SemiBold',
                          color: m.done ? theme.ink[2] : theme.ink[0],
                          textDecorationLine: m.done ? 'line-through' : 'none',
                        }}
                      >
                        {m.title}
                      </Body>
                      <Mono
                        style={{
                          fontSize: 10,
                          marginTop: 3,
                          color: theme.ink[3],
                        }}
                      >
                        {m.date}
                      </Mono>
                    </View>
                    {m.done ? (
                      <Chip borderColor={`${goal.color}60`}>
                        <Mono
                          style={{
                            fontSize: 9,
                            color: goal.color,
                          }}
                        >
                          +{m.xp} XP
                        </Mono>
                      </Chip>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Activity chart */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <SectionHead eyebrow="ATIVIDADE" title="Últimas 4 semanas" />
        <Card style={{ padding: 18 }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 3,
              height: 100,
              alignItems: 'flex-end',
            }}
          >
            {[
              0.1, 0.3, 0.6, 0.2, 0.9, 0.4, 0.0, 0.5, 0.7, 0.8, 0.6, 0.9, 0.3,
              0.4, 0.2, 0.9, 0.5, 0.8, 0.7, 0.9, 0.4, 0.6, 0.9, 1.0, 0.8, 0.9,
              0.7, 0.85,
            ].map((v, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.max(4, v * 100)}%`,
                  backgroundColor: v > 0.05 ? goal.color : theme.borderStrong,
                  opacity: v > 0.05 ? 0.4 + v * 0.6 : 1,
                  borderRadius: 2,
                }}
              />
            ))}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 12,
            }}
          >
            {['há 4sem', 'há 3sem', 'há 2sem', 'semana atual'].map((l) => (
              <Small key={l} style={{ color: theme.ink[3], fontSize: 10 }}>
                {l}
              </Small>
            ))}
          </View>
        </Card>
      </View>

      {/* Actions */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 24,
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <Button
          variant="ghost"
          label="Lembrete"
          leftAdornment={
            <Icon name="clock" size={16} stroke={2} color={theme.ink[0]} />
          }
          style={{ flex: 1 }}
        />
        <Button
          label="Registrar progresso"
          backgroundColor={goal.color}
          rightAdornment={
            <Icon
              name="plus"
              size={16}
              stroke={2.4}
              color={theme.accentInk}
            />
          }
          style={{ flex: 1.5 }}
        />
      </View>
    </ScrollView>
  );
};
