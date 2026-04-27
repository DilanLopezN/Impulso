import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { Celebration, FAB, TabBar } from '@/components';
import { useGamification } from '@/gamification/GamificationContext';
import { goalsToLegacy } from '@/goals/adapters';
import { useGoals } from '@/goals/GoalsContext';
import { useHabits } from '@/habits/HabitsContext';
import {
  AccountSecurity,
  Achievements,
  Auth,
  CreateGoal,
  Feed,
  GoalDetail,
  Habits,
  Home,
  Onboarding,
  Profile,
  Rank,
} from '@/screens';
import { useTheme } from '@/theme/ThemeContext';
import type { Route, TabId } from '@/types';

export const AppNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { status, user, isFirstSession, completeWelcome } = useAuth();
  const { goals: remoteGoals, toggleMilestone: toggleMilestoneRemote } = useGoals();
  const { refresh: refreshGamification } = useGamification();
  const { habits } = useHabits();

  const [route, setRoute] = useState<Route>('home');
  const [tab, setTab] = useState<TabId>('home');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setRoute('home');
      setTab('home');
      setSelectedGoalId(null);
    }
  }, [status]);

  // After habit/goal mutations affect XP, the gamification summary lags by
  // exactly the time between mutation and next manual refresh. Re-pull it
  // whenever the Profile or Achievements tab is opened so the numbers are
  // fresh when the user actually looks at them.
  useEffect(() => {
    if (route === 'profile' || route === 'achievements' || route === 'home') {
      void refreshGamification();
    }
  }, [route, refreshGamification]);

  const activeGoals = useMemo(
    () => remoteGoals.filter((g) => !g.archivedAt),
    [remoteGoals],
  );
  const legacyGoals = useMemo(() => goalsToLegacy(activeGoals), [activeGoals]);

  // Re-pull gamification numbers whenever a habit's todayDone flips. This
  // catches the XP delta from a check-in without requiring screens to know
  // about the gamification context.
  const todayDoneSignature = useMemo(
    () => habits.map((h) => `${h.id}:${h.todayDone ? 1 : 0}`).join('|'),
    [habits],
  );
  useEffect(() => {
    if (status === 'authenticated') {
      void refreshGamification();
    }
  }, [todayDoneSignature, status, refreshGamification]);

  const triggerCelebration = () => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2400);
  };

  const toggleMilestone = (idx: number) => {
    if (!selectedGoalId) return;
    const goal = remoteGoals.find((g) => g.id === selectedGoalId);
    const milestone = goal?.milestones[idx];
    if (!goal || !milestone) return;
    void toggleMilestoneRemote(goal.id, milestone.id, !milestone.done).catch(
      () => undefined,
    );
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
  const displayName = user?.displayName ?? '';

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

  const showTabs = ['home', 'habits', 'feed', 'rank', 'achievements', 'profile'].includes(
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
        return (
          <Home goals={legacyGoals} name={displayName} openGoal={openGoal} />
        );
      case 'habits':
        return <Habits />;
      case 'feed':
        return <Feed />;
      case 'achievements':
        return <Achievements />;
      case 'rank':
        return <Rank />;
      case 'profile':
        return (
          <Profile
            name={displayName}
            onOpenOnboarding={() => setRoute('onboarding')}
            onOpenSecurity={() => setRoute('security')}
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
