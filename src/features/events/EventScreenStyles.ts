import {StyleSheet} from 'react-native';
import {palette, radii, spacing, typography} from '../../theme/tokens';

export const styles = StyleSheet.create({
  heroValue: {
    ...typography.display,
    color: palette.primary,
  },
  homeHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroLabel: {
    ...typography.body,
    color: palette.inkMuted,
  },
  headerActionButton: {
    minHeight: 40,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerActionText: {
    ...typography.eyebrow,
    color: palette.surface,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionRowItem: {
    flex: 1,
    minWidth: 148,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  eventLeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  eventIconBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
  },
  eventCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eventName: {
    ...typography.title,
    fontSize: 19,
    lineHeight: 24,
  },
  eventMeta: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  eventIconSelector: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  eventIconSelectorBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
  },
  eventIconSelectorTitle: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
  memberPickerBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  selectedMemberChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceSoft,
  },
  selectedMemberChipText: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  selectedContactSummary: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  memberModalHeader: {
    paddingVertical: spacing.xs,
  },
  memberModalCount: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
  memberList: {
    maxHeight: 320,
  },
  memberListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOptionCard: {
    width: '31%',
    minWidth: 88,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
  },
  iconOptionCardActive: {
    backgroundColor: palette.primary,
  },
  iconOptionLabel: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  iconOptionLabelActive: {
    color: palette.surface,
  },
  metricPanel: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
  },
  metricLabel: {
    ...typography.eyebrow,
  },
  metricText: {
    ...typography.bodyStrong,
    fontSize: 16,
    color: palette.ink,
  },
  dashboardMetricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dashboardEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inlineEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  inlineEditButtonText: {
    ...typography.eyebrow,
    color: palette.primary,
  },
  dashboardEventIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dashboardMetricCard: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  dashboardMetricCardSoft: {
    backgroundColor: '#F1F7F4',
  },
  metricLabelStrong: {
    ...typography.bodyStrong,
    color: palette.inkMuted,
  },
  metricTextLarge: {
    ...typography.title,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
  },
  metricFootnote: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  metricActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricMiniButton: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  avatarChip: {
    width: 25,
    height: 25,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.surface,
  },
  avatarChipFirst: {
    marginLeft: 0,
  },
  avatarChipOffset: {
    marginLeft: -15,
  },
  avatarOverflowChip: {
    minWidth: 29,
    height: 25,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    backgroundColor: palette.surface,
  },
  avatarText: {
    ...typography.eyebrow,
    fontWeight: '700',
  },
  avatarOverflowText: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  balanceSummaryRow: {
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
  summaryIconBubble: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconPositive: {
    backgroundColor: '#E7F5EB',
  },
  summaryIconNegative: {
    backgroundColor: '#FCE8E5',
  },
  summaryIconNeutral: {
    backgroundColor: '#EFF2F4',
  },
  summaryIconBalances: {
    backgroundColor: '#E8F0FE',
  },
  summaryIconSettlement: {
    backgroundColor: '#EEF4F1',
  },
  balanceTitle: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 26,
  },
  balanceAmountWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  balanceAmount: {
    ...typography.title,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  balanceAmountPositive: {
    color: palette.success,
  },
  balanceAmountNegative: {
    color: palette.warning,
  },
  balanceAmountNeutral: {
    color: palette.inkMuted,
  },
  balanceHint: {
    ...typography.eyebrow,
  },
  compactActionList: {
    gap: spacing.sm,
  },
  compactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compactActionTitle: {
    ...typography.title,
    fontSize: 19,
    lineHeight: 24,
  },
  balanceSheetSummary: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
  },
  balanceSheetSummaryLabel: {
    ...typography.eyebrow,
  },
  balanceSheetSummaryAmount: {
    ...typography.display,
    fontSize: 30,
    lineHeight: 36,
  },
  balanceSheetSection: {
    gap: spacing.sm,
  },
  balanceSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
  },
  balanceSheetRowCopy: {
    flex: 1,
    gap: 2,
  },
  balanceSheetRowTitle: {
    ...typography.bodyStrong,
  },
  balanceSheetRowSubtitle: {
    ...typography.eyebrow,
  },
  balanceSheetEmpty: {
    ...typography.body,
    color: palette.inkMuted,
  },
  balanceDetailPositive: {
    ...typography.bodyStrong,
    color: palette.success,
  },
  balanceDetailNegative: {
    ...typography.bodyStrong,
    color: palette.warning,
  },
  memberCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  inviteCodePressable: {
    alignSelf: 'flex-start',
    gap: 2,
    marginTop: spacing.xs,
  },
  inviteCodeValueLarge: {
    ...typography.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 2,
    color: palette.primary,
  },
  inviteCodeHint: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  memberRosterList: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    overflow: 'hidden',
  },
  memberRosterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  memberRosterRowLast: {
    borderBottomWidth: 0,
  },
  memberRosterPrimary: {
    flex: 1,
    gap: 2,
  },
  memberRosterName: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
  memberRosterEmail: {
    ...typography.body,
    color: palette.inkMuted,
  },
  memberRosterMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  memberRosterJoined: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  memberRosterStatus: {
    ...typography.bodyStrong,
  },
  memberRosterStatusJoined: {
    color: palette.success,
  },
  memberRosterStatusPending: {
    color: palette.warning,
  },
  inviteCodeCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.xs,
  },
  inviteCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  inviteCodeLabel: {
    ...typography.eyebrow,
  },
  inviteCodeValue: {
    ...typography.title,
    letterSpacing: 1.1,
  },
  notificationList: {
    gap: spacing.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  notificationLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  notificationUnreadDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: palette.warning,
    marginTop: spacing.sm,
  },
  notificationTypeLabel: {
    ...typography.eyebrow,
    color: palette.primary,
  },
  notificationFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  notificationChevron: {
    ...typography.title,
    color: palette.inkMuted,
    lineHeight: 20,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    flexShrink: 0,
  },
  refreshButtonLight: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    flexShrink: 0,
  },
  deleteEventButton: {
    minHeight: 46,
    marginTop: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#F1C7C1',
    backgroundColor: '#FCE8E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  deleteEventButtonText: {
    ...typography.bodyStrong,
    color: palette.warning,
  },
  deleteEventConfirmText: {
    ...typography.body,
    color: palette.ink,
  },
  deleteConfirmButton: {
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: palette.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  deleteConfirmButtonText: {
    ...typography.bodyStrong,
    color: palette.surface,
  },
  pressed: {
    opacity: 0.82,
  },
});
