import { lastNDays, weekDates } from '@/data/calendar';
import type { HabitView } from '@/services/habits.service';
import type { IconName } from '@/types';

const KNOWN_ICONS: ReadonlyArray<IconName> = [
  'home', 'target', 'flame', 'trophy', 'user', 'plus', 'chevron', 'chevronL',
  'close', 'check', 'bell', 'sparkle', 'book', 'run', 'wallet', 'zap',
  'calendar', 'moon', 'settings', 'share', 'dots', 'clock', 'edit', 'search',
  'arrow', 'trend', 'lock', 'medal', 'heart', 'filter', 'star',
];

export const DEFAULT_HABIT_COLOR = '#7AC4F2';

export const habitIcon = (raw: string | null | undefined): IconName => {
  if (raw && (KNOWN_ICONS as readonly string[]).includes(raw)) {
    return raw as IconName;
  }
  return 'flame';
};

export const habitColor = (raw: string | null | undefined): string =>
  raw && raw.length > 0 ? raw : DEFAULT_HABIT_COLOR;

export const frequencyLabel = (habit: HabitView): string => {
  if (habit.frequency === 'DAILY') return 'Diário';
  if (habit.frequency === 'WEEKLY') return `${habit.targetPerWeek}x na semana`;
  return 'Dias da semana';
};

/**
 * Builds the 7-day mask (Sun → Sat) shown in the weekly grid. The mask is 1
 * if there is a check-in on that day, 0 otherwise — does NOT consider whether
 * the day is "due" (the visual intent is "did I do it?", not "should I have").
 */
export const buildWeekMask = (
  habitId: string,
  checkinsByHabit: Record<string, Set<string>>,
): number[] => {
  const set = checkinsByHabit[habitId] ?? new Set<string>();
  return weekDates().map((d) => (set.has(d) ? 1 : 0));
};

/**
 * Aggregates the last 30 days into a "completion ratio per day" that drives
 * the heatmap. ratio = checked-habits / active-habits — a single value in
 * [0,1] per cell. Empty days short-circuit to 0.
 */
export const buildHeatmap = (
  habits: HabitView[],
  checkinsByHabit: Record<string, Set<string>>,
  days = 30,
): { date: string; ratio: number }[] => {
  const window = lastNDays(days);
  if (habits.length === 0) {
    return window.map((date) => ({ date, ratio: 0 }));
  }
  return window.map((date) => {
    let count = 0;
    for (const h of habits) {
      const set = checkinsByHabit[h.id];
      if (set?.has(date)) count += 1;
    }
    return { date, ratio: count / habits.length };
  });
};

export const longestStreakAcross = (habits: HabitView[]): number => {
  let best = 0;
  for (const h of habits) if (h.streak > best) best = h.streak;
  return best;
};
