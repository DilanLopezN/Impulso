import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { Celebration, FAB, TabBar } from '@/components';
import { initialState } from '@/data/seed';
import { goalsToLegacy } from '@/goals/adapters';
import { useGoals } from '@/goals/GoalsContext';
import {
  AccountSecurity,
  Achievements,
  Auth,
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
  const { status, user, isFirstSession, completeWelcome } = useAuth();
  const { goals: remoteGoals, toggleMilestone: toggleMilestoneRemote } = useGoals();

  const [state, setState] = useState<AppState>(initialState);
  const [route, setRoute] = useState<Route>('home');
  const [tab, setTab] = useState<TabId>('home');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      setState((prev) => ({ ...prev, name: user.displayName }));
    }
  }, [status, user]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setRoute('home');
      setTab('home');
      setSelectedGoalId(null);
    }
  }, [status]);

  const activeGoals = useMemo(
    () => remoteGoals.filter((g) => !g.archivedAt),
    [remoteGoals],
  );
  const legacyGoals = useMemo(() => goalsToLegacy(activeGoals), [activeGoals]);
  const stateWithGoals = useMemo<AppState>(
    () => ({ ...state, goals: legacyGoals }),
    [state, legacyGoals],
  );

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
    if (!selectedGoalId) return;
    const goal = remoteGoals.find((g) => g.id === selectedGoalId);
    const milestone = goal?.milestones[idx];
    if (!goal || !milestone) return;
    void toggleMilestoneRemote(goal.id, milestone.id, !milestone.done).catch(() => {
      // Failure surfaces via context error state; nothing else to do here.
    });
  };

  const openGoal = (id: string) => {
    setSelectedGoalId(id);
    setRoute('goal');
  };

  const handleTab = (id: TabId) => {
    setTab(id);
    setRoute(id);
  };

  const currentGoal = legacyGoals.find((g) => g.id === selectedGoalId);

  if (status === 'unauthenticated') {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.bg[0] }}
      >
        <Auth />
      </SafeAreaView>
    );
  }

  if (isFirstSession) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.bg[0] }}
      >
        <Onboarding onDone={completeWelcome} />
      </SafeAreaView>
    );
  }

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
            goalId={selectedGoalId}
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
        return <Home state={stateWithGoals} dispatch={dispatch} openGoal={openGoal} />;
      case 'habits':
        return <Habits habits={state.habits} toggleHabit={toggleHabit} />;
      case 'achievements':
        return <Achievements />;
      case 'rank':
        return <Rank />;
      case 'profile':
        return (
          <Profile
            state={stateWithGoals}
            onOpenOnboarding={() => setRoute('onboarding')}
            onOpenSecurity={() => setRoute('security')}
            onReset={() => setState(initialState)}
          />
        );
      case 'security':
        return <AccountSecurity onBack={() => setRoute('profile')} />;
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
