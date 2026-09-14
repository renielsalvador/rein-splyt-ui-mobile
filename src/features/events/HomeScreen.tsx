import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import type {ScreenProps} from '../../app/navigation';
import {
  AppAvatarStack,
  AppButton,
  AppIcon,
  AppInput,
  AppModal,
  AppScreen,
  BrandLogo,
  HeaderMenuButton,
  InlineError,
  MoneyValue,
  NotificationButton,
  SectionRule,
  StatusChip,
} from '../../components/ui';
import {AccountSheet} from '../settings/AccountSheet';
import {NotificationsSheet} from './NotificationsSheet';
import {cardShadow, radii, spacing, typeScale} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles, useTheme} from '../../theme/ThemeProvider';
import {formatCurrencyCompact, formatDateRangeLabel} from '../../lib/utils/format';
import {joinSchema} from '../../lib/validation/forms';
import type {Event, EventMember, Expense, MemberBalance} from '../../types/domain';
import {getEventLifecycle, getTodayDateString, sortEventsByStartDate} from './eventStatus';

type Lifecycle = 'now' | 'upcoming' | 'ended';

function toDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function daysBetween(from: string, to: string) {
  return Math.round((toDate(to) - toDate(from)) / 86_400_000);
}

function countdownLabel(startDate: string | undefined, today: string) {
  if (!startDate) {
    return undefined;
  }
  const days = daysBetween(today, startDate);
  if (days <= 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Tomorrow';
  }
  return `In ${days}d`;
}

function dayOfTripLabel(event: Event, today: string) {
  if (!event.startDate) {
    return undefined;
  }
  const day = daysBetween(event.startDate, today) + 1;
  if (day < 1) {
    return undefined;
  }
  if (event.endDate) {
    return `Day ${day} of ${daysBetween(event.startDate, event.endDate) + 1}`;
  }
  return `Day ${day}`;
}

export function HomeScreen({
  navigation,
  hasTabBar,
  tabBarBottomInset,
}: ScreenProps<'Home'> & {hasTabBar?: boolean; tabBarBottomInset?: number}) {
  const {
    currentUser,
    events,
    summaries,
    balances,
    hydrateEvent,
    joinEvent,
    pendingInvites,
    refreshPendingInvites,
    error,
  } = useApp();
  const styles = useStyles(createStyles);

  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinFieldError, setJoinFieldError] = useState<string>();
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    events.forEach(event => {
      if (!summaries[event.id]) {
        hydrateEvent(event.id).catch(() => undefined);
      }
    });
  }, [events, hydrateEvent, summaries]);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }
    refreshPendingInvites().catch(() => undefined);
  }, [notificationsOpen, refreshPendingInvites]);

  const today = getTodayDateString();

  const groups = useMemo(() => {
    const buckets: Record<Lifecycle, Event[]> = {now: [], upcoming: [], ended: []};

    sortEventsByStartDate(events, today).forEach(event => {
      if (!event.isActive) {
        buckets.ended.push(event);
        return;
      }
      const lifecycle = getEventLifecycle(event, today);
      buckets[lifecycle === 'ongoing' ? 'now' : lifecycle === 'upcoming' ? 'upcoming' : 'ended'].push(
        event,
      );
    });

    // Soonest first reads better than newest first once a trip is still ahead.
    buckets.upcoming.reverse();
    return buckets;
  }, [events, today]);

  const selfBalanceFor = useCallback(
    (eventId: string) => {
      const selfMemberId = summaries[eventId]?.members.find(
        member => member.userId === currentUser?.id,
      )?.id;
      if (!selfMemberId) {
        return undefined;
      }
      return balances[eventId]?.find(balance => balance.memberId === selfMemberId);
    },
    [balances, currentUser?.id, summaries],
  );

  const unsettledEnded = useMemo(() => {
    const hydrated = groups.ended.filter(event => balances[event.id]);
    if (hydrated.length === 0) {
      return undefined;
    }
    const total = hydrated.reduce((sum, event) => {
      const net = selfBalanceFor(event.id)?.net ?? 0;
      return sum + Math.abs(net);
    }, 0);
    return total > 0 ? total : undefined;
  }, [balances, groups.ended, selfBalanceFor]);

  const firstName = currentUser?.displayName?.trim().split(/\s+/)[0] ?? 'there';

  async function handleJoin() {
    const parsed = joinSchema.safeParse({inviteCode});
    if (!parsed.success) {
      setJoinFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setJoinFieldError(undefined);
    setJoining(true);
    try {
      const event = await joinEvent(parsed.data);
      setInviteCode('');
      setJoinOpen(false);
      navigation.navigate('EventDashboard', {eventId: event.id});
    } finally {
      setJoining(false);
    }
  }

  const hasAnyEvent = events.length > 0;

  return (
    <>
      <AppScreen
        variant="main"
        hasTabBar={hasTabBar}
        tabBarBottomInset={tabBarBottomInset}
        title="Your trips"
        titleAction={{
          label: 'New',
          icon: 'plus',
          onPress: () => navigation.navigate('CreateEvent'),
        }}
        headerLeft={
          <View style={styles.brandRow}>
            <BrandLogo />
            <Text style={styles.brandName} numberOfLines={1}>{`Hi, ${firstName}`}</Text>
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
        {!hasAnyEvent ? (
          <View style={styles.welcome}>
            <Text style={styles.welcomeTitle}>Start your first trip</Text>
            <Text style={styles.welcomeBody}>
              Create an event for the group, or join one with a code someone shared with you.
            </Text>
            <View style={styles.welcomeActions}>
              <View style={styles.flex}>
                <AppButton
                  label="New event"
                  icon="create"
                  size="compact"
                  onPress={() => navigation.navigate('CreateEvent')}
                />
              </View>
              <View style={styles.flex}>
                <AppButton
                  label="Join code"
                  icon="join"
                  variant="secondary"
                  size="compact"
                  onPress={() => {
                    setJoinFieldError(undefined);
                    setJoinOpen(true);
                  }}
                />
              </View>
            </View>
          </View>
        ) : null}

        {groups.now.length > 0 ? (
          <>
            <SectionRule
              title="Now"
              detail={`${groups.now.length} trip${groups.now.length === 1 ? '' : 's'}`}
            />
            {groups.now.map(event => (
              <OpenTripCard
                key={event.id}
                event={event}
                members={summaries[event.id]?.members ?? []}
                expenses={summaries[event.id]?.expenses ?? []}
                balance={selfBalanceFor(event.id)}
                dayLabel={dayOfTripLabel(event, today)}
                onOpen={() => navigation.navigate('EventDashboard', {eventId: event.id})}
                onAddExpense={() => navigation.navigate('AddExpense', {eventId: event.id})}
              />
            ))}
          </>
        ) : null}

        {groups.upcoming.length > 0 ? (
          <>
            <SectionRule title="Upcoming" detail={`${groups.upcoming.length}`} />
            {groups.upcoming.map(event => (
              <TripRow
                key={event.id}
                event={event}
                memberCount={summaries[event.id]?.members.length}
                trailing={
                  <StatusChip label={countdownLabel(event.startDate, today) ?? 'Planned'} tone="soft" />
                }
                onPress={() => navigation.navigate('EventDashboard', {eventId: event.id})}
              />
            ))}
          </>
        ) : null}

        {groups.ended.length > 0 ? (
          <>
            <SectionRule
              title="Ended"
              detail={
                unsettledEnded
                  ? `₱${Math.round(unsettledEnded).toLocaleString()} unsettled`
                  : undefined
              }
            />
            {groups.ended.map(event => {
              const balance = selfBalanceFor(event.id);
              const settled = !balance || Math.abs(balance.net) < 0.01;
              return (
                <TripRow
                  key={event.id}
                  event={event}
                  dimmed
                  memberCount={summaries[event.id]?.members.length}
                  detail={
                    balance && !settled
                      ? balance.net < 0
                        ? `You owe ${formatCurrencyCompact(Math.abs(balance.net), event.currency)}`
                        : `You're owed ${formatCurrencyCompact(balance.net, event.currency)}`
                      : undefined
                  }
                  trailing={
                    settled ? (
                      <Text style={styles.settledLabel}>Settled up</Text>
                    ) : (
                      <StatusChip label="Settle" tone="action" />
                    )
                  }
                  onPress={() =>
                    settled
                      ? navigation.navigate('EventDashboard', {eventId: event.id})
                      : navigation.navigate('Settlement', {eventId: event.id})
                  }
                />
              );
            })}
          </>
        ) : null}

        {hasAnyEvent ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Join an event with an invite code"
            onPress={() => {
              setJoinFieldError(undefined);
              setJoinOpen(true);
            }}
            style={({pressed}) => [styles.joinRow, pressed ? styles.pressed : null]}>
            <AppIcon name="join" tone="accent" size={18} />
            <Text style={styles.joinLabel}>Join with a code</Text>
          </Pressable>
        ) : null}
      </AppScreen>

      <AccountSheet
        visible={accountOpen}
        onClose={() => setAccountOpen(false)}
        onOpenProfile={() => {
          setAccountOpen(false);
          navigation.navigate('AccountUpdate');
        }}
      />

      <NotificationsSheet
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onOpenInvite={inviteId => navigation.navigate('NotificationDetail', {inviteId})}
      />

      <AppModal
        visible={joinOpen}
        title="Join event"
        subtitle="Paste the invite code shared by the event owner."
        onClose={() => {
          setJoinOpen(false);
          setJoinFieldError(undefined);
          setInviteCode('');
        }}>
        <AppInput
          label="Invite code"
          value={inviteCode}
          onChangeText={value => {
            setInviteCode(value);
            setJoinFieldError(undefined);
          }}
          placeholder="ABC123"
          autoCapitalize="characters"
          autoFocus
          errorMessage={joinFieldError}
        />
        <InlineError message={error ?? undefined} />
        <AppButton
          label="Join event"
          icon="join"
          loading={joining}
          onPress={() => handleJoin().catch(() => undefined)}
        />
      </AppModal>
    </>
  );
}

function OpenTripCard({
  event,
  members,
  expenses,
  balance,
  dayLabel,
  onOpen,
  onAddExpense,
}: {
  event: Event;
  members: EventMember[];
  expenses: Expense[];
  balance?: MemberBalance;
  dayLabel?: string;
  onOpen: () => void;
  onAddExpense: () => void;
}) {
  const {colors} = useTheme();
  const styles = useStyles(createStyles);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);  const lastExpense = expenses.reduce<Expense | undefined>(
    (latest, expense) =>
      !latest || expense.createdAt > latest.createdAt ? expense : latest,
    undefined,
  );
  const payerName = lastExpense
    ? members.find(member => member.id === lastExpense.paidByMemberId)?.displayName
    : undefined;

  return (
    <View style={styles.openCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${event.name}`}
        onPress={onOpen}
        style={({pressed}) => [styles.openHead, pressed ? styles.pressed : null]}>
        <View style={styles.badge}>
          <AppIcon name={event.icon} tone="accent" size={22} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.tripName} numberOfLines={1}>
            {event.name}
          </Text>
          <Text style={styles.tripMeta} numberOfLines={1}>
            {[formatDateRangeLabel(event.startDate, event.endDate), dayLabel]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        <StatusChip label="Live" tone="live" />
      </Pressable>

      <View>
        <Text style={styles.label}>Total tracked</Text>
        <MoneyValue value={total} currency={event.currency} size="amount" />
        {balance && Math.abs(balance.net) >= 0.01 ? (
          <Text
            style={[
              styles.balanceLine,
              {color: balance.net < 0 ? colors.dangerText : colors.successText},
            ]}>
            {balance.net < 0 ? 'You owe ' : "You're owed "}
            {formatCurrencyCompact(Math.abs(balance.net), event.currency)}
          </Text>
        ) : null}
      </View>

      {lastExpense ? (
        <>
          <View style={styles.divider} />
          <View style={styles.lastRow}>
            <View style={styles.badgeSm}>
              <AppIcon name="expense" tone="accent" size={18} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.lastTitle} numberOfLines={1}>
                {lastExpense.title}
              </Text>
              <Text style={styles.tripMeta} numberOfLines={1}>
                {lastExpense.paymentSource === 'central_fund'
                  ? 'Central fund'
                  : payerName
                    ? `${payerName} paid`
                    : 'Paid'}
              </Text>
            </View>
            <MoneyValue value={lastExpense.amount} currency={event.currency} size="inline" />
          </View>
        </>
      ) : null}

      <View style={styles.openActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add an expense to ${event.name}`}
          onPress={onAddExpense}
          style={({pressed}) => [styles.primaryAction, pressed ? styles.pressed : null]}>
          <AppIcon name="create" tone="inverted" size={18} />
          <Text style={styles.primaryActionLabel}>Add expense</Text>
        </Pressable>
        {members.length > 0 ? (
          <AppAvatarStack names={members.map(member => member.displayName)} size="xs" />
        ) : null}
      </View>
    </View>
  );
}

function TripRow({
  event,
  memberCount,
  detail,
  trailing,
  dimmed = false,
  onPress,
}: {
  event: Event;
  memberCount?: number;
  detail?: string;
  trailing?: React.ReactNode;
  dimmed?: boolean;
  onPress: () => void;
}) {
  const styles = useStyles(createStyles);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${event.name}`}
      onPress={onPress}
      style={({pressed}) => [
        styles.tripRow,
        dimmed ? styles.tripRowDim : null,
        pressed ? styles.pressed : null,
      ]}>
      <View style={[styles.badgeSm, dimmed ? styles.badgeDim : null]}>
        <AppIcon name={event.icon} tone={dimmed ? 'muted' : 'accent'} size={18} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.rowName, dimmed ? styles.dimText : null]} numberOfLines={1}>
          {event.name}
        </Text>
        <Text style={styles.tripMeta} numberOfLines={1}>
          {[
            formatDateRangeLabel(event.startDate, event.endDate),
            detail ?? (memberCount ? `${memberCount} members` : undefined),
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      {trailing}
    </Pressable>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    flex: {flex: 1, minWidth: 0},
    pressed: {opacity: 0.82},
    brandRow: {flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1},
    brandName: {
      ...typeScale.bodyStrong,
      fontSize: 18,
      color: colors.onHeader,
    },

    welcome: {
      backgroundColor: colors.brandSoft,
      borderRadius: radii.xl,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    welcomeTitle: {...typeScale.sectionTitle, color: colors.ink},
    welcomeBody: {...typeScale.body, color: colors.inkMuted},
    welcomeActions: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm},

    openCard: {
      backgroundColor: colors.surface,
      borderRadius: radii.xl,
      padding: 18,
      gap: 14,
      ...cardShadow(colors),
    },
    openHead: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 4},
    badge: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: colors.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeSm: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeDim: {backgroundColor: colors.hairline},
    tripName: {...typeScale.cardTitle, color: colors.ink},
    tripMeta: {...typeScale.caption, fontSize: 12.5, color: colors.inkMuted, marginTop: 2},
    label: {...typeScale.caption, fontSize: 12.5, color: colors.inkMuted},
    balanceLine: {...typeScale.body, fontSize: 14, fontWeight: '600', marginTop: 5},
    divider: {height: StyleSheet.hairlineWidth, backgroundColor: colors.hairline, marginHorizontal: -18},
    lastRow: {flexDirection: 'row', alignItems: 'center', gap: 11},
    lastTitle: {...typeScale.bodyStrong, fontSize: 14.5, color: colors.ink},
    openActions: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2},
    primaryAction: {
      flex: 1,
      height: 46,
      borderRadius: radii.pill,
      backgroundColor: colors.actionInk,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    primaryActionLabel: {...typeScale.button, fontSize: 15, color: colors.onActionInk},

    tripRow: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      paddingVertical: 13,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 4,
      ...cardShadow(colors),
    },
    tripRowDim: {
      backgroundColor: colors.surfaceSunken,
      shadowOpacity: 0,
      elevation: 0,
    },
    rowName: {...typeScale.bodyStrong, fontSize: 15.5, color: colors.ink},
    dimText: {color: colors.inkMuted},
    settledLabel: {...typeScale.caption, fontSize: 12.5, color: colors.inkMuted},

    joinRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: 46,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.hairline,
    },
    joinLabel: {...typeScale.button, fontSize: 15, color: colors.brandIcon},

    notificationList: {gap: spacing.sm},
  });
