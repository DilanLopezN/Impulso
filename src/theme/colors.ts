export type AccentId = 180 | 150 | 260 | 25 | 85 | 330;

export type AccentPalette = {
  id: AccentId;
  label: string;
  base: string;
  glow: string;
  dim: string;
  ink: string;
};

/**
 * Accent palettes — hex approximations of the original oklch() values.
 * Each palette mirrors: --accent, --accent-glow (35% alpha) and --accent-dim (12% alpha).
 */
export const ACCENT_PALETTES: Record<AccentId, AccentPalette> = {
  180: {
    id: 180,
    label: 'Ciano',
    base: '#58E1E1',
    glow: 'rgba(88, 225, 225, 0.35)',
    dim: 'rgba(88, 225, 225, 0.12)',
    ink: '#05070c',
  },
  150: {
    id: 150,
    label: 'Verde',
    base: '#5EE0A7',
    glow: 'rgba(94, 224, 167, 0.35)',
    dim: 'rgba(94, 224, 167, 0.12)',
    ink: '#05070c',
  },
  260: {
    id: 260,
    label: 'Roxo',
    base: '#9F7BF0',
    glow: 'rgba(159, 123, 240, 0.35)',
    dim: 'rgba(159, 123, 240, 0.12)',
    ink: '#05070c',
  },
  25: {
    id: 25,
    label: 'Coral',
    base: '#F27471',
    glow: 'rgba(242, 116, 113, 0.35)',
    dim: 'rgba(242, 116, 113, 0.12)',
    ink: '#05070c',
  },
  85: {
    id: 85,
    label: 'Âmbar',
    base: '#F2CF5D',
    glow: 'rgba(242, 207, 93, 0.35)',
    dim: 'rgba(242, 207, 93, 0.12)',
    ink: '#05070c',
  },
  330: {
    id: 330,
    label: 'Magenta',
    base: '#F174BA',
    glow: 'rgba(241, 116, 186, 0.35)',
    dim: 'rgba(241, 116, 186, 0.12)',
    ink: '#05070c',
  },
};

export const ACCENT_LIST: AccentPalette[] = Object.values(ACCENT_PALETTES);

/**
 * Category / goal accent swatches — direct hex approximations of the oklch
 * values used in the original seed data.
 */
export const CATEGORY_COLORS = {
  fitness: '#F2947A',
  learn: '#8FAEF0',
  finance: '#72D8A9',
  mind: '#D9A0E8',
  project: '#E6C77A',
  habit: '#F2A070',
  water: '#7FD6E0',
} as const;

/**
 * Achievement tier colors.
 */
export const TIER_COLORS = {
  bronze: '#D19454',
  silver: '#B8C4DB',
  gold: '#F2CD4F',
} as const;

export const STREAK_ORANGE = '#FF9650';
