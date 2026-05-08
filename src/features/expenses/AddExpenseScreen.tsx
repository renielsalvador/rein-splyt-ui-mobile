import React, {useEffect, useMemo, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
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
import type {ExpenseReceipt, ExpenseReceiptAsset} from '../../types/domain';
import {formatSelfDisplayName} from '../events/EventScreenShared';

const MAX_RECEIPTS = 3;

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
  const [receipts, setReceipts] = useState<ExpenseReceiptAsset[]>([]);
  const [existingReceipts, setExistingReceipts] = useState<ExpenseReceipt[]>([]);
  const [clearReceipts, setClearReceipts] = useState(false);
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
      setExistingReceipts(existingExpense.receipts ?? []);
      setReceipts([]);
      setClearReceipts(false);
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

  const displayedReceipts = [
    ...existingReceipts,
    ...receipts.map(item => ({
      url: item.uri,
      fileName: item.fileName,
      type: item.type,
    })),
  ].slice(0, MAX_RECEIPTS);
  const submittedReceipts = [...existingReceipts, ...receipts].slice(0, MAX_RECEIPTS);
  const canAddMoreReceipts = displayedReceipts.length < MAX_RECEIPTS;

  async function handleReceiptPick(source: 'camera' | 'library') {
    if (!canAddMoreReceipts) {
      return;
    }

    const result =
      source === 'camera'
        ? await launchCamera({
            mediaType: 'photo',
            quality: 0.8,
          })
        : await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: Math.max(1, MAX_RECEIPTS - displayedReceipts.length),
            quality: 0.8,
          });

    const nextAssets = (result.assets ?? [])
      .filter(asset => !!asset.uri)
      .map(asset => ({
        uri: asset.uri as string,
        fileName: asset.fileName,
        type: asset.type,
      }));

    if (nextAssets.length === 0) {
      return;
    }

    setReceipts(current => [
      ...current,
      ...nextAssets.slice(0, MAX_RECEIPTS - displayedReceipts.length),
    ]);
    setClearReceipts(false);
  }

  function handleReceiptRemove(index: number) {
    if (index < existingReceipts.length) {
      const nextExistingReceipts = existingReceipts.filter((_, itemIndex) => itemIndex !== index);
      setExistingReceipts(nextExistingReceipts);
      if (nextExistingReceipts.length === 0 && receipts.length === 0) {
        setClearReceipts(true);
      }
      return;
    }

    const draftIndex = index - existingReceipts.length;
    const nextReceipts = receipts.filter((_, itemIndex) => itemIndex !== draftIndex);
    setReceipts(nextReceipts);
    if (existingReceipts.length === 0 && nextReceipts.length === 0) {
      setClearReceipts(true);
    }
  }

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
        receipts: submittedReceipts.length > 0 ? submittedReceipts : undefined,
        clearReceipts,
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
        receipts: submittedReceipts.length > 0 ? submittedReceipts : undefined,
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

      <AppCard>
        <SectionHeading title="Receipt" detail={`Optional · ${displayedReceipts.length}/${MAX_RECEIPTS}`} />
        {displayedReceipts.length > 0 ? (
          <View style={styles.receiptPreview}>
            <View style={styles.receiptGrid}>
              {displayedReceipts.map((item, index) => (
                <View key={`${item.url}-${index}`} style={styles.receiptTile}>
                  <Image source={{uri: item.url}} style={styles.receiptImage} />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove receipt ${index + 1}`}
                    onPress={() => handleReceiptRemove(index)}
                    style={({pressed}) => [
                      styles.receiptRemoveButton,
                      pressed ? styles.payerDropdownPressed : null,
                    ]}>
                    <AppIcon name="close" tone="white" size={14} />
                  </Pressable>
                </View>
              ))}
            </View>
            <View style={styles.receiptCopy}>
              <Text style={styles.receiptTitle}>
                {displayedReceipts.length === 1
                  ? '1 receipt attached'
                  : `${displayedReceipts.length} receipts attached`}
              </Text>
              <Text style={styles.receiptMeta}>
                Add up to three receipt photos for the same expense.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.receiptEmpty}>
            <View style={styles.receiptEmptyIcon}>
              <AppIcon name="expense" tone="accent" size={18} />
            </View>
            <View style={styles.receiptCopy}>
              <Text style={styles.receiptTitle}>No receipt attached</Text>
              <Text style={styles.receiptMeta}>
                Upload up to three receipt photos now or leave this expense without one.
              </Text>
            </View>
          </View>
        )}
        <View style={styles.receiptActions}>
          {canAddMoreReceipts ? (
            <AppButton
              label="Take photo"
              icon="camera"
              variant="secondary"
              size="sm"
              onPress={() => {
                handleReceiptPick('camera').catch(() => undefined);
              }}
            />
          ) : null}
          {canAddMoreReceipts ? (
            <AppButton
              label={displayedReceipts.length > 0 ? 'Add photos' : 'Upload photos'}
              icon="edit"
              variant="secondary"
              size="sm"
              onPress={() => {
                handleReceiptPick('library').catch(() => undefined);
              }}
            />
          ) : null}
          {displayedReceipts.length > 0 ? (
            <AppButton
              label="Clear all"
              icon="delete"
              variant="destructive"
              size="sm"
              onPress={() => {
                setReceipts([]);
                setExistingReceipts([]);
                setClearReceipts(true);
              }}
            />
          ) : null}
        </View>
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
  receiptPreview: {
    gap: spacing.md,
  },
  receiptGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  receiptTile: {
    flex: 1,
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: palette.bgApp,
  },
  receiptRemoveButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 34, 34, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptEmpty: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: palette.bgApp,
    borderRadius: 20,
    padding: spacing.md,
  },
  receiptEmptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  receiptCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  receiptTitle: {
    ...typography.bodyStrong,
  },
  receiptMeta: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  receiptActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
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
