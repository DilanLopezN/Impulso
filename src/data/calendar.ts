// Date helpers used by the habits/gamification UI. All operations work on the
// local (device) timezone — the same calendar the user perceives. The backend
// is timezone-aware too, so for "today" we send the calendar date and trust
// the server to interpret it.

const pad2 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const toIsoDate = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const todayLocal = (): string => toIsoDate(new Date());

export const shiftDays = (iso: string, delta: number): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toIsoDate(date);
};

export const lastNDays = (n: number, fromIso: string = todayLocal()): string[] => {
  const out: string[] = new Array(n);
  for (let i = 0; i < n; i += 1) {
    out[i] = shiftDays(fromIso, -(n - 1 - i));
  }
  return out;
};

// Sunday = 0 ... Saturday = 6 (matches the backend convention).
export const startOfWeekIso = (iso: string = todayLocal()): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return toIsoDate(new Date(y, m - 1, d - date.getDay()));
};

export const weekDates = (anchor: string = todayLocal()): string[] => {
  const start = startOfWeekIso(anchor);
  return Array.from({ length: 7 }, (_, i) => shiftDays(start, i));
};

const MONTHS_PT_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

const WEEKDAYS_PT_LONG = [
  'domingo', 'segunda', 'terça', 'quarta',
  'quinta', 'sexta', 'sábado',
];

const ucfirst = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

export const formatHeaderDate = (iso: string = todayLocal()): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const wd = WEEKDAYS_PT_LONG[date.getDay()].slice(0, 3).toUpperCase();
  return `${wd} · ${pad2(d)} ${MONTHS_PT_SHORT[m - 1].toUpperCase()}`;
};
