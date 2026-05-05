import {StyleSheet} from 'react-native';
import {palette, radii, spacing, typography} from '../../theme/tokens';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    flexGrow: 1,
    padding: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  detailHeader: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailHeaderLeading: {
    paddingTop: 2,
  },
  detailHeaderBody: {
    flex: 1,
    gap: spacing.xs,
  },
  detailHeaderTrailing: {
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLeading: {
    alignItems: 'flex-start',
    flex: 1,
  },
  headerTrailing: {
    alignItems: 'flex-end',
    flex: 1,
  },
  headerCopy: {
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
  },
  detailTitle: {
    ...typography.title,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: palette.inkMuted,
  },
  footerOverlay: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xl,
    pointerEvents: 'box-none',
  },
  card: {
    padding: spacing.md,
    gap: spacing.md,
  },
  cardWarm: {
    backgroundColor: palette.surfaceSoft,
  },
  cardAccent: {
    backgroundColor: palette.accentSoft,
    borderColor: 'rgba(47, 111, 87, 0.12)',
  },
  button: {
    minHeight: 50,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  buttonSecondary: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
  },
  buttonDisabled: {
    opacity: 0.45,
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
    ...typography.bodyStrong,
  },
  buttonTextPrimary: {
    color: palette.surface,
  },
  buttonTextSecondary: {
    color: palette.primary,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: palette.inkMuted,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  inputMultiline: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  errorText: {
    ...typography.eyebrow,
    color: palette.warning,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 26,
  },
  sectionDetail: {
    ...typography.eyebrow,
    color: palette.primary,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.surfaceSoft,
  },
  pillAccent: {
    backgroundColor: palette.primary,
  },
  pillText: {
    ...typography.eyebrow,
    color: palette.primary,
  },
  pillTextAccent: {
    color: palette.surface,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 26,
  },
  emptyBody: {
    ...typography.body,
    color: palette.inkMuted,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 28, 30, 0.22)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: '#C9CDD2',
    marginBottom: spacing.xs,
  },
  modalCard: {
    width: '100%',
    maxHeight: '88%',
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
    ...typography.title,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  modalBody: {
    gap: spacing.md,
    flexShrink: 1,
  },
  modalBodyScroll: {
    flexShrink: 1,
  },
  modalBodyScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
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
  icon: {
    fontWeight: '700',
    textAlign: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIconDome: {
    width: 12,
    height: 9,
    borderWidth: 1.5,
    borderColor: palette.primary,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  bellIconBase: {
    width: 14,
    height: 2,
    marginTop: 1,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
  },
  bellIconClapper: {
    width: 4,
    height: 4,
    marginTop: 1,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: palette.warning,
    borderWidth: 2,
    borderColor: palette.surface,
  },
  menuWrap: {
    position: 'relative',
  },
  menuTriggerButton: {
    minHeight: 44,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  menuAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
  },
  menuAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accentSoft,
  },
  menuAvatarFallbackText: {
    ...typography.eyebrow,
    color: palette.primary,
    fontWeight: '700',
  },
  menuTriggerLabel: {
    ...typography.bodyStrong,
    color: palette.primary,
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
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemLabel: {
    ...typography.bodyStrong,
  },
  actionTile: {
    minHeight: 132,
    padding: spacing.md,
    gap: spacing.md,
    flex: 1,
  },
  actionTileIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTileCopy: {
    gap: spacing.xs,
  },
  actionTileTitle: {
    ...typography.bodyStrong,
    fontSize: 18,
    lineHeight: 24,
  },
  actionTileSubtitle: {
    ...typography.eyebrow,
  },
  selectableRow: {
    minHeight: 66,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  selectableRowSelected: {
    backgroundColor: palette.accentSoft,
    borderColor: 'rgba(47, 111, 87, 0.35)',
  },
  selectableRowLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectableRowIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectableRowCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  selectableRowTitle: {
    ...typography.bodyStrong,
  },
  selectableRowDetail: {
    ...typography.eyebrow,
  },
  selectionMark: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionMarkActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
});
