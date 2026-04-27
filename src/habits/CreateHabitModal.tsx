import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import {
  Body,
  Card,
  Eyebrow,
  H2,
  Icon,
  IconButton,
  Mono,
  Small,
} from '@/components';
import { useHabits } from '@/habits/HabitsContext';
import { ApiError } from '@/services/api';
import type {
  CreateHabitPayload,
  HabitFrequency,
} from '@/services/habits.service';
import { useTheme } from '@/theme/ThemeContext';
import type { IconName } from '@/types';

const ICON_OPTIONS: { id: IconName; label: string }[] = [
  { id: 'flame', label: 'Streak' },
  { id: 'sparkle', label: 'Mente' },
  { id: 'book', label: 'Leitura' },
  { id: 'run', label: 'Correr' },
  { id: 'zap', label: 'Energia' },
  { id: 'edit', label: 'Journal' },
  { id: 'heart', label: 'Saúde' },
  { id: 'moon', label: 'Sono' },
  { id: 'wallet', label: 'Finanças' },
];

const COLOR_OPTIONS = [
  '#F2947A', '#8FAEF0', '#72D8A9', '#D9A0E8',
  '#7FD6E0', '#E6C77A', '#F2A070', '#7AC4F2',
];

const FREQ_OPTIONS: {
  id: HabitFrequency;
  label: string;
  sub: string;
}[] = [
  { id: 'DAILY', label: 'Todo dia', sub: 'Streak por dia consecutivo' },
  { id: 'WEEKLY', label: 'X vezes na semana', sub: 'Sequência por semana cumprida' },
  { id: 'CUSTOM', label: 'Dias específicos', sub: 'Escolha dias da semana' },
];

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const humanize = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (Array.isArray((err.payload as { message?: unknown })?.message)) {
      return ((err.payload as { message: string[] }).message ?? []).join('\n');
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Não foi possível criar o hábito.';
};

type CreateHabitModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const CreateHabitModal = ({ visible, onClose }: CreateHabitModalProps) => {
  const { theme } = useTheme();
  const { createHabit } = useHabits();

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<IconName>('flame');
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [frequency, setFrequency] = useState<HabitFrequency>('DAILY');
  const [targetPerWeek, setTargetPerWeek] = useState(3);
  const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]);
  const [xpPerCheckin, setXpPerCheckin] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTitle('');
    setIcon('flame');
    setColor(COLOR_OPTIONS[0]);
    setFrequency('DAILY');
    setTargetPerWeek(3);
    setWeekdays([1, 3, 5]);
    setXpPerCheckin(10);
    setError(null);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    reset();
    onClose();
  }, [reset, onClose, submitting]);

  const canSubmit = useMemo(() => {
    if (title.trim().length < 1) return false;
    if (frequency === 'CUSTOM' && weekdays.length === 0) return false;
    return !submitting;
  }, [title, frequency, weekdays, submitting]);

  const submit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const payload: CreateHabitPayload = {
      title: title.trim(),
      icon,
      color,
      frequency,
      xpPerCheckin,
    };
    if (frequency === 'WEEKLY') payload.targetPerWeek = targetPerWeek;
    if (frequency === 'CUSTOM') payload.weekdays = weekdays;
    try {
      await createHabit(payload);
      reset();
      onClose();
    } catch (err) {
      setError(humanize(err));
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit,
    title,
    icon,
    color,
    frequency,
    xpPerCheckin,
    targetPerWeek,
    weekdays,
    createHabit,
    reset,
    onClose,
  ]);

  const toggleWeekday = useCallback((idx: number) => {
    setWeekdays((prev) =>
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx].sort(),
    );
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: theme.bg[0] }}>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Eyebrow>NOVO HÁBITO</Eyebrow>
            <H2 style={{ marginTop: 4 }}>Defina o ritual</H2>
          </View>
          <IconButton
            icon="close"
            size={36}
            iconSize={18}
            stroke={1.8}
            onPress={handleClose}
          />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <Eyebrow style={{ marginBottom: 8 }}>NOME</Eyebrow>
          <Card style={{ padding: 14, marginBottom: 18 }}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Meditar 10 min"
              placeholderTextColor={theme.ink[3]}
              maxLength={120}
              style={{
                color: theme.ink[0],
                fontFamily: 'Geist_500Medium',
                fontSize: 16,
                paddingVertical: 4,
              }}
            />
          </Card>

          {/* Icon */}
          <Eyebrow style={{ marginBottom: 8 }}>ÍCONE</Eyebrow>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 18,
            }}
          >
            {ICON_OPTIONS.map((o) => {
              const active = icon === o.id;
              return (
                <Pressable
                  key={o.id}
                  onPress={() => setIcon(o.id)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: active ? color : theme.border,
                    backgroundColor: active ? `${color}33` : theme.glassStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    name={o.id}
                    size={20}
                    stroke={2}
                    color={active ? color : theme.ink[1]}
                  />
                </Pressable>
              );
            })}
          </View>

          {/* Color */}
          <Eyebrow style={{ marginBottom: 8 }}>COR</Eyebrow>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 18,
            }}
          >
            {COLOR_OPTIONS.map((c) => {
              const active = color === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: c,
                    borderWidth: active ? 3 : 1,
                    borderColor: active ? theme.ink[0] : theme.border,
                  }}
                />
              );
            })}
          </View>

          {/* Frequency */}
          <Eyebrow style={{ marginBottom: 8 }}>FREQUÊNCIA</Eyebrow>
          <View style={{ gap: 8, marginBottom: 18 }}>
            {FREQ_OPTIONS.map((f) => {
              const active = frequency === f.id;
              return (
                <Pressable key={f.id} onPress={() => setFrequency(f.id)}>
                  <Card
                    style={{
                      padding: 14,
                      borderColor: active ? color : theme.border,
                      backgroundColor: active ? `${color}1A` : theme.glassStrong,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 9,
                          borderWidth: 2,
                          borderColor: active ? color : theme.borderStrong,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {active ? (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: color,
                            }}
                          />
                        ) : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Body
                          style={{
                            color: theme.ink[0],
                            fontFamily: 'Geist_600SemiBold',
                          }}
                        >
                          {f.label}
                        </Body>
                        <Small style={{ color: theme.ink[3], marginTop: 2 }}>
                          {f.sub}
                        </Small>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>

          {/* Frequency-specific knobs */}
          {frequency === 'WEEKLY' ? (
            <View style={{ marginBottom: 18 }}>
              <Eyebrow style={{ marginBottom: 8 }}>VEZES POR SEMANA</Eyebrow>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => {
                  const active = targetPerWeek === n;
                  return (
                    <Pressable
                      key={n}
                      onPress={() => setTargetPerWeek(n)}
                      style={{ flex: 1 }}
                    >
                      <Card
                        style={{
                          paddingVertical: 12,
                          alignItems: 'center',
                          borderColor: active ? color : theme.border,
                          backgroundColor: active
                            ? `${color}26`
                            : theme.glassStrong,
                        }}
                      >
                        <Mono
                          style={{
                            color: active ? color : theme.ink[1],
                            fontFamily: 'Geist_600SemiBold',
                          }}
                        >
                          {n}
                        </Mono>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {frequency === 'CUSTOM' ? (
            <View style={{ marginBottom: 18 }}>
              <Eyebrow style={{ marginBottom: 8 }}>DIAS</Eyebrow>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {WEEKDAYS.map((label, idx) => {
                  const active = weekdays.includes(idx);
                  return (
                    <Pressable
                      key={`${label}-${idx}`}
                      onPress={() => toggleWeekday(idx)}
                      style={{ flex: 1 }}
                    >
                      <Card
                        style={{
                          paddingVertical: 14,
                          alignItems: 'center',
                          borderColor: active ? color : theme.border,
                          backgroundColor: active
                            ? `${color}26`
                            : theme.glassStrong,
                        }}
                      >
                        <Mono
                          style={{
                            color: active ? color : theme.ink[2],
                            fontFamily: 'Geist_600SemiBold',
                          }}
                        >
                          {label}
                        </Mono>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* XP */}
          <Eyebrow style={{ marginBottom: 8 }}>XP POR CHECK-IN</Eyebrow>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            {[5, 10, 20, 30, 50].map((n) => {
              const active = xpPerCheckin === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setXpPerCheckin(n)}
                  style={{ flex: 1 }}
                >
                  <Card
                    style={{
                      paddingVertical: 12,
                      alignItems: 'center',
                      borderColor: active ? color : theme.border,
                      backgroundColor: active ? `${color}26` : theme.glassStrong,
                    }}
                  >
                    <Mono
                      style={{
                        color: active ? color : theme.ink[1],
                        fontFamily: 'Geist_600SemiBold',
                      }}
                    >
                      +{n}
                    </Mono>
                  </Card>
                </Pressable>
              );
            })}
          </View>

          {error ? (
            <Card
              style={{
                padding: 12,
                marginBottom: 14,
                borderColor: '#F2947A',
                backgroundColor: 'rgba(242, 148, 122, 0.12)',
              }}
            >
              <Small style={{ color: '#F2947A' }}>{error}</Small>
            </Card>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={({ pressed }) => ({
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color,
              opacity: !canSubmit ? 0.4 : pressed ? 0.92 : 1,
              shadowColor: color,
              shadowOpacity: 0.45,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 0 },
              transform: pressed ? [{ scale: 0.97 }] : undefined,
            })}
          >
            {submitting ? (
              <ActivityIndicator color={theme.accentInk} />
            ) : (
              <Body
                style={{
                  color: theme.accentInk,
                  fontFamily: 'Geist_600SemiBold',
                }}
              >
                Criar hábito
              </Body>
            )}
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};
