import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Celebration, FAB, TabBar } from '@/components';
import { initialState } from '@/data/seed';
import {
  Achievements,
  CreateGoal,
  GoalDetail,
  Habits,
  Home,
  Onboarding,
  Profile,
  Rank,
} from '@/screens';
import { useTheme } from '@/theme/ThemeContext';
import type { AppState, Route, TabId } from '@/types';

export const AppNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [state, setState] = useState<AppState>(initialState);
  const [route, setRoute] = useState<Route>('home');
  const [tab, setTab] = useState<TabId>('home');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const dispatch = (action: { type: 'toggle'; key: string }) => {
    if (action.type === 'toggle') {
      setState((s) => ({
        ...s,
        todayDone: Math.min(s.todayTotal, s.todayDone + 1),
      }));
      triggerCelebration();
    }
  };

  const triggerCelebration = () => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2400);
  };

  const toggleHabit = (id: string) => {
    setState((s) => ({
      ...s,
      habits: s.habits.map((h) =>
        h.id === id ? { ...h, todayDone: !h.todayDone } : h,
      ),
    }));
  };

  const toggleMilestone = (idx: number) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id !== selectedGoalId
          ? g
          : {
              ...g,
              milestones: g.milestones.map((m, i) =>
                i === idx ? { ...m, done: !m.done } : m,
              ),
            },
      ),
    }));
  };

  const openGoal = (id: string) => {
    setSelectedGoalId(id);
    setRoute('goal');
  };

  const handleTab = (id: TabId) => {
    setTab(id);
    setRoute(id);
  };

  const currentGoal = state.goals.find((g) => g.id === selectedGoalId);
  const showTabs = ['home', 'habits', 'rank', 'achievements', 'profile'].includes(
    route,
  );

  const renderScreen = () => {
    switch (route) {
      case 'onboarding':
        return (
          <Onboarding
            onDone={() => {
              setRoute('home');
              setTab('home');
            }}
          />
        );
      case 'goal':
        return (
          <GoalDetail
            goal={currentGoal}
            onBack={() => setRoute('home')}
            onToggleMilestone={toggleMilestone}
          />
        );
      case 'create':
        return (
          <CreateGoal
            onClose={() => setRoute(tab)}
            onCreate={() => {
              triggerCelebration();
              setRoute(tab);
            }}
          />
        );
      case 'home':
        return <Home state={state} dispatch={dispatch} openGoal={openGoal} />;
      case 'habits':
        return <Habits habits={state.habits} toggleHabit={toggleHabit} />;
      case 'achievements':
        return <Achievements />;
      case 'rank':
        return <Rank />;
      case 'profile':
        return (
          <Profile
            state={state}
            onOpenOnboarding={() => setRoute('onboarding')}
            onReset={() => setState(initialState)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.bg[0] }}
    >
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {showTabs ? (
        <>
          <FAB
            onPress={() => setRoute('create')}
            bottom={86 + insets.bottom}
          />
          <TabBar
            active={tab}
            onChange={handleTab}
            bottomInset={insets.bottom}
          />
        </>
      ) : null}

      <Celebration visible={celebrate} onClose={() => setCelebrate(false)} />
    </SafeAreaView>
  );
};
