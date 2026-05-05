import React from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import {palette} from '../../theme/tokens';
import {styles} from './styles';

const iconMap = {
  back: '‹',
  menu: '☰',
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
  trip: '✦',
  plane: '✈',
  beach: '☼',
  food: '☕',
  party: '✶',
  work: '▣',
  home: '⌂',
  gift: '♡',
  check: '✓',
  close: '✕',
  refresh: '↻',
  edit: '✎',
  delete: '⌫',
} as const;

export type AppIconName = keyof typeof iconMap;

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

  return <Text style={[styles.icon, {fontSize: size, color}]}>{iconMap[name]}</Text>;
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

function BellIcon() {
  return (
    <View style={styles.bellIcon}>
      <View style={styles.bellIconDome} />
      <View style={styles.bellIconBase} />
      <View style={styles.bellIconClapper} />
    </View>
  );
}

export function NotificationButton({
  onPress,
  unreadCount = 0,
}: {
  onPress: () => void;
  unreadCount?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `Open notifications, ${unreadCount} unread`
          : 'Open notifications'
      }
      onPress={onPress}
      style={({pressed}) => [styles.iconButton, pressed ? styles.buttonPressed : null]}>
      <BellIcon />
      {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
    </Pressable>
  );
}

export function HeaderMenuButton({
  onPress,
  label = 'Menu',
  avatarUrl,
  avatarFallbackLabel,
}: {
  onPress: () => void;
  label?: string;
  avatarUrl?: string;
  avatarFallbackLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      onPress={onPress}
      style={({pressed}) => [styles.menuTriggerButton, pressed ? styles.buttonPressed : null]}>
      {avatarUrl ? (
        <Image source={{uri: avatarUrl}} style={styles.menuAvatarImage} />
      ) : (
        <View style={styles.menuAvatarFallback}>
          <Text style={styles.menuAvatarFallbackText}>
            {avatarFallbackLabel?.trim().slice(0, 1).toUpperCase() || 'U'}
          </Text>
        </View>
      )}
      <Text style={styles.menuTriggerLabel}>{label}</Text>
    </Pressable>
  );
}

export function ScreenBackButton({onPress}: {onPress: () => void}) {
  return <IconButton icon="back" onPress={onPress} accessibilityLabel="Go back" />;
}
