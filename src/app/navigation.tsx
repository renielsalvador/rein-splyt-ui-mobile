import React, {useEffect, useMemo, useState} from 'react';
import {BackHandler, Platform, SafeAreaView, StatusBar, Text, View} from 'react-native';
import {AppProvider, useApp} from './AppProvider';
import {AuthScreen, ResetPasswordScreen} from '../features/auth/AuthScreen';
import {
  CreateEventScreen,
  EventDashboardScreen,
  MembersScreen,
  NotificationDetailScreen,
} from '../features/events/EventScreens';
import {HomeScreen} from '../features/events/HomeScreen';
import {ActivityScreen} from '../features/events/ActivityScreen';
import {BalancesOverviewScreen} from '../features/balances/BalancesOverviewScreen';
import {AddExpenseScreen} from '../features/expenses/AddExpenseScreen';
import {CentralFundScreen} from '../features/funds/CentralFundScreen';
import {BalancesScreen, SettlementScreen} from '../features/balances/BalanceScreens';
import {AccountUpdateScreen} from '../features/settings/SettingsScreen';
import {AppCard, AppScreen, AppTabBar, HeaderGradient, TAB_BAR_HEIGHT} from '../components/ui';
import type {TabName} from '../components/ui';
import {ThemeProvider, useTheme} from '../theme/ThemeProvider';

export type AppStackParamList = {
  Home: undefined;
  Activity: undefined;
  BalancesOverview: undefined;
  NotificationDetail: {inviteId: string};
  CreateEvent: undefined;
  EventDashboard: {eventId: string};
  Members: {eventId: string};
  AddExpense: {eventId: string; expenseId?: string};
  CentralFund: {eventId: string};
  Balances: {eventId: string};
  Settlement: {eventId: string};
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
  Balances: 'BalancesOverview',
  Activity: 'Activity',
};

const TAB_SCREENS = new Set<ScreenName>(['Home', 'BalancesOverview', 'Activity']);

const SCREEN_TAB: Partial<Record<ScreenName, TabName>> = {
  Home: 'Home',
  BalancesOverview: 'Balances',
  Activity: 'Activity',
};

function AppNavigator() {
  const {colors} = useTheme();
  const [currentTab, setCurrentTab] = useState<TabName>('Home');
  const [stack, setStack] = useState<AnyRoute[]>([{name: 'Home'}]);

  const navigation = useMemo<Navigator>(
    () => ({
      navigate(name, ...args) {
        if (TAB_SCREENS.has(name)) {
          setCurrentTab(SCREEN_TAB[name] as TabName);
          setStack([{name} as AnyRoute]);
          return;
        }
        setStack(current => [...current, createRoute(name, ...args) as MutableRoute]);
      },
      replace(name, ...args) {
        if (TAB_SCREENS.has(name)) {
          setCurrentTab(SCREEN_TAB[name] as TabName);
          setStack([{name} as AnyRoute]);
          return;
        }
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

  // Screens that guard unsaved work register their own listener; RN runs the most
  // recently added subscription first, so this only fires when nothing intercepted.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length <= 1) {
        return false;
      }
      setStack(current => (current.length > 1 ? current.slice(0, -1) : current));
      return true;
    });

    return () => subscription.remove();
  }, [stack.length]);

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
      case 'BalancesOverview':
        return (
          <BalancesOverviewScreen
            navigation={navigation}
            route={route as Route<'BalancesOverview'>}
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
      case 'AccountUpdate':
        return <AccountUpdateScreen navigation={navigation} route={route as Route<'AccountUpdate'>} />;
      default:
        return null;
    }
  }

  const bottomInset = Platform.OS === 'ios' ? 34 : 0;

  return (
    <View style={{flex: 1, backgroundColor: colors.headerTo}}>
      <HeaderGradient />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: isTopLevel ? TAB_BAR_HEIGHT + bottomInset : bottomInset + 24,
          backgroundColor: isTopLevel ? colors.surface : colors.panel,
        }}
      />
      <SafeAreaView style={{flex: 1}}>
        <View style={{flex: 1}}>
          {renderScreen(currentRoute)}
        </View>
      </SafeAreaView>
      {isTopLevel && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}>
          <AppTabBar
            currentTab={currentTab}
            onTabPress={handleTabPress}
            bottomInset={bottomInset}
          />
        </View>
      )}
    </View>
  );
}

function AppStateRouter() {
  const {backendReady, currentUser, recoveryUser} = useApp();
  const {colors} = useTheme();
  // The header is dark green in both schemes, so only the white auth screens take dark content.
  const onGreenHeader = backendReady ? Boolean(currentUser) && !recoveryUser : true;

  return (
    <>
      <StatusBar
        barStyle={onGreenHeader ? 'light-content' : 'dark-content'}
        backgroundColor={onGreenHeader ? colors.headerFrom : colors.surface}
      />
      <AppStateContent />
    </>
  );
}

function AppStateContent() {
  const {backendReady, currentUser, recoveryUser} = useApp();
  const {colors} = useTheme();

  if (!backendReady) {
    return (
      <View style={{flex: 1, backgroundColor: colors.headerTo}}>
        <HeaderGradient />
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

  if (recoveryUser) {
    return <ResetPasswordScreen />;
  }

  return currentUser ? <AppNavigator /> : <AuthScreen />;
}

export function AppRoot() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppStateRouter />
      </AppProvider>
    </ThemeProvider>
  );
}
