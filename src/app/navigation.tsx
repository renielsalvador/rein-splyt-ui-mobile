import React, {useMemo, useState} from 'react';
import {Text} from 'react-native';
import {AppProvider, useApp} from './AppProvider';
import {AuthScreen} from '../features/auth/AuthScreen';
import {
  CreateEventScreen,
  EventDashboardScreen,
  HomeScreen,
  JoinEventScreen,
  MembersScreen,
} from '../features/events/EventScreens';
import {AddExpenseScreen} from '../features/expenses/AddExpenseScreen';
import {CentralFundScreen} from '../features/funds/CentralFundScreen';
import {BalancesScreen, SettlementScreen} from '../features/balances/BalanceScreens';
import {AppCard, AppScreen} from '../components/ui';

export type AppStackParamList = {
  Home: undefined;
  CreateEvent: undefined;
  JoinEvent: undefined;
  EventDashboard: {eventId: string};
  Members: {eventId: string};
  AddExpense: {eventId: string};
  CentralFund: {eventId: string};
  Balances: {eventId: string};
  Settlement: {eventId: string};
};

type ScreenName = keyof AppStackParamList;

type Route<T extends ScreenName> = AppStackParamList[T] extends undefined
  ? {name: T}
  : {name: T; params: AppStackParamList[T]};

type AnyRoute = {
  [K in ScreenName]: Route<K>;
}[ScreenName];

type Navigator = {
  navigate: <T extends ScreenName>(
    name: T,
    ...args: AppStackParamList[T] extends undefined ? [] : [AppStackParamList[T]]
  ) => void;
  replace: <T extends ScreenName>(
    name: T,
    ...args: AppStackParamList[T] extends undefined ? [] : [AppStackParamList[T]]
  ) => void;
  goBack: () => void;
};

type MutableRoute = AnyRoute;

export type ScreenProps<T extends ScreenName> = {
  navigation: Navigator;
  route: Route<T>;
};

function createRoute<T extends ScreenName>(
  name: T,
  ...args: AppStackParamList[T] extends undefined ? [] : [AppStackParamList[T]]
): Route<T> {
  if (args.length === 0) {
    return {name} as Route<T>;
  }

  return {name, params: args[0]} as Route<T>;
}

function AppNavigator() {
  const [stack, setStack] = useState<AnyRoute[]>([{name: 'Home'}]);

  const navigation = useMemo<Navigator>(
    () => ({
      navigate(name, ...args) {
        setStack(current => [...current, createRoute(name, ...args) as MutableRoute]);
      },
      replace(name, ...args) {
        setStack(current => {
          const nextRoute = createRoute(name, ...args) as MutableRoute;
          return current.length > 0
            ? [...current.slice(0, current.length - 1), nextRoute]
            : [nextRoute];
        });
      },
      goBack() {
        setStack(current => (current.length > 1 ? current.slice(0, -1) : current));
      },
    }),
    [],
  );

  const currentRoute = stack[stack.length - 1];

  switch (currentRoute.name) {
    case 'Home':
      return <HomeScreen navigation={navigation} route={currentRoute} />;
    case 'CreateEvent':
      return <CreateEventScreen navigation={navigation} route={currentRoute} />;
    case 'JoinEvent':
      return <JoinEventScreen navigation={navigation} route={currentRoute} />;
    case 'EventDashboard':
      return <EventDashboardScreen navigation={navigation} route={currentRoute} />;
    case 'Members':
      return <MembersScreen navigation={navigation} route={currentRoute} />;
    case 'AddExpense':
      return <AddExpenseScreen navigation={navigation} route={currentRoute} />;
    case 'CentralFund':
      return <CentralFundScreen navigation={navigation} route={currentRoute} />;
    case 'Balances':
      return <BalancesScreen navigation={navigation} route={currentRoute} />;
    case 'Settlement':
      return <SettlementScreen navigation={navigation} route={currentRoute} />;
    default:
      return null;
  }
}

function AppStateRouter() {
  const {backendReady, currentUser} = useApp();

  if (!backendReady) {
    return (
      <AppScreen title="Splyt" subtitle="Bootstrapping shared expense workspace.">
        <AppCard>
          <Text>Loading app state...</Text>
        </AppCard>
      </AppScreen>
    );
  }

  return currentUser ? <AppNavigator /> : <AuthScreen />;
}

export function AppRoot() {
  return (
    <AppProvider>
      <AppStateRouter />
    </AppProvider>
  );
}
