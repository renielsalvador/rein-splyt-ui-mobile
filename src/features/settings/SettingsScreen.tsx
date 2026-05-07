import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useApp} from '../../app/AppProvider';
import {
  AppAvatar,
  AppButton,
  AppCard,
  AppIcon,
  AppInput,
  AppMenu,
  AppScreen,
  BrandLogo,
  DataPill,
  HeaderMenuButton,
  InlineError,
  NotificationButton,
  ScreenBackButton,
} from '../../components/ui';
import type {AppIconName} from '../../components/ui';
import type {ScreenProps} from '../../app/navigation';
import type {ProfileAvatarAsset} from '../../types/domain';
import {palette, radii, spacing, typography} from '../../theme/tokens';

function SectionLabel({title}: {title: string}) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function SettingsRow({
  icon,
  title,
  detail,
  onPress,
  tone = 'default',
  bordered = false,
}: {
  icon: AppIconName;
  title: string;
  detail?: string;
  onPress?: () => void;
  tone?: 'default' | 'danger';
  bordered?: boolean;
}) {
  const textTone = tone === 'danger' ? styles.rowTitleDanger : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.row,
        bordered ? styles.rowBorder : null,
        pressed ? styles.rowPressed : null,
      ]}>
      <View style={[styles.rowIconWrap, tone === 'danger' ? styles.rowIconWrapDanger : null]}>
        <AppIcon
          name={icon}
          size={16}
          tone={tone === 'danger' ? 'danger' : 'accent'}
        />
      </View>
      <Text style={[styles.rowTitle, textTone]}>{title}</Text>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      <AppIcon name="chevron" size={16} tone="muted" />
    </Pressable>
  );
}

export function SettingsScreen({
  navigation,
  hasTabBar,
  tabBarBottomInset,
}: ScreenProps<'Settings'> & {hasTabBar?: boolean; tabBarBottomInset?: number}) {
  const {currentUser, pendingInvites, signOut} = useApp();
  const unreadLabel =
    pendingInvites.length > 0 ? `${pendingInvites.length} unread` : 'None';

  return (
    <AppScreen
      variant={hasTabBar ? 'main' : 'detail'}
      hasTabBar={hasTabBar}
      tabBarBottomInset={tabBarBottomInset}
      leading={
        !hasTabBar ? <ScreenBackButton onPress={() => navigation.goBack()} /> : undefined
      }
      headerLeft={
        hasTabBar ? (
          <View style={styles.headerLeft}>
            <BrandLogo />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        ) : undefined
      }
      headerRight={
        hasTabBar ? (
          <View style={styles.headerRight}>
            <NotificationButton
              unreadCount={pendingInvites.length}
              onPress={() => {
                if (!pendingInvites[0]) {
                  return;
                }

                navigation.navigate('NotificationDetail', {
                  inviteId: pendingInvites[0].invite.id,
                });
              }}
            />
            <AppMenu
              items={[
                {label: 'Sign out', icon: 'signout', onPress: () => signOut().catch(() => undefined)},
              ]}
              renderTrigger={({toggle}) => (
                <HeaderMenuButton
                  onPress={toggle}
                  avatarUrl={currentUser?.avatarUrl}
                  avatarFallbackLabel={currentUser?.displayName}
                />
              )}
            />
          </View>
        ) : undefined
      }>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open account settings"
        onPress={() => navigation.navigate('AccountUpdate')}
        style={({pressed}) => [styles.profileCard, pressed ? styles.rowPressed : null]}>
        <AppAvatar
          name={currentUser?.displayName ?? 'Traveler'}
          uri={currentUser?.avatarUrl}
          size="lg"
          style={styles.profileAvatar}
        />
        <View style={styles.profileCopy}>
          <Text style={styles.profileName}>{currentUser?.displayName ?? 'Traveler'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email ?? 'No email on file'}</Text>
          <DataPill label="Trusted" tone="accent" />
        </View>
        <View style={styles.profileEdit}>
          <AppIcon name="edit" size={16} tone="muted" />
        </View>
      </Pressable>

      <SectionLabel title="Preferences" />
      <AppCard>
        <View style={styles.rows}>
          <SettingsRow icon="wallet" title="Default currency" detail="PHP · ₱" />
          <SettingsRow icon="bell" title="Notifications" detail={unreadLabel} bordered />
          <SettingsRow icon="sun" title="Appearance" detail="System" bordered />
        </View>
      </AppCard>

      <SectionLabel title="Splyt" />
      <AppCard>
        <View style={styles.rows}>
          <SettingsRow icon="help" title="Help & support" />
          <SettingsRow
            icon="signout"
            title="Sign out"
            tone="danger"
            bordered
            onPress={() => signOut().catch(() => undefined)}
          />
        </View>
      </AppCard>
    </AppScreen>
  );
}

export function AccountUpdateScreen({
  navigation,
}: ScreenProps<'AccountUpdate'>) {
  const {currentUser, updateProfile, error, clearError} = useApp();
  const [displayName, setDisplayName] = useState(currentUser?.displayName ?? '');
  const [avatar, setAvatar] = useState<ProfileAvatarAsset | undefined>(undefined);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState(currentUser?.avatarUrl);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string>();

  async function handleAvatarPick(source: 'camera' | 'library') {
    const result =
      source === 'camera'
        ? await launchCamera({
            mediaType: 'photo',
            cameraType: 'front',
            quality: 0.8,
          })
        : await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 1,
            quality: 0.8,
          });

    const asset = result.assets?.[0];
    if (!asset?.uri) {
      return;
    }

    setAvatar({
      uri: asset.uri,
      fileName: asset.fileName,
      type: asset.type,
    });
    setPreviewAvatarUrl(asset.uri);
    setRemoveAvatar(false);
  }

  return (
    <AppScreen
      variant="detail"
      title="Account"
      subtitle="Update how your name appears across shared expenses."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <View style={styles.accountHero}>
          <AppAvatar
            name={currentUser?.displayName ?? 'Traveler'}
            uri={previewAvatarUrl}
            size="lg"
            style={styles.accountAvatar}
          />
          <View style={styles.accountHeroCopy}>
            <Text style={styles.accountHeroTitle}>{currentUser?.displayName ?? 'Traveler'}</Text>
            <Text style={styles.accountHeroSubtitle}>{currentUser?.email ?? 'No email on file'}</Text>
          </View>
        </View>
        <View style={styles.avatarActionRow}>
          <View style={styles.avatarActionItem}>
            <AppButton
              label="Take photo"
              icon="camera"
              variant="secondary"
              onPress={() => {
                handleAvatarPick('camera').catch(() => undefined);
              }}
            />
          </View>
          <View style={styles.avatarActionItem}>
            <AppButton
              label="Upload photo"
              icon="edit"
              variant="secondary"
              onPress={() => {
                handleAvatarPick('library').catch(() => undefined);
              }}
            />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <AppInput
          label="Display name"
          value={displayName}
          onChangeText={value => {
            setDisplayName(value);
            setDisplayNameError(undefined);
            clearError();
          }}
          placeholder="Enter your display name"
          autoCapitalize="words"
          prefixIcon="person"
          errorMessage={displayNameError}
        />

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email address</Text>
          <View style={styles.staticField}>
            <Text style={styles.staticFieldText}>{currentUser?.email ?? 'No email on file'}</Text>
          </View>
          <Text style={styles.fieldHint}>Email updates are not supported in-app yet.</Text>
        </View>
      </AppCard>

      <AppButton
        label={saving ? 'Saving...' : 'Save changes'}
        disabled={saving || displayName.trim().length < 2}
        onPress={() => {
          if (displayName.trim().length < 2) {
            setDisplayNameError('Display name must be at least 2 characters.');
            return;
          }

          setDisplayNameError(undefined);
          setSaving(true);
          updateProfile({displayName, avatar, removeAvatar})
            .then(() => navigation.goBack())
            .catch(() => undefined)
            .finally(() => setSaving(false));
        }}
      />
      <InlineError message={error ?? undefined} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: palette.surface,
    fontSize: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  profileCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: palette.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  profileAvatar: {
    width: 48,
    height: 48,
  },
  profileCopy: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    ...typography.cardTitle,
    color: palette.ink,
  },
  profileEmail: {
    ...typography.body,
    color: palette.inkMuted,
  },
  profileEdit: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bgApp,
  },
  sectionLabel: {
    ...typography.caption,
    color: palette.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: -spacing.sm,
  },
  rows: {
    marginHorizontal: -spacing.md,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: palette.divider,
  },
  rowPressed: {
    opacity: 0.82,
  },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: palette.greenTintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconWrapDanger: {
    backgroundColor: '#FDEAE7',
  },
  rowTitle: {
    ...typography.bodyStrong,
    color: palette.ink,
    flex: 1,
  },
  rowTitleDanger: {
    color: palette.danger,
  },
  rowDetail: {
    ...typography.body,
    color: palette.inkMuted,
  },
  accountHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accountAvatar: {
    width: 56,
    height: 56,
  },
  avatarActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  avatarActionItem: {
    flex: 1,
  },
  accountHeroCopy: {
    flex: 1,
    gap: 2,
  },
  accountHeroTitle: {
    ...typography.sectionTitle,
    fontSize: 22,
  },
  accountHeroSubtitle: {
    ...typography.body,
    color: palette.inkMuted,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
  },
  staticField: {
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: palette.bgApp,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  staticFieldText: {
    ...typography.body,
    color: palette.ink,
  },
  fieldHint: {
    ...typography.caption,
    color: palette.inkMuted,
  },
});
