// Calendar helpers for habit check-ins. Streaks and weekly progress are
// always computed against the *user's local calendar*, not UTC, so that
// "marquei à meia-noite no Brasil" doesn't bleed into the next day or
// reset a streak when the user travels.

const MS_PER_DAY = 86_400_000;

/**
 * Format a Date as `YYYY-MM-DD` in the given IANA timezone. Falls back to
 * UTC when the runtime can't resolve the zone.
 */
export function formatLocalDate(date: Date, timezone: string): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** Today's calendar date (YYYY-MM-DD) in the user's timezone. */
export function todayLocal(timezone: string, now = new Date()): string {
  return formatLocalDate(now, timezone);
}

/** Returns YYYY-MM-DD `n` days before `iso` (calendar arithmetic, no DST math). */
export function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  const t = Date.UTC(y, m - 1, d) + days * MS_PER_DAY;
  return new Date(t).toISOString().slice(0, 10);
}

/** Returns the YYYY-MM-DD of the Monday that opens the ISO week of `iso`. */
export function startOfWeek(iso: string): string {
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  const t = new Date(Date.UTC(y, m - 1, d));
  // ISO weekday: Mon=1..Sun=7. Date.getUTCDay returns Sun=0..Sat=6.
  const isoDow = t.getUTCDay() === 0 ? 7 : t.getUTCDay();
  return shiftDate(iso, -(isoDow - 1));
}

/** Inclusive range [start..end] enumerated as YYYY-MM-DD. */
export function eachDay(startIso: string, endIso: string): string[] {
  const out: string[] = [];
  let cursor = startIso;
  while (cursor <= endIso) {
    out.push(cursor);
    cursor = shiftDate(cursor, 1);
  }
  return out;
}

/** ISO weekday of `iso`: Sun=0..Sat=6 to match `Habit.weekdays`. */
export function weekdayIndex(iso: string): number {
  const [y, m, d] = iso.split('-').map((s) => parseInt(s, 10));
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
