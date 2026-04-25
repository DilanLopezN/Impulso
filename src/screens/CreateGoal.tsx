import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';

import {
  Body,
  Button,
  Card,
  Chip,
  Eyebrow,
  H2,
  Icon,
  IconButton,
  Mono,
  Small,
} from '@/components';
import { useGoals } from '@/goals/GoalsContext';
import { ApiError } from '@/services/api';
import type {
  CreateGoalPayload,
  GoalFrequency,
  GoalType,
} from '@/services/goals.service';
import { useTheme } from '@/theme/ThemeContext';
import type { IconName } from '@/types';

type FormState = {
  title: string;
  category: string | null;
  type: string | null;
  target: number;
  unit: string;
  reminder: boolean;
};

type CreateGoalProps = {
  onClose: () => void;
  onCreate: () => void;
};

const CATEGORIES: {
  id: string;
  label: string;
  icon: IconName;
  color: string;
}[] = [
  { id: 'fitness', label: 'Fitness', icon: 'run', color: '#F2947A' },
  { id: 'learn', label: 'Aprendizado', icon: 'book', color: '#8FAEF0' },
  { id: 'finance', label: 'Finanças', icon: 'wallet', color: '#72D8A9' },
  { id: 'mind', label: 'Mente', icon: 'sparkle', color: '#D9A0E8' },
  { id: 'project', label: 'Projeto', icon: 'target', color: '#E6C77A' },
  { id: 'habit', label: 'Hábito', icon: 'flame', color: '#F2A070' },
];

const TYPES: {
  id: GoalType;
  label: string;
  sub: string;
  icon: IconName;
}[] = [
  { id: 'HABIT', label: 'Hábito diário', sub: 'Consistência em streaks', icon: 'flame' },
  { id: 'DEADLINE', label: 'Meta com prazo', sub: 'Alcance até uma data', icon: 'calendar' },
  { id: 'NUMERIC', label: 'Meta numérica', sub: 'Ex: economizar R$ 5.000', icon: 'trend' },
  { id: 'PROJECT', label: 'Projeto', sub: 'Com sub-tarefas e marcos', icon: 'target' },
];

export const CreateGoal = ({ onClose, onCreate }: CreateGoalProps) => {
  const { theme } = useTheme();
  const { createGoal } = useGoals();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    title: '',
    category: null,
    type: null,
    target: 30,
    unit: 'dias',
    reminder: true,
  });

  const canNext = useMemo(() => {
    if (step === 0) return !!form.category;
    if (step === 1) return !!form.type && form.title.length > 2;
    return !submitting;
  }, [step, form, submitting]);

  const submit = async () => {
    if (!form.type || !form.category) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = buildCreatePayload(form);
      await createGoal(payload);
      onCreate();
    } catch (err) {
      setError(humanize(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onPrimary = () => {
    if (step === 2) {
      void submit();
    } else {
      setStep(step + 1);
    }
  };
  const onBack = () => {
    if (step === 0) onClose();
    else setStep(step - 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
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
          <IconButton
            icon={step === 0 ? 'close' : 'chevronL'}
            onPress={onBack}
            size={40}
            iconSize={18}
            stroke={2}
          />
          <Eyebrow>NOVA META · {step + 1}/3</Eyebrow>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 24,
            flexDirection: 'row',
            gap: 6,
          }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                backgroundColor: i <= step ? theme.accent : theme.borderStrong,
                shadowColor: theme.accent,
                shadowOpacity: i <= step ? 0.5 : 0,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
              }}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {step === 0 ? (
            <>
              <H2 style={{ marginBottom: 8 }}>O que você quer conquistar?</H2>
              <Body style={{ color: theme.ink[2], marginBottom: 24 }}>
                Escolha uma categoria para começar
              </Body>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                {CATEGORIES.map((c) => {
                  const active = form.category === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setForm({ ...form, category: c.id })}
                      style={{ width: '48%' }}
                    >
                      <Card
                        style={{
                          padding: 16,
                          gap: 10,
                          borderColor: active ? c.color : theme.border,
                          backgroundColor: active
                            ? `${c.color}22`
                            : theme.glassStrong,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: active ? c.color : `${c.color}2A`,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon
                            name={c.icon}
                            size={18}
                            stroke={1.8}
                            color={active ? theme.accentInk : c.color}
                          />
                        </View>
                        <Body
                          style={{
                            fontFamily: 'Geist_600SemiBold',
                            color: theme.ink[0],
                          }}
                        >
                          {c.label}
                        </Body>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <H2 style={{ marginBottom: 8 }}>Defina sua meta</H2>
              <Body style={{ color: theme.ink[2], marginBottom: 24 }}>
                Seja específico — clareza acelera o progresso
              </Body>

              <View style={{ marginBottom: 20 }}>
                <Eyebrow style={{ marginBottom: 8 }}>TÍTULO</Eyebrow>
                <TextInput
                  value={form.title}
                  onChangeText={(t) => setForm({ ...form, title: t })}
                  placeholder="Ex: Correr uma maratona"
                  placeholderTextColor={theme.ink[3]}
                  autoFocus
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    backgroundColor: theme.glassStrong,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 12,
                    color: theme.ink[0],
                    fontSize: 15,
                    fontFamily: 'Geist_400Regular',
                  }}
                />
              </View>

              <Eyebrow style={{ marginBottom: 10 }}>TIPO DE META</Eyebrow>
              <View style={{ gap: 8 }}>
                {TYPES.map((t) => {
                  const active = form.type === t.id;
                  return (
                    <Pressable
                      key={t.id}
                      onPress={() => setForm({ ...form, type: t.id })}
                    >
                      <Card
                        style={{
                          padding: 14,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          borderColor: active ? theme.accent : theme.border,
                          backgroundColor: active
                            ? theme.accentDim
                            : theme.glassStrong,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: active
                              ? theme.accent
                              : theme.glassStrong,
                            borderWidth: 1,
                            borderColor: theme.borderStrong,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon
                            name={t.icon}
                            size={16}
                            stroke={1.8}
                            color={active ? theme.accentInk : theme.ink[1]}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Body
                            style={{
                              fontFamily: 'Geist_600SemiBold',
                              color: theme.ink[0],
                            }}
                          >
                            {t.label}
                          </Body>
                          <Small style={{ color: theme.ink[3], marginTop: 1 }}>
                            {t.sub}
                          </Small>
                        </View>
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            borderWidth: 2,
                            borderColor: active
                              ? theme.accent
                              : theme.borderStrong,
                            backgroundColor: active ? theme.accent : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {active ? (
                            <Icon
                              name="check"
                              size={10}
                              stroke={3}
                              color={theme.accentInk}
                            />
                          ) : null}
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <H2 style={{ marginBottom: 8 }}>Configure o ritmo</H2>
              <Body style={{ color: theme.ink[2], marginBottom: 24 }}>
                Ajuste o alvo, prazo e lembretes
              </Body>

              <Card style={{ padding: 18, marginBottom: 12 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 14,
                  }}
                >
                  <Eyebrow>ALVO</Eyebrow>
                  <Mono
                    style={{
                      fontSize: 22,
                      color: theme.accent,
                      fontFamily: 'GeistMono_500Medium',
                    }}
                  >
                    {form.target}{' '}
                    <Mono style={{ fontSize: 12, color: theme.ink[3] }}>
                      {form.unit}
                    </Mono>
                  </Mono>
                </View>

                {/* Simple stepper replaces the HTML range slider */}
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    onPress={() =>
                      setForm({
                        ...form,
                        target: Math.max(1, form.target - 7),
                      })
                    }
                    style={{
                      width: 44,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: theme.glassStrong,
                      borderWidth: 1,
                      borderColor: theme.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mono
                      style={{
                        color: theme.ink[1],
                        fontSize: 18,
                        fontFamily: 'Geist_600SemiBold',
                      }}
                    >
                      -
                    </Mono>
                  </Pressable>
                  <View
                    style={{
                      flex: 1,
                      height: 4,
                      backgroundColor: theme.borderStrong,
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${(form.target / 365) * 100}%`,
                        height: '100%',
                        backgroundColor: theme.accent,
                      }}
                    />
                  </View>
                  <Pressable
                    onPress={() =>
                      setForm({
                        ...form,
                        target: Math.min(365, form.target + 7),
                      })
                    }
                    style={{
                      width: 44,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: theme.glassStrong,
                      borderWidth: 1,
                      borderColor: theme.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Mono
                      style={{
                        color: theme.ink[1],
                        fontSize: 18,
                        fontFamily: 'Geist_600SemiBold',
                      }}
                    >
                      +
                    </Mono>
                  </Pressable>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    gap: 6,
                    marginTop: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  {['7 dias', '21 dias', '30 dias', '90 dias'].map((p) => (
                    <Pressable
                      key={p}
                      onPress={() =>
                        setForm({ ...form, target: parseInt(p, 10) })
                      }
                    >
                      <Chip>
                        <Small style={{ color: theme.ink[1], fontSize: 11 }}>
                          {p}
                        </Small>
                      </Chip>
                    </Pressable>
                  ))}
                </View>
              </Card>

              <Card
                style={{
                  padding: 18,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: theme.glassStrong,
                      borderWidth: 1,
                      borderColor: theme.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      name="calendar"
                      size={16}
                      stroke={2}
                      color={theme.accent}
                    />
                  </View>
                  <View>
                    <Body
                      style={{
                        fontFamily: 'Geist_600SemiBold',
                        color: theme.ink[0],
                      }}
                    >
                      Prazo
                    </Body>
                    <Small style={{ color: theme.ink[3] }}>
                      21 de Maio, 2026
                    </Small>
                  </View>
                </View>
                <Icon
                  name="chevron"
                  size={14}
                  stroke={2}
                  color={theme.ink[3]}
                />
              </Card>

              <Card
                style={{
                  padding: 18,
                  marginBottom: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: theme.glassStrong,
                      borderWidth: 1,
                      borderColor: theme.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon
                      name="bell"
                      size={16}
                      stroke={2}
                      color={theme.accent}
                    />
                  </View>
                  <View>
                    <Body
                      style={{
                        fontFamily: 'Geist_600SemiBold',
                        color: theme.ink[0],
                      }}
                    >
                      Lembretes diários
                    </Body>
                    <Small style={{ color: theme.ink[3] }}>
                      Todo dia às 08:00
                    </Small>
                  </View>
                </View>
                <Pressable
                  onPress={() =>
                    setForm({ ...form, reminder: !form.reminder })
                  }
                  style={{
                    width: 44,
                    height: 26,
                    borderRadius: 999,
                    backgroundColor: form.reminder
                      ? theme.accent
                      : theme.borderStrong,
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: '#fff',
                      marginLeft: form.reminder ? 20 : 2,
                    }}
                  />
                </Pressable>
              </Card>

              <Eyebrow style={{ marginBottom: 8 }}>PREVIEW</Eyebrow>
              <Card
                accent
                style={{
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: theme.accentDim,
                    borderWidth: 1,
                    borderColor: theme.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    name="target"
                    size={18}
                    stroke={1.8}
                    color={theme.accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Body
                    style={{
                      fontFamily: 'Geist_600SemiBold',
                      color: theme.ink[0],
                    }}
                  >
                    {form.title || 'Sua meta'}
                  </Body>
                  <Mono
                    style={{
                      fontSize: 12,
                      color: theme.ink[3],
                      marginTop: 2,
                    }}
                  >
                    {form.target} {form.unit} · até 21 Mai
                  </Mono>
                </View>
              </Card>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        {error ? (
          <Small style={{ color: theme.danger, marginBottom: 8 }}>{error}</Small>
        ) : null}
        <Button
          label={step === 2 ? (submitting ? 'Criando…' : 'Criar meta') : 'Continuar'}
          onPress={onPrimary}
          disabled={!canNext || submitting}
          rightAdornment={
            submitting ? (
              <ActivityIndicator size="small" color={theme.accentInk} />
            ) : (
              <Icon name="arrow" size={16} stroke={2} color={theme.accentInk} />
            )
          }
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const buildCreatePayload = (form: FormState): CreateGoalPayload => {
  const category = CATEGORIES.find((c) => c.id === form.category);
  const type = (form.type ?? 'PROJECT') as GoalType;

  const payload: CreateGoalPayload = {
    title: form.title.trim(),
    type,
    category: category?.label,
    icon: category?.icon,
    color: category?.color,
  };

  if (type === 'HABIT') {
    payload.frequency = mapFrequency(form.unit);
  }
  if (type === 'DEADLINE') {
    payload.deadline = deadlineFromDays(form.target).toISOString();
  }
  if (type === 'NUMERIC') {
    payload.targetValue = form.target;
    payload.targetUnit = form.unit;
  }

  return payload;
};

const mapFrequency = (unit: string): GoalFrequency => {
  if (/sem/i.test(unit)) return 'WEEKLY';
  if (/m[eê]s/i.test(unit)) return 'MONTHLY';
  return 'DAILY';
};

const deadlineFromDays = (days: number): Date => {
  const target = new Date();
  target.setDate(target.getDate() + Math.max(1, days));
  return target;
};

const humanize = (err: unknown): string => {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Não foi possível criar a meta.';
};
