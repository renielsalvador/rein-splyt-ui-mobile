import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppInput,
  AppScreen,
  AppToast,
  EmptyState,
  InlineError,
  MoneyValue,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {settlementSchema} from '../../lib/validation/forms';
import {formatCurrency, toAmount} from '../../lib/utils/format';
import {createTypography, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';
import type {ScreenProps} from '../../app/navigation';
import {formatSelfDisplayName} from '../events/EventScreenShared';

export function RecordSettlementScreen({
  navigation,
  route,
}: ScreenProps<'RecordSettlement'>) {
  const styles = useStyles(createStyles);
  const {eventId, fromMemberId, toMemberId, suggestedAmount} = route.params;
  const {summaries, settlements, recordSettlement, currentUser} = useApp();
  const summary = summaries[eventId];
  const [amount, setAmount] = useState(String(suggestedAmount));
  const [note, setNote] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>();

  useEffect(() => {
    if (!successMessage) {
      return;
    }
    const timeoutId = setTimeout(() => setSuccessMessage(undefined), 2600);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  // Re-read the live plan so a stale suggestion cannot be submitted after another
  // payment landed for the same pair.
  const outstanding =
    (settlements[eventId] ?? []).find(
      instruction =>
        instruction.fromMemberId === fromMemberId &&
        instruction.toMemberId === toMemberId,
    )?.amount ?? 0;

  if (!summary) {
    return (
      <AppScreen
        variant="detail"
        title="Record payment"
        subtitle="Loading event details."
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading" body="Fetching the latest balances." />
      </AppScreen>
    );
  }

  const currency = summary.event.currency;
  const currentMemberId = summary.members.find(
    member => member.userId === currentUser?.id,
  )?.id;
  const fromName = formatSelfDisplayName(
    summary.members.find(member => member.id === fromMemberId)?.displayName ?? 'Someone',
    fromMemberId === currentMemberId,
  );
  const toName = formatSelfDisplayName(
    summary.members.find(member => member.id === toMemberId)?.displayName ?? 'Someone',
    toMemberId === currentMemberId,
  );

  const pairPayments = summary.settlements.filter(
    settlement =>
      settlement.fromMemberId === fromMemberId &&
      settlement.toMemberId === toMemberId,
  );
  const paidSoFar = pairPayments.reduce(
    (total, settlement) => total + settlement.amount,
    0,
  );

  const enteredAmount = toAmount(amount);
  const remainingAfter =
    Number.isFinite(enteredAmount) && enteredAmount > 0 && enteredAmount <= outstanding
      ? roundAmount(outstanding - enteredAmount)
      : undefined;
  const isFullPayment = remainingAfter === 0;

  if (outstanding <= 0) {
    return (
      <AppScreen
        variant="detail"
        title="Record payment"
        subtitle={summary.event.name}
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState
          title="Nothing outstanding"
          body={`${fromName} and ${toName} are already square.`}
        />
      </AppScreen>
    );
  }

  async function handleSubmit() {
    const parsed = settlementSchema.safeParse({
      amount: toAmount(amount),
      maxAmount: outstanding,
      note,
    });

    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }

    setFieldError(undefined);
    setSubmitError(undefined);
    setSuccessMessage(undefined);
    setSubmitting(true);

    try {
      await recordSettlement({
        eventId,
        fromMemberId,
        toMemberId,
        amount: parsed.data.amount,
        note: parsed.data.note,
      });

      const stillOwed = roundAmount(outstanding - parsed.data.amount);

      if (stillOwed <= 0) {
        navigation.goBack();
        return;
      }

      // Stay put so the payer can keep chipping away at what is left.
      setNote('');
      setAmount(String(stillOwed));
      setSuccessMessage(
        `Recorded ${formatCurrency(parsed.data.amount, currency)}. ${formatCurrency(
          stillOwed,
          currency,
        )} left to settle.`,
      );
    } catch (recordError) {
      setSubmitError(
        recordError instanceof Error
          ? recordError.message
          : 'Could not record the payment.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppScreen
      variant="detail"
      title="Record payment"
      subtitle={summary.event.name}
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}
      footerOverlay={
        <AppButton
          label={
            submitting
              ? 'Saving…'
              : isFullPayment
                ? 'Mark as fully paid'
                : 'Record payment'
          }
          icon="check"
          disabled={submitting}
          onPress={handleSubmit}
        />
      }>
      <AppCard tone="accent">
        <Text style={styles.heroLabel}>
          {fromName} pays {toName}
        </Text>
        <MoneyValue value={outstanding} currency={currency} size="hero" absolute />
        <Text style={styles.heroMeta}>
          {paidSoFar > 0
            ? `Still outstanding after ${formatCurrency(
                paidSoFar,
                currency,
              )} already recorded. Pay it off in as many instalments as you need.`
            : 'Outstanding between them. Record part of it now and the rest whenever it is handed over.'}
        </Text>
      </AppCard>

      <AppCard>
        <SectionHeading title="Payment details" />
        <AppInput
          label="Amount"
          value={amount}
          onChangeText={value => {
            setAmount(value);
            setFieldError(undefined);
          }}
          placeholder={String(outstanding)}
          autoCapitalize="none"
          keyboardType="decimal-pad"
          errorMessage={fieldError}
        />
        <View style={styles.quickRow}>
          <AppButton
            label={`Full ${formatCurrency(outstanding, currency)}`}
            variant="secondary"
            size="sm"
            onPress={() => {
              setAmount(String(outstanding));
              setFieldError(undefined);
            }}
          />
          <AppButton
            label="Half"
            variant="secondary"
            size="sm"
            onPress={() => {
              setAmount(String(roundAmount(outstanding / 2)));
              setFieldError(undefined);
            }}
          />
        </View>
        <AppInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Paid in cash"
        />
        <View style={styles.hintRow}>
          <Text style={styles.hint}>
            {remainingAfter === undefined
              ? `Maximum ${formatCurrency(outstanding, currency)}`
              : remainingAfter > 0
                ? `Partial payment — ${formatCurrency(
                    remainingAfter,
                    currency,
                  )} will still be outstanding.`
                : 'Settles this pair in full.'}
          </Text>
        </View>
        {submitError ? <InlineError message={submitError} /> : null}
      </AppCard>

      {pairPayments.length > 0 ? (
        <AppCard>
          <SectionHeading title="Payments so far" />
          {pairPayments.map(settlement => (
            <View key={settlement.id} style={styles.historyRow}>
              <Text style={styles.hint}>
                {settlement.note?.trim() || 'Payment recorded'}
              </Text>
              <MoneyValue value={settlement.amount} currency={currency} absolute />
            </View>
          ))}
        </AppCard>
      ) : null}

      {submitError ? <AppToast message={submitError} /> : null}
      {!submitError && successMessage ? <AppToast message={successMessage} /> : null}
    </AppScreen>
  );
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

const createStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    heroLabel: {
      ...t.caption,
      color: c.inkMuted,
    },
    heroMeta: {
      ...t.caption,
      color: c.inkMuted,
      marginTop: spacing.xs,
    },
    hintRow: {
      marginTop: spacing.xs,
    },
    hint: {
      ...t.caption,
      color: c.inkMuted,
    },
    quickRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
  });
};
