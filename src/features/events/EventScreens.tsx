import React, {useEffect, useMemo, useState} from 'react';
import {Clipboard, Pressable, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppIcon,
  AppInput,
  AppMenu,
  AppModal,
  AppScreen,
  AppToast,
  DataPill,
  EmptyState,
  InlineError,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {eventSchema, joinSchema} from '../../lib/validation/forms';
import {formatCurrency, formatDateLabel} from '../../lib/utils/format';
import {palette, radii, spacing, typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';
import type {CurrencyCode, MemberBalance, SettlementInstruction} from '../../types/domain';

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
    {backgroundColor: '#DDEDE6', textColor: palette.primary},
    {backgroundColor: '#E8F0FE', textColor: palette.blue},
    {backgroundColor: '#E8F6EE', textColor: palette.greenAccent},
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
                <View style={styles.metricRow}>
                  <View style={styles.metricPanel}>
                    <Text style={styles.metricLabel}>Members</Text>
                    <Text style={styles.metricText}>{summary?.members.length ?? 1}</Text>
                  </View>
                  <View style={styles.metricPanel}>
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
  const summary = summaries[eventId];
  const eventBalances = balances[eventId] ?? [];
  const event = summary?.event;

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

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
  const instructions = useMemo(
    () => buildSettlementInstructions(eventBalances),
    [eventBalances],
  );
  const youOwe = useMemo(
    () =>
      currentMember
        ? instructions.filter(item => item.fromMemberId === currentMember.id)
        : [],
    [currentMember, instructions],
  );
  const owesYou = useMemo(
    () =>
      currentMember
        ? instructions.filter(item => item.toMemberId === currentMember.id)
        : [],
    [currentMember, instructions],
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

  const balanceLabel =
    currentBalance?.net && currentBalance.net > 0
      ? 'People owe me'
      : currentBalance?.net && currentBalance.net < 0
        ? 'I owe the group'
        : 'No payments needed right now';

  return (
    <>
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
        <AppCard tone="accent">
          <Text style={styles.heroValue}>{formatCurrency(totalSpend, event.currency)}</Text>
          <Text style={styles.heroLabel}>Tracked event spending</Text>
          <View style={styles.dashboardMetricRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Members', {eventId})}
              style={({pressed}) => [
                styles.dashboardMetricCard,
                pressed ? styles.pressed : null,
              ]}>
              <View style={styles.metricActionRow}>
                <Text style={styles.metricLabelStrong}>Members</Text>
                <View style={styles.metricMiniButton}>
                  <AppIcon name="create" tone="accent" size={12} />
                </View>
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
                          marginLeft: index === 0 ? 0 : -10,
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
                styles.dashboardMetricCard,
                styles.dashboardMetricCardSoft,
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
            onPress={() => setShowBalanceDetails(true)}
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
                    <AppIcon name="balances" tone="accent" size={16} />
                  </View>
                  <View style={styles.eventCopy}>
                    <Text style={styles.balanceTitle}>My balance</Text>
                    <Text style={styles.eventMeta}>{balanceLabel}</Text>
                  </View>
                </View>
                <View style={styles.balanceAmountWrap}>
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
                  <Text style={styles.balanceHint}>Tap for details</Text>
                </View>
              </View>
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
                  <AppIcon name="balances" tone="accent" size={16} />
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
                  <AppIcon name="settlement" tone="accent" size={16} />
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
                        {payer?.displayName || 'Unknown payer'} • {formatDateLabel(expense.createdAt)}
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
      <AppModal
        visible={showBalanceDetails}
        title="My balance"
        subtitle="See who owes you and who you still need to pay."
        onClose={() => setShowBalanceDetails(false)}>
        <View style={styles.balanceSheetSummary}>
          <Text style={styles.balanceSheetSummaryLabel}>Net position</Text>
          <Text
            style={[
              styles.balanceSheetSummaryAmount,
              currentBalance?.net && currentBalance.net > 0
                ? styles.balanceAmountPositive
                : currentBalance?.net && currentBalance.net < 0
                  ? styles.balanceAmountNegative
                  : styles.balanceAmountNeutral,
            ]}>
            {formatCurrency(Math.abs(currentBalance?.net ?? 0), event.currency)}
          </Text>
        </View>

        <View style={styles.balanceSheetSection}>
          <SectionHeading title="People who owe me" detail={`${owesYou.length}`} />
          {owesYou.length === 0 ? (
            <Text style={styles.balanceSheetEmpty}>Nobody owes you right now.</Text>
          ) : null}
          {owesYou.map(item => (
            <View key={`${item.fromMemberId}-${item.toMemberId}`} style={styles.balanceSheetRow}>
              <View style={styles.balanceSheetRowCopy}>
                <Text style={styles.balanceSheetRowTitle}>{item.fromDisplayName}</Text>
                <Text style={styles.balanceSheetRowSubtitle}>Needs to pay you</Text>
              </View>
              <Text style={styles.balanceDetailPositive}>
                {formatCurrency(item.amount, event.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.balanceSheetSection}>
          <SectionHeading title="People I owe" detail={`${youOwe.length}`} />
          {youOwe.length === 0 ? (
            <Text style={styles.balanceSheetEmpty}>You do not owe anyone right now.</Text>
          ) : null}
          {youOwe.map(item => (
            <View key={`${item.fromMemberId}-${item.toMemberId}`} style={styles.balanceSheetRow}>
              <View style={styles.balanceSheetRowCopy}>
                <Text style={styles.balanceSheetRowTitle}>{item.toDisplayName}</Text>
                <Text style={styles.balanceSheetRowSubtitle}>You need to pay</Text>
              </View>
              <Text style={styles.balanceDetailNegative}>
                {formatCurrency(item.amount, event.currency)}
              </Text>
            </View>
          ))}
        </View>
      </AppModal>
    </>
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
      footerOverlay={toastMessage ? <AppToast message={toastMessage} /> : null}>
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

      <AppCard tone="warm">
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
                <AppIcon name="refresh" tone="inverted" size={16} />
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
    color: palette.primary,
  },
  heroLabel: {
    ...typography.body,
    color: palette.inkMuted,
  },
  headerActionButton: {
    minHeight: 40,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.primary,
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
    minWidth: 148,
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
    fontSize: 19,
    lineHeight: 24,
  },
  eventMeta: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricPanel: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
  },
  metricLabel: {
    ...typography.eyebrow,
  },
  metricText: {
    ...typography.bodyStrong,
    fontSize: 16,
    color: palette.ink,
  },
  dashboardMetricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dashboardMetricCard: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  dashboardMetricCardSoft: {
    backgroundColor: '#F1F7F4',
  },
  metricLabelStrong: {
    ...typography.bodyStrong,
    color: palette.inkMuted,
  },
  metricTextLarge: {
    ...typography.title,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
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
  metricMiniButton: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  avatarChip: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.surface,
  },
  avatarOverflowChip: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
    backgroundColor: palette.surface,
  },
  avatarText: {
    ...typography.eyebrow,
    fontWeight: '700',
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
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconPositive: {
    backgroundColor: '#E7F5EB',
  },
  summaryIconNegative: {
    backgroundColor: '#FCE8E5',
  },
  summaryIconNeutral: {
    backgroundColor: '#EFF2F4',
  },
  summaryIconBalances: {
    backgroundColor: '#E8F0FE',
  },
  summaryIconSettlement: {
    backgroundColor: '#EEF4F1',
  },
  balanceTitle: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 26,
  },
  balanceAmountWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  balanceAmount: {
    ...typography.title,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  balanceAmountPositive: {
    color: palette.success,
  },
  balanceAmountNegative: {
    color: palette.warning,
  },
  balanceAmountNeutral: {
    color: palette.inkMuted,
  },
  balanceHint: {
    ...typography.eyebrow,
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
    fontSize: 19,
    lineHeight: 24,
  },
  balanceSheetSummary: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
  },
  balanceSheetSummaryLabel: {
    ...typography.eyebrow,
  },
  balanceSheetSummaryAmount: {
    ...typography.display,
    fontSize: 30,
    lineHeight: 36,
  },
  balanceSheetSection: {
    gap: spacing.sm,
  },
  balanceSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
  },
  balanceSheetRowCopy: {
    flex: 1,
    gap: 2,
  },
  balanceSheetRowTitle: {
    ...typography.bodyStrong,
  },
  balanceSheetRowSubtitle: {
    ...typography.eyebrow,
  },
  balanceSheetEmpty: {
    ...typography.body,
    color: palette.inkMuted,
  },
  balanceDetailPositive: {
    ...typography.bodyStrong,
    color: palette.success,
  },
  balanceDetailNegative: {
    ...typography.bodyStrong,
    color: palette.warning,
  },
  inviteCodeCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
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
    letterSpacing: 1.1,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});
