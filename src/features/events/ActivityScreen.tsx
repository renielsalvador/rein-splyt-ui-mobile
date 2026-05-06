import React, {useEffect, useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {ScreenProps} from '../../app/navigation';
import {
  AppCard,
  AppIcon,
  AppMenu,
  AppScreen,
  BrandLogo,
  EmptyState,
  HeaderMenuButton,
  NotificationButton,
} from '../../components/ui';
import {useApp} from '../../app/AppProvider';
import {palette, radii, spacing, typography} from '../../theme/tokens';
import {buildActivityFeed} from './activityFeed';

export function ActivityScreen({
  navigation,
  hasTabBar,
  tabBarBottomInset,
}: ScreenProps<'Activity'> & {hasTabBar?: boolean; tabBarBottomInset?: number}) {
  const {
    currentUser,
    pendingInvites,
    signOut,
    events,
    summaries,
    balances,
    hydrateEvent,
  } = useApp();

  useEffect(() => {
    events.forEach(event => {
      if (!summaries[event.id]) {
        hydrateEvent(event.id).catch(() => undefined);
      }
    });
  }, [events, hydrateEvent, summaries]);

  const activityFeed = useMemo(
    () => buildActivityFeed(events, summaries, balances).slice(0, 24),
    [balances, events, summaries],
  );

  return (
    <AppScreen
      variant="main"
      subtitle="Recent updates across all your events"
      hasTabBar={hasTabBar}
      tabBarBottomInset={tabBarBottomInset}
      headerLeft={
        <View style={styles.headerLeft}>
          <BrandLogo />
          <View style={{display: 'flex', flexDirection: 'column', gap: 0}}>
            <Text style={styles.headerTitle}>Activity</Text>
          </View>
        </View>
      }
      headerRight={
        <View style={styles.headerRight}>
          <NotificationButton
            unreadCount={pendingInvites.length}
            onPress={() =>
              navigation.navigate('NotificationDetail', {
                inviteId: pendingInvites[0]?.invite.id ?? '',
              })
            }
          />
          <AppMenu
            items={[
              {
                label: 'Settings',
                icon: 'settings',
                onPress: () => navigation.navigate('Settings'),
              },
              {
                label: 'Sign out',
                icon: 'signout',
                onPress: () => signOut().catch(() => undefined),
              },
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
      {activityFeed.length === 0 ? (
        <EmptyState
          title="No activity yet"
          body="Expense additions, fund contributions, and member changes will appear here."
        />
      ) : null}

      {activityFeed.map(entry => (
        <Pressable
          key={entry.id}
          accessibilityRole="button"
          accessibilityLabel={`Open ${entry.title}`}
          onPress={() => navigation.navigate('EventDashboard', {eventId: entry.eventId})}
          style={({pressed}) => [pressed ? styles.pressed : null]}>
          <AppCard>
            <View style={styles.row}>
              <View style={styles.iconBadge}>
                <AppIcon name={entry.icon} tone="accent" size={18} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{entry.title}</Text>
                <Text style={styles.body}>{entry.body}</Text>
                <Text style={styles.meta}>{entry.meta}</Text>
              </View>
              <AppIcon name="chevron" tone="muted" size={16} />
            </View>
          </AppCard>
        </Pressable>
      ))}
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
  headerSubtitle: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.84,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyStrong,
  },
  body: {
    ...typography.body,
    color: palette.inkMuted,
  },
  meta: {
    ...typography.caption,
    color: palette.inkMuted,
  },
});
