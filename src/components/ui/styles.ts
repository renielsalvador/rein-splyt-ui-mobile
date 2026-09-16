import {StyleSheet} from 'react-native';
import {createTypography, radii, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';

export const createAppStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    // ─── screen / layout ────────────────────────────────────────────────────────
    screen: {
      flex: 1,
      backgroundColor: c.panel,
    },
    content: {
      flexGrow: 1,
      padding: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },

    // ─── page header (inside body container) ───────────────────────────────────
    pageHeader: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    pageTitle: {
      ...t.pageTitle,
    },
    pageSubtitle: {
      ...t.body,
      color: c.inkMuted,
    },

    // ─── hero band (full-bleed top of the body container) ───────────────────────
    heroBand: {
      // Negative margins cancel bodyScrollContent's padding, then it is re-applied
      // inside so content still lands on the 16pt screen margin.
      marginHorizontal: -spacing.md,
      marginTop: -spacing.lg,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: c.brandSoft,
      gap: spacing.md,
    },

    // ─── card ───────────────────────────────────────────────────────────────────
    card: {
      padding: spacing.md,
      gap: spacing.md,
    },
    cardAccent: {
      backgroundColor: c.brandSoft,
      borderRadius: radii.xl,
      padding: spacing.lg,
      gap: spacing.md,
    },
    cardWarm: {
      backgroundColor: c.panel,
    },

    // ─── footer overlay ─────────────────────────────────────────────────────────
    footerOverlay: {
      position: 'absolute',
      left: spacing.md,
      right: spacing.md,
      bottom: spacing.lg,
      pointerEvents: 'box-none',
    },

    // ─── buttons ────────────────────────────────────────────────────────────────
    button: {
      minHeight: 48,
      borderRadius: radii.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    buttonSm: {
      minHeight: 44,
      borderRadius: radii.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    buttonCompact: {
      minHeight: 44,
      borderRadius: radii.md,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    buttonPrimary: {
      backgroundColor: c.brand,
    },
    buttonSecondary: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.hairline,
    },
    buttonBlack: {
      backgroundColor: c.actionInk,
    },
    buttonTint: {
      backgroundColor: c.brandSoft,
    },
    buttonTintOnAccent: {
      backgroundColor: c.onTintScrim,
    },
    buttonDestructive: {
      backgroundColor: c.dangerText,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    buttonPressed: {
      opacity: 0.82,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    buttonText: {
      ...t.button,
    },
    buttonTextPrimary: {
      color: c.onBrand,
    },
    buttonTextSecondary: {
      color: c.brand,
    },
    buttonTextBlack: {
      color: c.onActionInk,
    },
    buttonTextTint: {
      color: c.onBrandSoft,
    },
    buttonTextDestructive: {
      color: c.onBrand,
    },

    // ─── inputs ─────────────────────────────────────────────────────────────────
    field: {
      gap: spacing.sm,
    },
    fieldLabel: {
      ...t.label,
    },
    inputWrapper: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 48,
      borderRadius: radii.md,
      backgroundColor: c.panel,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    inputWrapperFocused: {
      borderWidth: 1.5,
      borderColor: c.brand,
    },
    inputWrapperError: {
      borderWidth: 1.5,
      borderColor: c.dangerText,
    },
    inputWrapperMultiline: {
      height: 'auto' as any,
      minHeight: 88,
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
    },
    input: {
      flex: 1,
      ...t.body,
      padding: 0,
      paddingVertical: 0,
    },
    inputSingleLine: {
      height: '100%',
      textAlignVertical: 'center',
    },
    inputMultiline: {
      textAlignVertical: 'top',
      minHeight: 64,
    },
    errorText: {
      ...t.label,
      color: c.dangerText,
    },

    // ─── section heading ────────────────────────────────────────────────────────
    sectionHeading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    sectionHeadingTitle: {
      ...t.sectionTitle,
    },
    sectionHeadingDetail: {
      ...t.caption,
      color: c.brand,
    },

    // ─── pills ───────────────────────────────────────────────────────────────────
    pill: {
      alignSelf: 'flex-start',
      borderRadius: radii.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    pillDefault: {
      backgroundColor: c.brandSofter,
    },
    pillAccent: {
      backgroundColor: c.brand,
    },
    pillDanger: {
      backgroundColor: c.dangerText,
    },
    pillInfo: {
      backgroundColor: c.info,
    },
    pillSuccess: {
      backgroundColor: c.signal,
    },
    pillOutline: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.hairline,
    },
    pillText: {
      ...t.caption,
      fontWeight: '600',
      color: c.brand,
    },
    pillTextLight: {
      ...t.caption,
      fontWeight: '600',
      color: c.surface,
    },
    pillTextOnBright: {
      ...t.caption,
      fontWeight: '600',
      color: c.ink,
    },
    pillTextOutline: {
      ...t.caption,
      fontWeight: '600',
      color: c.ink,
    },

    // ─── empty state ────────────────────────────────────────────────────────────
    emptyTitle: {
      ...t.cardTitle,
    },
    emptyBody: {
      ...t.body,
      color: c.inkMuted,
    },

    // ─── modal ───────────────────────────────────────────────────────────────────
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalBackdropTint: {
      ...StyleSheet.absoluteFill,
      backgroundColor: c.scrim,
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFill,
    },
    modalSheet: {
      flexShrink: 1,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    modalHandle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: radii.pill,
      backgroundColor: c.rule,
      marginBottom: spacing.xs,
    },
    modalCard: {
      width: '100%',
      maxHeight: '88%',
      flexShrink: 1,
      borderTopLeftRadius: radii.xxl,
      borderTopRightRadius: radii.xxl,
      borderBottomLeftRadius: radii.xl,
      borderBottomRightRadius: radii.xl,
      padding: spacing.lg,
      gap: spacing.md,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    modalCopy: {
      flex: 1,
      gap: spacing.xs,
    },
    modalTitle: {
      ...t.cardTitle,
      fontSize: 22,
      fontWeight: '700',
    },
    modalBody: {
      gap: spacing.md,
      flexShrink: 1,
    },
    modalBodyScroll: {
      flexGrow: 0,
      flexShrink: 1,
      minHeight: 0,
    },
    modalBodyScrollContent: {
      flexGrow: 1,
      gap: spacing.md,
      paddingBottom: spacing.sm,
    },
    subtitle: {
      ...t.body,
      color: c.inkMuted,
    },

    // ─── toast ───────────────────────────────────────────────────────────────────
    toast: {
      alignSelf: 'center',
      backgroundColor: c.ink,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      shadowColor: c.shadow,
      shadowOpacity: 0.16,
      shadowRadius: 16,
      shadowOffset: {width: 0, height: 8},
      elevation: 6,
    },
    toastText: {
      ...t.bodyStrong,
      color: c.surface,
    },

    // ─── icon + icon button ─────────────────────────────────────────────────────
    icon: {
      fontWeight: '700',
      textAlign: 'center',
    },
    iconButton: {
      width: 36,
      height: 36,
      borderRadius: radii.pill,
      backgroundColor: c.onHeaderScrim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconButtonOnWhite: {
      width: 36,
      height: 36,
      borderRadius: radii.pill,
      backgroundColor: c.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ─── header zone ────────────────────────────────────────────────────────────
    gradientHeader: {
      backgroundColor: c.brand,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      paddingTop: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerLogoIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: c.onHeaderScrim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerUserName: {
      ...t.bodyStrong,
      color: c.surface,
      fontSize: 18,
    },
    headerBellButton: {
      width: 36,
      height: 36,
      borderRadius: radii.pill,
      backgroundColor: c.onHeaderScrim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerAvatarCircle: {
      width: 34,
      height: 34,
      borderRadius: radii.pill,
      backgroundColor: c.onHeaderScrim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerAvatarText: {
      ...t.label,
      color: c.surface,
      fontWeight: '700',
    },
    headerNotificationDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 3,
      borderRadius: radii.pill,
      backgroundColor: c.dangerText,
      borderWidth: 2,
      borderColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerNotificationDotText: {
      fontSize: 11,
      lineHeight: 13,
      fontWeight: '700',
      color: c.surface,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: radii.pill,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 2},
      elevation: 2,
    },

    // ─── body container ─────────────────────────────────────────────────────────
    bodyContainer: {
      flex: 1,
      backgroundColor: c.panel,
      borderTopLeftRadius: radii.xxl,
      borderTopRightRadius: radii.xxl,
      marginTop: -20,
      overflow: 'hidden',
    },
    bodyContainerGray: {
      backgroundColor: c.panel,
    },
    bodyScroll: {
      flex: 1,
    },
    bodyScrollContent: {
      padding: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    bodyScrollContentWithTabBar: {
      paddingBottom: 88,
    },

    // ─── menu ─────────────────────────────────────────────────────────────────
    menuWrap: {
      position: 'relative',
    },
    menuModalLayer: {
      flex: 1,
    },
    menuBackdrop: {
      ...StyleSheet.absoluteFill,
    },
    menuCard: {
      position: 'absolute',
      minWidth: 188,
      padding: spacing.xs,
      gap: spacing.xs,
      zIndex: 10,
    },
    menuItem: {
      minHeight: 46,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    menuItemLabel: {
      ...t.bodyStrong,
    },

    // ─── selectable row ─────────────────────────────────────────────────────────
    selectableRow: {
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
    selectableRowSelected: {
      backgroundColor: c.brandSoft,
    },
    selectableRowLead: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    selectableRowIcon: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      backgroundColor: c.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectableRowIconSelected: {
      backgroundColor: c.brand,
    },
    selectableRowCopy: {
      flex: 1,
      gap: 2,
    },
    selectableRowTitle: {
      ...t.bodyStrong,
    },
    selectableRowDetail: {
      ...t.caption,
    },
    selectionMark: {
      width: 22,
      height: 22,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      borderColor: c.hairline,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectionMarkActive: {
      backgroundColor: c.brand,
      borderColor: c.brand,
    },

    // ─── action tile ─────────────────────────────────────────────────────────
    actionTile: {
      minHeight: 120,
      padding: spacing.md,
      gap: spacing.sm,
      flex: 1,
    },
    actionTileIcon: {
      width: 40,
      height: 40,
      borderRadius: radii.sm,
      backgroundColor: c.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionTileCopy: {
      gap: 2,
    },
    actionTileTitle: {
      ...t.bodyStrong,
      fontSize: 16,
    },
    actionTileSubtitle: {
      ...t.caption,
    },

    // ─── tab bar ─────────────────────────────────────────────────────────────
    tabBar: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.hairline,
      height: 64,
      shadowColor: c.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 12,
      shadowOffset: {width: 0, height: -2},
      elevation: 8,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      paddingTop: spacing.sm,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '500',
      lineHeight: 13,
      color: c.inkMuted,
    },
    tabLabelActive: {
      fontWeight: '600',
      color: c.ink,
    },
  });
};

export function useAppStyles() {
  return useStyles(createAppStyles);
}

