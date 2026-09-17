import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppIcon,
  AppInput,
  AppScreen,
  InlineError,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import type {ScreenProps} from '../../app/navigation';
import {createTypography, radii, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';

const CONFIRM_PHRASE = 'DELETE';

const CONSEQUENCES = [
  'Your profile, contacts, preferences and sign-in are permanently removed.',
  'Events where you are the only member are deleted along with their expenses.',
  'Shared events stay with the other members, and your past shares remain in their balances so nobody\u2019s totals change.',
  'Your name is replaced with \u201cDeleted user\u201d in those shared events.',
];

export function DeleteAccountScreen({navigation}: ScreenProps<'DeleteAccount'>) {
  const styles = useStyles(createStyles);
  const {currentUser, deleteAccount, error, clearError} = useApp();
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmation.trim().toUpperCase() === CONFIRM_PHRASE;

  return (
    <AppScreen
      variant="detail"
      title="Delete account"
      subtitle="This cannot be undone."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <View style={styles.warning}>
          <AppIcon name="delete" tone="danger" size={20} />
          <Text style={styles.warningText}>
            Deleting {currentUser?.email ?? 'your account'} is permanent. We cannot recover
            it afterwards.
          </Text>
        </View>
      </AppCard>

      <AppCard>
        <SectionHeading title="What happens" />
        {CONSEQUENCES.map(item => (
          <View key={item} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <AppInput
          label={`Type ${CONFIRM_PHRASE} to confirm`}
          value={confirmation}
          onChangeText={value => {
            setConfirmation(value);
            clearError();
          }}
          placeholder={CONFIRM_PHRASE}
          autoCapitalize="characters"
        />
      </AppCard>

      <AppButton
        label="Delete my account"
        variant="destructive"
        icon="delete"
        disabled={!canDelete || deleting}
        loading={deleting}
        onPress={() => {
          setDeleting(true);
          // On success the provider clears the session, which unmounts this screen.
          deleteAccount()
            .catch(() => undefined)
            .finally(() => setDeleting(false));
        }}
      />
      <InlineError message={error ?? undefined} />
    </AppScreen>
  );
}

const createStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    warning: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    warningText: {
      ...t.body,
      color: c.ink,
      flex: 1,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: radii.sm,
      backgroundColor: c.inkMuted,
      marginTop: 8,
    },
    bulletText: {
      ...t.body,
      color: c.inkMuted,
      flex: 1,
    },
  });
};
