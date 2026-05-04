import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
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
  join: '⌁',
  members: '◌',
  expense: '＋',
  fund: '◍',
  balances: '⊜',
  settlement: '⇄',
  settings: '⌘',
  signout: '↗',
  person: '◦',
  invite: '⌁',
  event: '○',
  check: '✓',
  close: '✕',
  refresh: '↻',
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
        contentInsetAdjustmentBehavior="always"
        keyboardShouldPersistTaps="handled">
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
            tone={variant === 'primary' ? 'inverted' : 'accent'}
            size={15}
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
  const [rendered, setRendered] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const sheetTranslateY = useRef(new Animated.Value(visible ? 0 : 28)).current;

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 28,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        setRendered(false);
      }
    });
  }, [backdropOpacity, sheetTranslateY, visible]);

  if (!rendered) {
    return null;
  }

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Animated.View
          pointerEvents="none"
          style={[styles.modalBackdropTint, {opacity: backdropOpacity}]}
        />
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalSheet,
            {
              transform: [{translateY: sheetTranslateY}],
            },
          ]}>
          <View style={styles.modalHandle} />
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
        </Animated.View>
      </View>
    </Modal>
  );
}

export function AppToast({message}: {message: string}) {
  return (
    <View pointerEvents="none" style={styles.toast}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
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
  const color =
    tone === 'inverted'
      ? palette.surface
      : tone === 'muted'
        ? palette.inkMuted
        : tone === 'accent'
          ? palette.accent
          : palette.ink;

  return (
    <Text style={[styles.icon, {fontSize: size, color}]}>
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
      <AppIcon name={icon} tone="accent" />
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
              <AppIcon name={item.icon} tone="accent" />
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
  menuWrap: {
    position: 'relative',
  },
  menuCard: {
    position: 'absolute',
    top: 52,
    right: 0,
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
