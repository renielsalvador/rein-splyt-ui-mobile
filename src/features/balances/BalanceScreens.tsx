import React, {useEffect, useMemo, useState} from 'react';
import {Share, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppScreen,
  AppToast,
  EmptyState,
  MoneyValue,
  ScreenBackButton,
  SectionHeading,
  balanceLabel,
  balanceTone,
} from '../../components/ui';
import {formatCurrency} from '../../lib/utils/format';
import {createTypography, radii, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';
import type {ScreenProps} from '../../app/navigation';
import {formatSelfDisplayName} from '../events/EventScreenShared';

export function BalancesScreen({navigation, route}: ScreenProps<'Balances'>) {
  const styles = useStyles(createStyles);
  const {eventId} = route.params;
  const {hydrateEvent, summaries, balances, currentUser} = useApp();
  const summary = summaries[eventId];
  const eventBalances = balances[eventId] ?? [];
  const currentMemberId = summary?.members.find(member => member.userId === currentUser?.id)?.id;
  const selfBalance = eventBalances.find(balance => balance.memberId === currentMemberId);

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  if (!summary) {
    return (
      <AppScreen
        variant="detail"
        title="Balances"
        subtitle="Loading computed balances."
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading balances" body="Computing who paid more and who still owes." />
      </AppScreen>
    );
  }

  const currency = summary.event.currency;

  return (
    <AppScreen
      variant="detail"
      title="Balances"
      subtitle={summary.event.name}
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      {selfBalance ? (
        <AppCard tone="accent">
          <Text style={styles.heroLabel}>{balanceLabel(selfBalance.net, true)}</Text>
          <MoneyValue value={selfBalance.net} currency={currency} size="hero" absolute />
          <Text style={styles.heroMeta}>
            You paid {formatCurrency(selfBalance.paid, currency)} and your share is{' '}
            {formatCurrency(selfBalance.owed, currency)}.
          </Text>
        </AppCard>
      ) : null}

      <SectionHeading title="Everyone" detail={`${eventBalances.length} members`} />

      <AppCard>
        {eventBalances.map((balance, index) => {
          const isSelf = balance.memberId === currentMemberId;

          return (
            <View key={balance.memberId} style={[styles.row, index > 0 ? styles.rowDivided : null]}>
              <View style={styles.copy}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {formatSelfDisplayName(balance.displayName, isSelf)}
                </Text>
                <Text style={styles.meta}>
                  Paid {formatCurrency(balance.paid, currency)} · Share{' '}
                  {formatCurrency(balance.owed, currency)}
                </Text>
              </View>
              <View style={styles.value}>
                <Text style={styles.valueLabel}>{balanceLabel(balance.net, isSelf)}</Text>
                <MoneyValue
                  value={balance.net}
                  currency={currency}
                  tone={balanceTone(balance.net)}
                  absolute
                />
              </View>
            </View>
          );
        })}
      </AppCard>
    </AppScreen>
  );
}

export function SettlementScreen({navigation, route}: ScreenProps<'Settlement'>) {
  const styles = useStyles(createStyles);
  const {eventId} = route.params;
  const {hydrateEvent, summaries, settlements, currentUser} = useApp();
  const summary = summaries[eventId];
  const instructions = settlements[eventId] ?? [];
  const currentMemberId = summary?.members.find(member => member.userId === currentUser?.id)?.id;
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeoutId = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  const fundSpend = useMemo(() => {
    if (!summary) {
      return 0;
    }
    return summary.expenses
      .filter(expense => expense.paymentSource === 'central_fund')
      .reduce((total, expense) => total + expense.amount, 0);
  }, [summary]);

  if (!summary) {
    return (
      <AppScreen
        variant="detail"
        title="Settle up"
        subtitle="Loading suggested settlement instructions."
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading settlement" body="Working out the shortest way to square up." />
      </AppScreen>
    );
  }

  const event = summary.event;
  const currency = event.currency;
  const expenses = summary.expenses;
  const totalSpend = expenses.reduce((total, expense) => total + expense.amount, 0);
  const isSettled = instructions.length === 0;

  async function shareSummary() {
    const lines = [`${event.name} — settle up`, ''];

    if (isSettled) {
      lines.push('Everyone is square. No payments needed.');
    } else {
      instructions.forEach(instruction => {
        lines.push(
          `${instruction.fromDisplayName} pays ${instruction.toDisplayName} ${formatCurrency(
            instruction.amount,
            currency,
          )}`,
        );
      });
    }

    if (fundSpend > 0) {
      lines.push('', `The central fund covered ${formatCurrency(fundSpend, currency)} of the trip.`);
    }

    lines.push('', `Total tracked: ${formatCurrency(totalSpend, currency)} · Shared from Splyt`);

    try {
      await Share.share({message: lines.join('\n')});
    } catch {
      setToast('Could not open the share sheet.');
    }
  }

  return (
    <AppScreen
      variant="detail"
      title="Settle up"
      subtitle={event.name}
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}
      footerOverlay={
        <AppButton
          label="Share summary"
          icon="share"
          variant={isSettled ? 'primary' : 'black'}
          onPress={shareSummary}
        />
      }>
      {isSettled ? (
        <AppCard tone="accent">
          <Text style={styles.heroLabel}>All square</Text>
          <Text style={styles.settledTitle}>Nobody owes anybody.</Text>
          <Text style={styles.heroMeta}>
            {formatCurrency(totalSpend, currency)} tracked across {expenses.length}{' '}
            {expenses.length === 1 ? 'expense' : 'expenses'}. Send the group the summary so everyone
            has the same record.
          </Text>
        </AppCard>
      ) : (
        <>
          <AppCard tone="accent">
            <Text style={styles.heroLabel}>To square up</Text>
            <Text style={styles.settledTitle}>
              {instructions.length} {instructions.length === 1 ? 'payment' : 'payments'}
            </Text>
            <Text style={styles.heroMeta}>
              The shortest set of transfers that clears every balance.
            </Text>
          </AppCard>

          <AppCard>
            {instructions.map((instruction, index) => (
              <View
                key={`${instruction.fromMemberId}-${instruction.toMemberId}-${index}`}
                style={[styles.row, index > 0 ? styles.rowDivided : null]}>
                <View style={styles.copy}>
                  <Text style={styles.memberName}>
                    {formatSelfDisplayName(
                      instruction.fromDisplayName,
                      instruction.fromMemberId === currentMemberId,
                    )}{' '}
                    pays{' '}
                    {formatSelfDisplayName(
                      instruction.toDisplayName,
                      instruction.toMemberId === currentMemberId,
                    )}
                  </Text>
                </View>
                <MoneyValue value={instruction.amount} currency={currency} tone="positive" />
              </View>
            ))}
          </AppCard>
        </>
      )}

      {fundSpend > 0 ? (
        <View style={styles.fundNote}>
          <Text style={styles.fundNoteLabel}>Central fund</Text>
          <Text style={styles.fundNoteBody}>
            The pool absorbed {formatCurrency(fundSpend, currency)} of this trip, so that spend never
            became anyone's debt.
          </Text>
        </View>
      ) : null}

      {toast ? <AppToast message={toast} /> : null}
    </AppScreen>
  );
}

const createStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
    },
    rowDivided: {
      paddingTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.hairline,
    },
    copy: {
      flex: 1,
      gap: 2,
    },
    value: {
      alignItems: 'flex-end',
      gap: 2,
    },
    valueLabel: {
      ...t.caption,
      color: c.inkMuted,
    },
    memberName: {
      ...t.bodyStrong,
    },
    meta: {
      ...t.caption,
      color: c.inkMuted,
    },
    heroLabel: {
      ...t.label,
      color: c.brand,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    heroMeta: {
      ...t.body,
      color: c.inkMuted,
    },
    settledTitle: {
      ...t.pageTitle,
    },
    fundNote: {
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: c.brandSofter,
      gap: spacing.xs,
    },
    fundNoteLabel: {
      ...t.label,
      color: c.brand,
    },
    fundNoteBody: {
      ...t.body,
      color: c.ink,
    },
  });
};
