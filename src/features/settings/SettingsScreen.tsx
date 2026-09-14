import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {useApp} from '../../app/AppProvider';
import {
  AppAvatar,
  AppButton,
  AppCard,
  AppInput,
  AppScreen,
  InlineError,
  ScreenBackButton,
} from '../../components/ui';
import type {ScreenProps} from '../../app/navigation';
import type {ProfileAvatarAsset} from '../../types/domain';
import {createTypography, radii, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';

export function AccountUpdateScreen({
  navigation,
}: ScreenProps<'AccountUpdate'>) {
  const styles = useStyles(createStyles);
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
              variant="tint"
              onPress={() => {
                handleAvatarPick('camera').catch(() => undefined);
              }}
            />
          </View>
          <View style={styles.avatarActionItem}>
            <AppButton
              label="Upload photo"
              icon="edit"
              variant="tint"
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
        label="Save changes"
        disabled={saving || displayName.trim().length < 2}
        loading={saving}
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

const createStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    headerTitle: {
      ...t.bodyStrong,
      color: c.surface,
      fontSize: 18,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    profileCard: {
      backgroundColor: c.surface,
      borderRadius: radii.xl,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      shadowColor: c.shadow,
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
      ...t.cardTitle,
      color: c.ink,
    },
    profileEmail: {
      ...t.body,
      color: c.inkMuted,
    },
    profileEdit: {
      width: 32,
      height: 32,
      borderRadius: radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.panel,
    },
    sectionLabel: {
      ...t.caption,
      color: c.inkMuted,
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
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.hairline,
    },
    rowPressed: {
      opacity: 0.82,
    },
    rowIconWrap: {
      width: 34,
      height: 34,
      borderRadius: radii.md,
      backgroundColor: c.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowIconWrapDanger: {
      backgroundColor: c.dangerSoft,
    },
    rowTitle: {
      ...t.bodyStrong,
      color: c.ink,
      flex: 1,
    },
    rowTitleDanger: {
      color: c.dangerText,
    },
    rowDetail: {
      ...t.body,
      color: c.inkMuted,
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
      ...t.sectionTitle,
      fontSize: 22,
    },
    accountHeroSubtitle: {
      ...t.body,
      color: c.inkMuted,
    },
    field: {
      gap: spacing.sm,
    },
    fieldLabel: {
      ...t.label,
    },
    staticField: {
      minHeight: 48,
      borderRadius: radii.md,
      backgroundColor: c.panel,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
    },
    staticFieldText: {
      ...t.body,
      color: c.ink,
    },
    fieldHint: {
      ...t.caption,
      color: c.inkMuted,
    },
  });
};
