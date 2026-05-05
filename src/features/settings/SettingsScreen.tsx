import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppMenu,
  AppScreen,
  DataPill,
  HeaderMenuButton,
  NotificationButton,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {palette, spacing, typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';

export function SettingsScreen({
  navigation,
  hasTabBar,
}: ScreenProps<'Settings'> & {hasTabBar?: boolean}) {
  const {currentUser, pendingInvites, signOut} = useApp();

  return (
    <AppScreen
      variant={hasTabBar ? 'main' : 'detail'}
      title="Settings"
      subtitle="Account and app preferences."
      hasTabBar={hasTabBar}
      leading={
        !hasTabBar ? <ScreenBackButton onPress={() => navigation.goBack()} /> : undefined
      }
      headerLeft={
        hasTabBar ? (
          <View style={styles.headerLeft}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        ) : undefined
      }
      headerRight={
        hasTabBar ? (
          <View style={styles.headerRight}>
            <NotificationButton
              unreadCount={pendingInvites.length}
              onPress={() =>
                navigation.navigate('NotificationDetail', {
                  inviteId: pendingInvites[0]?.invite.id ?? '',
                })
              }
            />
            <AppMenu
              items={[
                {label: 'Sign out', icon: 'signout', onPress: () => signOut().catch(() => undefined)},
              ]}
              renderTrigger={({toggle}) => (
                <HeaderMenuButton
                  onPress={toggle}
                  avatarFallbackLabel={currentUser?.displayName}
                />
              )}
            />
          </View>
        ) : undefined
      }>
      <AppCard>
        <SectionHeading title="Account" />
        <Text style={styles.name}>{currentUser?.displayName ?? 'Traveler'}</Text>
        <Text style={styles.email}>{currentUser?.email ?? 'No email on file'}</Text>
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

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    ...typography.bodyStrong,
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerTitle: {
    ...typography.bodyStrong,
    color: '#FFFFFF',
    fontSize: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.cardTitle,
    color: palette.ink,
  },
  email: {
    ...typography.body,
    color: palette.inkMuted,
  },
});
