import React, {useEffect, useMemo} from 'react';
import {Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppCard,
  AppScreen,
  DataPill,
  EmptyState,
  InlineError,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {RecentExpenseListItem} from '../events/EventScreenComponents';
import {describeExpenseSplit} from '../events/EventScreenShared';
import {formatCurrency, formatDateLabel} from '../../lib/utils/format';
import {createTypography, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';
import type {ScreenProps} from '../../app/navigation';

export function ExpenseListScreen({navigation, route}: ScreenProps<'AllExpenses'>) {
  const styles = useStyles(createStyles);
  const {eventId} = route.params;
  const {hydrateEvent, summaries, currentUser, error} = useApp();
  const summary = summaries[eventId];

  // Only the people who can change an event get to see who changed it.
  const canSeeAudit = summary?.members.some(
    member =>
      member.userId === currentUser?.id &&
      (member.role === 'owner' || member.role === 'admin'),
  );

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  const groups = useMemo(() => {
    if (!summary) {
      return [];
    }
    const ordered = summary.expenses.slice().reverse();
    const buckets = new Map<string, {label: string; total: number; expenses: typeof ordered}>();

    for (const expense of ordered) {
      const key = expense.createdAt.slice(0, 10);
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.total += expense.amount;
        bucket.expenses.push(expense);
        continue;
      }
      buckets.set(key, {
        label: formatDateLabel(expense.createdAt),
        total: expense.amount,
        expenses: [expense],
      });
    }

    return [...buckets.values()];
  }, [summary]);

  if (!summary) {
    return (
      <AppScreen
        variant="detail"
        title="Expenses"
        subtitle="Loading expense history."
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading expenses" body="Fetching every expense for this event." />
      </AppScreen>
    );
  }

  const {currency} = summary.event;
  const total = summary.expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <AppScreen
      variant="detail"
      title="Expenses"
      subtitle={summary.event.name}
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard tone="accent">
        <Text style={styles.heroAmount}>{formatCurrency(total, currency)}</Text>
        <Text style={styles.heroLabel}>Total recorded for this event</Text>
        <View style={styles.pillRow}>
          <DataPill
            label={`${summary.expenses.length} expense${
              summary.expenses.length === 1 ? '' : 's'
            }`}
          />
        </View>
      </AppCard>

      {summary.expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          body="Record the first shared purchase to start balance tracking."
        />
      ) : null}

      {groups.map(group => (
        <AppCard key={group.label}>
          <SectionHeading title={group.label} detail={formatCurrency(group.total, currency)} />
          {group.expenses.map(expense => {
            const payer = summary.members.find(member => member.id === expense.paidByMemberId);
            const editor = expense.lastEditedBy
              ? summary.members.find(member => member.userId === expense.lastEditedBy)
              : undefined;
            return (
              <RecentExpenseListItem
                key={expense.id}
                title={expense.title}
                meta={`${payer?.displayName || 'Unknown payer'}${
                  expense.paymentSource === 'central_fund' ? ' · Central fund' : ''
                }${
                  canSeeAudit && expense.lastEditedAt
                    ? ` · Edited by ${editor?.displayName ?? 'someone'} ${formatDateLabel(
                        expense.lastEditedAt,
                      )}`
                    : expense.updatedAt !== expense.createdAt
                      ? ' · Edited'
                      : ''
                }`}
                amountLabel={formatCurrency(expense.amount, currency)}
                splitLabel={describeExpenseSplit(
                  summary.expenseSplits,
                  expense.id,
                  summary.members.length,
                )}
                receiptAttached={(expense.receipts?.length ?? 0) > 0}
                onPress={() =>
                  navigation.navigate('AddExpense', {eventId, expenseId: expense.id})
                }
              />
            );
          })}
        </AppCard>
      ))}

      <InlineError message={error ?? undefined} />
    </AppScreen>
  );
}

const createStyles = (c: Colors) => {
  const t = createTypography(c);
  return {
    heroAmount: t.amount,
    heroLabel: {
      ...t.label,
      color: c.inkMuted,
    },
    pillRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.sm,
    },
  };
};
