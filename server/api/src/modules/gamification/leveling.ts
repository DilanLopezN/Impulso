// Centralised level/XP curve (RF-04). All conversions between total XP and
// level go through here so there is a single formula to evolve. The curve is
// linearly increasing per level: level L → L+1 requires `BASE_XP + (L-1) *
// STEP_XP` points.
//
// xpForLevel(L) is the cumulative total XP required to *reach* level L:
//   level 1 = 0 XP, level 2 = 100 XP, level 3 = 250 XP, level 4 = 450 XP, ...
//
// Multiple level-ups in a single ledger insert are handled by `levelFromXp`
// which iterates until the level threshold no longer fits.

const BASE_XP = 100;
const STEP_XP = 50;

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
}

export function xpRequiredForLevelUp(level: number): number {
  return BASE_XP + Math.max(0, level - 1) * STEP_XP;
}

export function xpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l += 1) {
    total += xpRequiredForLevelUp(l);
  }
  return total;
}

export function levelFromXp(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let consumed = 0;
  while (consumed + xpRequiredForLevelUp(level) <= safeXp) {
    consumed += xpRequiredForLevelUp(level);
    level += 1;
  }
  const xpIntoLevel = safeXp - consumed;
  const xpToNext = xpRequiredForLevelUp(level) - xpIntoLevel;
  return { level, xpIntoLevel, xpToNext };
}
