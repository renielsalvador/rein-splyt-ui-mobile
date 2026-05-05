import {StyleSheet} from 'react-native';
import {palette, radii, spacing, typography} from '../../theme/tokens';

export const styles = StyleSheet.create({
  // ─── screen / layout ────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: palette.bgApp,
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
    ...typography.pageTitle,
  },
  pageSubtitle: {
    ...typography.body,
    color: palette.inkMuted,
  },

  // ─── card ───────────────────────────────────────────────────────────────────
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardAccent: {
    backgroundColor: palette.greenTint,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardWarm: {
    backgroundColor: palette.bgApp,
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
    height: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonSm: {
    height: 40,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonCompact: {
    height: 44,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
  },
  buttonSecondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  buttonBlack: {
    backgroundColor: palette.ink,
  },
  buttonDestructive: {
    backgroundColor: palette.danger,
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
    ...typography.button,
  },
  buttonTextPrimary: {
    color: palette.surface,
  },
  buttonTextSecondary: {
    color: palette.primary,
  },
  buttonTextBlack: {
    color: palette.surface,
  },
  buttonTextDestructive: {
    color: palette.surface,
  },

  // ─── inputs ─────────────────────────────────────────────────────────────────
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radii.md,
    backgroundColor: palette.bgApp,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  inputWrapperFocused: {
    borderWidth: 1.5,
    borderColor: palette.primary,
  },
  inputWrapperMultiline: {
    height: 'auto' as any,
    minHeight: 88,
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
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
    ...typography.caption,
    color: palette.danger,
  },

  // ─── section heading ────────────────────────────────────────────────────────
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionHeadingTitle: {
    ...typography.sectionTitle,
  },
  sectionHeadingDetail: {
    ...typography.caption,
    color: palette.primary,
  },

  // ─── pills ───────────────────────────────────────────────────────────────────
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pillDefault: {
    backgroundColor: palette.greenTintSoft,
  },
  pillAccent: {
    backgroundColor: palette.primary,
  },
  pillDanger: {
    backgroundColor: palette.danger,
  },
  pillInfo: {
    backgroundColor: palette.info,
  },
  pillSuccess: {
    backgroundColor: palette.greenAccent,
  },
  pillOutline: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.divider,
  },
  pillText: {
    ...typography.caption,
    fontWeight: '600',
    color: palette.primary,
  },
  pillTextLight: {
    ...typography.caption,
    fontWeight: '600',
    color: palette.surface,
  },
  pillTextOutline: {
    ...typography.caption,
    fontWeight: '600',
    color: palette.ink,
  },

  // ─── empty state ────────────────────────────────────────────────────────────
  emptyTitle: {
    ...typography.cardTitle,
  },
  emptyBody: {
    ...typography.body,
    color: palette.inkMuted,
  },

  // ─── modal ───────────────────────────────────────────────────────────────────
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 28, 30, 0.4)',
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
    backgroundColor: '#C9CDD2',
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
    ...typography.cardTitle,
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
    ...typography.body,
    color: palette.inkMuted,
  },

  // ─── toast ───────────────────────────────────────────────────────────────────
  toast: {
    alignSelf: 'center',
    backgroundColor: palette.ink,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    shadowColor: palette.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  toastText: {
    ...typography.bodyStrong,
    color: palette.surface,
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonOnWhite: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: palette.bgApp,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── header (gradient zone) ─────────────────────────────────────────────────
  gradientHeader: {
    backgroundColor: palette.primary,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUserName: {
    ...typography.bodyStrong,
    color: palette.surface,
    fontSize: 18,
  },
  headerBellButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    ...typography.label,
    color: palette.surface,
    fontWeight: '700',
  },
  headerNotificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: radii.pill,
    backgroundColor: palette.danger,
    borderWidth: 2,
    borderColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerNotificationDotText: {
    fontSize: 9,
    fontWeight: '700',
    color: palette.surface,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  // ─── body container ─────────────────────────────────────────────────────────
  bodyContainer: {
    flex: 1,
    backgroundColor: palette.bgApp,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    marginTop: -20,
    overflow: 'hidden',
  },
  bodyContainerGray: {
    backgroundColor: palette.bgApp,
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
    ...typography.bodyStrong,
  },

  // ─── selectable row ─────────────────────────────────────────────────────────
  selectableRow: {
    minHeight: 60,
    borderRadius: radii.lg,
    backgroundColor: palette.bgApp,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  selectableRowSelected: {
    backgroundColor: palette.greenTint,
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
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectableRowIconSelected: {
    backgroundColor: palette.primary,
  },
  selectableRowCopy: {
    flex: 1,
    gap: 2,
  },
  selectableRowTitle: {
    ...typography.bodyStrong,
  },
  selectableRowDetail: {
    ...typography.caption,
  },
  selectionMark: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: palette.divider,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionMarkActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
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
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTileCopy: {
    gap: 2,
  },
  actionTileTitle: {
    ...typography.bodyStrong,
    fontSize: 16,
  },
  actionTileSubtitle: {
    ...typography.caption,
  },

  // ─── tab bar ─────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.divider,
    height: 64,
    shadowColor: palette.shadow,
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
    color: palette.inkMuted,
  },
  tabLabelActive: {
    fontWeight: '600',
    color: palette.ink,
  },
});
