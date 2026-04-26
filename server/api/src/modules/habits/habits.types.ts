import type { Habit, HabitCheckin } from '@prisma/client';

export type HabitFrequencyView = 'DAILY' | 'WEEKLY' | 'CUSTOM';

export interface HabitCheckinView {
  id: string;
  habitId: string;
  date: string;
  note: string | null;
  xpAwarded: number;
  source: string;
  createdAt: string;
}

export interface HabitView {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  frequency: HabitFrequencyView;
  weekdays: number[];
  targetPerWeek: number;
  xpPerCheckin: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields. Filled in by `HabitsService.toView` based on the user's
  // timezone — never persisted on the row itself.
  todayDone: boolean;
  streak: number;
  weekDone: number;
  weekTarget: number;
}

export function toCheckinView(c: HabitCheckin): HabitCheckinView {
  return {
    id: c.id,
    habitId: c.habitId,
    // Date-only column: ISO YYYY-MM-DD is what the client expects.
    date: c.date.toISOString().slice(0, 10),
    note: c.note,
    xpAwarded: c.xpAwarded,
    source: c.source,
    createdAt: c.createdAt.toISOString(),
  };
}

export function toHabitView(
  habit: Habit,
  computed: {
    todayDone: boolean;
    streak: number;
    weekDone: number;
    weekTarget: number;
  },
): HabitView {
  return {
    id: habit.id,
    title: habit.title,
    description: habit.description,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    weekdays: habit.weekdays,
    targetPerWeek: habit.targetPerWeek,
    xpPerCheckin: habit.xpPerCheckin,
    archivedAt: habit.archivedAt ? habit.archivedAt.toISOString() : null,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    todayDone: computed.todayDone,
    streak: computed.streak,
    weekDone: computed.weekDone,
    weekTarget: computed.weekTarget,
  };
}
