import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppCard,
  AppScreen,
  DataPill,
  EmptyState,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {formatCurrency} from '../../lib/utils/format';
import {palette, spacing, typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';

export function BalancesScreen({navigation, route}: ScreenProps<'Balances'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, balances} = useApp();
  const summary = summaries[eventId];
  const eventBalances = balances[eventId] ?? [];

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  if (!summary) {
    return (
      <AppScreen
        title="Balances"
        subtitle="Loading computed balances."
        headerVariant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading balances" body="Computing who paid more and who still owes." />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Balances"
      subtitle="Each member’s running net position for this event."
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      {eventBalances.map(balance => (
        <AppCard key={balance.memberId}>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.memberName}>{balance.displayName}</Text>
              <Text style={styles.meta}>
                Paid {formatCurrency(balance.paid, summary.event.currency)} • Owes{' '}
                {formatCurrency(balance.owed, summary.event.currency)}
              </Text>
            </View>
            <DataPill
              label={formatCurrency(balance.net, summary.event.currency)}
              tone={balance.net >= 0 ? 'accent' : 'default'}
            />
          </View>
        </AppCard>
      ))}
    </AppScreen>
  );
}

export function SettlementScreen({navigation, route}: ScreenProps<'Settlement'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, settlements} = useApp();
  const summary = summaries[eventId];
  const instructions = settlements[eventId] ?? [];

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  if (!summary) {
    return (
      <AppScreen
        title="Settlement summary"
        subtitle="Loading suggested settlement instructions."
        headerVariant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading settlement" body="Computing the minimum payment instructions for the group." />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Settlement summary"
      subtitle="Simplified payment instructions generated from net balances."
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <SectionHeading title="Suggested transfers" detail={`${instructions.length} payments`} />
      {instructions.length === 0 ? (
        <EmptyState title="No settlement needed" body="This event is already balanced." />
      ) : null}
      {instructions.map((instruction, index) => (
        <AppCard key={`${instruction.fromMemberId}-${instruction.toMemberId}-${index}`}>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.memberName}>
                {instruction.fromDisplayName} pays {instruction.toDisplayName}
              </Text>
              <Text style={styles.meta}>Suggested transfer</Text>
            </View>
            <Text style={styles.amount}>
              {formatCurrency(instruction.amount, summary.event.currency)}
            </Text>
          </View>
        </AppCard>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  memberName: {
    ...typography.title,
    fontSize: 19,
    lineHeight: 24,
  },
  meta: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  amount: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 26,
    color: palette.primary,
  },
});
