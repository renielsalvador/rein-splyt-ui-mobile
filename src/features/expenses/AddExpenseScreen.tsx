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
import {expenseSchema} from '../../lib/validation/forms';
import {formatCurrency, toAmount} from '../../lib/utils/format';
import {palette, spacing, typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';

export function AddExpenseScreen({navigation, route}: ScreenProps<'AddExpense'>) {
  const {eventId, expenseId} = route.params;
  const {hydrateEvent, summaries, addExpense, updateExpense, error} = useApp();
  const summary = summaries[eventId];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentSource, setPaymentSource] = useState<'personal' | 'central_fund'>(
    'personal',
  );
  const [payerId, setPayerId] = useState<string>();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string>();
  const [didPrefill, setDidPrefill] = useState(false);

  const existingExpense = useMemo(
    () => summary?.expenses.find(expense => expense.id === expenseId),
    [expenseId, summary],
  );

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  useEffect(() => {
    if (!summary) {
      return;
    }

    if (existingExpense && !didPrefill) {
      setTitle(existingExpense.title);
      setAmount(String(existingExpense.amount));
      setNote(existingExpense.note ?? '');
      setPaymentSource(existingExpense.paymentSource);
      setPayerId(existingExpense.paidByMemberId);
      setSelectedMemberIds(
        summary.expenseSplits
          .filter(split => split.expenseId === existingExpense.id)
          .map(split => split.memberId),
      );
      setDidPrefill(true);
      return;
    }

    if (!existingExpense) {
      setPayerId(current => current ?? summary.members[0]?.id);
      setSelectedMemberIds(current =>
        current.length > 0 ? current : summary.members.map(member => member.id),
      );
    }
  }, [didPrefill, existingExpense, summary]);

  if (!summary || !payerId) {
    return (
      <AppScreen
        title={expenseId ? 'Edit expense' : 'Add expense'}
        subtitle="Loading event details."
        headerVariant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading event" body="Preparing members and balances for a new expense." />
      </AppScreen>
    );
  }

  async function handleSubmit() {
    if (!payerId) {
      setFormError('Select a payer.');
      return;
    }

    const parsed = expenseSchema.safeParse({
      title,
      amount: toAmount(amount),
      note,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message);
      return;
    }

    if (selectedMemberIds.length === 0) {
      setFormError('Select at least one participant.');
      return;
    }

    setFormError(undefined);
    if (expenseId) {
      await updateExpense({
        expenseId,
        eventId,
        title: parsed.data.title,
        amount: parsed.data.amount,
        currency: summary.event.currency,
        paidByMemberId: payerId,
        paymentSource,
        participantMemberIds: selectedMemberIds,
        note: parsed.data.note,
      });
    } else {
      await addExpense({
        eventId,
        title: parsed.data.title,
        amount: parsed.data.amount,
        currency: summary.event.currency,
        paidByMemberId: payerId,
        paymentSource,
        participantMemberIds: selectedMemberIds,
        note: parsed.data.note,
      });
    }

    navigation.goBack();
  }

  return (
    <AppScreen
      title={expenseId ? 'Edit expense' : 'Add expense'}
      subtitle={
        expenseId
          ? 'Update the amount, payer, and included members.'
          : 'Track who paid and who joined the split.'
      }
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="Villa down payment" />
        <AppInput label="Amount" value={amount} onChangeText={setAmount} placeholder="1200" autoCapitalize="none" />
        <AppInput label="Note" value={note} onChangeText={setNote} placeholder="Optional context" multiline />
        <SectionHeading title="Payment source" />
        <View style={styles.toggleRow}>
          <AppButton
            label="Personal"
            icon="person"
            variant={paymentSource === 'personal' ? 'primary' : 'secondary'}
            onPress={() => setPaymentSource('personal')}
          />
          <AppButton
            label="Central fund"
            icon="fund"
            variant={paymentSource === 'central_fund' ? 'primary' : 'secondary'}
            onPress={() => setPaymentSource('central_fund')}
          />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeading title="Payer" />
        {summary.members.map(member => (
          <SelectableRow
            key={member.id}
            label={member.displayName}
            detail="Paid for this expense"
            selected={payerId === member.id}
            onPress={() => setPayerId(member.id)}
          />
        ))}
      </AppCard>

      <AppCard>
        <SectionHeading title="Participants" detail={`${selectedMemberIds.length} selected`} />
        {summary.members.map(member => {
          const selected = selectedMemberIds.includes(member.id);

          return (
            <SelectableRow
              key={member.id}
              label={member.displayName}
              detail={selected ? 'Included in split' : 'Tap to include'}
              selected={selected}
              onPress={() =>
                setSelectedMemberIds(current =>
                  selected
                    ? current.filter(memberId => memberId !== member.id)
                    : [...current, member.id],
                )
              }
            />
          );
        })}
      </AppCard>

      <InlineError message={formError ?? error ?? undefined} />
      <AppButton
        label={expenseId ? 'Update expense' : 'Save expense'}
        icon="expense"
        onPress={() => handleSubmit().catch(() => undefined)}
      />

      <AppCard tone="warm">
        <Text style={styles.previewTitle}>Preview</Text>
        <Text style={styles.previewBody}>
          Total {formatCurrency(toAmount(amount), summary.event.currency)} split across {selectedMemberIds.length || 0} participants.
        </Text>
        {selectedMemberIds.length > 0 ? (
          <DataPill
            label={formatCurrency(
              toAmount(amount) / Math.max(selectedMemberIds.length, 1),
              summary.event.currency,
            )}
          />
        ) : null}
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  previewTitle: {
    ...typography.bodyStrong,
    color: palette.primary,
  },
  previewBody: {
    ...typography.body,
    color: palette.inkMuted,
  },
});
