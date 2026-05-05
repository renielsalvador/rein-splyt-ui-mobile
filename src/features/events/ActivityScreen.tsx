import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {ScreenProps} from '../../app/navigation';
import {AppScreen, BrandLogo, EmptyState, NotificationButton} from '../../components/ui';
import {AppMenu, HeaderMenuButton} from '../../components/ui';
import {useApp} from '../../app/AppProvider';
import {spacing, typography} from '../../theme/tokens';

export function ActivityScreen({
  navigation,
  hasTabBar,
  tabBarBottomInset,
}: ScreenProps<'Activity'> & {hasTabBar?: boolean; tabBarBottomInset?: number}) {
  const {currentUser, pendingInvites, signOut} = useApp();

  return (
    <AppScreen
      variant="main"
      title="Activity"
      subtitle="Recent updates across all your events"
      hasTabBar={hasTabBar}
      tabBarBottomInset={tabBarBottomInset}
      headerLeft={
        <View style={styles.headerLeft}>
          <BrandLogo />
          <Text style={styles.headerTitle}>Activity</Text>
        </View>
      }
      headerRight={
        <View style={styles.headerRight}>
          <NotificationButton
            unreadCount={pendingInvites.length}
            onPress={() => navigation.navigate('NotificationDetail', {inviteId: pendingInvites[0]?.invite.id ?? ''})}
          />
          <AppMenu
            items={[
              {label: 'Settings', icon: 'settings', onPress: () => navigation.navigate('Settings')},
              {label: 'Sign out', icon: 'signout', onPress: () => signOut().catch(() => undefined)},
            ]}
            renderTrigger={({toggle}) => (
              <HeaderMenuButton
                onPress={toggle}
                avatarFallbackLabel={currentUser?.displayName}
              />
            )}
          />
        </View>
      }>
      <EmptyState
        title="No activity yet"
        body="Expense additions, settlements, and member changes will appear here."
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: '#FFFFFF',
    fontSize: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
