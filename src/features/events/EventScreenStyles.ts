import {StyleSheet} from 'react-native';
import {cardSurface, createTypography, radii, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';

export const createEventStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
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
    homeHeaderUserName: {
      ...t.bodyStrong,
      color: c.onHeader,
      fontSize: 18,
    },
    homeHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },

    // ─── hero band ────────────────────────────────────────────────
    heroWelcome: {
      ...t.pageTitle,
    },
    heroLabel: {
      ...t.label,
      color: c.brand,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    heroAmount: {
      ...t.amount,
      fontSize: 36,
      lineHeight: 42,
      color: c.ink,
    },
    heroMeta: {
      ...t.body,
      color: c.inkMuted,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: c.signal,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    heroBadgeText: {
      ...t.caption,
      fontWeight: '700',
      color: c.ink,
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
      ...cardSurface(c),
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
      ...t.label,
      color: c.inkMuted,
    },
    statCardIconBadge: {
      width: 32,
      height: 32,
      borderRadius: radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statCardIconGreen: {
      backgroundColor: c.signal,
    },
    statCardIconBlue: {
      backgroundColor: c.info,
    },
    statCardValue: {
      ...t.sectionTitle,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '700',
    },

    // ─── home event card ────────────────────────────────────────────────────────
    eventCard: {
      ...cardSurface(c),
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      padding: spacing.md,
    },
    eventIconBadge: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: c.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    eventBody: {
      flex: 1,
      gap: 4,
    },
    eventTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    eventName: {
      ...t.cardTitle,
      flexShrink: 1,
    },
    eventNameInactive: {
      color: c.inkMuted,
    },
    eventMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    eventMetaText: {
      ...t.caption,
      color: c.inkMuted,
    },
    eventMetaTextInactive: {
      color: c.inkMuted,
    },
    eventTrailing: {
      marginLeft: 'auto',
      alignItems: 'flex-end',
      gap: 2,
    },
    eventStatusText: {
      ...t.bodyStrong,
      color: c.successText,
    },
    eventStatusEnded: {
      color: c.dangerText,
    },
    eventStatusUpcoming: {
      color: c.warningText,
    },
    eventStatusInactive: {
      color: c.inkMuted,
    },
    eventBalanceLabel: {
      ...t.caption,
      color: c.inkMuted,
    },
    eventBalanceOwed: {
      ...t.bodyStrong,
      color: c.successText,
    },
    eventBalanceOwing: {
      ...t.bodyStrong,
      color: c.dangerText,
    },
    eventBalanceSettled: {
      ...t.caption,
      color: c.inkMuted,
    },
    eventCardInactive: {
      backgroundColor: c.surfaceSunken,
    },
    eventIconBadgeInactive: {
      backgroundColor: c.hairline,
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
      backgroundColor: c.onTintScrim,
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
      ...t.cardTitle,
      color: c.ink,
    },
    dashboardStatusText: {
      ...t.caption,
      fontWeight: '700',
      color: c.successText,
    },
    dashboardEndedText: {
      color: c.warningText,
    },
    dashboardInactiveText: {
      color: c.inkMuted,
    },
    dashboardMemberCount: {
      ...t.caption,
      color: c.inkMuted,
    },
    dashboardStatusCopy: {
      flex: 1,
    },
    dashboardEditButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      minHeight: 40,
      paddingHorizontal: spacing.sm + 4,
      borderRadius: radii.md,
      backgroundColor: c.onTintChip,
    },
    dashboardEditText: {
      ...t.button,
      fontSize: 15,
      color: c.onBrandSoft,
    },
    dashboardHeaderStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dashboardStatusToggle: {
      alignItems: 'flex-end',
      gap: 2,
    },
    dashboardStatusToggleLabel: {
      ...t.caption,
      color: c.surface,
      fontWeight: '700',
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
      ...t.label,
      color: c.brand,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
      fontSize: 11,
    },
    dashboardMetricValue: {
      ...t.bodyStrong,
      fontSize: 17,
    },
    dashboardMetricPositive: {
      color: c.successText,
    },

    // ─── shortcut row (4 buttons) ───────────────────────────────────────────────
    shortcutRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    shortcutItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      minHeight: 76,
      paddingVertical: spacing.sm + 4,
      paddingHorizontal: spacing.xs,
      borderRadius: radii.md,
      backgroundColor: c.brandSoft,
    },
    shortcutLabel: {
      ...t.caption,
      color: c.ink,
    },

    // ─── expense list item ──────────────────────────────────────────────────────
    expenseRow: {
      ...cardSurface(c),
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
    },
    expenseIconBadge: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      backgroundColor: c.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    expenseBody: {
      flex: 1,
      gap: 2,
    },
    expenseTitle: {
      ...t.bodyStrong,
    },
    expenseMeta: {
      ...t.caption,
      color: c.inkMuted,
    },
    expenseAmount: {
      ...t.bodyStrong,
    },

    // ─── event icon selector ────────────────────────────────────────────────────
    eventIconSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.panel,
      borderRadius: radii.md,
      padding: spacing.md,
    },
    eventIconSelectorBadge: {
      width: 52,
      height: 52,
      borderRadius: radii.md,
      backgroundColor: c.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eventIconSelectorTitle: {
      ...t.cardTitle,
      fontSize: 18,
      lineHeight: 30,
      flex: 1,
    },
    eventIconSelectorCopy: {
      flex: 1
    },
    eventMeta: {
      ...t.caption,
      color: c.inkMuted,
    },
    fieldGroup: {
      gap: spacing.sm,
    },
    fieldLabel: {
      ...t.label,
    },
    dateRangeField: {
      paddingVertical: spacing.sm,
    },
    dateRangeFieldBadge: {
      width: 44,
      height: 44,
      borderRadius: radii.md,
      backgroundColor: c.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateRangeFieldCopy: {
      flex: 1,
      gap: 2,
    },
    dateRangeFieldValue: {
      ...t.bodyStrong,
      color: c.ink,
    },

    // ─── delete button ───────────────────────────────────────────────────────────
    deleteEventButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      minHeight: 44,
      paddingRight: spacing.sm,
    },
    deleteEventButtonText: {
      ...t.bodyStrong,
      color: c.dangerText,
    },
    deleteEventConfirmText: {
      ...t.body,
      color: c.ink,
    },
    deleteConfirmButton: {
      minHeight: 52,
      borderRadius: radii.pill,
      backgroundColor: c.dangerText,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    deleteConfirmButtonText: {
      ...t.button,
      color: c.surface,
    },

    // ─── member picker / create event ──────────────────────────────────────────
    memberPickerBlock: {
      gap: spacing.sm,
    },
    memberModalHeader: {
      paddingVertical: spacing.xs,
    },
    memberModalCount: {
      ...t.bodyStrong,
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
      backgroundColor: c.brandSofter,
    },
    selectedMemberChipText: {
      ...t.caption,
      color: c.ink,
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
      backgroundColor: c.brandSofter,
    },
    iconOptionCardActive: {
      backgroundColor: c.brand,
    },
    iconOptionLabel: {
      ...t.caption,
      color: c.ink,
      textAlign: 'center',
    },
    iconOptionLabelActive: {
      color: c.surface,
    },

    // ─── currency row ───────────────────────────────────────────────────────────
    currencyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.panel,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 48,
    },
    currencyLabel: {
      ...t.label,
      color: c.inkMuted,
    },
    currencyValue: {
      ...t.bodyStrong,
    },
    currencyBadge: {
      backgroundColor: c.surface,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: c.hairline,
    },
    currencyBadgeText: {
      ...t.caption,
      fontWeight: '600',
      color: c.brand,
    },

    // ─── invite code ──────────────────────────────────────────────────────────
    inviteCodeDisplay: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    inviteCodeLabel: {
      ...t.label,
      color: c.brand,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    inviteCodeValue: {
      ...t.display,
      fontSize: 38,
      letterSpacing: 4,
      color: c.ink,
    },
    inviteCodeExpiry: {
      ...t.caption,
      color: c.inkMuted,
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
      ...cardSurface(c),
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
      ...t.bodyStrong,
    },
    memberRowRole: {
      ...t.caption,
      color: c.inkMuted,
    },
    memberRowTrailing: {
      alignItems: 'flex-end',
      gap: 2,
    },
    memberRowBalance: {
      ...t.bodyStrong,
    },
    memberRowBalancePositive: {
      color: c.successText,
    },
    memberRowBalanceNegative: {
      color: c.dangerText,
    },
    memberCodeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    refreshButtonLight: {
      width: 44,
      height: 44,
      borderRadius: radii.pill,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.hairline,
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
      backgroundColor: c.info,
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
      backgroundColor: c.panel,
    },
    balanceSheetRowCopy: {
      flex: 1,
      gap: 2,
    },
    balanceSheetRowTitle: {
      ...t.bodyStrong,
    },
    balanceSheetRowSubtitle: {
      ...t.caption,
    },
    balanceSheetEmpty: {
      ...t.body,
      color: c.inkMuted,
    },
    balanceDetailPositive: {
      ...t.bodyStrong,
      color: c.successText,
    },
    balanceDetailNegative: {
      ...t.bodyStrong,
      color: c.dangerText,
    },
    balanceSheetSummary: {
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radii.lg,
      backgroundColor: c.brandSofter,
    },
    balanceSheetSummaryLabel: {
      ...t.caption,
      color: c.brand,
      textTransform: 'uppercase',
    },
    balanceSheetSummaryAmount: {
      ...t.amount,
    },
    balanceAmountPositive: {
      color: c.successText,
    },
    balanceAmountNegative: {
      color: c.dangerText,
    },
    balanceAmountNeutral: {
      color: c.inkMuted,
    },
  });
};

export function useEventStyles() {
  return useStyles(createEventStyles);
}

