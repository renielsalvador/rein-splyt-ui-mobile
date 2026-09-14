import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppCard,
  AppScreen,
  AppToast,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {getPushProvider} from '../../lib/notifications/pushProvider';
import {createTypography, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles, useTheme} from '../../theme/ThemeProvider';
import type {ScreenProps} from '../../app/navigation';
import type {NotificationPreferences} from '../../types/domain';

type ToggleKey = keyof NotificationPreferences;

const CATEGORIES: Array<{key: ToggleKey; title: string; body: string}> = [
  {
    key: 'expenses',
    title: 'New expenses',
    body: 'When someone logs a shared expense.',
  },
  {
    key: 'settlements',
    title: 'Payments',
    body: 'When someone records a payment that affects your balance.',
  },
  {
    key: 'invites',
    title: 'Invites',
    body: 'When you are invited to a new event.',
  },
  {
    key: 'eventUpdates',
    title: 'Event updates',
    body: 'When event details or members change.',
  },
];

export function NotificationSettingsScreen({
  navigation,
}: ScreenProps<'NotificationSettings'>) {
  const styles = useStyles(createStyles);
  const {colors} = useTheme();
  const {notificationPreferences, updateNotificationPreferences} = useApp();
  const [toast, setToast] = useState<string | null>(null);
  const pushSupported = getPushProvider().isSupported();

  async function toggle(key: ToggleKey, value: boolean) {
    try {
      await updateNotificationPreferences({[key]: value});
    } catch {
      setToast('Could not save that setting.');
    }
  }

  return (
    <AppScreen
      variant="detail"
      title="Notifications"
      subtitle="Choose what Splyt tells you about."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <SectionHeading title="Push notifications" />
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.rowTitle}>Send to this device</Text>
            <Text style={styles.rowBody}>
              {pushSupported
                ? 'Deliver the categories below to your lock screen.'
                : 'Push delivery is not set up in this build yet. The choices below still control what you see inside Splyt.'}
            </Text>
          </View>
          <Switch
            value={notificationPreferences.pushEnabled}
            disabled={!pushSupported}
            onValueChange={value => toggle('pushEnabled', value)}
            trackColor={{true: colors.brand, false: colors.hairline}}
          />
        </View>
      </AppCard>

      <AppCard>
        <SectionHeading title="Tell me about" />
        {CATEGORIES.map((category, index) => (
          <View
            key={category.key}
            style={[styles.row, index > 0 ? styles.rowDivided : null]}>
            <View style={styles.copy}>
              <Text style={styles.rowTitle}>{category.title}</Text>
              <Text style={styles.rowBody}>{category.body}</Text>
            </View>
            <Switch
              value={notificationPreferences[category.key]}
              onValueChange={value => toggle(category.key, value)}
              trackColor={{true: colors.brand, false: colors.hairline}}
            />
          </View>
        ))}
      </AppCard>

      {toast ? <AppToast message={toast} /> : null}
    </AppScreen>
  );
}

const createStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    rowDivided: {
      paddingTop: spacing.md,
      marginTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.hairline,
    },
    copy: {
      flex: 1,
      gap: 2,
    },
    rowTitle: {
      ...t.bodyStrong,
    },
    rowBody: {
      ...t.caption,
      color: c.inkMuted,
    },
  });
};
