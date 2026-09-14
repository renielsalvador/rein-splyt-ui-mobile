import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {
  AppAvatar,
  AppAvatarStack,
  AppButton,
  AppCard,
  AppIcon,
  type AppIconName,
  DataPill,
  SectionHeading,
} from '../../components/ui';
import {
  formatCurrency,
  formatDateLabel,
  formatDateRangeLabel,
} from '../../lib/utils/format';
import {cardSurface, createTypography, radii, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles, useTheme} from '../../theme/ThemeProvider';
import type {
  CurrencyCode,
  Event,
  EventIconName,
  EventMember,
  MemberBalance,
  PendingInvite,
  SettlementInstruction,
} from '../../types/domain';
import {useEventStyles} from './EventScreenStyles';
import {getEventStatusBadge, getTodayDateString} from './eventStatus';
import {
  EVENT_ICON_OPTIONS,
  type MemberRosterRow,
  type SelectedMemberDraft,
  describeInviteDate,
  getInvitePreview,
} from './EventScreenShared';

function shiftDate(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function buildMarkedDateRange(c: Colors, startDate?: string, endDate?: string) {
  const markedDates: Record<
    string,
    {
      color: string;
      textColor: string;
      startingDay?: boolean;
      endingDay?: boolean;
    }
  > = {};

  if (!startDate || !endDate) {
    return markedDates;
  }

  let cursor = startDate;
  while (cursor <= endDate) {
    const isStart = cursor === startDate;
    const isEnd = cursor === endDate;

    markedDates[cursor] = {
      color: isStart || isEnd ? c.brand : c.brandSoft,
      textColor: isStart || isEnd ? c.surface : c.ink,
      startingDay: isStart,
      endingDay: isEnd,
    };

    cursor = shiftDate(cursor, 1);
  }

  return markedDates;
}

export function HomeEventCard({
  event,
  members,
  totalSpend,
  currentBalance,
  onPress,
}: {
  event: Event;
  members: EventMember[];
  totalSpend: number;
  currentBalance?: number;
  onPress: () => void;
}) {
  const styles = useEventStyles();
  const memberNames = members.map(m => m.displayName);
  const badge = getEventStatusBadge(event);

  return (
    <Pressable onPress={onPress} style={({pressed}) => [pressed && styles.pressed]}>
      <View style={[styles.eventCard, !event.isActive && styles.eventCardInactive]}>
        <View style={[styles.eventIconBadge, !event.isActive && styles.eventIconBadgeInactive]}>
          <AppIcon name={event.icon} tone={event.isActive ? 'accent' : 'muted'} size={20} />
        </View>
        <View style={styles.eventBody}>
          <View style={styles.eventTitleRow}>
            <Text
              style={[styles.eventName, !event.isActive && styles.eventNameInactive]}
              numberOfLines={1}>
              {event.name}
            </Text>
          </View>
          <View style={styles.eventMetaRow}>
            {memberNames.length > 0 && <AppAvatarStack names={memberNames} size="xs" />}
            <Text style={styles.eventMetaText}>{members.length} members</Text>
          </View>
          <Text style={[styles.eventMetaText, !event.isActive && styles.eventMetaTextInactive]}>
            {formatDateRangeLabel(event.startDate, event.endDate)}
          </Text>
        </View>
        <View style={styles.eventTrailing}>
          {badge ? (
            <Text
              style={[
                styles.eventStatusText,
                badge.label === 'Ended' ? styles.eventStatusEnded : null,
                badge.label === 'Upcoming' ? styles.eventStatusUpcoming : null,
                badge.label === 'Inactive' ? styles.eventStatusInactive : null,
              ]}>
              {badge.label}
            </Text>
          ) : null}
          {currentBalance !== undefined ? (
            <>
              <Text style={styles.eventBalanceLabel}>
                {currentBalance > 0 ? "You're owed" : currentBalance < 0 ? 'You owe' : 'Settled'}
              </Text>
              {currentBalance !== 0 && (
                <Text
                  style={[
                    styles.eventBalanceOwed,
                    currentBalance < 0 && styles.eventBalanceOwing,
                  ]}>
                  {currentBalance > 0 ? '+' : ''}
                  {formatCurrency(Math.abs(currentBalance), event.currency)}
                </Text>
              )}
              {currentBalance === 0 && <Text style={styles.eventBalanceSettled}>—</Text>}
            </>
          ) : (
            <Text style={styles.eventMetaText}>
              {formatCurrency(totalSpend, event.currency)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function PendingInviteListItem({
  pendingInvite,
  onPress,
}: {
  pendingInvite: PendingInvite;
  onPress: () => void;
}) {
  const componentStyles = useStyles(createComponentStyles);
  const {colors: c} = useTheme();
  const styles = useEventStyles();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed && styles.pressed]}>
      <View style={[cardSurface(c), componentStyles.notifCard]}>
        <View style={componentStyles.notifRow}>
          <View style={componentStyles.notifIconBadge}>
            <AppIcon name={pendingInvite.event.icon} tone="accent" size={18} />
          </View>
          <View style={componentStyles.notifBody}>
            <Text style={componentStyles.notifTitle}>{pendingInvite.event.name}</Text>
            <Text numberOfLines={2} style={componentStyles.notifMeta}>
              {getInvitePreview(pendingInvite)}
            </Text>
          </View>
          <View style={styles.notificationUnreadDot} />
        </View>
        <Text style={componentStyles.notifType}>Invite request</Text>
      </View>
    </Pressable>
  );
}

export function PendingInviteDetailCard({
  pendingInvite,
  onAccept,
  onDecline,
  accepting = false,
  declining = false,
}: {
  pendingInvite: PendingInvite;
  onAccept: () => void;
  onDecline: () => void;
  accepting?: boolean;
  declining?: boolean;
}) {
  const componentStyles = useStyles(createComponentStyles);
  const styles = useEventStyles();
  return (
    <AppCard>
      <View style={componentStyles.notifRow}>
        <View style={componentStyles.notifIconBadge}>
          <AppIcon name={pendingInvite.event.icon} tone="accent" size={18} />
        </View>
        <View style={componentStyles.notifBody}>
          <Text style={componentStyles.notifTitle}>{pendingInvite.event.name}</Text>
          <Text style={componentStyles.notifMeta}>
            {pendingInvite.invitedByUser.displayName} invited you
          </Text>
        </View>
      </View>
      <Text style={componentStyles.notifType}>Invite request</Text>
      <Text style={componentStyles.notifBody}>{getInvitePreview(pendingInvite)}</Text>
      <Text style={componentStyles.notifMeta}>Code: {pendingInvite.invite.inviteCode}</Text>
      <Text style={componentStyles.notifMeta}>
        {describeInviteDate(pendingInvite.invite.createdAt, pendingInvite.invite.expiresAt)}
      </Text>
      <View style={styles.actionRow}>
        <View style={styles.actionRowItem}>
          <AppButton label="Accept invite" icon="check" loading={accepting} onPress={onAccept} />
        </View>
        <View style={styles.actionRowItem}>
          <AppButton
            label="Decline"
            icon="close"
            variant="secondary"
            loading={declining}
            onPress={onDecline}
          />
        </View>
      </View>
    </AppCard>
  );
}

export function EventDateRangeField({
  label,
  startDate,
  endDate,
  helperText,
  onPress,
}: {
  label: string;
  startDate?: string;
  endDate?: string;
  helperText?: string;
  onPress: () => void;
}) {
  const styles = useEventStyles();
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${formatDateRangeLabel(startDate, endDate)}`}
        onPress={onPress}
        style={({pressed}) => [
          styles.eventIconSelector,
          styles.dateRangeField,
          pressed ? styles.pressed : null,
        ]}>
        <View style={styles.dateRangeFieldBadge}>
          <AppIcon name="calendar" tone="accent" size={22} />
        </View>
        <View style={styles.dateRangeFieldCopy}>
          <Text style={styles.dateRangeFieldValue}>
            {formatDateRangeLabel(startDate, endDate)}
          </Text>
          {helperText ? <Text style={styles.eventMeta}>{helperText}</Text> : null}
        </View>
        <AppIcon name="chevron" tone="muted" size={16} />
      </Pressable>
    </View>
  );
}

export function EventDateRangePicker({
  startDate,
  endDate,
  onChange,
  onClear,
  onClose,
}: {
  startDate?: string;
  endDate?: string;
  onChange: (next: {startDate?: string; endDate?: string}) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const componentStyles = useStyles(createComponentStyles);
  const {colors: c} = useTheme();
  const styles = useEventStyles();
  const today = useMemo(() => getTodayDateString(), []);
  const [draftStartDate, setDraftStartDate] = useState(startDate ?? today);
  const [draftEndDate, setDraftEndDate] = useState(endDate ?? today);
  const [hasDates, setHasDates] = useState(Boolean(startDate && endDate));
  const [activeField, setActiveField] = useState<'start' | 'end'>('start');
  const markedDates = useMemo(
    () => (hasDates ? buildMarkedDateRange(c, draftStartDate, draftEndDate) : {}),
    [c, draftEndDate, draftStartDate, hasDates],
  );

  function handleDayPress(dateString: string) {
    setHasDates(true);

    if (activeField === 'start') {
      setDraftStartDate(dateString);
      if (dateString > draftEndDate) {
        setDraftEndDate(dateString);
      }
      setActiveField('end');
      return;
    }

    setDraftEndDate(dateString);
    if (dateString < draftStartDate) {
      setDraftStartDate(dateString);
    }
  }

  return (
    <View style={componentStyles.datePickerBlock}>
      <View style={componentStyles.datePickerSummaryCard}>
        <Text style={componentStyles.datePickerSummaryLabel}>Selected range</Text>
        <Text style={componentStyles.datePickerSummaryValue}>
          {hasDates ? formatDateRangeLabel(draftStartDate, draftEndDate) : 'No dates'}
        </Text>
        <View style={componentStyles.dateRangeFieldRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveField('start')}
            style={({pressed}) => [
              componentStyles.dateAnchorChip,
              activeField === 'start' ? componentStyles.dateAnchorChipActive : null,
              pressed ? styles.pressed : null,
            ]}>
            <Text
              style={[
                componentStyles.dateAnchorLabel,
                activeField === 'start' ? componentStyles.dateAnchorLabelActive : null,
              ]}>
              From
            </Text>
            <Text
              style={[
                componentStyles.dateAnchorValue,
                activeField === 'start' ? componentStyles.dateAnchorValueActive : null,
              ]}>
              {hasDates ? formatDateLabel(draftStartDate) : 'Not set'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveField('end')}
            style={({pressed}) => [
              componentStyles.dateAnchorChip,
              activeField === 'end' ? componentStyles.dateAnchorChipActive : null,
              pressed ? styles.pressed : null,
            ]}>
            <Text
              style={[
                componentStyles.dateAnchorLabel,
                activeField === 'end' ? componentStyles.dateAnchorLabelActive : null,
              ]}>
              To
            </Text>
            <Text
              style={[
                componentStyles.dateAnchorValue,
                activeField === 'end' ? componentStyles.dateAnchorValueActive : null,
              ]}>
              {hasDates ? formatDateLabel(draftEndDate) : 'Not set'}
            </Text>
          </Pressable>
        </View>
        <Text style={componentStyles.datePickerSummaryHint}>
          {hasDates
            ? `Select ${activeField === 'start' ? 'the start date' : 'the end date'}, then confirm.`
            : 'Choose dates to add a range, or clear them to keep this share ongoing.'}
        </Text>
      </View>
      <Calendar
        markingType="period"
        markedDates={markedDates}
        onDayPress={({dateString}) => handleDayPress(dateString)}
        theme={{
          backgroundColor: c.surface,
          calendarBackground: c.surface,
          textSectionTitleColor: c.inkMuted,
          selectedDayBackgroundColor: c.brand,
          selectedDayTextColor: c.surface,
          todayTextColor: c.brand,
          dayTextColor: c.ink,
          monthTextColor: c.ink,
          arrowColor: c.brand,
          textDisabledColor: c.hairline,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
        }}
        style={componentStyles.calendar}
      />
      <View style={styles.actionRow}>
        <View style={styles.actionRowItem}>
          <AppButton
            label="Clear dates"
            variant="tint"
            onPress={() => {
              setHasDates(false);
              onClear();
              onClose();
            }}
          />
        </View>
        <View style={styles.actionRowItem}>
          <AppButton
            label="Apply dates"
            icon="check"
            onPress={() => {
              onChange({startDate: draftStartDate, endDate: draftEndDate});
              onClose();
            }}
          />
        </View>
      </View>
    </View>
  );
}

export function EventIconPicker({
  selectedIcon,
  onSelect,
}: {
  selectedIcon: EventIconName;
  onSelect: (icon: EventIconName) => void;
}) {
  const styles = useEventStyles();
  return (
    <View style={styles.iconGrid}>
      {EVENT_ICON_OPTIONS.map(option => (
        <Pressable
          key={option.name}
          accessibilityRole="button"
          onPress={() => onSelect(option.name)}
          style={({pressed}) => [
            styles.iconOptionCard,
            selectedIcon === option.name ? styles.iconOptionCardActive : null,
            pressed ? styles.pressed : null,
          ]}>
          <AppIcon
            name={option.name as AppIconName}
            tone={selectedIcon === option.name ? 'inverted' : 'accent'}
            size={24}
          />
          <Text
            style={[
              styles.iconOptionLabel,
              selectedIcon === option.name ? styles.iconOptionLabelActive : null,
            ]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function SelectedMembersPreview({
  selectedMembers,
  onRemoveMember,
}: {
  selectedMembers: SelectedMemberDraft[];
  onRemoveMember: (memberId: string) => void;
}) {
  const styles = useEventStyles();
  if (selectedMembers.length === 0) {
    return null;
  }

  return (
    <View style={styles.selectedMemberChipRow}>
      {selectedMembers.map(member => (
        <Pressable
          key={member.id}
          accessibilityRole="button"
          onPress={() => onRemoveMember(member.id)}
          style={({pressed}) => [styles.selectedMemberChip, pressed && styles.pressed]}>
          <Text style={styles.selectedMemberChipText}>{member.label}</Text>
          <AppIcon name="close" tone="accent" size={11} />
        </Pressable>
      ))}
    </View>
  );
}

export function DashboardMembersMetricCard({
  members,
  onPress,
}: {
  members: EventMember[];
  onPress: () => void;
}) {
  const componentStyles = useStyles(createComponentStyles);
  const styles = useEventStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [componentStyles.dashboardMetricCard, pressed && styles.pressed]}>
      <Text style={componentStyles.dashboardMetricLabel}>Members</Text>
      <Text style={componentStyles.dashboardMetricValue}>{members.length}</Text>
      <AppAvatarStack names={members.map(m => m.displayName)} size="xs" />
    </Pressable>
  );
}

export function DashboardBalanceSummaryCard({
  currentBalance,
  currency,
  balanceLabel,
  onPress,
}: {
  currentBalance: MemberBalance;
  currency: CurrencyCode;
  balanceLabel: string;
  onPress: () => void;
}) {
  const componentStyles = useStyles(createComponentStyles);
  const styles = useEventStyles();
  const isPositive = currentBalance.net > 0;
  const isNegative = currentBalance.net < 0;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed && styles.pressed]}>
      <AppCard>
        <View style={componentStyles.balanceRow}>
          <View style={componentStyles.balanceLead}>
            <View
              style={[
                componentStyles.balanceIconBubble,
                isPositive
                  ? componentStyles.balanceIconPositive
                  : isNegative
                    ? componentStyles.balanceIconNegative
                    : componentStyles.balanceIconNeutral,
              ]}>
              <AppIcon name="balances" tone="accent" size={16} />
            </View>
            <View style={{flex: 1, gap: 2}}>
              <Text style={componentStyles.balanceTitle}>My balance</Text>
              <Text style={componentStyles.balanceMeta}>{balanceLabel}</Text>
            </View>
          </View>
          <View style={{alignItems: 'flex-end', gap: 2}}>
            <Text
              style={[
                componentStyles.balanceAmount,
                isPositive ? styles.balanceAmountPositive : isNegative ? styles.balanceAmountNegative : styles.balanceAmountNeutral,
              ]}>
              {formatCurrency(Math.abs(currentBalance.net), currency)}
            </Text>
            <Text style={componentStyles.balanceHint}>Tap for details</Text>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

export function DashboardFundOverviewCard({
  currency,
  availableAmount,
  contributedAmount,
  spentAmount,
  progressRatio,
  onPress,
}: {
  currency: CurrencyCode;
  availableAmount: number;
  contributedAmount: number;
  spentAmount: number;
  progressRatio: number;
  onPress: () => void;
}) {
  const componentStyles = useStyles(createComponentStyles);
  const styles = useEventStyles();
  const clampedRatio = Math.min(Math.max(progressRatio, 0), 1);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [pressed && styles.pressed]}>
      <View style={componentStyles.fundOverviewBlock}>
        <View style={componentStyles.fundOverviewHeader}>
          <View style={componentStyles.fundOverviewTitleBlock}>
            <Text style={componentStyles.fundOverviewLabel}>Available balance</Text>
            <Text style={componentStyles.fundOverviewAmount}>
              {formatCurrency(availableAmount, currency)}
            </Text>
            <Text style={componentStyles.fundOverviewMeta}>
              {formatCurrency(contributedAmount, currency)} contributed ·{' '}
              {formatCurrency(spentAmount, currency)} spent
            </Text>
          </View>
          <View style={componentStyles.fundOverviewAction}>
            <View style={componentStyles.manageFundChip}>
              <Text style={componentStyles.manageFundChipLabel}>Manage fund</Text>
              <AppIcon name="chevron" tone="accent" size={16} />
            </View>
          </View>
        </View>

        <View style={componentStyles.fundProgressTrack}>
          <View
            style={[
              componentStyles.fundProgressSpent,
              spentAmount > 0 ? null : componentStyles.fundProgressSpentHidden,
              {flex: clampedRatio},
            ]}
          />
          <View
            style={[
              componentStyles.fundProgressAvailable,
              {flex: Math.max(1 - clampedRatio, 0.0001)},
            ]}
          />
        </View>

        <View style={componentStyles.fundProgressLabels}>
          <Text style={componentStyles.fundProgressLabel}>
            Spent · {formatCurrency(spentAmount, currency)}
          </Text>
          <Text style={componentStyles.fundProgressLabel}>
            Available · {formatCurrency(availableAmount, currency)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function DashboardShortcutCard({
  iconName,
  title,
  subtitle,
  onPress,
}: {
  iconName: AppIconName;
  title: string;
  subtitle: string;
  variant?: 'balances' | 'settlement';
  onPress: () => void;
}) {
  const componentStyles = useStyles(createComponentStyles);
  const styles = useEventStyles();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed && styles.pressed]}>
      <AppCard>
        <View style={componentStyles.shortcutRow}>
          <View style={componentStyles.shortcutIconBubble}>
            <AppIcon name={iconName} tone="accent" size={18} />
          </View>
          <View style={{flex: 1, gap: 2}}>
            <Text style={componentStyles.shortcutTitle}>{title}</Text>
            <Text style={componentStyles.shortcutMeta}>{subtitle}</Text>
          </View>
          <AppIcon name="chevron" tone="muted" size={18} />
        </View>
      </AppCard>
    </Pressable>
  );
}

export function RecentExpenseListItem({
  title,
  meta,
  amountLabel,
  receiptAttached = false,
  onPress,
}: {
  title: string;
  meta: string;
  amountLabel: string;
  receiptAttached?: boolean;
  onPress: () => void;
}) {
  const styles = useEventStyles();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed && styles.pressed]}>
      <View style={styles.expenseRow}>
        <View style={styles.expenseIconBadge}>
          <AppIcon name="expense" tone="accent" size={16} />
        </View>
        <View style={styles.expenseBody}>
          <Text style={styles.expenseTitle}>{title}</Text>
          <Text style={styles.expenseMeta}>{meta}</Text>
          {receiptAttached ? <Text style={styles.expenseMeta}>Receipt attached</Text> : null}
        </View>
        <Text style={styles.expenseAmount}>{amountLabel}</Text>
      </View>
    </Pressable>
  );
}

export function BalanceDetailsContent({
  currentBalanceNet,
  currency,
  owesYou,
  youOwe,
}: {
  currentBalanceNet: number;
  currency: CurrencyCode;
  owesYou: SettlementInstruction[];
  youOwe: SettlementInstruction[];
}) {
  const styles = useEventStyles();
  return (
    <>
      <View style={styles.balanceSheetSummary}>
        <Text style={styles.balanceSheetSummaryLabel}>Net position</Text>
        <Text
          style={[
            styles.balanceSheetSummaryAmount,
            currentBalanceNet > 0
              ? styles.balanceAmountPositive
              : currentBalanceNet < 0
                ? styles.balanceAmountNegative
                : styles.balanceAmountNeutral,
          ]}>
          {formatCurrency(Math.abs(currentBalanceNet), currency)}
        </Text>
      </View>

      <View style={styles.balanceSheetSection}>
        <SectionHeading title="People who owe me" detail={`${owesYou.length}`} />
        {owesYou.length === 0 ? (
          <Text style={styles.balanceSheetEmpty}>Nobody owes you right now.</Text>
        ) : null}
        {owesYou.map(item => (
          <View key={`${item.fromMemberId}-${item.toMemberId}`} style={styles.balanceSheetRow}>
            <View style={styles.balanceSheetRowCopy}>
              <Text style={styles.balanceSheetRowTitle}>{item.fromDisplayName}</Text>
              <Text style={styles.balanceSheetRowSubtitle}>Needs to pay you</Text>
            </View>
            <Text style={styles.balanceDetailPositive}>
              {formatCurrency(item.amount, currency)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.balanceSheetSection}>
        <SectionHeading title="People I owe" detail={`${youOwe.length}`} />
        {youOwe.length === 0 ? (
          <Text style={styles.balanceSheetEmpty}>You do not owe anyone right now.</Text>
        ) : null}
        {youOwe.map(item => (
          <View key={`${item.fromMemberId}-${item.toMemberId}`} style={styles.balanceSheetRow}>
            <View style={styles.balanceSheetRowCopy}>
              <Text style={styles.balanceSheetRowTitle}>{item.toDisplayName}</Text>
              <Text style={styles.balanceSheetRowSubtitle}>You need to pay</Text>
            </View>
            <Text style={styles.balanceDetailNegative}>
              {formatCurrency(item.amount, currency)}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

export function MemberRosterList({members}: {members: MemberRosterRow[]}) {
  const styles = useEventStyles();
  return (
    <View style={styles.memberRosterList}>
      {members.map(member => (
        <View key={member.id} style={styles.memberRow}>
          <AppAvatar name={member.displayName} size="sm" />
          <View style={styles.memberRowBody}>
            <View style={styles.memberRowNameRow}>
              <Text style={styles.memberRowName}>{member.displayName}</Text>
            </View>
            <Text style={styles.memberRowRole}>{member.email ?? member.joinedLabel}</Text>
          </View>
          <View style={styles.memberRowTrailing}>
            <DataPill
              label={member.statusLabel === 'Joined' ? 'Joined' : 'Invited'}
              tone={member.statusLabel === 'Joined' ? 'success' : 'info'}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const createComponentStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    datePickerBlock: {
      gap: spacing.md,
    },
    datePickerSummaryCard: {
      backgroundColor: c.brandSofter,
      borderRadius: radii.lg,
      padding: spacing.md,
      gap: spacing.xs,
    },
    datePickerSummaryLabel: {
      ...t.label,
      color: c.brand,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    datePickerSummaryValue: {
      ...t.cardTitle,
    },
    datePickerSummaryHint: {
      ...t.caption,
      color: c.inkMuted,
    },
    dateRangeFieldRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    dateAnchorChip: {
      flex: 1,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: c.hairline,
      backgroundColor: c.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      gap: 2,
    },
    dateAnchorChipActive: {
      borderColor: c.brand,
      backgroundColor: c.brand,
    },
    dateAnchorLabel: {
      ...t.caption,
      color: c.inkMuted,
    },
    dateAnchorLabelActive: {
      color: c.onBrand,
    },
    dateAnchorValue: {
      ...t.bodyStrong,
      color: c.ink,
    },
    dateAnchorValueActive: {
      color: c.surface,
    },
    calendar: {
      borderRadius: radii.lg,
      overflow: 'hidden',
    },
    notifCard: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    notifRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    notifIconBadge: {
      width: 40,
      height: 40,
      borderRadius: radii.sm,
      backgroundColor: c.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    notifBody: {
      flex: 1,
      gap: 2,
    },
    notifTitle: {
      ...t.bodyStrong,
    },
    notifMeta: {
      ...t.caption,
      color: c.inkMuted,
    },
    notifType: {
      ...t.caption,
      color: c.brand,
      fontWeight: '600',
    },
    dashboardMetricCard: {
      ...cardSurface(c),
      flex: 1,
      padding: spacing.md,
      gap: spacing.sm,
    },
    dashboardMetricLabel: {
      ...t.label,
      color: c.inkMuted,
    },
    dashboardMetricValue: {
      ...t.sectionTitle,
      fontSize: 28,
      fontWeight: '700',
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    balanceLead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    balanceIconBubble: {
      width: 40,
      height: 40,
      borderRadius: radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    balanceIconPositive: {
      backgroundColor: c.successSoft,
    },
    balanceIconNegative: {
      backgroundColor: c.dangerSoft,
    },
    balanceIconNeutral: {
      backgroundColor: c.panel,
    },
    balanceTitle: {
      ...t.bodyStrong,
    },
    balanceMeta: {
      ...t.caption,
      color: c.inkMuted,
    },
    balanceAmount: {
      ...t.sectionTitle,
      fontWeight: '700',
    },
    balanceHint: {
      ...t.caption,
      color: c.inkMuted,
    },
    fundOverviewBlock: {
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    fundOverviewHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    fundOverviewTitleBlock: {
      flex: 1,
      gap: spacing.xs,
    },
    fundOverviewLabel: {
      ...t.label,
      color: c.brand,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    fundOverviewAmount: {
      ...t.display,
      fontSize: 34,
      lineHeight: 40,
      color: c.ink,
    },
    fundOverviewMeta: {
      ...t.body,
      color: c.inkMuted,
    },
    fundOverviewAction: {
      paddingTop: spacing.xs,
    },
    manageFundChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      minHeight: 36,
      paddingLeft: spacing.md,
      paddingRight: spacing.sm + 2,
      borderRadius: radii.md,
      backgroundColor: c.onTintChip,
    },
    manageFundChipLabel: {
      ...t.button,
      fontSize: 15,
      color: c.onBrandSoft,
    },
    fundProgressTrack: {
      flexDirection: 'row',
      height: 10,
      borderRadius: radii.pill,
      overflow: 'hidden',
      backgroundColor: c.brandGhost,
    },
    fundProgressSpent: {
      backgroundColor: c.brand,
    },
    fundProgressSpentHidden: {
      opacity: 0,
    },
    fundProgressAvailable: {
      backgroundColor: c.signal,
    },
    fundProgressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    fundProgressLabel: {
      ...t.body,
      color: c.inkMuted,
    },
    shortcutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    shortcutIconBubble: {
      width: 40,
      height: 40,
      borderRadius: radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.brandSofter,
    },
    shortcutTitle: {
      ...t.bodyStrong,
    },
    shortcutMeta: {
      ...t.caption,
      color: c.inkMuted,
    },
  });
};
