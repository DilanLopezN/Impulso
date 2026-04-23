import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, Path, RadialGradient, Stop } from 'react-native-svg';

import {
  Body,
  Button,
  Eyebrow,
  H1,
  Icon,
  Mono,
  ProgressRing,
} from '@/components';
import { useTheme } from '@/theme/ThemeContext';

type OnboardingProps = {
  onDone: () => void;
};

export const Onboarding = ({ onDone }: OnboardingProps) => {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);

  const slides = [
    {
      eyebrow: 'BEM-VINDO AO IMPULSO',
      title: 'Suas metas merecem momentum.',
      body:
        'Transforme intenções em progresso real. Cada pequena ação, registrada e celebrada.',
      Art: OnbGrid,
    },
    {
      eyebrow: 'COMO FUNCIONA',
      title: 'Projete, execute, evolua.',
      body:
        'Defina metas, acompanhe hábitos diários, ganhe XP e veja sua jornada se desenhar em tempo real.',
      Art: OnbRings,
    },
    {
      eyebrow: 'VAMOS COMEÇAR',
      title: 'Sua primeira vitória está próxima.',
      body:
        'Crie sua primeira meta agora. Pode ser um curso, um hábito, um projeto — qualquer coisa que importe.',
      Art: OnbSpark,
    },
  ];

  const current = slides[step]!;
  const isLast = step === slides.length - 1;
  const ArtComponent = current.Art;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg[0] }}>
      <View
        style={{
          paddingHorizontal: 28,
          paddingTop: 20,
          flex: 1,
        }}
      >
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 24 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                backgroundColor: i <= step ? theme.accent : theme.borderStrong,
                shadowColor: theme.accent,
                shadowOpacity: i <= step ? 0.5 : 0,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
              }}
            />
          ))}
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              marginBottom: 36,
            }}
          >
            <ArtComponent />
          </View>

          <Eyebrow style={{ marginBottom: 12 }}>{current.eyebrow}</Eyebrow>
          <H1 style={{ marginBottom: 16 }}>{current.title}</H1>
          <Body style={{ color: theme.ink[1], maxWidth: 320 }}>
            {current.body}
          </Body>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          flexDirection: 'row',
          gap: 10,
        }}
      >
        {!isLast ? (
          <Button
            variant="ghost"
            label="Pular"
            onPress={onDone}
            style={{ flex: 1 }}
          />
        ) : null}
        <Button
          label={isLast ? 'Criar minha primeira meta' : 'Continuar'}
          onPress={() => (isLast ? onDone() : setStep(step + 1))}
          rightAdornment={
            <Icon name="arrow" size={16} stroke={2} color={theme.accentInk} />
          }
          style={{ flex: isLast ? 1 : 1.5 }}
        />
      </View>
    </View>
  );
};

/* ================== ONBOARDING ART ================== */

const OnbGrid = () => {
  const { theme } = useTheme();
  return (
    <View style={{ width: 260, height: 260 }}>
      <Svg viewBox="0 0 260 260" width={260} height={260}>
        <Defs>
          <RadialGradient id="og1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={theme.accent} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={theme.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={130} cy={130} r={120} fill="url(#og1)" />
        {[40, 70, 100, 130].map((r) => (
          <Circle
            key={r}
            cx={130}
            cy={130}
            r={r}
            fill="none"
            stroke={theme.accent}
            strokeOpacity={0.15 + 0.1 * (130 / r - 1)}
            strokeWidth={1}
          />
        ))}
        <Line
          x1={10}
          y1={130}
          x2={250}
          y2={130}
          stroke={theme.borderStrong}
          strokeDasharray="2 4"
        />
        <Line
          x1={130}
          y1={10}
          x2={130}
          y2={250}
          stroke={theme.borderStrong}
          strokeDasharray="2 4"
        />
        <Path
          d="M 40 200 Q 90 180 130 130 T 220 50"
          stroke={theme.accent}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        {[
          [40, 200],
          [80, 180],
          [130, 130],
          [180, 90],
          [220, 50],
        ].map(([x, y], i) => (
          <Circle
            key={i}
            cx={x}
            cy={y}
            r={i === 2 ? 6 : 3}
            fill={theme.accent}
          />
        ))}
      </Svg>
    </View>
  );
};

const OnbRings = () => {
  const { theme } = useTheme();
  return (
    <View style={{ width: 260, height: 260 }}>
      <View style={{ position: 'absolute', top: 20, left: 20 }}>
        <ProgressRing value={0.72} size={220} stroke={3} />
      </View>
      <View style={{ position: 'absolute', top: 56, left: 56 }}>
        <ProgressRing value={0.45} size={148} stroke={3} />
      </View>
      <View style={{ position: 'absolute', top: 76, left: 76 }}>
        <ProgressRing value={0.88} size={108} stroke={5} />
      </View>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Eyebrow style={{ color: theme.accent, marginBottom: 4 }}>
          MOMENTUM
        </Eyebrow>
        <Mono
          style={{
            fontSize: 36,
            color: theme.ink[0],
            fontFamily: 'GeistMono_500Medium',
          }}
        >
          68<Mono style={{ color: theme.ink[3], fontSize: 18 }}>%</Mono>
        </Mono>
      </View>
    </View>
  );
};

const OnbSpark = () => {
  const { theme } = useTheme();
  return (
    <View style={{ width: 260, height: 260 }}>
      <Svg viewBox="0 0 260 260" width={260} height={260}>
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const x2 = 130 + Math.cos(angle) * 120;
          const y2 = 130 + Math.sin(angle) * 120;
          const x1 = 130 + Math.cos(angle) * 60;
          const y1 = 130 + Math.sin(angle) * 60;
          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.accent}
              strokeOpacity={0.25}
              strokeWidth={1}
            />
          );
        })}
        <Circle
          cx={130}
          cy={130}
          r={58}
          fill={theme.bg[2]}
          stroke={theme.accent}
          strokeWidth={2}
        />
        <Path
          d="M 118 108 L 146 128 L 130 132 L 142 152 L 114 132 L 130 128 Z"
          fill={theme.accent}
        />
      </Svg>
    </View>
  );
};
