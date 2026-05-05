import React, {useMemo, useState} from 'react';
import {Platform, SafeAreaView, Text, View} from 'react-native';
import {AppProvider, useApp} from './AppProvider';
import {AuthScreen} from '../features/auth/AuthScreen';
import {
  CreateEventScreen,
  EventDashboardScreen,
  HomeScreen,
  MembersScreen,
  NotificationDetailScreen,
} from '../features/events/EventScreens';
import {EventsScreen} from '../features/events/EventsScreen';
import {ActivityScreen} from '../features/events/ActivityScreen';
import {AddExpenseScreen} from '../features/expenses/AddExpenseScreen';
import {CentralFundScreen} from '../features/funds/CentralFundScreen';
import {BalancesScreen, SettlementScreen} from '../features/balances/BalanceScreens';
import {AccountUpdateScreen, SettingsScreen} from '../features/settings/SettingsScreen';
import {AppCard, AppScreen, AppTabBar} from '../components/ui';
import type {TabName} from '../components/ui';
import {palette} from '../theme/tokens';

export type AppStackParamList = {
  Home: undefined;
  Events: undefined;
  Activity: undefined;
  NotificationDetail: {inviteId: string};
  CreateEvent: undefined;
  EventDashboard: {eventId: string};
  Members: {eventId: string};
  AddExpense: {eventId: string; expenseId?: string};
  CentralFund: {eventId: string};
  Balances: {eventId: string};
  Settlement: {eventId: string};
  Settings: undefined;
  AccountUpdate: undefined;
};

type ScreenName = keyof AppStackParamList;

type Route<T extends ScreenName> = AppStackParamList[T] extends undefined
  ? {name: T}
  : {name: T; params: AppStackParamList[T]};

type AnyRoute = {[K in ScreenName]: Route<K>}[ScreenName];
type MutableRoute = AnyRoute;

export type Navigator = {
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

const TAB_ROOT: Record<TabName, ScreenName> = {
  Home: 'Home',
  Events: 'Events',
  Activity: 'Activity',
  Settings: 'Settings',
};

const TAB_SCREENS = new Set<ScreenName>(['Home', 'Events', 'Activity', 'Settings']);

function AppNavigator() {
  const [currentTab, setCurrentTab] = useState<TabName>('Home');
  const [stack, setStack] = useState<AnyRoute[]>([{name: 'Home'}]);

  const navigation = useMemo<Navigator>(
    () => ({
      navigate(name, ...args) {
        setStack(current => [...current, createRoute(name, ...args) as MutableRoute]);
      },
      replace(name, ...args) {
        setStack(current => {
          const next = createRoute(name, ...args) as MutableRoute;
          return current.length > 0 ? [...current.slice(0, -1), next] : [next];
        });
      },
      goBack() {
        setStack(current => (current.length > 1 ? current.slice(0, -1) : current));
      },
    }),
    [],
  );

  function handleTabPress(tab: TabName) {
    setCurrentTab(tab);
    setStack([{name: TAB_ROOT[tab]} as AnyRoute]);
  }

  const currentRoute = stack[stack.length - 1];
  const isTopLevel = stack.length === 1 && TAB_SCREENS.has(currentRoute.name);

  function renderScreen(route: AnyRoute) {
    switch (route.name) {
      case 'Home':
        return (
          <HomeScreen
            navigation={navigation}
            route={route as Route<'Home'>}
            hasTabBar={isTopLevel}
            tabBarBottomInset={bottomInset}
          />
        );
      case 'Events':
        return (
          <EventsScreen
            navigation={navigation}
            route={route as Route<'Events'>}
            hasTabBar={isTopLevel}
            tabBarBottomInset={bottomInset}
          />
        );
      case 'Activity':
        return (
          <ActivityScreen
            navigation={navigation}
            route={route as Route<'Activity'>}
            hasTabBar={isTopLevel}
            tabBarBottomInset={bottomInset}
          />
        );
      case 'NotificationDetail':
        return <NotificationDetailScreen navigation={navigation} route={route as Route<'NotificationDetail'>} />;
      case 'CreateEvent':
        return <CreateEventScreen navigation={navigation} route={route as Route<'CreateEvent'>} />;
      case 'EventDashboard':
        return <EventDashboardScreen navigation={navigation} route={route as Route<'EventDashboard'>} />;
      case 'Members':
        return <MembersScreen navigation={navigation} route={route as Route<'Members'>} />;
      case 'AddExpense':
        return <AddExpenseScreen navigation={navigation} route={route as Route<'AddExpense'>} />;
      case 'CentralFund':
        return <CentralFundScreen navigation={navigation} route={route as Route<'CentralFund'>} />;
      case 'Balances':
        return <BalancesScreen navigation={navigation} route={route as Route<'Balances'>} />;
      case 'Settlement':
        return <SettlementScreen navigation={navigation} route={route as Route<'Settlement'>} />;
      case 'Settings':
        return (
          <SettingsScreen
            navigation={navigation}
            route={route as Route<'Settings'>}
            hasTabBar={isTopLevel}
            tabBarBottomInset={bottomInset}
          />
        );
      case 'AccountUpdate':
        return <AccountUpdateScreen navigation={navigation} route={route as Route<'AccountUpdate'>} />;
      default:
        return null;
    }
  }

  const bottomInset = Platform.OS === 'ios' ? 34 : 0;

  return (
    <View style={{flex: 1, backgroundColor: palette.primary}}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: isTopLevel ? 64 + bottomInset : bottomInset + 24,
          backgroundColor: isTopLevel ? palette.surface : palette.bgApp,
        }}
      />
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
          {renderScreen(currentRoute)}
        </View>
      </SafeAreaView>
      {isTopLevel && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: bottomInset,
          backgroundColor: palette.surface,
        }}>
          <AppTabBar currentTab={currentTab} onTabPress={handleTabPress} />
        </View>
      )}
    </View>
  );
}

function AppStateRouter() {
  const {backendReady, currentUser} = useApp();

  if (!backendReady) {
    return (
      <View style={{flex: 1, backgroundColor: palette.primary}}>
        <SafeAreaView style={{flex: 1}}>
          <AppScreen title="Splyt" subtitle="Bootstrapping shared expense workspace.">
            <AppCard>
              <Text>Loading app state...</Text>
            </AppCard>
          </AppScreen>
        </SafeAreaView>
      </View>
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
