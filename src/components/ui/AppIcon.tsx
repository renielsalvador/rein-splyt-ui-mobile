import React from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {palette} from '../../theme/tokens';
import {styles} from './styles';

const iconMap = {
  back: 'chevron-left',
  menu: 'menu',
  create: 'plus',
  join: 'account-plus-outline',
  members: 'account-multiple-outline',
  expense: 'receipt',
  fund: 'safe-square-outline',
  balances: 'scale-balance',
  settlement: 'swap-horizontal',
  settings: 'cog-outline',
  wallet: 'wallet-outline',
  bell: 'bell-outline',
  sun: 'white-balance-sunny',
  shield: 'shield-check-outline',
  link: 'link-variant',
  help: 'help-circle-outline',
  signout: 'logout',
  person: 'account-outline',
  invite: 'email-fast-outline',
  event: 'calendar-star',
  trip: 'bag-suitcase-outline',
  plane: 'airplane',
  beach: 'palm-tree',
  food: 'silverware-fork-knife',
  party: 'party-popper',
  work: 'briefcase-outline',
  home: 'home-outline',
  gift: 'gift-outline',
  music: 'music-note-outline',
  camera: 'camera-outline',
  sports: 'basketball',
  shopping: 'shopping-outline',
  game: 'gamepad-variant-outline',
  study: 'book-open-page-variant-outline',
  check: 'check',
  close: 'close',
  refresh: 'refresh',
  edit: 'pencil-outline',
  delete: 'trash-can-outline',
  mail: 'email-outline',
  lock: 'lock-outline',
  chevron: 'chevron-right',
  chevronDown: 'chevron-down',
  qr: 'qrcode',
  share: 'share-variant-outline',
  copy: 'content-copy',
  activity: 'chart-timeline-variant',
  calendar: 'calendar-range-outline',
  swap: 'swap-horizontal',
  star: 'star-outline',
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

  return <MaterialCommunityIcons name={iconMap[name]} size={size} color={color} />;
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
      <AppIcon name="bell" tone="white" size={18} />
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
  avatarUrl,
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
      {avatarUrl ? (
        <Image
          source={{uri: avatarUrl}}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 999,
          }}
        />
      ) : (
        <Text style={styles.headerAvatarText}>{initials}</Text>
      )}
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
