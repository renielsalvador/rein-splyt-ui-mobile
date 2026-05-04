import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {palette, radii, spacing, surfaces, typography} from '../theme/tokens';

const iconMap = {
  back: '‹',
  menu: '⋯',
  create: '+',
  join: '#',
  members: '@',
  expense: '+',
  fund: '$',
  balances: '=',
  settlement: '⇄',
  settings: '⚙',
  signout: '↪',
  person: '•',
  invite: '⌁',
  event: '◌',
  check: '✓',
  close: '×',
} as const;

export type AppIconName = keyof typeof iconMap;

export function AppScreen({
  title,
  subtitle,
  children,
  leading,
  actions,
  headerVariant = 'main',
  footerOverlay,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  headerVariant?: 'main' | 'detail';
  footerOverlay?: React.ReactNode;
}>) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="always">
        {headerVariant === 'detail' ? (
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderRow}>
              <View style={styles.detailHeaderLeading}>{leading}</View>
              <View style={styles.detailHeaderBody}>
                <Text style={styles.detailTitle}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              <View style={styles.detailHeaderTrailing}>{actions}</View>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            {leading || actions ? (
              <View style={styles.headerActions}>
                <View style={styles.headerLeading}>{leading}</View>
                <View style={styles.headerTrailing}>{actions}</View>
              </View>
            ) : null}
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
        )}
        {children}
      </ScrollView>
      {footerOverlay ? <View style={styles.footerOverlay}>{footerOverlay}</View> : null}
    </SafeAreaView>
  );
}

export function AppCard({
  children,
  tone = 'default',
}: React.PropsWithChildren<{tone?: 'default' | 'warm' | 'accent'}>) {
  return (
    <View
      style={[
        surfaces.card,
        styles.card,
        tone === 'warm' ? styles.cardWarm : null,
        tone === 'accent' ? styles.cardAccent : null,
      ]}>
      {children}
    </View>
  );
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: AppIconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        disabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
      ]}>
      <View style={styles.buttonContent}>
        {icon ? (
          <AppIcon
            name={icon}
            tone={variant === 'primary' ? 'inverted' : 'default'}
            size={16}
          />
        ) : null}
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' ? styles.buttonTextPrimary : styles.buttonTextSecondary,
          ]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'sentences',
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.inputMultiline : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.inkMuted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        autoFocus={autoFocus}
      />
    </View>
  );
}

export function InlineError({message}: {message?: string}) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}

export function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

export function DataPill({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <View style={[styles.pill, tone === 'accent' ? styles.pillAccent : null]}>
      <Text style={[styles.pillText, tone === 'accent' ? styles.pillTextAccent : null]}>
        {label}
      </Text>
    </View>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <AppCard tone="warm">
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </AppCard>
  );
}

export function AppModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: React.PropsWithChildren<{
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
}>) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={[surfaces.card, styles.modalCard]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalCopy}>
                <Text style={styles.modalTitle}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              <IconButton
                icon="close"
                onPress={onClose}
                accessibilityLabel="Close modal"
              />
            </View>
            <View style={styles.modalBody}>{children}</View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AppIcon({
  name,
  size = 18,
  tone = 'default',
}: {
  name: AppIconName;
  size?: number;
  tone?: 'default' | 'muted' | 'inverted' | 'accent';
}) {
  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color:
            tone === 'inverted'
              ? palette.surface
              : tone === 'muted'
                ? palette.inkMuted
                : tone === 'accent'
                  ? palette.accent
                  : palette.ink,
        },
      ]}>
      {iconMap[name]}
    </Text>
  );
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
}: {
  icon: AppIconName;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({pressed}) => [styles.iconButton, pressed ? styles.buttonPressed : null]}>
      <AppIcon name={icon} />
    </Pressable>
  );
}

export function ScreenBackButton({onPress}: {onPress: () => void}) {
  return <IconButton icon="back" onPress={onPress} accessibilityLabel="Go back" />;
}

export function AppMenu({
  items,
}: {
  items: Array<{
    label: string;
    icon: AppIconName;
    onPress: () => void;
    disabled?: boolean;
  }>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.menuWrap}>
      <IconButton
        icon="menu"
        accessibilityLabel="Open menu"
        onPress={() => setOpen(current => !current)}
      />
      {open ? (
        <View style={[surfaces.card, styles.menuCard]}>
          {items.map(item => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              disabled={item.disabled}
              onPress={() => {
                setOpen(false);
                if (!item.disabled) {
                  item.onPress();
                }
              }}
              style={({pressed}) => [
                styles.menuItem,
                item.disabled ? styles.buttonDisabled : null,
                pressed ? styles.buttonPressed : null,
              ]}>
              <AppIcon name={item.icon} tone="muted" />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function ActionTile({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: AppIconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [surfaces.card, styles.actionTile, pressed ? styles.buttonPressed : null]}>
      <View style={styles.actionTileIcon}>
        <AppIcon name={icon} tone="accent" />
      </View>
      <View style={styles.actionTileCopy}>
        <Text style={styles.actionTileTitle}>{title}</Text>
        <Text style={styles.actionTileSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

export function SelectableRow({
  label,
  detail,
  icon = 'person',
  selected = false,
  onPress,
}: {
  label: string;
  detail?: string;
  icon?: AppIconName;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.selectableRow,
        selected ? styles.selectableRowSelected : null,
        pressed ? styles.buttonPressed : null,
      ]}>
      <View style={styles.selectableRowLead}>
        <View style={styles.selectableRowIcon}>
          <AppIcon name={icon} tone="accent" />
        </View>
        <View style={styles.selectableRowCopy}>
          <Text style={styles.selectableRowTitle}>{label}</Text>
          {detail ? <Text style={styles.selectableRowDetail}>{detail}</Text> : null}
        </View>
      </View>
      <View style={[styles.selectionMark, selected ? styles.selectionMarkActive : null]}>
        {selected ? <AppIcon name="check" tone="inverted" size={12} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  detailHeader: {
    gap: spacing.sm,
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
    fontSize: 32,
    lineHeight: 36,
  },
  detailTitle: {
    ...typography.title,
    fontSize: 26,
    lineHeight: 30,
  },
  footerOverlay: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    pointerEvents: 'box-none',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(12, 35, 42, 0.18)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    gap: spacing.lg,
    width: '100%',
    maxWidth: 420,
    padding: spacing.xl,
  },
  modalBody: {
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
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    ...typography.body,
    color: palette.inkMuted,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardWarm: {
    backgroundColor: palette.canvasWarm,
  },
  cardAccent: {
    backgroundColor: palette.accentSoft,
  },
  button: {
    minHeight: 48,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
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
    gap: spacing.sm,
  },
  buttonText: {
    ...typography.bodyStrong,
  },
  buttonTextPrimary: {
    color: palette.surface,
  },
  buttonTextSecondary: {
    color: palette.ink,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.bodyStrong,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  errorText: {
    ...typography.eyebrow,
    color: '#A33535',
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 24,
  },
  sectionDetail: {
    ...typography.eyebrow,
    color: palette.accent,
  },
  icon: {
    fontWeight: '700',
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.surfaceMuted,
  },
  pillAccent: {
    backgroundColor: palette.ink,
  },
  pillText: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  pillTextAccent: {
    color: palette.surface,
  },
  emptyTitle: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 24,
  },
  emptyBody: {
    ...typography.body,
    color: palette.inkMuted,
  },
  menuWrap: {
    position: 'relative',
  },
  menuCard: {
    position: 'absolute',
    top: 48,
    right: 0,
    minWidth: 176,
    padding: spacing.xs,
    gap: spacing.xs,
    zIndex: 10,
  },
  menuItem: {
    minHeight: 44,
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
    minHeight: 136,
    padding: spacing.lg,
    gap: spacing.lg,
    flex: 1,
  },
  actionTileIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
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
    lineHeight: 22,
  },
  actionTileSubtitle: {
    ...typography.eyebrow,
  },
  selectableRow: {
    minHeight: 64,
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
    borderColor: palette.accent,
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
    borderRadius: radii.md,
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
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
});
