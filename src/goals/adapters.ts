import type { Goal, IconName, Milestone } from '@/types';
import type { GoalView, MilestoneView } from '@/services/goals.service';

const KNOWN_ICONS: ReadonlyArray<IconName> = [
  'home',
  'target',
  'flame',
  'trophy',
  'user',
  'plus',
  'chevron',
  'chevronL',
  'close',
  'check',
  'bell',
  'sparkle',
  'book',
  'run',
  'wallet',
  'zap',
  'calendar',
  'moon',
  'settings',
  'share',
  'dots',
  'clock',
  'edit',
  'search',
  'arrow',
  'trend',
  'lock',
  'medal',
  'heart',
  'filter',
  'star',
];

const DEFAULT_COLOR = '#7AC4F2';

const MONTHS_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const formatShortDate = (iso: string | null): string => {
  if (!iso) return 'Contínuo';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate().toString().padStart(2, '0')} ${MONTHS_PT[date.getMonth()]}`;
};

const daysBetween = (iso: string | null): number => {
  if (!iso) return 0;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return 0;
  const ms = target - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const toIcon = (raw: string | null): IconName => {
  if (raw && (KNOWN_ICONS as readonly string[]).includes(raw)) {
    return raw as IconName;
  }
  return 'target';
};

export const milestoneToLegacy = (m: MilestoneView): Milestone => ({
  title: m.title,
  date: formatShortDate(m.date),
  done: m.done,
  xp: m.xp,
});

export const goalToLegacy = (goal: GoalView): Goal => {
  const xpTotal = goal.milestones.reduce((acc, m) => acc + (m.xp ?? 0), 0);
  const xp = goal.milestones
    .filter((m) => m.done)
    .reduce((acc, m) => acc + (m.xp ?? 0), 0);
  const next =
    goal.milestones.find((m) => !m.done)?.title ??
    (goal.milestones.length === 0 ? 'Adicione um marco' : 'Tudo concluído');

  return {
    id: goal.id,
    title: goal.title,
    description: goal.description ?? '',
    category: goal.category ?? '—',
    icon: toIcon(goal.icon),
    color: goal.color ?? DEFAULT_COLOR,
    progress: goal.progress,
    deadline: formatShortDate(goal.deadline),
    daysLeft: daysBetween(goal.deadline),
    next,
    xp,
    xpTotal,
    milestones: goal.milestones.map(milestoneToLegacy),
  };
};

export const goalsToLegacy = (goals: ReadonlyArray<GoalView>): Goal[] =>
  goals.map(goalToLegacy);
