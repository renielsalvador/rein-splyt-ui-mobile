import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppInput,
  AppScreen,
  DataPill,
  EmptyState,
  InlineError,
  ScreenBackButton,
  SelectableRow,
  SectionHeading,
} from '../../components/ui';
import {contributionSchema} from '../../lib/validation/forms';
import {formatCurrency, toAmount} from '../../lib/utils/format';
import {palette, spacing, typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';

export function CentralFundScreen({navigation, route}: ScreenProps<'CentralFund'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, addContribution, error} = useApp();
  const summary = summaries[eventId];
  const [memberId, setMemberId] = useState<string>();
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string>();

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  useEffect(() => {
    if (summary && !memberId) {
      setMemberId(summary.members[0]?.id);
    }
  }, [memberId, summary]);

  const contributionTotal = useMemo(
    () => summary?.contributions.reduce((sum, item) => sum + item.amount, 0) ?? 0,
    [summary],
  );

  const fundExpenseTotal = useMemo(
    () =>
      summary?.expenses
        .filter(item => item.paymentSource === 'central_fund')
        .reduce((sum, item) => sum + item.amount, 0) ?? 0,
    [summary],
  );

  if (!summary || !memberId) {
    return (
      <AppScreen
        variant="detail"
        title="Central fund"
        subtitle="Loading fund details."
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading fund" body="Fetching contributions and fund-paid expenses." />
      </AppScreen>
    );
  }

  async function handleSubmit() {
    if (!memberId) {
      setFormError('Select a member.');
      return;
    }
    const parsed = contributionSchema.safeParse({amount: toAmount(amount)});
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message);
      return;
    }
    setFormError(undefined);
    await addContribution({eventId, memberId, amount: parsed.data.amount});
    setAmount('');
  }

  return (
    <AppScreen
      variant="detail"
      title="Central fund"
      subtitle="Track who topped up the shared fund and how much remains."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard tone="accent">
        <Text style={styles.heroAmount}>
          {formatCurrency(contributionTotal - fundExpenseTotal, summary.event.currency)}
        </Text>
        <Text style={styles.heroLabel}>Available shared fund balance</Text>
        <View style={styles.pillRow}>
          <DataPill label={`In: ${formatCurrency(contributionTotal, summary.event.currency)}`} />
          <DataPill label={`Out: ${formatCurrency(fundExpenseTotal, summary.event.currency)}`} />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeading title="Record contribution" />
        <AppInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="300"
          autoCapitalize="none"
          keyboardType="decimal-pad"
        />
        {summary.members.map(member => (
          <SelectableRow
            key={member.id}
            label={member.displayName}
            detail="Contributor"
            selected={memberId === member.id}
            onPress={() => setMemberId(member.id)}
          />
        ))}
        <InlineError message={formError ?? error ?? undefined} />
        <AppButton
          label="Add contribution"
          icon="fund"
          onPress={() => handleSubmit().catch(() => undefined)}
        />
      </AppCard>

      {summary.contributions.map(contribution => {
        const member = summary.members.find(item => item.id === contribution.memberId);
        return (
          <AppCard key={contribution.id}>
            <View style={styles.row}>
              <View style={{gap: 2}}>
                <Text style={styles.memberName}>{member?.displayName || 'Unknown member'}</Text>
                <Text style={styles.contributionLabel}>Contribution</Text>
              </View>
              <DataPill
                label={formatCurrency(contribution.amount, summary.event.currency)}
                tone="accent"
              />
            </View>
          </AppCard>
        );
      })}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroAmount: {
    ...typography.amount,
    color: palette.primary,
  },
  heroLabel: {
    ...typography.body,
    color: palette.inkMuted,
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberName: {
    ...typography.cardTitle,
  },
  contributionLabel: {
    ...typography.caption,
    color: palette.inkMuted,
  },
});
