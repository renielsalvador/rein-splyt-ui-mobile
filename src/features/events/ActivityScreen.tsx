import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {ScreenProps} from '../../app/navigation';
import {
  AppIcon,
  AppScreen,
  BrandLogo,
  EmptyState,
  HeaderMenuButton,
  NotificationButton,
} from '../../components/ui';
import {AccountSheet} from '../settings/AccountSheet';
import {NotificationsSheet} from './NotificationsSheet';
import {useApp} from '../../app/AppProvider';
import {cardShadow, radii, spacing, typeScale} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';
import {buildActivityFeed} from './activityFeed';

export function ActivityScreen({
  navigation,
  hasTabBar,
  tabBarBottomInset,
}: ScreenProps<'Activity'> & {hasTabBar?: boolean; tabBarBottomInset?: number}) {
  const {currentUser, pendingInvites, events, summaries, balances, hydrateEvent} = useApp();
  const styles = useStyles(createStyles);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
    <>
      <AppScreen
        variant="main"
        title="Activity"
        subtitle="Recent updates across all your trips"
        hasTabBar={hasTabBar}
        tabBarBottomInset={tabBarBottomInset}
        headerLeft={
          <View style={styles.brandRow}>
            <BrandLogo />
            <Text style={styles.brandName}>Activity</Text>
          </View>
        }
        headerRight={
          <>
            <NotificationButton
              unreadCount={pendingInvites.length}
              onPress={() => setNotificationsOpen(true)}
            />
            <HeaderMenuButton
              onPress={() => setAccountOpen(true)}
              avatarUrl={currentUser?.avatarUrl}
              avatarFallbackLabel={currentUser?.displayName}
            />
          </>
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
            style={({pressed}) => [styles.card, pressed ? styles.pressed : null]}>
            <View style={styles.iconBadge}>
              <AppIcon name={entry.icon} tone="accent" size={18} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{entry.title}</Text>
              <Text style={styles.body}>{entry.body}</Text>
              <Text style={styles.meta}>{entry.meta}</Text>
            </View>
            <AppIcon name="chevron" tone="muted" size={16} />
          </Pressable>
        ))}
      </AppScreen>

      <NotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onOpenInvite={inviteId => navigation.navigate('NotificationDetail', {inviteId})}
      />

      <AccountSheet
        visible={accountOpen}
        onClose={() => setAccountOpen(false)}
        onOpenProfile={() => {
          setAccountOpen(false);
          navigation.navigate('AccountUpdate');
        }}
      />
    </>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    pressed: {opacity: 0.84},
    brandRow: {flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1},
    brandName: {...typeScale.bodyStrong, fontSize: 18, color: colors.onHeader},
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      ...cardShadow(colors),
    },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      backgroundColor: colors.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    copy: {flex: 1, gap: 2},
    title: {...typeScale.bodyStrong, color: colors.ink},
    body: {...typeScale.body, color: colors.inkMuted},
    meta: {...typeScale.caption, color: colors.inkMuted},
  });
