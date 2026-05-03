import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppInput,
  AppScreen,
  DataPill,
  EmptyState,
  InlineError,
  SectionHeading,
} from '../../components/ui';
import {eventSchema, joinSchema} from '../../lib/validation/forms';
import {formatCurrency, formatDateLabel} from '../../lib/utils/format';
import {palette, spacing, typography} from '../../theme/tokens';
import type {CurrencyCode} from '../../types/domain';
import type {ScreenProps} from '../../app/navigation';

export function HomeScreen({navigation}: ScreenProps<'Home'>) {
  const {currentUser, events, signOut, summaries, hydrateEvent} = useApp();

  useEffect(() => {
    events.forEach(event => {
      if (!summaries[event.id]) {
        hydrateEvent(event.id).catch(() => undefined);
      }
    });
  }, [events, hydrateEvent, summaries]);

  return (
    <AppScreen
      title={`Hi, ${currentUser?.displayName ?? 'traveler'}`}
      subtitle="Build a trip, bring the crew in, and settle shared spending cleanly."
      actions={<AppButton label="Sign out" variant="secondary" onPress={() => signOut().catch(() => undefined)} />}>
      <AppCard tone="accent">
        <Text style={styles.heroValue}>{events.length}</Text>
        <Text style={styles.heroLabel}>Active events in your workspace</Text>
        <View style={styles.row}>
          <AppButton label="Create event" onPress={() => navigation.navigate('CreateEvent')} />
          <AppButton
            label="Join by code"
            variant="secondary"
            onPress={() => navigation.navigate('JoinEvent')}
          />
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
              <View style={styles.eventRow}>
                <View style={styles.eventCopy}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventMeta}>
                    {event.description || 'Shared expense workspace'}
                  </Text>
                </View>
                <DataPill label={event.currency} tone="accent" />
              </View>
              <View style={styles.eventMetrics}>
                <Text style={styles.metricText}>
                  {summary?.members.length ?? 1} members
                </Text>
                <Text style={styles.metricText}>
                  {formatCurrency(totalSpend, event.currency)}
                </Text>
              </View>
            </AppCard>
          </Pressable>
        );
      })}
    </AppScreen>
  );
}

export function CreateEventScreen({navigation}: ScreenProps<'CreateEvent'>) {
  const {createEvent, error} = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
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
    <AppScreen title="Create event" subtitle="Start with a currency, a name, and a clean shared ledger.">
      <AppCard>
        <AppInput label="Event name" value={name} onChangeText={setName} placeholder="Boracay long weekend" />
        <AppInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Flights, villa, food, and shared activities"
          multiline
        />
        <View style={styles.row}>
          <AppButton label={`Currency: ${currency}`} variant="secondary" onPress={() => setCurrency(currency === 'USD' ? 'PHP' : 'USD')} />
          <AppButton label="Create event" onPress={() => handleCreate().catch(() => undefined)} />
        </View>
        <InlineError message={formError ?? error ?? undefined} />
      </AppCard>
    </AppScreen>
  );
}

export function JoinEventScreen({navigation}: ScreenProps<'JoinEvent'>) {
  const {joinEvent, error} = useApp();
  const [inviteCode, setInviteCode] = useState('');
  const [formError, setFormError] = useState<string>();

  async function handleJoin() {
    const parsed = joinSchema.safeParse({inviteCode});

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message);
      return;
    }

    setFormError(undefined);
    const event = await joinEvent(parsed.data);
    navigation.replace('EventDashboard', {eventId: event.id});
  }

  return (
    <AppScreen title="Join event" subtitle="Paste the invite code shared by the event owner.">
      <AppCard>
        <AppInput
          label="Invite code"
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="ABC123"
          autoCapitalize="characters"
        />
        <InlineError message={formError ?? error ?? undefined} />
        <AppButton label="Join event" onPress={() => handleJoin().catch(() => undefined)} />
      </AppCard>
    </AppScreen>
  );
}

export function EventDashboardScreen({
  navigation,
  route,
}: ScreenProps<'EventDashboard'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, balances} = useApp();

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

  if (!summary || !event) {
    return (
      <AppScreen title="Event dashboard" subtitle="Loading event details.">
        <EmptyState title="Loading event" body="Fetching members, expenses, balances, and fund status." />
      </AppScreen>
    );
  }

  return (
    <AppScreen title={event.name} subtitle={event.description || 'Shared expense workspace'}>
      <AppCard tone="warm">
        <Text style={styles.heroValue}>{formatCurrency(totalSpend, event.currency)}</Text>
        <Text style={styles.heroLabel}>Tracked event spending</Text>
        <View style={styles.eventMetrics}>
          <Text style={styles.metricText}>{summary.members.length} members</Text>
          <Text style={styles.metricText}>{formatCurrency(fundTotal, event.currency)} contributed</Text>
        </View>
      </AppCard>

      <View style={styles.grid}>
        <AppButton label="Members" onPress={() => navigation.navigate('Members', {eventId})} />
        <AppButton label="Add expense" onPress={() => navigation.navigate('AddExpense', {eventId})} />
        <AppButton label="Central fund" onPress={() => navigation.navigate('CentralFund', {eventId})} />
        <AppButton label="Balances" onPress={() => navigation.navigate('Balances', {eventId})} />
        <AppButton label="Settlement" onPress={() => navigation.navigate('Settlement', {eventId})} />
      </View>

      <SectionHeading title="Member balances" detail="Preview" />
      {eventBalances.slice(0, 4).map(balance => (
        <AppCard key={balance.memberId}>
          <View style={styles.eventRow}>
            <View>
              <Text style={styles.eventName}>{balance.displayName}</Text>
              <Text style={styles.eventMeta}>
                Paid {formatCurrency(balance.paid, event.currency)} • Owes{' '}
                {formatCurrency(balance.owed, event.currency)}
              </Text>
            </View>
            <DataPill
              label={formatCurrency(balance.net, event.currency)}
              tone={balance.net >= 0 ? 'accent' : 'default'}
            />
          </View>
        </AppCard>
      ))}

      <SectionHeading title="Recent expenses" detail={`${summary.expenses.length} total`} />
      {summary.expenses.length === 0 ? (
        <EmptyState title="No expenses yet" body="Record the first shared purchase to start balance tracking." />
      ) : null}
      {summary.expenses.slice().reverse().slice(0, 4).map(expense => {
        const payer = summary.members.find(member => member.id === expense.paidByMemberId);
        return (
          <AppCard key={expense.id}>
            <View style={styles.eventRow}>
              <View style={styles.eventCopy}>
                <Text style={styles.eventName}>{expense.title}</Text>
                <Text style={styles.eventMeta}>
                  {payer?.displayName || 'Unknown payer'} • {formatDateLabel(expense.createdAt)}
                </Text>
              </View>
              <DataPill label={formatCurrency(expense.amount, event.currency)} />
            </View>
          </AppCard>
        );
      })}
    </AppScreen>
  );
}

export function MembersScreen({route}: ScreenProps<'Members'>) {
  const {eventId} = route.params;
  const {summaries, addManualMember, createInvite, error} = useApp();
  const summary = summaries[eventId];
  const [displayName, setDisplayName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [latestInvite, setLatestInvite] = useState<string>();

  if (!summary) {
    return (
      <AppScreen title="Members" subtitle="Loading member roster.">
        <EmptyState title="Loading members" body="Fetching event roster and invite state." />
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Members" subtitle="Keep registered and placeholder members in one shared event roster.">
      <AppCard>
        <SectionHeading title="Add member manually" />
        <AppInput label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Bea Santos" />
        <AppButton
          label="Add placeholder member"
          onPress={() => {
            addManualMember(eventId, displayName)
              .then(() => setDisplayName(''))
              .catch(() => undefined);
          }}
        />
      </AppCard>
      <AppCard>
        <SectionHeading title="Generate invite" />
        <AppInput
          label="Invite email"
          value={inviteEmail}
          onChangeText={setInviteEmail}
          placeholder="optional@example.com"
          autoCapitalize="none"
        />
        <AppButton
          label="Create invite code"
          onPress={() => {
            createInvite(eventId, inviteEmail || undefined)
              .then(invite => {
                setLatestInvite(invite.inviteCode);
                setInviteEmail('');
              })
              .catch(() => undefined);
          }}
        />
        <InlineError message={error ?? undefined} />
        {latestInvite ? <DataPill label={`Latest code: ${latestInvite}`} tone="accent" /> : null}
      </AppCard>
      {summary.members.map(member => (
        <AppCard key={member.id}>
          <View style={styles.eventRow}>
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  grid: {
    gap: spacing.sm,
  },
  eventRow: {
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
  },
  metricText: {
    ...typography.bodyStrong,
  },
  pressed: {
    opacity: 0.8,
  },
});
