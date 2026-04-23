# Impulso

App mobile de metas, hábitos e gamificação construído com **Expo + React Native + TypeScript**.

O design foi portado do protótipo web original (`_legacy/`) para React Native, mantendo o mesmo sistema visual: tokens de cor glassmórficos, acento neon ajustável, tipografia Geist e componentes como `ProgressRing`, `WeekBars`, `TabBar` e o FAB.

## Stack

- **Expo SDK 53** com New Architecture habilitada
- **React 19** / **React Native 0.79**
- **TypeScript** (strict)
- `react-native-svg` para todos os ícones e visualizações (badges, podium, onboarding art)
- `expo-linear-gradient` para o fade da tab bar
- `@expo-google-fonts/geist` + `geist-mono`

## Scripts

```bash
npm install
npm start        # inicia o Metro
npm run ios      # simulador iOS
npm run android  # emulador Android
npm run web      # versão web
npm run typecheck
```

## Estrutura

```
App.tsx                 # entry point (fonts + ThemeProvider)
src/
├── components/         # primitivas: Card, Chip, Button, Icon, ProgressRing, etc.
├── screens/            # Home, Onboarding, GoalDetail, CreateGoal, Habits,
│                       # Achievements, Rank, Profile
├── navigation/         # router simples baseado em estado (mesmo fluxo do protótipo)
├── theme/              # tokens, paletas de acento, ThemeContext (dark/light)
├── data/seed.ts        # estado inicial (metas, hábitos, XP)
└── types/              # tipos compartilhados
_legacy/                # protótipo web original (HTML/CSS/JSX) preservado
```

## Tema & Acento

O antigo `tweaks-panel` vira contexto: `useTheme()` expõe `setMode('dark' | 'light')` e `setAccent(180 | 150 | 260 | 25 | 85 | 330)`. Os valores `oklch()` originais foram convertidos para equivalentes hex/rgba, que são o que o RN aceita nativamente.
