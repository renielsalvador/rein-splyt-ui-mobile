import React, {useEffect} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {AppModal, EmptyState, InlineError} from '../../components/ui';
import {spacing} from '../../theme/tokens';
import {PendingInviteListItem} from './EventScreenComponents';

/** One notifications surface for every screen, so the bell means the same thing everywhere. */
export function NotificationsSheet({
  visible,
  onClose,
  onOpenInvite,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenInvite: (inviteId: string) => void;
}) {
  const {pendingInvites, refreshPendingInvites, error} = useApp();

  useEffect(() => {
    if (!visible) {
      return;
    }
    refreshPendingInvites().catch(() => undefined);
  }, [refreshPendingInvites, visible]);

  return (
    <AppModal
      visible={visible}
      title="Notifications"
      subtitle="Updates and invites that need your attention."
      scrollable
      onClose={onClose}>
      {pendingInvites.length === 0 ? (
        <EmptyState title="Nothing new" body="Unread invites and other alerts will appear here." />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {pendingInvites.map(pendingInvite => (
            <PendingInviteListItem
              key={pendingInvite.invite.id}
              pendingInvite={pendingInvite}
              onPress={() => {
                onClose();
                onOpenInvite(pendingInvite.invite.id);
              }}
            />
          ))}
        </ScrollView>
      )}
      <InlineError message={error ?? undefined} />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  list: {gap: spacing.sm},
});
