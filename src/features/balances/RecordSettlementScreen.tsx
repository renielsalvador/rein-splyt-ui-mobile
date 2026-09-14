import React, {useState} from 'react';
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
    setSubmitting(true);

    try {
      await recordSettlement({
        eventId,
        fromMemberId,
        toMemberId,
        amount: parsed.data.amount,
        note: parsed.data.note,
      });
      navigation.goBack();
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
          label={submitting ? 'Saving…' : 'Mark as paid'}
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
          Outstanding between them. Record less if only part of it was handed over.
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
        <AppInput
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Paid in cash"
        />
        <View style={styles.hintRow}>
          <Text style={styles.hint}>
            Maximum {formatCurrency(outstanding, currency)}
          </Text>
        </View>
        {submitError ? <InlineError message={submitError} /> : null}
      </AppCard>

      {submitError ? <AppToast message={submitError} /> : null}
    </AppScreen>
  );
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
  });
};
