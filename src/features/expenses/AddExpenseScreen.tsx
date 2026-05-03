import React, {useEffect, useState} from 'react';
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
  SectionHeading,
} from '../../components/ui';
import {expenseSchema} from '../../lib/validation/forms';
import {formatCurrency, toAmount} from '../../lib/utils/format';
import {spacing, typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';

export function AddExpenseScreen({navigation, route}: ScreenProps<'AddExpense'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, addExpense, error} = useApp();
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

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  useEffect(() => {
    if (!summary) {
      return;
    }

    setPayerId(current => current ?? summary.members[0]?.id);
    setSelectedMemberIds(current =>
      current.length > 0 ? current : summary.members.map(member => member.id),
    );
  }, [summary]);

  if (!summary || !payerId) {
    return (
      <AppScreen title="Add expense" subtitle="Loading event details.">
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

    navigation.goBack();
  }

  return (
    <AppScreen title="Add expense" subtitle="Equal split only for this MVP slice.">
      <AppCard>
        <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="Villa down payment" />
        <AppInput label="Amount" value={amount} onChangeText={setAmount} placeholder="1200" autoCapitalize="none" />
        <AppInput label="Note" value={note} onChangeText={setNote} placeholder="Optional context" multiline />
        <SectionHeading title="Payment source" />
        <View style={styles.row}>
          <AppButton
            label="Personal"
            variant={paymentSource === 'personal' ? 'primary' : 'secondary'}
            onPress={() => setPaymentSource('personal')}
          />
          <AppButton
            label="Central fund"
            variant={paymentSource === 'central_fund' ? 'primary' : 'secondary'}
            onPress={() => setPaymentSource('central_fund')}
          />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeading title="Payer" />
        {summary.members.map(member => (
          <AppButton
            key={member.id}
            label={member.displayName}
            variant={payerId === member.id ? 'primary' : 'secondary'}
            onPress={() => setPayerId(member.id)}
          />
        ))}
      </AppCard>

      <AppCard>
        <SectionHeading title="Participants" detail={`${selectedMemberIds.length} selected`} />
        {summary.members.map(member => {
          const selected = selectedMemberIds.includes(member.id);

          return (
            <AppButton
              key={member.id}
              label={member.displayName}
              variant={selected ? 'primary' : 'secondary'}
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
      <AppButton label="Save expense" onPress={() => handleSubmit().catch(() => undefined)} />

      <AppCard tone="warm">
        <Text style={{...typography.bodyStrong}}>Preview</Text>
        <Text style={{...typography.body}}>
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
