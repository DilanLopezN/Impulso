import type { AccentPalette } from './colors';

export type ThemeMode = 'dark' | 'light';

export type ThemeTokens = {
  mode: ThemeMode;
  bg: {
    0: string;
    1: string;
    2: string;
    3: string;
  };
  ink: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
  };
  border: string;
  borderStrong: string;
  glass: string;
  glassStrong: string;
  accent: string;
  accentInk: string;
  accentGlow: string;
  accentDim: string;
  danger: string;
  warn: string;
  ok: string;
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  font: {
    ui: string;
    mono: string;
  };
};

const DARK = {
  bg: { 0: '#05070c', 1: '#0a0e18', 2: '#0f1422', 3: '#151b2d' },
  ink: {
    0: '#f4f7ff',
    1: '#c9d0e0',
    2: '#8790a8',
    3: '#525a74',
    4: '#2b3247',
  },
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
  glass: 'rgba(255, 255, 255, 0.03)',
  glassStrong: 'rgba(255, 255, 255, 0.06)',
} as const;

const LIGHT = {
  bg: { 0: '#f1f3f8', 1: '#ffffff', 2: '#f7f8fc', 3: '#eef0f7' },
  ink: {
    0: '#0a0e18',
    1: '#2a3046',
    2: '#5a6480',
    3: '#8790a8',
    4: '#c9d0e0',
  },
  border: 'rgba(10, 14, 24, 0.08)',
  borderStrong: 'rgba(10, 14, 24, 0.18)',
  glass: 'rgba(10, 14, 24, 0.02)',
  glassStrong: 'rgba(10, 14, 24, 0.04)',
} as const;

export const buildTheme = (
  mode: ThemeMode,
  accent: AccentPalette,
): ThemeTokens => {
  const base = mode === 'dark' ? DARK : LIGHT;
  return {
    mode,
    bg: { ...base.bg },
    ink: { ...base.ink },
    border: base.border,
    borderStrong: base.borderStrong,
    glass: base.glass,
    glassStrong: base.glassStrong,
    accent: accent.base,
    accentInk: mode === 'dark' ? accent.ink : '#ffffff',
    accentGlow: accent.glow,
    accentDim: accent.dim,
    danger: '#F2745E',
    warn: '#F2CF5D',
    ok: '#5EE0A7',
    radius: { sm: 10, md: 16, lg: 22, xl: 28 },
    font: { ui: 'Geist_500Medium', mono: 'GeistMono_500Medium' },
  };
};
