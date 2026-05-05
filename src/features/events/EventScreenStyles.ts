import {StyleSheet} from 'react-native';
import {palette, radii, spacing, surfaces, typography} from '../../theme/tokens';

export const styles = StyleSheet.create({
  // ─── shared / pressed ──────────────────────────────────────────────────────
  pressed: {
    opacity: 0.82,
  },

  // ─── header (inside gradient zone) ─────────────────────────────────────────
  homeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  homeHeaderLogoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeHeaderLogoText: {
    ...typography.bodyStrong,
    color: '#FFFFFF',
    fontSize: 16,
  },
  homeHeaderUserName: {
    ...typography.bodyStrong,
    color: '#FFFFFF',
    fontSize: 18,
  },
  homeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // ─── hero card ─────────────────────────────────────────────────────────────
  heroLabel: {
    ...typography.label,
    color: palette.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroAmount: {
    ...typography.amount,
    fontSize: 36,
    lineHeight: 42,
    color: palette.ink,
  },
  heroMeta: {
    ...typography.body,
    color: palette.inkMuted,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.greenAccent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: palette.surface,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ─── action row ─────────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionRowItem: {
    flex: 1,
  },

  // ─── stat cards (side by side) ──────────────────────────────────────────────
  statCardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    ...surfaces.card,
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardLabel: {
    ...typography.label,
    color: palette.inkMuted,
  },
  statCardIconBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardIconGreen: {
    backgroundColor: palette.greenAccent,
  },
  statCardIconBlue: {
    backgroundColor: palette.info,
  },
  statCardValue: {
    ...typography.sectionTitle,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },

  // ─── home event card ────────────────────────────────────────────────────────
  eventCard: {
    ...surfaces.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  eventIconBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  eventBody: {
    flex: 1,
    gap: 4,
  },
  eventName: {
    ...typography.cardTitle,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eventMetaText: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  eventTrailing: {
    alignItems: 'flex-end',
    gap: 2,
  },
  eventBalanceLabel: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  eventBalanceOwed: {
    ...typography.bodyStrong,
    color: palette.success,
  },
  eventBalanceOwing: {
    ...typography.bodyStrong,
    color: palette.danger,
  },
  eventBalanceSettled: {
    ...typography.caption,
    color: palette.inkMuted,
  },

  // ─── dashboard ─────────────────────────────────────────────────────────────
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dashboardEventIconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  dashboardEventName: {
    ...typography.cardTitle,
    color: palette.ink,
  },
  dashboardLiveBadge: {
    backgroundColor: palette.greenAccent,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dashboardLiveBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    color: palette.surface,
  },
  dashboardMemberCount: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  dashboardEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  dashboardEditText: {
    ...typography.caption,
    color: palette.primary,
    fontWeight: '600',
  },
  dashboardMetrics: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  dashboardMetricItem: {
    gap: 2,
  },
  dashboardMetricLabel: {
    ...typography.label,
    color: palette.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontSize: 11,
  },
  dashboardMetricValue: {
    ...typography.bodyStrong,
    fontSize: 17,
  },
  dashboardMetricPositive: {
    color: palette.success,
  },

  // ─── shortcut row (4 buttons) ───────────────────────────────────────────────
  shortcutRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shortcutItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  shortcutIconBubble: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    ...typography.caption,
    color: palette.ink,
  },

  // ─── expense list item ──────────────────────────────────────────────────────
  expenseRow: {
    ...surfaces.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  expenseIconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expenseBody: {
    flex: 1,
    gap: 2,
  },
  expenseTitle: {
    ...typography.bodyStrong,
  },
  expenseMeta: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  expenseAmount: {
    ...typography.bodyStrong,
  },

  // ─── event icon selector ────────────────────────────────────────────────────
  eventIconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.bgApp,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  eventIconSelectorBadge: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIconSelectorTitle: {
    ...typography.bodyStrong,
    flex: 1,
  },
  eventMeta: {
    ...typography.caption,
    color: palette.inkMuted,
  },

  // ─── delete button ───────────────────────────────────────────────────────────
  deleteEventButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  deleteEventButtonText: {
    ...typography.body,
    color: palette.danger,
  },
  deleteEventConfirmText: {
    ...typography.body,
    color: palette.ink,
  },
  deleteConfirmButton: {
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: palette.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  deleteConfirmButtonText: {
    ...typography.button,
    color: palette.surface,
  },

  // ─── member picker / create event ──────────────────────────────────────────
  memberPickerBlock: {
    gap: spacing.sm,
  },
  memberModalHeader: {
    paddingVertical: spacing.xs,
  },
  memberModalCount: {
    ...typography.bodyStrong,
  },
  memberList: {
    maxHeight: 320,
  },
  memberListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
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
    backgroundColor: palette.greenTintSoft,
  },
  selectedMemberChipText: {
    ...typography.caption,
    color: palette.ink,
  },

  // ─── icon grid (create event) ───────────────────────────────────────────────
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  iconOptionCard: {
    flexBasis: '31%',
    maxWidth: '31%',
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.greenTintSoft,
  },
  iconOptionCardActive: {
    backgroundColor: palette.primary,
  },
  iconOptionLabel: {
    ...typography.caption,
    color: palette.ink,
    textAlign: 'center',
  },
  iconOptionLabelActive: {
    color: palette.surface,
  },

  // ─── currency row ───────────────────────────────────────────────────────────
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.bgApp,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  currencyLabel: {
    ...typography.label,
    color: palette.inkMuted,
  },
  currencyValue: {
    ...typography.bodyStrong,
  },
  currencyBadge: {
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  currencyBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: palette.primary,
  },

  // ─── invite code ──────────────────────────────────────────────────────────
  inviteCodeDisplay: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  inviteCodeLabel: {
    ...typography.label,
    color: palette.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inviteCodeValue: {
    ...typography.display,
    fontSize: 38,
    letterSpacing: 4,
    color: palette.ink,
  },
  inviteCodeExpiry: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  inviteCodeActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // ─── member roster ──────────────────────────────────────────────────────────
  memberRosterList: {
    gap: spacing.sm,
  },
  memberRow: {
    ...surfaces.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  memberRowBody: {
    flex: 1,
    gap: 2,
  },
  memberRowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberRowName: {
    ...typography.bodyStrong,
  },
  memberRowRole: {
    ...typography.caption,
    color: palette.inkMuted,
  },
  memberRowTrailing: {
    alignItems: 'flex-end',
    gap: 2,
  },
  memberRowBalance: {
    ...typography.bodyStrong,
  },
  memberRowBalancePositive: {
    color: palette.success,
  },
  memberRowBalanceNegative: {
    color: palette.danger,
  },
  memberCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshButtonLight: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── notification ──────────────────────────────────────────────────────────
  notificationList: {
    gap: spacing.sm,
  },
  notificationUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: palette.info,
    marginTop: 4,
  },

  // ─── balance sheet ──────────────────────────────────────────────────────────
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
    backgroundColor: palette.bgApp,
  },
  balanceSheetRowCopy: {
    flex: 1,
    gap: 2,
  },
  balanceSheetRowTitle: {
    ...typography.bodyStrong,
  },
  balanceSheetRowSubtitle: {
    ...typography.caption,
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
    color: palette.danger,
  },
  balanceSheetSummary: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.greenTintSoft,
  },
  balanceSheetSummaryLabel: {
    ...typography.caption,
    color: palette.primary,
    textTransform: 'uppercase',
  },
  balanceSheetSummaryAmount: {
    ...typography.amount,
  },
  balanceAmountPositive: {
    color: palette.success,
  },
  balanceAmountNegative: {
    color: palette.danger,
  },
  balanceAmountNeutral: {
    color: palette.inkMuted,
  },
});
