import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {
  AppButton,
  AppCard,
  AppIcon,
  type AppIconName,
  SectionHeading,
} from '../../components/ui';
import {formatCurrency} from '../../lib/utils/format';
import type {
  CurrencyCode,
  Event,
  EventIconName,
  EventMember,
  MemberBalance,
  PendingInvite,
  SettlementInstruction,
} from '../../types/domain';
import {styles} from './EventScreenStyles';
import {
  EVENT_ICON_OPTIONS,
  type MemberRosterRow,
  type SelectedMemberDraft,
  describeInviteDate,
  getInvitePreview,
} from './EventScreenShared';

function getAvatarTone(index: number) {
  const tones = [
    {backgroundColor: '#DDEDE6', textColor: '#1B4332'},
    {backgroundColor: '#E8F0FE', textColor: '#2855AE'},
    {backgroundColor: '#E8F6EE', textColor: '#2E7D32'},
  ] as const;

  return tones[index % tones.length];
}

function getAvatarChipOffsetStyle(index: number) {
  return index === 0 ? styles.avatarChipFirst : styles.avatarChipOffset;
}

function formatAmountValue(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function EventMemberAvatarStack({members}: {members: EventMember[]}) {
  return (
    <View style={styles.avatarStackRow}>
      {members.slice(0, 3).map((member, index) => {
        const tone = getAvatarTone(index);
        return (
          <View
            key={member.id}
            style={[
              styles.avatarChip,
              getAvatarChipOffsetStyle(index),
              {backgroundColor: tone.backgroundColor},
            ]}>
            <Text style={[styles.avatarText, {color: tone.textColor}]}>
              {member.displayName.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        );
      })}
      {members.length > 3 ? (
        <View style={styles.avatarOverflowChip}>
          <Text style={styles.avatarOverflowText}>+{members.length - 3}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function HomeEventCard({
  event,
  members,
  totalSpend,
  onPress,
}: {
  event: Event;
  members: EventMember[];
  totalSpend: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [pressed ? styles.pressed : null]}>
      <AppCard>
        <View style={styles.eventHeaderRow}>
          <View style={styles.eventLeadRow}>
            <View style={styles.eventIconBadge}>
              <AppIcon name={event.icon} tone="accent" size={20} />
            </View>
            <View style={styles.eventCopy}>
              <Text style={styles.eventName}>{event.name}</Text>
              <Text style={styles.eventMeta}>{event.description || 'Shared expense workspace'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.metricRow}>
          <View style={styles.metricPanel}>
            <Text style={styles.metricLabel}>Members</Text>
            <EventMemberAvatarStack members={members} />
          </View>
          <View style={styles.metricPanel}>
            <Text style={styles.metricLabel}>Tracked spend</Text>
            <Text style={styles.metricText}>{formatAmountValue(totalSpend)}</Text>
          </View>
        </View>
      </AppCard>
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
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed ? styles.pressed : null]}>
      <AppCard>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationLead}>
            <View style={styles.eventIconBadge}>
              <AppIcon name={pendingInvite.event.icon} tone="accent" size={20} />
            </View>
            <View style={styles.eventCopy}>
              <Text style={styles.eventName}>{pendingInvite.event.name}</Text>
              <Text numberOfLines={2} ellipsizeMode="tail" style={styles.eventMeta}>
                {getInvitePreview(pendingInvite)}
              </Text>
            </View>
          </View>
          <View style={styles.notificationUnreadDot} />
        </View>
        <View style={styles.notificationFooterRow}>
          <Text style={styles.notificationTypeLabel}>Invite request</Text>
          <Text style={styles.notificationChevron}>›</Text>
        </View>
      </AppCard>
    </Pressable>
  );
}

export function PendingInviteDetailCard({
  pendingInvite,
  onAccept,
  onDecline,
}: {
  pendingInvite: PendingInvite;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <AppCard>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationLead}>
          <View style={styles.eventIconBadge}>
            <AppIcon name={pendingInvite.event.icon} tone="accent" size={20} />
          </View>
          <View style={styles.eventCopy}>
            <Text style={styles.eventName}>{pendingInvite.event.name}</Text>
            <Text style={styles.eventMeta}>{pendingInvite.invitedByUser.displayName} invited you</Text>
          </View>
        </View>
        <View style={styles.notificationUnreadDot} />
      </View>
      <Text style={styles.notificationTypeLabel}>Invite request</Text>
      <Text style={styles.selectedContactSummary}>{getInvitePreview(pendingInvite)}</Text>
      <Text style={styles.eventMeta}>Code {pendingInvite.invite.inviteCode}</Text>
      <Text style={styles.eventMeta}>
        {describeInviteDate(pendingInvite.invite.createdAt, pendingInvite.invite.expiresAt)}
      </Text>
      <View style={styles.actionRow}>
        <View style={styles.actionRowItem}>
          <AppButton label="Accept invite" icon="check" onPress={onAccept} />
        </View>
        <View style={styles.actionRowItem}>
          <AppButton label="Decline" icon="close" variant="secondary" onPress={onDecline} />
        </View>
      </View>
    </AppCard>
  );
}

export function EventIconPicker({
  selectedIcon,
  onSelect,
}: {
  selectedIcon: EventIconName;
  onSelect: (icon: EventIconName) => void;
}) {
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
          style={({pressed}) => [styles.selectedMemberChip, pressed ? styles.pressed : null]}>
          <Text style={styles.selectedMemberChipText}>{member.label}</Text>
          <AppIcon name="close" tone="accent" size={12} />
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
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [styles.dashboardMetricCard, pressed ? styles.pressed : null]}>
      <View style={styles.metricActionRow}>
        <Text style={styles.metricLabelStrong}>Members</Text>
        <View style={styles.metricMiniButton}>
          <AppIcon name="create" tone="accent" size={12} />
        </View>
      </View>
      <Text style={styles.metricTextLarge}>{members.length}</Text>
      <EventMemberAvatarStack members={members} />
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
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed ? styles.pressed : null]}>
      <AppCard>
        <View style={styles.balanceSummaryRow}>
          <View style={styles.balanceLead}>
            <View
              style={[
                styles.summaryIconBubble,
                currentBalance.net > 0
                  ? styles.summaryIconPositive
                  : currentBalance.net < 0
                    ? styles.summaryIconNegative
                    : styles.summaryIconNeutral,
              ]}>
              <AppIcon name="balances" tone="accent" size={16} />
            </View>
            <View style={styles.eventCopy}>
              <Text style={styles.balanceTitle}>My balance</Text>
              <Text style={styles.eventMeta}>{balanceLabel}</Text>
            </View>
          </View>
          <View style={styles.balanceAmountWrap}>
            <Text
              style={[
                styles.balanceAmount,
                currentBalance.net > 0
                  ? styles.balanceAmountPositive
                  : currentBalance.net < 0
                    ? styles.balanceAmountNegative
                    : styles.balanceAmountNeutral,
              ]}>
              {formatCurrency(Math.abs(currentBalance.net), currency)}
            </Text>
            <Text style={styles.balanceHint}>Tap for details</Text>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

export function DashboardShortcutCard({
  iconName,
  title,
  subtitle,
  variant,
  onPress,
}: {
  iconName: AppIconName;
  title: string;
  subtitle: string;
  variant: 'balances' | 'settlement';
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed ? styles.pressed : null]}>
      <AppCard>
        <View style={styles.compactActionRow}>
          <View
            style={[
              styles.summaryIconBubble,
              variant === 'balances' ? styles.summaryIconBalances : styles.summaryIconSettlement,
            ]}>
            <AppIcon name={iconName} tone="accent" size={16} />
          </View>
          <View style={styles.eventCopy}>
            <Text style={styles.compactActionTitle}>{title}</Text>
            <Text style={styles.eventMeta}>{subtitle}</Text>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

export function RecentExpenseListItem({
  title,
  meta,
  amountLabel,
  onPress,
}: {
  title: string;
  meta: string;
  amountLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [pressed ? styles.pressed : null]}>
      <AppCard>
        <View style={styles.eventHeaderRow}>
          <View style={styles.eventCopy}>
            <Text style={styles.eventName}>{title}</Text>
            <Text style={styles.eventMeta}>{meta}</Text>
          </View>
          <Text style={styles.metricText}>{amountLabel}</Text>
        </View>
      </AppCard>
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
            <Text style={styles.balanceDetailPositive}>{formatCurrency(item.amount, currency)}</Text>
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
            <Text style={styles.balanceDetailNegative}>{formatCurrency(item.amount, currency)}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

export function MemberRosterList({members}: {members: MemberRosterRow[]}) {
  return (
    <View style={styles.memberRosterList}>
      {members.map((member, index) => (
        <View
          key={member.id}
          style={[
            styles.memberRosterRow,
            index === members.length - 1 ? styles.memberRosterRowLast : null,
          ]}>
          <View style={styles.memberRosterPrimary}>
            <Text style={styles.memberRosterName}>{member.displayName}</Text>
            <Text style={styles.memberRosterEmail}>{member.email ?? 'No email available'}</Text>
          </View>
          <View style={styles.memberRosterMeta}>
            <Text style={styles.memberRosterJoined}>{member.joinedLabel}</Text>
            <Text
              style={[
                styles.memberRosterStatus,
                member.statusLabel === 'Joined'
                  ? styles.memberRosterStatusJoined
                  : styles.memberRosterStatusPending,
              ]}>
              {member.statusLabel}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
