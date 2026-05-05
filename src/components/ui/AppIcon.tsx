import React from 'react';
import {Pressable, Text, View} from 'react-native';
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
  settings: '⚙',
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
  music: '♪',
  camera: '◉',
  sports: '⚑',
  shopping: '◈',
  game: '♞',
  study: '✎',
  check: '✓',
  close: '✕',
  refresh: '↻',
  edit: '✎',
  delete: '⌫',
  mail: '✉',
  lock: '⊛',
  chevron: '›',
  chevronDown: '⌄',
  qr: '⊞',
  share: '↑',
  copy: '⎘',
  activity: '⌇',
  calendar: '◫',
  swap: '⇄',
  star: '★',
} as const;

export type AppIconName = keyof typeof iconMap;

export function AppIcon({
  name,
  size = 18,
  tone = 'default',
}: {
  name: AppIconName;
  size?: number;
  tone?: 'default' | 'muted' | 'inverted' | 'accent' | 'danger' | 'white';
}) {
  const color =
    tone === 'inverted' || tone === 'white'
      ? palette.surface
      : tone === 'muted'
        ? palette.inkMuted
        : tone === 'accent'
          ? palette.primary
          : tone === 'danger'
            ? palette.danger
            : palette.ink;

  return <Text style={[styles.icon, {fontSize: size, color}]}>{iconMap[name]}</Text>;
}

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  onWhite = false,
}: {
  icon: AppIconName;
  onPress: () => void;
  accessibilityLabel: string;
  onWhite?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({pressed}) => [
        onWhite ? styles.iconButtonOnWhite : styles.iconButton,
        pressed ? styles.buttonPressed : null,
      ]}>
      <AppIcon name={icon} tone={onWhite ? 'accent' : 'white'} size={16} />
    </Pressable>
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
      style={({pressed}) => [styles.headerBellButton, pressed ? styles.buttonPressed : null]}>
      <Text style={{fontSize: 16, color: palette.surface}}>🔔</Text>
      {unreadCount > 0 ? (
        <View style={styles.headerNotificationDot}>
          <Text style={styles.headerNotificationDotText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function HeaderMenuButton({
  onPress,
  avatarFallbackLabel,
}: {
  onPress: () => void;
  avatarUrl?: string;
  avatarFallbackLabel?: string;
  label?: string;
}) {
  const initials = avatarFallbackLabel
    ? avatarFallbackLabel
        .trim()
        .split(/\s+/)
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      onPress={onPress}
      style={({pressed}) => [styles.headerAvatarCircle, pressed ? styles.buttonPressed : null]}>
      <Text style={styles.headerAvatarText}>{initials}</Text>
    </Pressable>
  );
}

export function ScreenBackButton({onPress}: {onPress: () => void}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      style={({pressed}) => [styles.backButton, pressed ? styles.buttonPressed : null]}>
      <AppIcon name="back" tone="accent" size={20} />
    </Pressable>
  );
}
