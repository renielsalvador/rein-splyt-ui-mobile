import React, {useEffect, useMemo} from 'react';
import {Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppScreen,
  EmptyState,
  InlineError,
  MoneyValue,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {buildBalanceBreakdown} from './balanceBreakdown';
import {formatCurrency, formatDateLabel} from '../../lib/utils/format';
import {createTypography, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';
import type {ScreenProps} from '../../app/navigation';

export function BalanceDetailScreen({navigation, route}: ScreenProps<'BalanceDetail'>) {
  const styles = useStyles(createStyles);
  const {eventId, memberId} = route.params;
  const {hydrateEvent, summaries, currentUser, error} = useApp();
  const summary = summaries[eventId];

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  const selfMemberId = summary?.members.find(
    member => member.userId === currentUser?.id,
  )?.id;
  const other = summary?.members.find(member => member.id === memberId);

  const breakdown = useMemo(() => {
    if (!summary || !selfMemberId || !other) {
      return undefined;
    }
    return buildBalanceBreakdown({
      selfMemberId,
      otherMemberId: other.id,
      expenses: summary.expenses,
      expenseSplits: summary.expenseSplits,
      settlements: summary.settlements,
      members: summary.members,
    });
  }, [other, selfMemberId, summary]);

  if (!summary || !other || !breakdown) {
    return (
      <AppScreen
        variant="detail"
        title="Balance detail"
        subtitle="Loading the shared history."
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading" body="Working out what makes up this balance." />
      </AppScreen>
    );
  }

  const {currency} = summary.event;
  const settled = Math.abs(breakdown.net) < 0.01;
  const headline = settled
    ? 'Settled up'
    : breakdown.net > 0
      ? `${other.displayName} owes you`
      : `You owe ${other.displayName}`;

  return (
    <AppScreen
      variant="detail"
      title={other.displayName}
      subtitle={summary.event.name}
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard tone="accent">
        <Text style={styles.heroLabel}>{headline}</Text>
        <MoneyValue value={Math.abs(breakdown.net)} currency={currency} size="amount" />
      </AppCard>

      {breakdown.lines.length === 0 ? (
        <EmptyState
          title="Nothing shared yet"
          body={`You and ${other.displayName} have no expenses or payments in common.`}
        />
      ) : (
        <AppCard>
          <SectionHeading
            title="What makes this up"
            detail={`${breakdown.lines.length} item${
              breakdown.lines.length === 1 ? '' : 's'
            }`}
          />
          {breakdown.lines.map(line => (
            <View key={line.id} style={styles.line}>
              <View style={styles.lineBody}>
                <Text style={styles.lineLabel} numberOfLines={1}>
                  {line.label}
                </Text>
                <Text style={styles.lineDetail} numberOfLines={1}>
                  {line.detail} · {formatDateLabel(line.occurredAt)}
                </Text>
              </View>
              <Text
                style={[
                  styles.lineAmount,
                  line.amount < 0 ? styles.lineAmountNegative : styles.lineAmountPositive,
                ]}>
                {line.amount < 0 ? '-' : '+'}
                {formatCurrency(Math.abs(line.amount), currency)}
              </Text>
            </View>
          ))}
        </AppCard>
      )}

      {!settled && selfMemberId ? (
        <AppButton
          label={breakdown.net < 0 ? 'Record a payment' : 'Record their payment'}
          icon="settlement"
          onPress={() =>
            navigation.navigate('RecordSettlement', {
              eventId,
              fromMemberId: breakdown.net < 0 ? selfMemberId : other.id,
              toMemberId: breakdown.net < 0 ? other.id : selfMemberId,
              suggestedAmount: Math.abs(breakdown.net),
            })
          }
        />
      ) : null}

      <InlineError message={error ?? undefined} />
    </AppScreen>
  );
}

const createStyles = (c: Colors) => {
  const t = createTypography(c);
  return {
    heroLabel: {
      ...t.label,
      color: c.inkMuted,
    },
    line: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    lineBody: {
      flex: 1,
      gap: 2,
    },
    lineLabel: t.body,
    lineDetail: {
      ...t.caption,
      color: c.inkMuted,
    },
    lineAmount: t.bodyStrong,
    lineAmountPositive: {
      color: c.successText,
    },
    lineAmountNegative: {
      color: c.dangerText,
    },
  };
};
