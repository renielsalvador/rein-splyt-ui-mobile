import React, {useEffect, useMemo, useState} from 'react';
import {BackHandler, Image, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
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
  AppToast,
  EmptyState,
  InlineError,
  MoneyValue,
  ScreenBackButton,
  SelectableRow,
  SectionHeading,
} from '../../components/ui';
import {expenseSchema} from '../../lib/validation/forms';
import {formatCurrency, toAmount} from '../../lib/utils/format';
import {createTypography, radii, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles, useTheme} from '../../theme/ThemeProvider';
import type {ScreenProps} from '../../app/navigation';
import type {CurrencyCode, ExpenseReceipt, ExpenseReceiptAsset} from '../../types/domain';
import {formatSelfDisplayName} from '../events/EventScreenShared';

const MAX_RECEIPTS = 3;

function currencySymbol(currency: CurrencyCode) {
  return formatCurrency(0, currency).replace(/[\d.,\s]/g, '');
}

export function AddExpenseScreen({navigation, route}: ScreenProps<'AddExpense'>) {
  const styles = useStyles(createStyles);
  const {colors: c} = useTheme();
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
  const [splitModalVisible, setSplitModalVisible] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const parsedAmount = toAmount(amount);
  const currency = summary?.event.currency ?? 'PHP';
  const memberCount = summary?.members.length ?? 0;
  const allSelected = memberCount > 0 && selectedMemberIds.length === memberCount;
  const perHead = selectedMemberIds.length > 0 ? parsedAmount / selectedMemberIds.length : 0;

  // Contributions less everything already spent from the pool, excluding the expense being edited.
  const fundAvailable = useMemo(() => {
    if (!summary) {
      return 0;
    }
    const contributed = summary.contributions.reduce((total, item) => total + item.amount, 0);
    const spent = summary.expenses
      .filter(expense => expense.paymentSource === 'central_fund' && expense.id !== expenseId)
      .reduce((total, expense) => total + expense.amount, 0);
    return contributed - spent;
  }, [expenseId, summary]);

  const usingFund = paymentSource === 'central_fund';
  const fundRemaining = fundAvailable - parsedAmount;
  const overdrawsFund = usingFund && parsedAmount > 0 && fundRemaining < 0;
  const isDirty =
    title.trim().length > 0 ||
    amount.trim().length > 0 ||
    note.trim().length > 0 ||
    receipts.length > 0;

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timeoutId = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  function requestClose() {
    if (isDirty && !submitting) {
      setDiscardVisible(true);
      return;
    }
    navigation.goBack();
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isDirty || submitting) {
        return false;
      }
      setDiscardVisible(true);
      return true;
    });

    return () => subscription.remove();
  }, [isDirty, submitting]);

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

    if (!usingFund && !payerId) {
      nextErrors.payerId = 'Select who paid.';
    }

    const parsed = expenseSchema.safeParse({
      title,
      amount: toAmount(amount),
      note,
    });

    if (!parsed.success) {
      parsed.error.issues.forEach(issue => {
        if (issue.message === 'Expense title is required.') {
          nextErrors.title = issue.message;
        } else if (issue.message === 'Enter an amount greater than zero.') {
          nextErrors.amount = issue.message;
        }
      });
    }

    if (selectedMemberIds.length === 0) {
      nextErrors.participantMemberIds = 'Select at least one person to split with.';
    }

    if (Object.keys(nextErrors).length > 0 || !parsed.success) {
      setFieldErrors(nextErrors);
      return;
    }

    // Fund-paid expenses draw down the pool rather than crediting a person, so the payer
    // is only recorded, never asked for.
    const nextPayerId = payerId ?? summary.members[0]?.id;
    if (!nextPayerId) {
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
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

      setToastMessage(
        expenseId
          ? 'Expense updated'
          : `${formatCurrency(parsed.data.amount, currency)} added`,
      );
      setTimeout(() => navigation.goBack(), 900);
    } catch {
      setSubmitting(false);
    }
  }
  return (
    <AppScreen
      title={expenseId ? 'Edit expense' : 'Add expense'}
      subtitle={`${summary.event.name} · ${summary.event.currency}`}
      variant="detail"
      leading={<ScreenBackButton onPress={requestClose} />}
      footerOverlay={
        toastMessage ? (
          <AppToast message={toastMessage} />
        ) : (
          <AppButton
            label={expenseId ? 'Update expense' : 'Save expense'}
            loading={submitting}
            onPress={() => handleSubmit().catch(() => undefined)}
          />
        )
      }>
      <AppCard>
        <Text style={styles.amountLabel}>Amount</Text>
        <View style={[styles.amountField, fieldErrors.amount ? styles.amountFieldError : null]}>
          <Text style={styles.amountPrefix}>{currencySymbol(currency)}</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={value => {
              setAmount(value);
              setFieldErrors(current => ({...current, amount: undefined}));
            }}
            placeholder="0.00"
            placeholderTextColor={c.inkMuted}
            keyboardType="decimal-pad"
            accessibilityLabel="Expense amount"
            maxFontSizeMultiplier={1.4}
          />
        </View>
        <InlineError message={fieldErrors.amount} />
        {selectedMemberIds.length > 0 && parsedAmount > 0 ? (
          <Text style={styles.perHead}>
            {formatCurrency(perHead, currency)} each for {selectedMemberIds.length}{' '}
            {selectedMemberIds.length === 1 ? 'person' : 'people'}
          </Text>
        ) : null}
      </AppCard>

      <AppCard>
        <SectionHeading title="Paid with" />
        <View style={styles.toggleRow}>
          <View style={styles.toggleItem}>
            <AppButton
              label="Personal"
              icon="person"
              variant={usingFund ? 'tint' : 'primary'}
              onPress={() => setPaymentSource('personal')}
            />
          </View>
          <View style={styles.toggleItem}>
            <AppButton
              label="Central fund"
              icon="fund"
              variant={usingFund ? 'primary' : 'tint'}
              onPress={() => setPaymentSource('central_fund')}
            />
          </View>
        </View>

        {usingFund ? (
          <View style={styles.fundPanel}>
            <View style={styles.fundRow}>
              <Text style={styles.fundLabel}>Available in the pool</Text>
              <MoneyValue value={fundAvailable} currency={currency} tone="positive" />
            </View>
            {parsedAmount > 0 ? (
              <View style={styles.fundRow}>
                <Text style={styles.fundLabel}>Left after this expense</Text>
                <MoneyValue
                  value={fundRemaining}
                  currency={currency}
                  tone={overdrawsFund ? 'negative' : 'default'}
                />
              </View>
            ) : null}
            <Text style={styles.fundMeta}>
              Fund spend draws down the pool, so it never becomes anyone's debt.
            </Text>
            {overdrawsFund ? (
              <InlineError
                message={`This is ${formatCurrency(
                  Math.abs(fundRemaining),
                  currency,
                )} more than the pool holds. Add a contribution first, or pay personally.`}
              />
            ) : null}
          </View>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Paid by ${payer?.displayName ?? 'nobody selected'}. Change payer`}
              onPress={() => {
                setFieldErrors(current => ({...current, payerId: undefined}));
                setPayerModalVisible(true);
              }}
              style={({pressed}) => [
                styles.payerDropdown,
                pressed ? styles.payerDropdownPressed : null,
              ]}>
              <View style={styles.payerDropdownLead}>
                <AppAvatar name={payer?.displayName ?? 'Unknown member'} size="md" />
                <View style={styles.payerDropdownCopy}>
                  <Text style={styles.payerDropdownDetail}>Paid by</Text>
                  <Text style={styles.payerDropdownLabel} numberOfLines={1}>
                    {payer
                      ? formatSelfDisplayName(payer.displayName, payer.userId === currentUser?.id)
                      : 'Select who paid'}
                  </Text>
                </View>
              </View>
              <AppIcon name="chevronDown" tone="muted" size={18} />
            </Pressable>
            <InlineError message={fieldErrors.payerId} />
          </>
        )}
      </AppCard>

      <AppCard>
        <AppInput
          label="Title"
          value={title}
          onChangeText={value => {
            setTitle(value);
            setFieldErrors(current => ({...current, title: undefined}));
          }}
          placeholder="Dinner at Cyma"
          errorMessage={fieldErrors.title}
        />
        <AppInput
          label="Note"
          value={note}
          onChangeText={setNote}
          placeholder="Optional context"
          multiline
        />
      </AppCard>

      <AppCard>
        <SectionHeading
          title="Split between"
          detail="Edit"
          onDetailPress={() => setSplitModalVisible(true)}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Split between ${
            allSelected ? 'everyone' : `${selectedMemberIds.length} of ${memberCount} members`
          }. Change`}
          onPress={() => setSplitModalVisible(true)}
          style={({pressed}) => [styles.splitRow, pressed ? styles.payerDropdownPressed : null]}>
          <View style={styles.payerDropdownCopy}>
            <Text style={styles.splitTitle}>
              {allSelected ? `Everyone · ${memberCount}` : `${selectedMemberIds.length} of ${memberCount}`}
            </Text>
            <Text style={styles.payerDropdownDetail}>
              {selectedMemberIds.length > 0
                ? `${formatCurrency(perHead, currency)} each, split equally`
                : 'Nobody selected yet'}
            </Text>
          </View>
          <AppIcon name="chevron" tone="muted" size={18} />
        </Pressable>
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
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
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
              variant="tint"
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
              variant="tint"
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

      <AppModal
        visible={splitModalVisible}
        title="Split between"
        subtitle="Everyone selected shares this expense equally."
        scrollable
        onClose={() => setSplitModalVisible(false)}>
        <View style={styles.splitActions}>
          <AppButton
            label="Select everyone"
            variant="tint"
            size="sm"
            onPress={() => {
              setFieldErrors(current => ({...current, participantMemberIds: undefined}));
              setSelectedMemberIds(summary.members.map(member => member.id));
            }}
          />
          <AppButton
            label="Clear all"
            variant="tint"
            size="sm"
            onPress={() => setSelectedMemberIds([])}
          />
        </View>
        {summary.members.map(member => {
          const selected = selectedMemberIds.includes(member.id);

          return (
            <SelectableRow
              key={member.id}
              label={formatSelfDisplayName(member.displayName, member.userId === currentUser?.id)}
              detail={selected ? `${formatCurrency(perHead, currency)} share` : 'Not included'}
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
      </AppModal>

      <AppModal
        visible={discardVisible}
        title="Discard this expense?"
        subtitle="Your amount, title, and any attached receipts will be lost."
        onClose={() => setDiscardVisible(false)}>
        <AppButton
          label="Keep editing"
          variant="secondary"
          onPress={() => setDiscardVisible(false)}
        />
        <AppButton
          label="Discard"
          variant="destructive"
          onPress={() => {
            setDiscardVisible(false);
            navigation.goBack();
          }}
        />
      </AppModal>

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

const createStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    amountLabel: {
      ...t.label,
    },
    amountField: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 64,
      paddingHorizontal: spacing.md,
      borderRadius: radii.md,
      borderWidth: 1.5,
      borderColor: 'transparent',
      backgroundColor: c.panel,
    },
    amountFieldError: {
      borderColor: c.dangerText,
    },
    amountPrefix: {
      ...t.amount,
      fontSize: 26,
      lineHeight: 32,
      color: c.inkMuted,
    },
    amountInput: {
      flex: 1,
      ...t.amount,
      fontSize: 30,
      lineHeight: 36,
      padding: 0,
      color: c.ink,
    },
    perHead: {
      ...t.body,
      color: c.inkMuted,
    },
    fundPanel: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: c.brandSoft,
    },
    fundRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    fundLabel: {
      ...t.label,
      color: c.ink,
    },
    fundMeta: {
      ...t.caption,
      color: c.inkMuted,
    },
    splitRow: {
      minHeight: 60,
      borderRadius: radii.lg,
      backgroundColor: c.panel,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    splitTitle: {
      ...t.cardTitle,
    },
    splitActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    toggleItem: {
      flex: 1,
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
      backgroundColor: c.panel,
    },
    receiptRemoveButton: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      width: 32,
      height: 32,
      borderRadius: radii.pill,
      backgroundColor: c.scrim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    receiptEmpty: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: c.panel,
      borderRadius: 20,
      padding: spacing.md,
    },
    receiptEmptyIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.brandSofter,
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
      ...t.bodyStrong,
    },
    receiptMeta: {
      ...t.caption,
      color: c.inkMuted,
    },
    receiptActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    previewTitle: {
      ...t.bodyStrong,
      color: c.brand,
    },
    previewBody: {
      ...t.body,
      color: c.inkMuted,
    },
    payerDropdown: {
      minHeight: 72,
      borderRadius: 20,
      backgroundColor: c.panel,
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
      ...t.cardTitle,
      fontSize: 18,
    },
    payerDropdownDetail: {
      ...t.caption,
      color: c.inkMuted,
    },
  });
};
