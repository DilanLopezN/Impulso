// Built-in achievement catalog. Each entry is upserted into `achievements`
// by `AchievementsService.ensureCatalog` on first use, keyed by `code`. This
// lets the rule set evolve in code without hand-written migrations: adding a
// new entry here is enough for the engine to start unlocking it.

export type AchievementRule =
  | { kind: 'habit_streak'; threshold: number }
  | { kind: 'habit_total_checkins'; threshold: number }
  | { kind: 'total_xp'; threshold: number }
  | { kind: 'goals_completed'; threshold: number };

export interface AchievementSeed {
  code: string;
  title: string;
  description: string;
  category: 'HABITS' | 'GOALS' | 'STREAKS' | 'XP' | 'SPECIAL';
  icon: string | null;
  xpReward: number;
  rule: AchievementRule;
}

export const ACHIEVEMENTS_CATALOG: AchievementSeed[] = [
  {
    code: 'habit_streak_3',
    title: 'Faísca',
    description: 'Mantenha um hábito por 3 dias seguidos.',
    category: 'STREAKS',
    icon: 'flame',
    xpReward: 50,
    rule: { kind: 'habit_streak', threshold: 3 },
  },
  {
    code: 'habit_streak_7',
    title: 'Em chamas',
    description: 'Sequência de 7 dias em um hábito.',
    category: 'STREAKS',
    icon: 'fire',
    xpReward: 150,
    rule: { kind: 'habit_streak', threshold: 7 },
  },
  {
    code: 'habit_streak_30',
    title: 'Constância',
    description: 'Sequência de 30 dias em um hábito.',
    category: 'STREAKS',
    icon: 'medal',
    xpReward: 500,
    rule: { kind: 'habit_streak', threshold: 30 },
  },
  {
    code: 'habit_total_10',
    title: 'Primeiros passos',
    description: 'Marque 10 conclusões de hábito.',
    category: 'HABITS',
    icon: 'check',
    xpReward: 50,
    rule: { kind: 'habit_total_checkins', threshold: 10 },
  },
  {
    code: 'habit_total_100',
    title: 'Hábito de campeão',
    description: 'Marque 100 conclusões de hábito.',
    category: 'HABITS',
    icon: 'trophy',
    xpReward: 300,
    rule: { kind: 'habit_total_checkins', threshold: 100 },
  },
  {
    code: 'xp_1000',
    title: 'Mil XP',
    description: 'Acumule 1.000 XP.',
    category: 'XP',
    icon: 'spark',
    xpReward: 100,
    rule: { kind: 'total_xp', threshold: 1000 },
  },
  {
    code: 'xp_10000',
    title: 'Veterano',
    description: 'Acumule 10.000 XP.',
    category: 'XP',
    icon: 'crown',
    xpReward: 500,
    rule: { kind: 'total_xp', threshold: 10000 },
  },
];
