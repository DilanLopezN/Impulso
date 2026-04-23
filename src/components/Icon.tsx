import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { IconName } from '@/types';

export type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
};

type Renderer = (color: string, stroke: number) => React.ReactNode;

const LC = 'round' as const;
const LJ = 'round' as const;

const ICONS: Record<IconName, Renderer> = {
  home: (c, s) => (
    <Path
      d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  target: (c, s) => (
    <>
      <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={s} fill="none" />
      <Circle cx={12} cy={12} r={5} stroke={c} strokeWidth={s} fill="none" />
      <Circle cx={12} cy={12} r={1.5} fill={c} />
    </>
  ),
  flame: (c, s) => (
    <Path
      d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4-1 3 1 4 1 4S8 9 12 3z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  trophy: (c, s) => (
    <>
      <Path
        d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
      <Path
        d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  user: (c, s) => (
    <>
      <Circle cx={12} cy={8} r={4} stroke={c} strokeWidth={s} fill="none" />
      <Path
        d="M4 21a8 8 0 0 1 16 0"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  plus: (c, s) => (
    <Path
      d="M12 5v14M5 12h14"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  chevron: (c, s) => (
    <Path
      d="m9 6 6 6-6 6"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  chevronL: (c, s) => (
    <Path
      d="m15 6-6 6 6 6"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  close: (c, s) => (
    <Path
      d="M6 6l12 12M18 6 6 18"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  check: (c, s) => (
    <Path
      d="m4 12 5 5L20 6"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  bell: (c, s) => (
    <Path
      d="M6 8a6 6 0 0 1 12 0c0 6 3 6 3 9H3c0-3 3-3 3-9M10 21h4"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  sparkle: (c, s) => (
    <Path
      d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  book: (c, s) => (
    <Path
      d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  run: (c, s) => (
    <>
      <Circle cx={13} cy={4} r={2} stroke={c} strokeWidth={s} fill="none" />
      <Path
        d="M4 20l4-6 3 2-2 4M8 14l-1-4 4-2 3 3 3 1M14 11l2 3-3 3"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  wallet: (c, s) => (
    <>
      <Path
        d="M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
      <Path
        d="M3 7V5a1 1 0 0 1 1-1h12v3M17 13h2"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  zap: (c, s) => (
    <Path
      d="M13 2 4 14h7l-1 8 9-12h-7z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  calendar: (c, s) => (
    <>
      <Rect
        x={3}
        y={5}
        width={18}
        height={16}
        rx={2}
        stroke={c}
        strokeWidth={s}
        fill="none"
      />
      <Path
        d="M3 10h18M8 3v4M16 3v4"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  moon: (c, s) => (
    <Path
      d="M20 14A8 8 0 1 1 10 4a7 7 0 0 0 10 10z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  settings: (c, s) => (
    <>
      <Circle cx={12} cy={12} r={3} stroke={c} strokeWidth={s} fill="none" />
      <Path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.2.4.6.8 1 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  share: (c, s) => (
    <>
      <Circle cx={18} cy={5} r={3} stroke={c} strokeWidth={s} fill="none" />
      <Circle cx={6} cy={12} r={3} stroke={c} strokeWidth={s} fill="none" />
      <Circle cx={18} cy={19} r={3} stroke={c} strokeWidth={s} fill="none" />
      <Path
        d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  dots: (c) => (
    <>
      <Circle cx={5} cy={12} r={1.5} fill={c} />
      <Circle cx={12} cy={12} r={1.5} fill={c} />
      <Circle cx={19} cy={12} r={1.5} fill={c} />
    </>
  ),
  clock: (c, s) => (
    <>
      <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={s} fill="none" />
      <Path
        d="M12 7v5l3 2"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  edit: (c, s) => (
    <Path
      d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  search: (c, s) => (
    <>
      <Circle cx={11} cy={11} r={7} stroke={c} strokeWidth={s} fill="none" />
      <Path
        d="m21 21-4.3-4.3"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  arrow: (c, s) => (
    <Path
      d="M5 12h14M13 5l7 7-7 7"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  trend: (c, s) => (
    <>
      <Path
        d="m3 17 6-6 4 4 8-8"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
      <Path
        d="M14 7h7v7"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  lock: (c, s) => (
    <>
      <Rect
        x={5}
        y={11}
        width={14}
        height={10}
        rx={2}
        stroke={c}
        strokeWidth={s}
        fill="none"
      />
      <Path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  medal: (c, s) => (
    <>
      <Circle cx={12} cy={15} r={6} stroke={c} strokeWidth={s} fill="none" />
      <Path
        d="M8.5 10 6 3h12l-2.5 7"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
      <Path
        d="M12 12v3M10 15h4"
        stroke={c}
        strokeWidth={s}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
        fill="none"
      />
    </>
  ),
  heart: (c, s) => (
    <Path
      d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  filter: (c, s) => (
    <Path
      d="M3 5h18l-7 9v6l-4-2v-4z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
  star: (c, s) => (
    <Path
      d="m12 3 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1z"
      stroke={c}
      strokeWidth={s}
      strokeLinecap={LC}
      strokeLinejoin={LJ}
      fill="none"
    />
  ),
};

export const Icon = ({
  name,
  size = 22,
  stroke = 1.6,
  color = 'currentColor',
}: IconProps) => {
  const renderer = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderer(color, stroke)}
    </Svg>
  );
};
