import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {AppCard, AppScreen, DataPill, EmptyState, SectionHeading} from '../../components/ui';
import {formatCurrency} from '../../lib/utils/format';
import {typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';

export function BalancesScreen({route}: ScreenProps<'Balances'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, balances} = useApp();
  const summary = summaries[eventId];
  const eventBalances = balances[eventId] ?? [];

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  if (!summary) {
    return (
      <AppScreen title="Balances" subtitle="Loading computed balances.">
        <EmptyState title="Loading balances" body="Computing who paid more and who still owes." />
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Balances" subtitle="Each member’s running net position for this event.">
      {eventBalances.map(balance => (
        <AppCard key={balance.memberId}>
          <View style={styles.row}>
            <View>
              <Text style={styles.memberName}>{balance.displayName}</Text>
              <Text style={{...typography.eyebrow}}>
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

export function SettlementScreen({route}: ScreenProps<'Settlement'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, settlements} = useApp();
  const summary = summaries[eventId];
  const instructions = settlements[eventId] ?? [];

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  if (!summary) {
    return (
      <AppScreen title="Settlement summary" subtitle="Loading suggested settlement instructions.">
        <EmptyState title="Loading settlement" body="Computing the minimum payment instructions for the group." />
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Settlement summary" subtitle="Simplified payment instructions generated from net balances.">
      <SectionHeading title="Suggested transfers" detail={`${instructions.length} payments`} />
      {instructions.length === 0 ? (
        <EmptyState title="No settlement needed" body="This event is already balanced." />
      ) : null}
      {instructions.map((instruction, index) => (
        <AppCard key={`${instruction.fromMemberId}-${instruction.toMemberId}-${index}`}>
          <Text style={styles.memberName}>
            {instruction.fromDisplayName} pays {instruction.toDisplayName}
          </Text>
          <Text style={styles.amount}>
            {formatCurrency(instruction.amount, summary.event.currency)}
          </Text>
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
  },
  memberName: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 24,
  },
  amount: {
    ...typography.display,
    fontSize: 28,
    lineHeight: 32,
  },
});
