import React from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {getInitials} from './AppAvatar';
import {useTheme} from '../../theme/ThemeProvider';
import {useAppStyles} from './styles';

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

/** Brings the 34-36pt circular controls up to the 44pt minimum target. */
export const ICON_BUTTON_HIT_SLOP = {top: 8, bottom: 8, left: 8, right: 8};

export function AppIcon({
  name,
  size = 18,
  tone = 'default',
}: {
  name: AppIconName;
  size?: number;
  tone?: 'default' | 'muted' | 'inverted' | 'accent' | 'danger' | 'white';
}) {
  const {colors: c} = useTheme();
  const color =
    tone === 'white'
      ? c.onBrand
      : tone === 'inverted'
        ? c.surface
        : tone === 'muted'
          ? c.inkMuted
          : tone === 'accent'
            ? c.brand
            : tone === 'danger'
              ? c.danger
              : c.ink;

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
  const styles = useAppStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={ICON_BUTTON_HIT_SLOP}
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
  const styles = useAppStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0
          ? `Open notifications, ${unreadCount} unread`
          : 'Open notifications'
      }
      onPress={onPress}
      hitSlop={ICON_BUTTON_HIT_SLOP}
      style={({pressed}) => [styles.headerBellButton, pressed ? styles.buttonPressed : null]}>
      <AppIcon name="bell" tone="white" size={18} />
      {unreadCount > 0 ? (
        <View style={styles.headerNotificationDot}>
          <Text style={styles.headerNotificationDotText} maxFontSizeMultiplier={1.3}>
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
  const styles = useAppStyles();
  const initials = avatarFallbackLabel ? getInitials(avatarFallbackLabel) : 'U';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      onPress={onPress}
      hitSlop={ICON_BUTTON_HIT_SLOP}
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
  const styles = useAppStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={ICON_BUTTON_HIT_SLOP}
      style={({pressed}) => [styles.backButton, pressed ? styles.buttonPressed : null]}>
      <AppIcon name="back" tone="accent" size={20} />
    </Pressable>
  );
}
