export type IconName =
  | 'home'
  | 'target'
  | 'flame'
  | 'trophy'
  | 'user'
  | 'plus'
  | 'chevron'
  | 'chevronL'
  | 'close'
  | 'check'
  | 'bell'
  | 'sparkle'
  | 'book'
  | 'run'
  | 'wallet'
  | 'zap'
  | 'calendar'
  | 'moon'
  | 'settings'
  | 'share'
  | 'dots'
  | 'clock'
  | 'edit'
  | 'search'
  | 'arrow'
  | 'trend'
  | 'lock'
  | 'medal'
  | 'heart'
  | 'filter'
  | 'star';

export type Milestone = {
  title: string;
  date: string;
  done: boolean;
  xp: number;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: IconName;
  color: string;
  progress: number;
  deadline: string;
  daysLeft: number;
  next: string;
  streak?: number;
  xp: number;
  xpTotal: number;
  milestones: Milestone[];
};

export type Habit = {
  id: string;
  title: string;
  short: string;
  icon: IconName;
  color: string;
  time: string;
  streak: number;
  weekDone: number;
  todayDone: boolean;
  week: number[];
};

export type WeekDay = {
  label: string;
  value: number;
  done: boolean;
  today?: boolean;
};

export type AppState = {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  todayDone: number;
  todayTotal: number;
  weekDays: WeekDay[];
  goals: Goal[];
  habits: Habit[];
};

export type TabId = 'home' | 'habits' | 'rank' | 'achievements' | 'profile';
export type Route = TabId | 'onboarding' | 'goal' | 'create' | 'security';
