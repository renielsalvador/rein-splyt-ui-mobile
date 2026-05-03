import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {palette, radii, spacing, surfaces, typography} from '../theme/tokens';

export function AppScreen({
  title,
  subtitle,
  children,
  actions,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}>) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {actions}
      </View>
      {children}
    </ScrollView>
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
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
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
      <Text
        style={[
          styles.buttonText,
          variant === 'primary' ? styles.buttonTextPrimary : styles.buttonTextSecondary,
        ]}>
        {label}
      </Text>
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
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  headerCopy: {
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
    fontSize: 32,
    lineHeight: 36,
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
});
