import React, {useEffect, useMemo, useState} from 'react';
import {Clipboard, Pressable, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppIcon,
  AppButton,
  AppCard,
  AppInput,
  AppModal,
  AppMenu,
  AppScreen,
  DataPill,
  EmptyState,
  InlineError,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {eventSchema, joinSchema} from '../../lib/validation/forms';
import {formatCurrency, formatDateLabel} from '../../lib/utils/format';
import {palette, radii, spacing, typography} from '../../theme/tokens';
import type {CurrencyCode, MemberBalance, SettlementInstruction} from '../../types/domain';
import type {ScreenProps} from '../../app/navigation';

function buildSettlementInstructions(balances: MemberBalance[]): SettlementInstruction[] {
  const creditors = balances
    .filter(balance => balance.net > 0)
    .map(balance => ({...balance}));
  const debtors = balances
    .filter(balance => balance.net < 0)
    .map(balance => ({...balance, net: Math.abs(balance.net)}));
  const instructions: SettlementInstruction[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.round(Math.min(creditor.net, debtor.net) * 100) / 100;

    instructions.push({
      fromMemberId: debtor.memberId,
      fromDisplayName: debtor.displayName,
      toMemberId: creditor.memberId,
      toDisplayName: creditor.displayName,
      amount,
    });

    creditor.net = Math.round((creditor.net - amount) * 100) / 100;
    debtor.net = Math.round((debtor.net - amount) * 100) / 100;

    if (creditor.net === 0) {
      creditorIndex += 1;
    }

    if (debtor.net === 0) {
      debtorIndex += 1;
    }
  }

  return instructions;
}

function getAvatarTone(index: number) {
  const tones = [
    {backgroundColor: '#D9F1FF', textColor: '#2F7AC7'},
    {backgroundColor: '#E9F7E7', textColor: '#2D8A4F'},
    {backgroundColor: '#F7EAFE', textColor: '#7B4BC2'},
  ] as const;

  return tones[index % tones.length];
}

export function HomeScreen({navigation}: ScreenProps<'Home'>) {
  const {currentUser, events, signOut, summaries, hydrateEvent, joinEvent, error} = useApp();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinFormError, setJoinFormError] = useState<string>();

  useEffect(() => {
    events.forEach(event => {
      if (!summaries[event.id]) {
        hydrateEvent(event.id).catch(() => undefined);
      }
    });
  }, [events, hydrateEvent, summaries]);

  async function handleJoin() {
    const parsed = joinSchema.safeParse({inviteCode});

    if (!parsed.success) {
      setJoinFormError(parsed.error.issues[0]?.message);
      return;
    }

    setJoinFormError(undefined);
    const event = await joinEvent(parsed.data);
    setInviteCode('');
    setJoinModalVisible(false);
    navigation.navigate('EventDashboard', {eventId: event.id});
  }

  return (
    <>
      <AppScreen
        title={`Hi, ${currentUser?.displayName ?? 'traveler'}`}
        subtitle="Keep trips, shared spending, and settlement in one place."
        actions={
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
          />
        }>
      <AppCard tone="accent">
        <Text style={styles.heroValue}>{events.length}</Text>
        <Text style={styles.heroLabel}>Active events in your workspace</Text>
        <View style={styles.actionRow}>
          <View style={styles.actionRowItem}>
            <AppButton
              label="Create event"
              icon="create"
              onPress={() => navigation.navigate('CreateEvent')}
            />
          </View>
          <View style={styles.actionRowItem}>
            <AppButton
              label="Join by code"
              icon="join"
              variant="secondary"
              onPress={() => {
                setJoinFormError(undefined);
                setJoinModalVisible(true);
              }}
            />
          </View>
        </View>
      </AppCard>

      <SectionHeading title="Your events" detail={`${events.length} total`} />
      {events.length === 0 ? (
        <EmptyState
          title="No events yet"
          body="Create a trip or join one with an invite code to start tracking shared spending."
        />
      ) : null}
      {events.map(event => {
        const summary = summaries[event.id];
        const totalSpend =
          summary?.expenses.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;

        return (
          <Pressable
            key={event.id}
            onPress={() => navigation.navigate('EventDashboard', {eventId: event.id})}
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <AppCard>
              <View style={styles.eventHeaderRow}>
                <View style={styles.eventCopy}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventMeta}>
                    {event.description || 'Shared expense workspace'}
                  </Text>
                </View>
                <DataPill label={event.currency} tone="accent" />
              </View>
              <View style={styles.eventMetrics}>
                <View style={styles.metricGroup}>
                  <Text style={styles.metricLabel}>Members</Text>
                  <Text style={styles.metricText}>{summary?.members.length ?? 1}</Text>
                </View>
                <View style={styles.metricGroup}>
                  <Text style={styles.metricLabel}>Tracked spend</Text>
                  <Text style={styles.metricText}>
                    {formatCurrency(totalSpend, event.currency)}
                  </Text>
                </View>
              </View>
            </AppCard>
          </Pressable>
        );
      })}
      </AppScreen>
      <AppModal
        visible={joinModalVisible}
        title="Join event"
        subtitle="Paste the invite code shared by the event owner."
        onClose={() => {
          setJoinModalVisible(false);
          setJoinFormError(undefined);
          setInviteCode('');
        }}>
        <AppInput
          label="Invite code"
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="ABC123"
          autoCapitalize="characters"
          autoFocus
        />
        <InlineError message={joinFormError ?? error ?? undefined} />
        <AppButton
          label="Join event"
          icon="join"
          onPress={() => handleJoin().catch(() => undefined)}
        />
      </AppModal>
    </>
  );
}

export function CreateEventScreen({navigation}: ScreenProps<'CreateEvent'>) {
  const {createEvent, error} = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('PHP');
  const [formError, setFormError] = useState<string>();

  async function handleCreate() {
    const parsed = eventSchema.safeParse({name, description, currency});

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message);
      return;
    }

    setFormError(undefined);
    const event = await createEvent(parsed.data);
    navigation.replace('EventDashboard', {eventId: event.id});
  }

  return (
    <AppScreen
      title="Create event"
      subtitle="Start with a currency, a name, and a shared ledger."
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <AppInput
          label="Event name"
          value={name}
          onChangeText={setName}
          placeholder="Boracay long weekend"
        />
        <AppInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Flights, villa, food, and shared activities"
          multiline
        />
        <View style={styles.actionRow}>
          <View style={styles.actionRowItem}>
            <AppButton
              label={`Currency: ${currency}`}
              icon="event"
              variant="secondary"
              onPress={() => setCurrency(currency === 'USD' ? 'PHP' : 'USD')}
            />
          </View>
          <View style={styles.actionRowItem}>
            <AppButton
              label="Create event"
              icon="create"
              onPress={() => handleCreate().catch(() => undefined)}
            />
          </View>
        </View>
        <InlineError message={formError ?? error ?? undefined} />
      </AppCard>
    </AppScreen>
  );
}

export function EventDashboardScreen({
  navigation,
  route,
}: ScreenProps<'EventDashboard'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, balances, currentUser} = useApp();
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  const summary = summaries[eventId];
  const eventBalances = balances[eventId] ?? [];
  const event = summary?.event;

  const totalSpend = useMemo(
    () => summary?.expenses.reduce((sum, expense) => sum + expense.amount, 0) ?? 0,
    [summary],
  );
  const fundTotal = useMemo(
    () => summary?.contributions.reduce((sum, item) => sum + item.amount, 0) ?? 0,
    [summary],
  );
  const currentMember = useMemo(
    () => summary?.members.find(member => member.userId === currentUser?.id),
    [currentUser?.id, summary],
  );
  const currentBalance = useMemo(
    () =>
      currentMember
        ? eventBalances.find(balance => balance.memberId === currentMember.id)
        : undefined,
    [currentMember, eventBalances],
  );
  const youOwe = useMemo(
    () =>
      currentMember
        ? buildSettlementInstructions(eventBalances).filter(
            item => item.fromMemberId === currentMember.id,
          )
        : [],
    [currentMember, eventBalances],
  );
  const owesYou = useMemo(
    () =>
      currentMember
        ? buildSettlementInstructions(eventBalances).filter(
            item => item.toMemberId === currentMember.id,
          )
        : [],
    [currentMember, eventBalances],
  );

  if (!summary || !event) {
    return (
      <AppScreen
        title="Event dashboard"
        subtitle="Loading event details."
        headerVariant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState
          title="Loading event"
          body="Fetching members, expenses, balances, and fund status."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title={event.name}
      subtitle={event.description || 'Shared expense workspace'}
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}
      actions={
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('AddExpense', {eventId})}
          style={({pressed}) => [
            styles.headerActionButton,
            pressed ? styles.pressed : null,
          ]}>
          <AppIcon name="expense" tone="inverted" size={14} />
          <Text style={styles.headerActionText}>Add expense</Text>
        </Pressable>
      }>
      <AppCard tone="warm">
        <Text style={styles.heroValue}>{formatCurrency(totalSpend, event.currency)}</Text>
        <Text style={styles.heroLabel}>Tracked event spending</Text>
        <View style={styles.eventMetrics}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Members', {eventId})}
            style={({pressed}) => [
              styles.metricGroup,
              styles.metricGroupMembers,
              pressed ? styles.pressed : null,
            ]}>
            <View style={styles.metricActionRow}>
              <Text style={styles.metricLabelStrong}>Members</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate('Members', {eventId})}
                style={({pressed}) => [
                  styles.metricAddButton,
                  pressed ? styles.pressed : null,
                ]}>
                <AppIcon name="create" size={12} />
              </Pressable>
            </View>
            <Text style={styles.metricTextLarge}>{summary.members.length}</Text>
            <View style={styles.avatarStackRow}>
              {summary.members.slice(0, 3).map((member, index) => {
                const tone = getAvatarTone(index);
                return (
                <View
                  key={member.id}
                  style={[
                    styles.avatarChip,
                    {
                      marginLeft: index === 0 ? 0 : -16,
                      backgroundColor: tone.backgroundColor,
                    },
                  ]}>
                  <Text style={[styles.avatarText, {color: tone.textColor}]}>
                    {member.displayName.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                );
              })}
              {summary.members.length > 3 ? (
                <View style={styles.avatarOverflowChip}>
                  <Text style={styles.avatarOverflowText}>+{summary.members.length - 3}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('CentralFund', {eventId})}
            style={({pressed}) => [
              styles.metricGroup,
              styles.metricGroupFund,
              pressed ? styles.pressed : null,
            ]}>
            <Text style={styles.metricLabelStrong}>Fund contributed</Text>
            <Text style={styles.metricText}>{formatCurrency(fundTotal, event.currency)}</Text>
            <Text style={styles.metricFootnote}>Tap to manage the shared fund</Text>
          </Pressable>
        </View>
      </AppCard>

      {currentBalance ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowBalanceDetails(current => !current)}
          style={({pressed}) => [pressed ? styles.pressed : null]}>
          <AppCard>
            <View style={styles.balanceSummaryRow}>
              <View style={styles.balanceLead}>
                <View
                  style={[
                    styles.summaryIconBubble,
                    currentBalance.net > 0
                      ? styles.summaryIconPositive
                      : currentBalance.net < 0
                        ? styles.summaryIconNegative
                        : styles.summaryIconNeutral,
                  ]}>
                  <AppIcon name="balances" tone="default" size={16} />
                </View>
                <View style={styles.eventCopy}>
                  <Text style={styles.balanceTitle}>My balance</Text>
                  <Text style={styles.eventMeta}>
                    {currentBalance.net > 0
                      ? 'People owe me'
                      : currentBalance.net < 0
                        ? 'I owe the group'
                        : 'I am settled up'}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.balanceAmount,
                  currentBalance.net > 0
                    ? styles.balanceAmountPositive
                    : currentBalance.net < 0
                      ? styles.balanceAmountNegative
                      : styles.balanceAmountNeutral,
                ]}>
                {formatCurrency(Math.abs(currentBalance.net), event.currency)}
              </Text>
            </View>
            {showBalanceDetails ? (
              <View style={styles.balanceDetails}>
                {owesYou.map(item => (
                  <View key={`${item.fromMemberId}-${item.toMemberId}`} style={styles.balanceDetailRow}>
                    <Text style={styles.balanceDetailText}>
                      {item.fromDisplayName} owes you
                    </Text>
                    <Text style={styles.balanceDetailPositive}>
                      {formatCurrency(item.amount, event.currency)}
                    </Text>
                  </View>
                ))}
                {youOwe.map(item => (
                  <View key={`${item.fromMemberId}-${item.toMemberId}`} style={styles.balanceDetailRow}>
                    <Text style={styles.balanceDetailText}>
                      You owe {item.toDisplayName}
                    </Text>
                    <Text style={styles.balanceDetailNegative}>
                      {formatCurrency(item.amount, event.currency)}
                    </Text>
                  </View>
                ))}
                {owesYou.length === 0 && youOwe.length === 0 ? (
                  <Text style={styles.eventMeta}>No payments needed right now.</Text>
                ) : null}
              </View>
            ) : null}
          </AppCard>
        </Pressable>
      ) : null}

      <View style={styles.compactActionList}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Balances', {eventId})}
          style={({pressed}) => [pressed ? styles.pressed : null]}>
          <AppCard>
            <View style={styles.compactActionRow}>
              <View style={[styles.summaryIconBubble, styles.summaryIconBalances]}>
                <AppIcon name="balances" tone="default" size={16} />
              </View>
              <View style={styles.eventCopy}>
                <Text style={styles.compactActionTitle}>Balances</Text>
                <Text style={styles.eventMeta}>See who is up or down</Text>
              </View>
            </View>
          </AppCard>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Settlement', {eventId})}
          style={({pressed}) => [pressed ? styles.pressed : null]}>
          <AppCard>
            <View style={styles.compactActionRow}>
              <View style={[styles.summaryIconBubble, styles.summaryIconSettlement]}>
                <AppIcon name="settlement" tone="default" size={16} />
              </View>
              <View style={styles.eventCopy}>
                <Text style={styles.compactActionTitle}>Settlement</Text>
                <Text style={styles.eventMeta}>Suggested payback plan</Text>
              </View>
            </View>
          </AppCard>
        </Pressable>
      </View>

      <SectionHeading title="Recent expenses" detail={`${summary.expenses.length} total`} />
      {summary.expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          body="Record the first shared purchase to start balance tracking."
        />
      ) : null}
      {summary.expenses
        .slice()
        .reverse()
        .slice(0, 4)
        .map(expense => {
          const payer = summary.members.find(member => member.id === expense.paidByMemberId);
          return (
            <Pressable
              key={expense.id}
              accessibilityRole="button"
              onPress={() => navigation.navigate('AddExpense', {eventId, expenseId: expense.id})}
              style={({pressed}) => [pressed ? styles.pressed : null]}>
              <AppCard>
                <View style={styles.eventHeaderRow}>
                  <View style={styles.eventCopy}>
                    <Text style={styles.eventName}>{expense.title}</Text>
                    <Text style={styles.eventMeta}>
                      {payer?.displayName || 'Unknown payer'} •{' '}
                      {formatDateLabel(expense.createdAt)}
                      {expense.updatedAt !== expense.createdAt ? ' • Edited' : ''}
                    </Text>
                  </View>
                  <DataPill label={formatCurrency(expense.amount, event.currency)} />
                </View>
              </AppCard>
            </Pressable>
          );
        })}
    </AppScreen>
  );
}

export function MembersScreen({navigation, route}: ScreenProps<'Members'>) {
  const {eventId} = route.params;
  const {summaries, addManualMember, createInvite, error} = useApp();
  const summary = summaries[eventId];
  const [displayName, setDisplayName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const latestInvite = useMemo(
    () =>
      summary?.invites
        .slice()
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        )[0],
    [summary],
  );

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  if (!summary) {
    return (
      <AppScreen
        title="Members"
        subtitle="Loading member roster."
        headerVariant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState
          title="Loading members"
          body="Fetching event roster and invite state."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Members"
      subtitle="Keep registered and placeholder members in one shared roster."
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}
      footerOverlay={
        toastMessage ? (
          <View pointerEvents="none" style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null
      }>
      <AppCard>
        <SectionHeading title="Add member manually" />
        <AppInput
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Bea Santos"
        />
        <AppButton
          label="Add placeholder member"
          icon="members"
          onPress={() => {
            addManualMember(eventId, displayName)
              .then(() => setDisplayName(''))
              .catch(() => undefined);
          }}
        />
      </AppCard>
      <AppCard>
        <SectionHeading title="Event code" />
        <Text style={styles.eventMeta}>
          Generate a code for this event, then copy and share it with members.
        </Text>
        <View style={styles.inviteCodeCard}>
          <View style={styles.inviteCodeHeader}>
            <View style={styles.eventCopy}>
              <Text style={styles.inviteCodeLabel}>Current code</Text>
              <Text style={styles.inviteCodeValue}>
                {latestInvite?.inviteCode ?? 'No code generated yet'}
              </Text>
            </View>
            {latestInvite ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Generate new event code"
                onPress={() => {
                  createInvite(eventId)
                    .then(() => setToastMessage('New event code generated'))
                    .catch(() => undefined);
                }}
                style={({pressed}) => [
                  styles.refreshButton,
                  pressed ? styles.pressed : null,
                ]}>
                <Text style={styles.refreshButtonIcon}>↻</Text>
              </Pressable>
            ) : null}
          </View>
          {latestInvite ? (
            <Text style={styles.eventMeta}>
              Expires {formatDateLabel(latestInvite.expiresAt)}
            </Text>
          ) : null}
        </View>
        <View style={styles.actionRow}>
          {!latestInvite ? (
            <View style={styles.actionRowItem}>
              <AppButton
                label="Generate event code"
                icon="invite"
                onPress={() => {
                  createInvite(eventId)
                    .then(() => setToastMessage('Event code generated'))
                    .catch(() => undefined);
                }}
              />
            </View>
          ) : null}
          <View style={styles.actionRowItem}>
            <AppButton
              label="Copy event code"
              icon="join"
              variant="secondary"
              disabled={!latestInvite}
              onPress={() => {
                if (!latestInvite) {
                  return;
                }

                Clipboard.setString(latestInvite.inviteCode);
                setToastMessage('Event code copied');
              }}
            />
          </View>
        </View>
        <AppButton
          label="Copy share message"
          icon="members"
          variant="secondary"
          disabled={!latestInvite}
          onPress={() => {
            if (!latestInvite) {
              return;
            }

            Clipboard.setString(
              `Join "${summary.event.name}" in ReinSplyt with code ${latestInvite.inviteCode}.`,
            );
            setToastMessage('Share message copied');
          }}
        />
        <InlineError message={error ?? undefined} />
      </AppCard>
      {summary.members.map(member => (
        <AppCard key={member.id}>
          <View style={styles.eventHeaderRow}>
            <View>
              <Text style={styles.eventName}>{member.displayName}</Text>
              <Text style={styles.eventMeta}>
                {member.role} • {member.status}
              </Text>
            </View>
            <DataPill label={member.userId ? 'Registered' : 'Placeholder'} />
          </View>
        </AppCard>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroValue: {
    ...typography.display,
    fontSize: 30,
    lineHeight: 34,
  },
  heroLabel: {
    ...typography.body,
    color: palette.inkMuted,
  },
  headerActionButton: {
    minHeight: 38,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: '#C9453E',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerActionText: {
    ...typography.eyebrow,
    color: palette.surface,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionRowItem: {
    flex: 1,
    minWidth: 140,
  },
  tileGrid: {
    gap: spacing.sm,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  eventCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eventName: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 24,
  },
  eventMeta: {
    ...typography.eyebrow,
  },
  eventMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metricGroup: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  metricGroupMembers: {
    backgroundColor: '#F4FBFF',
  },
  metricGroupFund: {
    backgroundColor: '#F4FAF2',
  },
  metricLabel: {
    ...typography.eyebrow,
  },
  metricLabelStrong: {
    ...typography.bodyStrong,
    color: palette.inkMuted,
  },
  metricText: {
    ...typography.bodyStrong,
  },
  metricTextLarge: {
    ...typography.title,
    fontSize: 28,
    lineHeight: 32,
  },
  metricFootnote: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  metricActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricAddButton: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1FF',
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  avatarChip: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.surface,
  },
  avatarOverflowChip: {
    minWidth: 32,
    height: 28,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    backgroundColor: '#EEF2F4',
  },
  avatarText: {
    ...typography.eyebrow,
  },
  avatarOverflowText: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  balanceSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balanceLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  summaryIconBubble: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconGlyph: {
    ...typography.bodyStrong,
    fontSize: 18,
  },
  summaryIconPositive: {
    backgroundColor: '#E6F7EC',
  },
  summaryIconNegative: {
    backgroundColor: '#FCE7E5',
  },
  summaryIconNeutral: {
    backgroundColor: '#ECEFF1',
  },
  summaryIconBalances: {
    backgroundColor: '#F1EAFF',
  },
  summaryIconSettlement: {
    backgroundColor: '#EEF2F4',
  },
  balanceTitle: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 26,
  },
  balanceAmount: {
    ...typography.title,
    fontSize: 24,
    lineHeight: 28,
  },
  balanceAmountPositive: {
    color: '#1E8E4D',
  },
  balanceAmountNegative: {
    color: '#C9453E',
  },
  balanceAmountNeutral: {
    color: palette.inkMuted,
  },
  balanceDetails: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  balanceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  balanceDetailText: {
    ...typography.body,
    flex: 1,
  },
  balanceDetailPositive: {
    ...typography.bodyStrong,
    color: '#1E8E4D',
  },
  balanceDetailNegative: {
    ...typography.bodyStrong,
    color: '#C9453E',
  },
  compactActionList: {
    gap: spacing.sm,
  },
  compactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compactActionTitle: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 24,
  },
  inviteCodeCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    gap: spacing.xs,
  },
  inviteCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  inviteCodeLabel: {
    ...typography.eyebrow,
  },
  inviteCodeValue: {
    ...typography.title,
    letterSpacing: 1.2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ink,
    flexShrink: 0,
  },
  refreshButtonIcon: {
    ...typography.bodyStrong,
    color: palette.surface,
    fontSize: 18,
    lineHeight: 18,
  },
  toast: {
    alignSelf: 'center',
    backgroundColor: palette.ink,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    shadowColor: palette.ink,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  toastText: {
    ...typography.bodyStrong,
    color: palette.surface,
  },
  pressed: {
    opacity: 0.8,
  },
});
