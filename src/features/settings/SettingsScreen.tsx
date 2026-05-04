import React from 'react';
import {Text} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppScreen,
  DataPill,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';

export function SettingsScreen({navigation}: ScreenProps<'Settings'>) {
  const {currentUser, signOut} = useApp();

  return (
    <AppScreen
      title="Settings"
      subtitle="Account and app actions."
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <SectionHeading title="Account" />
        <Text style={typography.title}>{currentUser?.displayName ?? 'Traveler'}</Text>
        <Text style={typography.body}>{currentUser?.email ?? 'No email available'}</Text>
        <DataPill label="Signed in" tone="accent" />
      </AppCard>

      <AppCard>
        <SectionHeading title="Session" />
        <AppButton
          label="Sign out"
          icon="signout"
          variant="secondary"
          onPress={() => signOut().catch(() => undefined)}
        />
      </AppCard>
    </AppScreen>
  );
}
