import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppAvatar,
  AppButton,
  AppCard,
  AppIcon,
  AppInput,
  AppModal,
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
import {formatSelfDisplayName} from '../events/EventScreenShared';

export function AddExpenseScreen({navigation, route}: ScreenProps<'AddExpense'>) {
  const {eventId, expenseId} = route.params;
  const {hydrateEvent, summaries, addExpense, updateExpense, currentUser, error} = useApp();
  const summary = summaries[eventId];
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [paymentSource, setPaymentSource] = useState<'personal' | 'central_fund'>(
    'personal',
  );
  const [payerId, setPayerId] = useState<string>();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    amount?: string;
    participantMemberIds?: string;
    payerId?: string;
  }>({});
  const [didPrefill, setDidPrefill] = useState(false);
  const [payerModalVisible, setPayerModalVisible] = useState(false);

  const existingExpense = useMemo(
    () => summary?.expenses.find(expense => expense.id === expenseId),
    [expenseId, summary],
  );

  const payer = useMemo(
    () => summary?.members.find(member => member.id === payerId),
    [payerId, summary],
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
        variant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState title="Loading event" body="Preparing members and balances for a new expense." />
      </AppScreen>
    );
  }

  async function handleSubmit() {
    const nextErrors: typeof fieldErrors = {};

    if (!payerId) {
      nextErrors.payerId = 'Select a payer.';
    }

    const parsed = expenseSchema.safeParse({
      title,
      amount: toAmount(amount),
      note,
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message;

      if (message === 'Expense title is required.') {
        nextErrors.title = message;
      } else if (message === 'Enter an amount greater than zero.') {
        nextErrors.amount = message;
      }
    }

    if (selectedMemberIds.length === 0) {
      nextErrors.participantMemberIds = 'Select at least one participant.';
    }

    if (Object.keys(nextErrors).length > 0 || !parsed.success) {
      setFieldErrors(nextErrors);
      return;
    }

    const nextPayerId = payerId;
    if (!nextPayerId) {
      return;
    }
    setFieldErrors({});
    if (expenseId) {
      await updateExpense({
        expenseId,
        eventId,
        title: parsed.data.title,
        amount: parsed.data.amount,
        currency: summary.event.currency,
        paidByMemberId: nextPayerId,
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
        paidByMemberId: nextPayerId,
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
      variant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <AppInput
          label="Title"
          value={title}
          onChangeText={value => {
            setTitle(value);
            setFieldErrors(current => ({...current, title: undefined}));
          }}
          placeholder="Villa down payment"
          errorMessage={fieldErrors.title}
        />
        <AppInput
          label="Amount"
          value={amount}
          onChangeText={value => {
            setAmount(value);
            setFieldErrors(current => ({...current, amount: undefined}));
          }}
          placeholder="1200"
          autoCapitalize="none"
          errorMessage={fieldErrors.amount}
        />
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose payer"
          onPress={() => {
            setFieldErrors(current => ({...current, payerId: undefined}));
            setPayerModalVisible(true);
          }}
          style={({pressed}) => [styles.payerDropdown, pressed ? styles.payerDropdownPressed : null]}>
          <View style={styles.payerDropdownLead}>
            <AppAvatar name={payer?.displayName ?? 'Unknown member'} size="md" />
            <View style={styles.payerDropdownCopy}>
              <Text style={styles.payerDropdownLabel}>
                {payer
                  ? formatSelfDisplayName(
                      payer.displayName,
                      payer.userId === currentUser?.id,
                    )
                  : 'Select payer'}
              </Text>
              <Text style={styles.payerDropdownDetail}>Paid for this expense</Text>
            </View>
          </View>
          <AppIcon name="chevronDown" tone="muted" size={18} />
        </Pressable>
        <InlineError message={fieldErrors.payerId} />
      </AppCard>

      <AppCard>
        <SectionHeading title="Participants" detail={`${selectedMemberIds.length} selected`} />
        {summary.members.map(member => {
          const selected = selectedMemberIds.includes(member.id);

          return (
            <SelectableRow
              key={member.id}
              label={formatSelfDisplayName(
                member.displayName,
                member.userId === currentUser?.id,
              )}
              detail={selected ? 'Included in split' : 'Tap to include'}
              avatarLabel={member.displayName}
              selected={selected}
              onPress={() => {
                setFieldErrors(current => ({...current, participantMemberIds: undefined}));
                setSelectedMemberIds(current =>
                  selected
                    ? current.filter(memberId => memberId !== member.id)
                    : [...current, member.id],
                );
              }}
            />
          );
        })}
        <InlineError message={fieldErrors.participantMemberIds} />
      </AppCard>

      <InlineError message={error ?? undefined} />
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

      <AppModal
        visible={payerModalVisible}
        title="Choose payer"
        subtitle="Select the member who paid this expense."
        scrollable
        onClose={() => setPayerModalVisible(false)}>
        {summary.members.map(member => (
          <SelectableRow
            key={member.id}
            label={formatSelfDisplayName(
              member.displayName,
              member.userId === currentUser?.id,
            )}
            detail="Paid for this expense"
            avatarLabel={member.displayName}
            selected={payerId === member.id}
            onPress={() => {
              setPayerId(member.id);
              setPayerModalVisible(false);
            }}
          />
        ))}
      </AppModal>
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
  payerDropdown: {
    minHeight: 72,
    borderRadius: 20,
    backgroundColor: palette.bgApp,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  payerDropdownPressed: {
    opacity: 0.82,
  },
  payerDropdownLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  payerDropdownCopy: {
    flex: 1,
    gap: 2,
  },
  payerDropdownLabel: {
    ...typography.cardTitle,
    fontSize: 18,
  },
  payerDropdownDetail: {
    ...typography.caption,
    color: palette.inkMuted,
  },
});
