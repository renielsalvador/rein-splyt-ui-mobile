import React, {useEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import type {ScreenProps} from '../../app/navigation';
import {AppAvatarStack, AppScreen, BrandLogo, EmptyState, NotificationButton} from '../../components/ui';
import {AppIcon} from '../../components/ui';
import {AppMenu} from '../../components/ui';
import {HeaderMenuButton} from '../../components/ui';
import {formatCurrency, formatDateRangeLabel} from '../../lib/utils/format';
import {palette, radii, spacing, typography} from '../../theme/tokens';
import {surfaces} from '../../theme/tokens';

export function EventsScreen({navigation, hasTabBar}: ScreenProps<'Events'> & {hasTabBar?: boolean}) {
  const {currentUser, events, summaries, hydrateEvent, pendingInvites, signOut} = useApp();

  useEffect(() => {
    events.forEach(event => {
      if (!summaries[event.id]) {
        hydrateEvent(event.id).catch(() => undefined);
      }
    });
  }, [events, hydrateEvent, summaries]);

  return (
    <AppScreen
      variant="main"
      title="Events"
      subtitle={`${events.length} active event${events.length === 1 ? '' : 's'}`}
      hasTabBar={hasTabBar}
      headerLeft={
        <View style={styles.headerLeft}>
          <BrandLogo />
          <Text style={styles.headerTitle}>Events</Text>
        </View>
      }
      headerRight={
        <View style={styles.headerRight}>
          <NotificationButton
            unreadCount={pendingInvites.length}
            onPress={() => undefined}
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
      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          body="Create a trip or join one with an invite code to start tracking shared spending."
        />
      ) : null}
      {events.map(event => {
        const summary = summaries[event.id];
        const totalSpend = summary?.expenses.reduce((sum, e) => sum + e.amount, 0) ?? 0;
        const memberNames = summary?.members.map(m => m.displayName) ?? [];

        return (
          <Pressable
            key={event.id}
            onPress={() => navigation.navigate('EventDashboard', {eventId: event.id})}
            style={({pressed}) => [pressed && {opacity: 0.82}]}>
            <View style={styles.eventCard}>
              <View style={styles.eventIconBadge}>
                <AppIcon name={event.icon} tone="accent" size={20} />
              </View>
              <View style={styles.eventBody}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={styles.eventMeta}>
                  {memberNames.length > 0 && (
                    <AppAvatarStack names={memberNames} size="xs" />
                  )}
                  <Text style={styles.eventMetaText}>
                    {formatDateRangeLabel(event.startDate, event.endDate)}
                  </Text>
                </View>
              </View>
              <View style={styles.eventTrailing}>
                {totalSpend > 0 ? (
                  <>
                    <Text style={styles.eventBalance}>
                      {formatCurrency(totalSpend, event.currency ?? 'PHP')}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.eventSettled}>Settled</Text>
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
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
  eventCard: {
    ...surfaces.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  eventIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventBody: {
    flex: 1,
    gap: 4,
  },
  eventName: {
    ...typography.cardTitle,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eventMetaText: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  eventTrailing: {
    alignItems: 'flex-end',
    gap: 2,
  },
  eventBalance: {
    ...typography.bodyStrong,
    color: palette.success,
  },
  eventBalanceOwed: {
    ...typography.bodyStrong,
    color: palette.danger,
  },
  eventSettled: {
    ...typography.caption,
    color: palette.inkMuted,
  },
});
