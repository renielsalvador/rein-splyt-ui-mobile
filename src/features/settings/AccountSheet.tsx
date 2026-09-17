import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {AppAvatar, AppIcon, AppModal} from '../../components/ui';
import type {AppIconName} from '../../components/ui';
import {radii, spacing, typeScale} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles, useTheme} from '../../theme/ThemeProvider';
import type {AppearancePreference} from '../../theme/ThemeProvider';
import type {CurrencyCode} from '../../types/domain';

const APPEARANCE_ORDER: AppearancePreference[] = ['system', 'light', 'dark'];

const CURRENCY_OPTIONS: Array<{code: CurrencyCode; label: string}> = [
  {code: 'PHP', label: 'Philippine peso · ₱'},
  {code: 'USD', label: 'US dollar · $'},
];

const CURRENCY_LABEL: Record<CurrencyCode, string> = {
  PHP: 'PHP · ₱',
  USD: 'USD · $',
};

export function AccountSheet({
  visible,
  onClose,
  onOpenProfile,
  onOpenHelp,
  onOpenNotifications,
  onOpenDeleteAccount,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenHelp?: () => void;
  onOpenNotifications?: () => void;
  onOpenDeleteAccount?: () => void;
}) {
  const {currentUser, signOut, preferences, notificationPreferences, updatePreferences} =
    useApp();
  const {preference, preferenceLabel, setPreference} = useTheme();
  const styles = useStyles(createStyles);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const enabledCategories = [
    notificationPreferences.expenses,
    notificationPreferences.settlements,
    notificationPreferences.invites,
    notificationPreferences.eventUpdates,
  ].filter(Boolean).length;

  const notificationsValue =
    enabledCategories === 0
      ? 'Off'
      : notificationPreferences.pushEnabled
        ? `Push · ${enabledCategories} of 4`
        : `In-app · ${enabledCategories} of 4`;

  function cycleAppearance() {
    const next = APPEARANCE_ORDER[(APPEARANCE_ORDER.indexOf(preference) + 1) % APPEARANCE_ORDER.length];
    setPreference(next);
  }

  return (
    <>
      <AppModal visible={visible} title="Account" onClose={onClose} scrollable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit your profile"
          onPress={onOpenProfile}
          style={({pressed}) => [styles.identity, pressed ? styles.pressed : null]}>
          <AppAvatar
            name={currentUser?.displayName ?? 'Your account'}
            uri={currentUser?.avatarUrl}
            size="lg"
          />
          <View style={styles.flex}>
            <Text style={styles.name} numberOfLines={1}>
              {currentUser?.displayName ?? 'Your account'}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {currentUser?.email}
            </Text>
          </View>
          <View style={styles.circle}>
            <AppIcon name="chevron" tone="muted" size={16} />
          </View>
        </Pressable>

        <Text style={styles.caption}>Preferences</Text>
        <View style={styles.group}>
          <SheetRow
            icon="wallet"
            title="Currency"
            value={CURRENCY_LABEL[preferences.preferredCurrency]}
            onPress={() => setCurrencyOpen(true)}
          />
          <SheetRow
            divided
            icon="bell"
            title="Notifications"
            value={notificationsValue}
            onPress={
              onOpenNotifications
                ? () => {
                    onClose();
                    onOpenNotifications();
                  }
                : undefined
            }
          />
          <SheetRow
            divided
            icon="sun"
            title="Appearance"
            value={preferenceLabel}
            onPress={cycleAppearance}
          />
        </View>

        <Text style={styles.caption}>Splyt</Text>
        <View style={styles.group}>
          <SheetRow
            icon="help"
            title="Help & support"
            chevron
            onPress={
              onOpenHelp
                ? () => {
                    onClose();
                    onOpenHelp();
                  }
                : undefined
            }
          />
          <SheetRow
            divided
            icon="signout"
            title="Sign out"
            destructive
            onPress={() => {
              onClose();
              signOut().catch(() => undefined);
            }}
          />
          <SheetRow
            divided
            icon="delete"
            title="Delete account"
            destructive
            chevron
            onPress={
              onOpenDeleteAccount
                ? () => {
                    onClose();
                    onOpenDeleteAccount();
                  }
                : undefined
            }
          />
        </View>
      </AppModal>

      <AppModal
        visible={currencyOpen}
        title="Currency"
        subtitle="Used as the default when you create a new event. Existing events keep their own."
        onClose={() => setCurrencyOpen(false)}>
        <View style={styles.group}>
          {CURRENCY_OPTIONS.map((option, index) => (
            <SheetRow
              key={option.code}
              divided={index > 0}
              icon="wallet"
              title={option.label}
              value={preferences.preferredCurrency === option.code ? 'Selected' : undefined}
              onPress={() => {
                setCurrencyOpen(false);
                updatePreferences({preferredCurrency: option.code}).catch(
                  () => undefined,
                );
              }}
            />
          ))}
        </View>
      </AppModal>
    </>
  );
}

function SheetRow({
  icon,
  title,
  value,
  chevron = false,
  destructive = false,
  divided = false,
  onPress,
}: {
  icon: AppIconName;
  title: string;
  value?: string;
  chevron?: boolean;
  destructive?: boolean;
  divided?: boolean;
  onPress?: () => void;
}) {
  const styles = useStyles(createStyles);
  const content = (
    <>
      <View style={[styles.rowIcon, destructive ? styles.rowIconDanger : null]}>
        <AppIcon name={icon} tone={destructive ? 'danger' : 'accent'} size={17} />
      </View>
      <Text style={[styles.rowTitle, destructive ? styles.rowTitleDanger : null]}>{title}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {chevron || (onPress && !value) ? <AppIcon name="chevron" tone="muted" size={16} /> : null}
    </>
  );

  return (
    <View>
      {divided ? <View style={styles.divider} /> : null}
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={value ? `${title}, ${value}` : title}
          onPress={onPress}
          style={({pressed}) => [styles.row, pressed ? styles.pressed : null]}>
          {content}
        </Pressable>
      ) : (
        <View style={styles.row}>{content}</View>
      )}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    flex: {flex: 1, minWidth: 0},
    pressed: {opacity: 0.82},
    identity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      padding: 13,
      borderRadius: radii.xl,
      backgroundColor: colors.panel,
    },
    name: {...typeScale.cardTitle, fontSize: 16.5, color: colors.ink},
    email: {...typeScale.caption, fontSize: 12.5, color: colors.inkMuted, marginTop: 2},
    circle: {
      width: 32,
      height: 32,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    caption: {
      ...typeScale.caption,
      fontSize: 12.5,
      fontWeight: '600',
      color: colors.inkMuted,
      paddingLeft: spacing.xs,
      marginTop: spacing.sm,
    },
    group: {
      borderRadius: radii.xl,
      backgroundColor: colors.panel,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      padding: 14,
      minHeight: 54,
    },
    // Inset past the 14px padding + 32px icon + 13px gap so it aligns with the row title.
    divider: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 59,
      backgroundColor: colors.hairline,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIconDanger: {backgroundColor: colors.brandSofter},
    rowTitle: {...typeScale.bodyStrong, fontSize: 15.5, color: colors.ink, flex: 1},
    rowTitleDanger: {color: colors.dangerText},
    rowValue: {...typeScale.body, fontSize: 14, color: colors.inkMuted},
  });
