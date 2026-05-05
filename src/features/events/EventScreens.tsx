import React, {useEffect, useMemo, useState} from 'react';
import {Clipboard, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppIcon,
  type AppIconName,
  AppInput,
  AppMenu,
  AppModal,
  AppScreen,
  AppToast,
  DataPill,
  EmptyState,
  HeaderMenuButton,
  InlineError,
  NotificationButton,
  ScreenBackButton,
  SelectableRow,
  SectionHeading,
} from '../../components/ui';
import {eventSchema, joinSchema} from '../../lib/validation/forms';
import {formatCurrency, formatDateLabel} from '../../lib/utils/format';
import {palette, radii, spacing, typography} from '../../theme/tokens';
import type {ScreenProps} from '../../app/navigation';
import type {
  Contact,
  CurrencyCode,
  EventIconName,
  MemberBalance,
  PendingInvite,
  SettlementInstruction,
} from '../../types/domain';

const EVENT_ICON_OPTIONS: Array<{name: EventIconName; label: string}> = [
  {name: 'event', label: 'Classic'},
  {name: 'trip', label: 'Trip'},
  {name: 'plane', label: 'Flight'},
  {name: 'beach', label: 'Beach'},
  {name: 'food', label: 'Food'},
  {name: 'party', label: 'Party'},
  {name: 'work', label: 'Work'},
  {name: 'home', label: 'Home'},
  {name: 'gift', label: 'Gift'},
];

type SelectedMemberDraft =
  | {
      id: string;
      kind: 'contact';
      label: string;
      contactId: string;
      userId?: string;
    }
  | {
      id: string;
      kind: 'email_invite';
      label: string;
      email: string;
    };

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function buildSettlementInstructions(balances: MemberBalance[]): SettlementInstruction[] {
  const creditors = balances
    .filter(balance => balance.net > 0)
    .map(balance => ({...balance}));
  const debtors = balances
    .filter(balance => balance.net < 0)
    .map(balance => ({...balance, net: Math.abs(balance.net)}));
  const instructions: SettlementInstruction[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.round(Math.min(creditor.net, debtor.net) * 100) / 100;

    instructions.push({
      fromMemberId: debtor.memberId,
      fromDisplayName: debtor.displayName,
      toMemberId: creditor.memberId,
      toDisplayName: creditor.displayName,
      amount,
    });

    creditor.net = Math.round((creditor.net - amount) * 100) / 100;
    debtor.net = Math.round((debtor.net - amount) * 100) / 100;

    if (creditor.net === 0) {
      creditorIndex += 1;
    }

    if (debtor.net === 0) {
      debtorIndex += 1;
    }
  }

  return instructions;
}

function getAvatarTone(index: number) {
  const tones = [
    {backgroundColor: '#DDEDE6', textColor: palette.primary},
    {backgroundColor: '#E8F0FE', textColor: palette.blue},
    {backgroundColor: '#E8F6EE', textColor: palette.greenAccent},
  ] as const;

  return tones[index % tones.length];
}

function getAvatarChipOffsetStyle(index: number) {
  return index === 0 ? styles.avatarChipFirst : styles.avatarChipOffset;
}

function formatAmountValue(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function describeInviteDate(createdAt: string, expiresAt: string) {
  return `Received ${formatDateLabel(createdAt)} • Expires ${formatDateLabel(expiresAt)}`;
}

function getInvitePreview(pendingInvite: PendingInvite) {
  if (pendingInvite.event.description?.trim()) {
    return pendingInvite.event.description.trim();
  }

  return `${pendingInvite.invitedByUser.displayName} invited you to join ${pendingInvite.event.name}.`;
}

export function HomeScreen({navigation}: ScreenProps<'Home'>) {
  const {
    currentUser,
    events,
    signOut,
    summaries,
    hydrateEvent,
    joinEvent,
    pendingInvites,
    refreshPendingInvites,
    error,
  } = useApp();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinFormError, setJoinFormError] = useState<string>();

  useEffect(() => {
    events.forEach(event => {
      if (!summaries[event.id]) {
        hydrateEvent(event.id).catch(() => undefined);
      }
    });
  }, [events, hydrateEvent, summaries]);

  useEffect(() => {
    if (!notificationModalVisible) {
      return;
    }

    refreshPendingInvites().catch(() => undefined);
  }, [notificationModalVisible, refreshPendingInvites]);

  async function handleJoin() {
    const parsed = joinSchema.safeParse({inviteCode});

    if (!parsed.success) {
      setJoinFormError(parsed.error.issues[0]?.message);
      return;
    }

    setJoinFormError(undefined);
    const event = await joinEvent(parsed.data);
    setInviteCode('');
    setJoinModalVisible(false);
    navigation.navigate('EventDashboard', {eventId: event.id});
  }

  return (
    <>
      <AppScreen
        title={`Hi, ${currentUser?.displayName ?? 'traveler'}`}
        subtitle="Keep trips, shared spending, and settlement in one place."
        actions={
          <View style={styles.homeHeaderActions}>
            <NotificationButton
              unreadCount={pendingInvites.length}
              onPress={() => setNotificationModalVisible(true)}
            />
            <AppMenu
              items={[
                {
                  label: 'Settings',
                  icon: 'settings',
                  onPress: () => navigation.navigate('Settings'),
                },
                {
                  label: 'Sign out',
                  icon: 'signout',
                  onPress: () => signOut().catch(() => undefined),
                },
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
        }>
        <AppCard tone="accent">
          <Text style={styles.heroValue}>{events.length}</Text>
          <Text style={styles.heroLabel}>Active events in your workspace</Text>
          <View style={styles.actionRow}>
            <View style={styles.actionRowItem}>
              <AppButton
                label="Create event"
                icon="create"
                onPress={() => navigation.navigate('CreateEvent')}
              />
            </View>
            <View style={styles.actionRowItem}>
              <AppButton
                label="Join by code"
                icon="join"
                variant="secondary"
                onPress={() => {
                  setJoinFormError(undefined);
                  setJoinModalVisible(true);
                }}
              />
            </View>
          </View>
        </AppCard>

        <SectionHeading title="Your events" detail={`${events.length} total`} />
        {events.length === 0 ? (
          <EmptyState
            title="No events yet"
            body="Create a trip or join one with an invite code to start tracking shared spending."
          />
        ) : null}
        {events.map(event => {
          const summary = summaries[event.id];
          const totalSpend =
            summary?.expenses.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;

          return (
            <Pressable
              key={event.id}
              onPress={() => navigation.navigate('EventDashboard', {eventId: event.id})}
              style={({pressed}) => [pressed ? styles.pressed : null]}>
              <AppCard>
                <View style={styles.eventHeaderRow}>
                  <View style={styles.eventLeadRow}>
                    <View style={styles.eventIconBadge}>
                      <AppIcon name={event.icon} tone="accent" size={20} />
                    </View>
                  <View style={styles.eventCopy}>
                      <Text style={styles.eventName}>{event.name}</Text>
                      <Text style={styles.eventMeta}>
                        {event.description || 'Shared expense workspace'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.metricRow}>
                  <View style={styles.metricPanel}>
                    <Text style={styles.metricLabel}>Members</Text>
                    <View style={styles.avatarStackRow}>
                      {(summary?.members ?? []).slice(0, 3).map((member, index) => {
                        const tone = getAvatarTone(index);
                        return (
                          <View
                            key={member.id}
                            style={[
                              styles.avatarChip,
                              getAvatarChipOffsetStyle(index),
                              {backgroundColor: tone.backgroundColor},
                            ]}>
                            <Text style={[styles.avatarText, {color: tone.textColor}]}>
                              {member.displayName.slice(0, 1).toUpperCase()}
                            </Text>
                          </View>
                        );
                      })}
                      {(summary?.members.length ?? 0) > 3 ? (
                        <View style={styles.avatarOverflowChip}>
                          <Text style={styles.avatarOverflowText}>
                            +{(summary?.members.length ?? 0) - 3}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.metricPanel}>
                    <Text style={styles.metricLabel}>Tracked spend</Text>
                    <Text style={styles.metricText}>{formatAmountValue(totalSpend)}</Text>
                  </View>
                </View>
              </AppCard>
            </Pressable>
          );
        })}
      </AppScreen>
      <AppModal
        visible={notificationModalVisible}
        title="Notifications"
        subtitle="Unread updates and invites that need your attention."
        onClose={() => setNotificationModalVisible(false)}>
        {pendingInvites.length === 0 ? (
          <EmptyState
            title="Nothing new"
            body="Unread invites and other alerts will appear here."
          />
        ) : (
          <ScrollView contentContainerStyle={styles.notificationList}>
            {pendingInvites.map((pendingInvite: PendingInvite) => (
              <Pressable
                key={pendingInvite.invite.id}
                accessibilityRole="button"
                onPress={() => {
                  setNotificationModalVisible(false);
                  navigation.navigate('NotificationDetail', {
                    inviteId: pendingInvite.invite.id,
                  });
                }}
                style={({pressed}) => [pressed ? styles.pressed : null]}>
                <AppCard>
                  <View style={styles.notificationHeader}>
                    <View style={styles.notificationLead}>
                      <View style={styles.eventIconBadge}>
                        <AppIcon name={pendingInvite.event.icon} tone="accent" size={20} />
                      </View>
                      <View style={styles.eventCopy}>
                        <Text style={styles.eventName}>{pendingInvite.event.name}</Text>
                        <Text
                          numberOfLines={2}
                          ellipsizeMode="tail"
                          style={styles.eventMeta}>
                          {getInvitePreview(pendingInvite)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.notificationUnreadDot} />
                  </View>
                  <View style={styles.notificationFooterRow}>
                    <Text style={styles.notificationTypeLabel}>Invite request</Text>
                    <Text style={styles.notificationChevron}>›</Text>
                  </View>
                </AppCard>
              </Pressable>
            ))}
          </ScrollView>
        )}
        <InlineError message={error ?? undefined} />
      </AppModal>
      <AppModal
        visible={joinModalVisible}
        title="Join event"
        subtitle="Paste the invite code shared by the event owner."
        onClose={() => {
          setJoinModalVisible(false);
          setJoinFormError(undefined);
          setInviteCode('');
        }}>
        <AppInput
          label="Invite code"
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="ABC123"
          autoCapitalize="characters"
          autoFocus
        />
        <InlineError message={joinFormError ?? error ?? undefined} />
        <AppButton
          label="Join event"
          icon="join"
          onPress={() => handleJoin().catch(() => undefined)}
        />
      </AppModal>
    </>
  );
}

export function NotificationDetailScreen({
  navigation,
  route,
}: ScreenProps<'NotificationDetail'>) {
  const {inviteId} = route.params;
  const {pendingInvites, refreshPendingInvites, respondToInvite, error} = useApp();

  const pendingInvite = useMemo(
    () => pendingInvites.find(item => item.invite.id === inviteId),
    [inviteId, pendingInvites],
  );

  useEffect(() => {
    refreshPendingInvites().catch(() => undefined);
  }, [refreshPendingInvites]);

  return (
    <AppScreen
      title="Notification"
      subtitle="Review the update and take action if needed."
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      {!pendingInvite ? (
        <EmptyState
          title="Notification unavailable"
          body="This item may have already been handled or expired."
        />
      ) : (
        <AppCard>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationLead}>
              <View style={styles.eventIconBadge}>
                <AppIcon name={pendingInvite.event.icon} tone="accent" size={20} />
              </View>
              <View style={styles.eventCopy}>
                <Text style={styles.eventName}>{pendingInvite.event.name}</Text>
                <Text style={styles.eventMeta}>
                  {pendingInvite.invitedByUser.displayName} invited you
                </Text>
              </View>
            </View>
            <View style={styles.notificationUnreadDot} />
          </View>
          <Text style={styles.notificationTypeLabel}>Invite request</Text>
          <Text style={styles.selectedContactSummary}>{getInvitePreview(pendingInvite)}</Text>
          <Text style={styles.eventMeta}>Code {pendingInvite.invite.inviteCode}</Text>
          <Text style={styles.eventMeta}>
            {describeInviteDate(
              pendingInvite.invite.createdAt,
              pendingInvite.invite.expiresAt,
            )}
          </Text>
          <View style={styles.actionRow}>
            <View style={styles.actionRowItem}>
              <AppButton
                label="Accept invite"
                icon="check"
                onPress={() => {
                  respondToInvite({
                    inviteId: pendingInvite.invite.id,
                    action: 'accept',
                  })
                    .then(event => {
                      if (event) {
                        navigation.replace('EventDashboard', {eventId: event.id});
                      } else {
                        navigation.goBack();
                      }
                    })
                    .catch(() => undefined);
                }}
              />
            </View>
            <View style={styles.actionRowItem}>
              <AppButton
                label="Decline"
                icon="close"
                variant="secondary"
                onPress={() => {
                  respondToInvite({
                    inviteId: pendingInvite.invite.id,
                    action: 'decline',
                  })
                    .then(() => navigation.goBack())
                    .catch(() => undefined);
                }}
              />
            </View>
          </View>
        </AppCard>
      )}
      <InlineError message={error ?? undefined} />
    </AppScreen>
  );
}

export function CreateEventScreen({navigation}: ScreenProps<'CreateEvent'>) {
  const {contacts, createEvent, error} = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('PHP');
  const [icon, setIcon] = useState<EventIconName>('event');
  const [formError, setFormError] = useState<string>();
  const [iconModalVisible, setIconModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<SelectedMemberDraft[]>([]);

  const filteredContacts = useMemo(() => {
    const query = memberSearch.trim().toLowerCase();
    return contacts
      .slice()
      .sort((left, right) => left.displayName.localeCompare(right.displayName))
      .filter(contact =>
        query.length === 0 ? true : contact.displayName.toLowerCase().includes(query),
      );
  }, [contacts, memberSearch]);

  const normalizedMemberSearch = useMemo(() => normalizeEmail(memberSearch), [memberSearch]);
  const canInviteByEmail = isEmailAddress(memberSearch);
  const hasSelectedEmailInvite = useMemo(
    () =>
      selectedMembers.some(
        member => member.kind === 'email_invite' && member.email === normalizedMemberSearch,
      ),
    [normalizedMemberSearch, selectedMembers],
  );

  function toggleContact(contact: Contact) {
    const draftId = `contact:${contact.id}`;

    setSelectedMembers(current =>
      current.some(member => member.id === draftId)
        ? current.filter(member => member.id !== draftId)
        : [
            ...current,
            {
              id: draftId,
              kind: 'contact',
              label: contact.displayName,
              contactId: contact.id,
              userId: contact.userId,
            },
          ],
    );
  }

  function addEmailInvite() {
    if (!canInviteByEmail || hasSelectedEmailInvite) {
      return;
    }

    setSelectedMembers(current => [
      ...current,
      {
        id: `invite:${normalizedMemberSearch}`,
        kind: 'email_invite',
        label: normalizedMemberSearch,
        email: normalizedMemberSearch,
      },
    ]);
  }

  function removeSelectedMember(memberId: string) {
    setSelectedMembers(current => current.filter(member => member.id !== memberId));
  }

  async function handleCreate() {
    const parsed = eventSchema.safeParse({name, description, currency});

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message);
      return;
    }

    setFormError(undefined);
    const event = await createEvent({
      ...parsed.data,
      icon,
      members: selectedMembers.map(member =>
        member.kind === 'contact'
          ? {kind: 'contact' as const, displayName: member.label, userId: member.userId}
          : {kind: 'email_invite' as const, email: member.email},
      ),
    });
    navigation.replace('EventDashboard', {eventId: event.id});
  }

  return (
    <AppScreen
      title="Create event"
      subtitle="Start with a currency, a name, and a shared ledger."
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIconModalVisible(true)}
          style={({pressed}) => [
            styles.eventIconSelector,
            pressed ? styles.pressed : null,
          ]}>
          <View style={styles.eventIconSelectorBadge}>
            <AppIcon name={icon} tone="accent" size={28} />
          </View>
          <Text style={styles.eventIconSelectorTitle}>Event icon</Text>
          <Text style={styles.eventMeta}>Optional. A default icon is already set.</Text>
        </Pressable>
        <AppInput
          label="Event name"
          value={name}
          onChangeText={setName}
          placeholder="Boracay long weekend"
        />
        <AppInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Flights, villa, food, and shared activities"
          multiline
        />
        <View style={styles.memberPickerBlock}>
          <SectionHeading
            title="Add members"
            detail={
              selectedMembers.length > 0
                ? `${selectedMembers.length} pending additions`
                : 'Optional'
            }
          />
          <Text style={styles.eventMeta}>
            Search contacts or type an email address to queue an invite for this event.
          </Text>
          <AppButton
            label={
              selectedMembers.length > 0
                ? `Add members (${selectedMembers.length})`
                : 'Add members'
            }
            icon="members"
            variant="secondary"
            onPress={() => setMemberModalVisible(true)}
          />
          {selectedMembers.length > 0 ? (
            <View style={styles.selectedMemberChipRow}>
              {selectedMembers.map(member => (
                <Pressable
                  key={member.id}
                  accessibilityRole="button"
                  onPress={() => removeSelectedMember(member.id)}
                  style={({pressed}) => [
                    styles.selectedMemberChip,
                    pressed ? styles.pressed : null,
                  ]}>
                  <Text style={styles.selectedMemberChipText}>{member.label}</Text>
                  <AppIcon name="close" tone="accent" size={12} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        <View style={styles.actionRow}>
          <View style={styles.actionRowItem}>
            <AppButton
              label={`Currency: ${currency}`}
              icon={icon}
              variant="secondary"
              onPress={() => setCurrency(currency === 'USD' ? 'PHP' : 'USD')}
            />
          </View>
          <View style={styles.actionRowItem}>
            <AppButton
              label="Create event"
              icon="create"
              onPress={() => handleCreate().catch(() => undefined)}
            />
          </View>
        </View>
        <InlineError message={formError ?? error ?? undefined} />
      </AppCard>
      <AppModal
        visible={iconModalVisible}
        title="Choose an event icon"
        subtitle="Pick a visual marker for this event."
        onClose={() => setIconModalVisible(false)}>
        <View style={styles.iconGrid}>
          {EVENT_ICON_OPTIONS.map(option => (
            <Pressable
              key={option.name}
              accessibilityRole="button"
              onPress={() => {
                setIcon(option.name);
                setIconModalVisible(false);
              }}
              style={({pressed}) => [
                styles.iconOptionCard,
                icon === option.name ? styles.iconOptionCardActive : null,
                pressed ? styles.pressed : null,
              ]}>
              <AppIcon
                name={option.name as AppIconName}
                tone={icon === option.name ? 'inverted' : 'accent'}
                size={24}
              />
              <Text
                style={[
                  styles.iconOptionLabel,
                  icon === option.name ? styles.iconOptionLabelActive : null,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </AppModal>
      <AppModal
        visible={memberModalVisible}
        title="Add members"
        subtitle={`${selectedMembers.length} queued for this event`}
        onClose={() => {
          setMemberModalVisible(false);
          setMemberSearch('');
        }}>
        <AppInput
          label="Search contacts or invite email"
          value={memberSearch}
          onChangeText={setMemberSearch}
          placeholder="Search by name or type email@example.com"
          autoCapitalize="none"
          autoFocus
        />
        <View style={styles.memberModalHeader}>
          <Text style={styles.memberModalCount}>
            {selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'} queued
          </Text>
        </View>
        {canInviteByEmail && !hasSelectedEmailInvite ? (
          <SelectableRow
            label={`Invite ${normalizedMemberSearch}`}
            detail="Sends an invite they can accept or decline after signing in."
            icon="invite"
            onPress={addEmailInvite}
          />
        ) : null}
        {contacts.length === 0 && !canInviteByEmail ? (
          <EmptyState
            title="No contacts yet"
            body="Type an email address to send an invite, or build up reusable contacts from your events."
          />
        ) : filteredContacts.length === 0 && !canInviteByEmail ? (
          <EmptyState
            title="Nothing matched"
            body="Try a different name, or enter an email address to invite someone directly."
          />
        ) : (
          <ScrollView style={styles.memberList} contentContainerStyle={styles.memberListContent}>
            {filteredContacts.map(contact => (
              <SelectableRow
                key={contact.id}
                label={contact.displayName}
                detail="Registered contact"
                selected={selectedMembers.some(member => member.id === `contact:${contact.id}`)}
                onPress={() => toggleContact(contact)}
              />
            ))}
          </ScrollView>
        )}
        <AppButton
          label={`Done${selectedMembers.length > 0 ? ` (${selectedMembers.length})` : ''}`}
          icon="check"
          onPress={() => {
            setMemberModalVisible(false);
            setMemberSearch('');
          }}
        />
      </AppModal>
    </AppScreen>
  );
}

export function EventDashboardScreen({
  navigation,
  route,
}: ScreenProps<'EventDashboard'>) {
  const {eventId} = route.params;
  const {hydrateEvent, summaries, balances, currentUser} = useApp();
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const summary = summaries[eventId];
  const eventBalances = useMemo(() => balances[eventId] ?? [], [balances, eventId]);
  const event = summary?.event;

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  const totalSpend = useMemo(
    () => summary?.expenses.reduce((sum, expense) => sum + expense.amount, 0) ?? 0,
    [summary],
  );
  const fundTotal = useMemo(
    () => summary?.contributions.reduce((sum, item) => sum + item.amount, 0) ?? 0,
    [summary],
  );
  const currentMember = useMemo(
    () => summary?.members.find(member => member.userId === currentUser?.id),
    [currentUser?.id, summary],
  );
  const currentBalance = useMemo(
    () =>
      currentMember
        ? eventBalances.find(balance => balance.memberId === currentMember.id)
        : undefined,
    [currentMember, eventBalances],
  );
  const instructions = useMemo(
    () => buildSettlementInstructions(eventBalances),
    [eventBalances],
  );
  const youOwe = useMemo(
    () =>
      currentMember
        ? instructions.filter(item => item.fromMemberId === currentMember.id)
        : [],
    [currentMember, instructions],
  );
  const owesYou = useMemo(
    () =>
      currentMember
        ? instructions.filter(item => item.toMemberId === currentMember.id)
        : [],
    [currentMember, instructions],
  );

  if (!summary || !event) {
    return (
      <AppScreen
        title="Event dashboard"
        subtitle="Loading event details."
        headerVariant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState
          title="Loading event"
          body="Fetching members, expenses, balances, and fund status."
        />
      </AppScreen>
    );
  }

  const balanceLabel =
    currentBalance?.net && currentBalance.net > 0
      ? 'People owe me'
      : currentBalance?.net && currentBalance.net < 0
        ? 'I owe the group'
        : 'No payments needed right now';

  return (
    <>
      <AppScreen
        title={event.name}
        subtitle={event.description || 'Shared expense workspace'}
        headerVariant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}
        actions={
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('AddExpense', {eventId})}
            style={({pressed}) => [
              styles.headerActionButton,
              pressed ? styles.pressed : null,
            ]}>
            <AppIcon name="expense" tone="inverted" size={14} />
            <Text style={styles.headerActionText}>Add expense</Text>
          </Pressable>
        }>
        <AppCard tone="accent">
          <View style={styles.dashboardEventHeader}>
            <View style={styles.dashboardEventIcon}>
              <AppIcon name={event.icon} tone="accent" size={22} />
            </View>
            <DataPill label={event.currency} />
          </View>
          <Text style={styles.heroValue}>{formatCurrency(totalSpend, event.currency)}</Text>
          <Text style={styles.heroLabel}>Tracked event spending</Text>
          <View style={styles.dashboardMetricRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Members', {eventId})}
              style={({pressed}) => [
                styles.dashboardMetricCard,
                pressed ? styles.pressed : null,
              ]}>
              <View style={styles.metricActionRow}>
                <Text style={styles.metricLabelStrong}>Members</Text>
                <View style={styles.metricMiniButton}>
                  <AppIcon name="create" tone="accent" size={12} />
                </View>
              </View>
              <Text style={styles.metricTextLarge}>{summary.members.length}</Text>
              <View style={styles.avatarStackRow}>
                {summary.members.slice(0, 3).map((member, index) => {
                  const tone = getAvatarTone(index);
                  return (
                    <View
                      key={member.id}
                      style={[
                        styles.avatarChip,
                        getAvatarChipOffsetStyle(index),
                        {backgroundColor: tone.backgroundColor},
                      ]}>
                      <Text style={[styles.avatarText, {color: tone.textColor}]}>
                        {member.displayName.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                  );
                })}
                {summary.members.length > 3 ? (
                  <View style={styles.avatarOverflowChip}>
                    <Text style={styles.avatarOverflowText}>+{summary.members.length - 3}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('CentralFund', {eventId})}
              style={({pressed}) => [
                styles.dashboardMetricCard,
                styles.dashboardMetricCardSoft,
                pressed ? styles.pressed : null,
              ]}>
              <Text style={styles.metricLabelStrong}>Fund contributed</Text>
              <Text style={styles.metricText}>{formatCurrency(fundTotal, event.currency)}</Text>
              <Text style={styles.metricFootnote}>Tap to manage the shared fund</Text>
            </Pressable>
          </View>
        </AppCard>

        {currentBalance ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowBalanceDetails(true)}
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <AppCard>
              <View style={styles.balanceSummaryRow}>
                <View style={styles.balanceLead}>
                  <View
                    style={[
                      styles.summaryIconBubble,
                      currentBalance.net > 0
                        ? styles.summaryIconPositive
                        : currentBalance.net < 0
                          ? styles.summaryIconNegative
                          : styles.summaryIconNeutral,
                    ]}>
                    <AppIcon name="balances" tone="accent" size={16} />
                  </View>
                  <View style={styles.eventCopy}>
                    <Text style={styles.balanceTitle}>My balance</Text>
                    <Text style={styles.eventMeta}>{balanceLabel}</Text>
                  </View>
                </View>
                <View style={styles.balanceAmountWrap}>
                  <Text
                    style={[
                      styles.balanceAmount,
                      currentBalance.net > 0
                        ? styles.balanceAmountPositive
                        : currentBalance.net < 0
                          ? styles.balanceAmountNegative
                          : styles.balanceAmountNeutral,
                    ]}>
                    {formatCurrency(Math.abs(currentBalance.net), event.currency)}
                  </Text>
                  <Text style={styles.balanceHint}>Tap for details</Text>
                </View>
              </View>
            </AppCard>
          </Pressable>
        ) : null}

        <View style={styles.compactActionList}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Balances', {eventId})}
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <AppCard>
              <View style={styles.compactActionRow}>
                <View style={[styles.summaryIconBubble, styles.summaryIconBalances]}>
                  <AppIcon name="balances" tone="accent" size={16} />
                </View>
                <View style={styles.eventCopy}>
                  <Text style={styles.compactActionTitle}>Balances</Text>
                  <Text style={styles.eventMeta}>See who is up or down</Text>
                </View>
              </View>
            </AppCard>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Settlement', {eventId})}
            style={({pressed}) => [pressed ? styles.pressed : null]}>
            <AppCard>
              <View style={styles.compactActionRow}>
                <View style={[styles.summaryIconBubble, styles.summaryIconSettlement]}>
                  <AppIcon name="settlement" tone="accent" size={16} />
                </View>
                <View style={styles.eventCopy}>
                  <Text style={styles.compactActionTitle}>Settlement</Text>
                  <Text style={styles.eventMeta}>Suggested payback plan</Text>
                </View>
              </View>
            </AppCard>
          </Pressable>
        </View>

        <SectionHeading title="Recent expenses" detail={`${summary.expenses.length} total`} />
        {summary.expenses.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            body="Record the first shared purchase to start balance tracking."
          />
        ) : null}
        {summary.expenses
          .slice()
          .reverse()
          .slice(0, 4)
          .map(expense => {
            const payer = summary.members.find(member => member.id === expense.paidByMemberId);
            return (
              <Pressable
                key={expense.id}
                accessibilityRole="button"
                onPress={() => navigation.navigate('AddExpense', {eventId, expenseId: expense.id})}
                style={({pressed}) => [pressed ? styles.pressed : null]}>
                <AppCard>
                  <View style={styles.eventHeaderRow}>
                    <View style={styles.eventCopy}>
                      <Text style={styles.eventName}>{expense.title}</Text>
                      <Text style={styles.eventMeta}>
                        {payer?.displayName || 'Unknown payer'} • {formatDateLabel(expense.createdAt)}
                        {expense.updatedAt !== expense.createdAt ? ' • Edited' : ''}
                      </Text>
                    </View>
                    <DataPill label={formatCurrency(expense.amount, event.currency)} />
                  </View>
                </AppCard>
              </Pressable>
            );
          })}
      </AppScreen>
      <AppModal
        visible={showBalanceDetails}
        title="My balance"
        subtitle="See who owes you and who you still need to pay."
        onClose={() => setShowBalanceDetails(false)}>
        <View style={styles.balanceSheetSummary}>
          <Text style={styles.balanceSheetSummaryLabel}>Net position</Text>
          <Text
            style={[
              styles.balanceSheetSummaryAmount,
              currentBalance?.net && currentBalance.net > 0
                ? styles.balanceAmountPositive
                : currentBalance?.net && currentBalance.net < 0
                  ? styles.balanceAmountNegative
                  : styles.balanceAmountNeutral,
            ]}>
            {formatCurrency(Math.abs(currentBalance?.net ?? 0), event.currency)}
          </Text>
        </View>

        <View style={styles.balanceSheetSection}>
          <SectionHeading title="People who owe me" detail={`${owesYou.length}`} />
          {owesYou.length === 0 ? (
            <Text style={styles.balanceSheetEmpty}>Nobody owes you right now.</Text>
          ) : null}
          {owesYou.map(item => (
            <View key={`${item.fromMemberId}-${item.toMemberId}`} style={styles.balanceSheetRow}>
              <View style={styles.balanceSheetRowCopy}>
                <Text style={styles.balanceSheetRowTitle}>{item.fromDisplayName}</Text>
                <Text style={styles.balanceSheetRowSubtitle}>Needs to pay you</Text>
              </View>
              <Text style={styles.balanceDetailPositive}>
                {formatCurrency(item.amount, event.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.balanceSheetSection}>
          <SectionHeading title="People I owe" detail={`${youOwe.length}`} />
          {youOwe.length === 0 ? (
            <Text style={styles.balanceSheetEmpty}>You do not owe anyone right now.</Text>
          ) : null}
          {youOwe.map(item => (
            <View key={`${item.fromMemberId}-${item.toMemberId}`} style={styles.balanceSheetRow}>
              <View style={styles.balanceSheetRowCopy}>
                <Text style={styles.balanceSheetRowTitle}>{item.toDisplayName}</Text>
                <Text style={styles.balanceSheetRowSubtitle}>You need to pay</Text>
              </View>
              <Text style={styles.balanceDetailNegative}>
                {formatCurrency(item.amount, event.currency)}
              </Text>
            </View>
          ))}
        </View>
      </AppModal>
    </>
  );
}

export function MembersScreen({navigation, route}: ScreenProps<'Members'>) {
  const {eventId} = route.params;
  const {summaries, addManualMember, createInvite, error} = useApp();
  const summary = summaries[eventId];
  const [displayName, setDisplayName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const latestInvite = useMemo(
    () =>
      summary?.invites
        .slice()
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
        )[0],
    [summary],
  );

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  if (!summary) {
    return (
      <AppScreen
        title="Members"
        subtitle="Loading member roster."
        headerVariant="detail"
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <EmptyState
          title="Loading members"
          body="Fetching event roster and invite state."
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title="Members"
      subtitle="Keep registered and placeholder members in one shared roster."
      headerVariant="detail"
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}
      footerOverlay={toastMessage ? <AppToast message={toastMessage} /> : null}>
      <AppCard>
        <SectionHeading title="Add member manually" />
        <AppInput
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Bea Santos"
        />
        <AppButton
          label="Add placeholder member"
          icon="members"
          onPress={() => {
            addManualMember(eventId, displayName)
              .then(() => setDisplayName(''))
              .catch(() => undefined);
          }}
        />
      </AppCard>

      <AppCard tone="warm">
        <SectionHeading title="Event code" />
        <Text style={styles.eventMeta}>
          Generate a code for this event, then copy and share it with members.
        </Text>
        <View style={styles.inviteCodeCard}>
          <View style={styles.inviteCodeHeader}>
            <View style={styles.eventCopy}>
              <Text style={styles.inviteCodeLabel}>Current code</Text>
              <Text style={styles.inviteCodeValue}>
                {latestInvite?.inviteCode ?? 'No code generated yet'}
              </Text>
            </View>
            {latestInvite ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Generate new event code"
                onPress={() => {
                  createInvite(eventId)
                    .then(() => setToastMessage('New event code generated'))
                    .catch(() => undefined);
                }}
                style={({pressed}) => [
                  styles.refreshButton,
                  pressed ? styles.pressed : null,
                ]}>
                <AppIcon name="refresh" tone="inverted" size={16} />
              </Pressable>
            ) : null}
          </View>
          {latestInvite ? (
            <Text style={styles.eventMeta}>
              Expires {formatDateLabel(latestInvite.expiresAt)}
            </Text>
          ) : null}
        </View>
        <View style={styles.actionRow}>
          {!latestInvite ? (
            <View style={styles.actionRowItem}>
              <AppButton
                label="Generate event code"
                icon="invite"
                onPress={() => {
                  createInvite(eventId)
                    .then(() => setToastMessage('Event code generated'))
                    .catch(() => undefined);
                }}
              />
            </View>
          ) : null}
          <View style={styles.actionRowItem}>
            <AppButton
              label="Copy event code"
              icon="join"
              variant="secondary"
              disabled={!latestInvite}
              onPress={() => {
                if (!latestInvite) {
                  return;
                }

                Clipboard.setString(latestInvite.inviteCode);
                setToastMessage('Event code copied');
              }}
            />
          </View>
        </View>
        <AppButton
          label="Copy share message"
          icon="members"
          variant="secondary"
          disabled={!latestInvite}
          onPress={() => {
            if (!latestInvite) {
              return;
            }

            Clipboard.setString(
              `Join "${summary.event.name}" in ReinSplyt with code ${latestInvite.inviteCode}.`,
            );
            setToastMessage('Share message copied');
          }}
        />
        <InlineError message={error ?? undefined} />
      </AppCard>

      {summary.members.map(member => (
        <AppCard key={member.id}>
          <View style={styles.eventHeaderRow}>
            <View>
              <Text style={styles.eventName}>{member.displayName}</Text>
              <Text style={styles.eventMeta}>
                {member.role} • {member.status}
              </Text>
            </View>
            <DataPill label={member.userId ? 'Registered' : 'Placeholder'} />
          </View>
        </AppCard>
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroValue: {
    ...typography.display,
    color: palette.primary,
  },
  homeHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroLabel: {
    ...typography.body,
    color: palette.inkMuted,
  },
  headerActionButton: {
    minHeight: 40,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerActionText: {
    ...typography.eyebrow,
    color: palette.surface,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionRowItem: {
    flex: 1,
    minWidth: 148,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  eventLeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  eventIconBadge: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
  },
  eventCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eventName: {
    ...typography.title,
    fontSize: 19,
    lineHeight: 24,
  },
  eventMeta: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  eventIconSelector: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  eventIconSelectorBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surfaceSoft,
  },
  eventIconSelectorTitle: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
  memberPickerBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  selectedMemberChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedMemberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceSoft,
  },
  selectedMemberChipText: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  selectedContactSummary: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  memberModalHeader: {
    paddingVertical: spacing.xs,
  },
  memberModalCount: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
  memberList: {
    maxHeight: 320,
  },
  memberListContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOptionCard: {
    width: '31%',
    minWidth: 88,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
  },
  iconOptionCardActive: {
    backgroundColor: palette.primary,
  },
  iconOptionLabel: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  iconOptionLabelActive: {
    color: palette.surface,
  },
  metricPanel: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
  },
  metricLabel: {
    ...typography.eyebrow,
  },
  metricText: {
    ...typography.bodyStrong,
    fontSize: 16,
    color: palette.ink,
  },
  dashboardMetricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dashboardEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dashboardEventIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  dashboardMetricCard: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  dashboardMetricCardSoft: {
    backgroundColor: '#F1F7F4',
  },
  metricLabelStrong: {
    ...typography.bodyStrong,
    color: palette.inkMuted,
  },
  metricTextLarge: {
    ...typography.title,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
  },
  metricFootnote: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  metricActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricMiniButton: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  avatarChip: {
    width: 25,
    height: 25,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.surface,
  },
  avatarChipFirst: {
    marginLeft: 0,
  },
  avatarChipOffset: {
    marginLeft: -15,
  },
  avatarOverflowChip: {
    minWidth: 29,
    height: 25,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
    backgroundColor: palette.surface,
  },
  avatarText: {
    ...typography.eyebrow,
    fontWeight: '700',
  },
  avatarOverflowText: {
    ...typography.eyebrow,
    color: palette.inkMuted,
  },
  balanceSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  balanceLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  summaryIconBubble: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconPositive: {
    backgroundColor: '#E7F5EB',
  },
  summaryIconNegative: {
    backgroundColor: '#FCE8E5',
  },
  summaryIconNeutral: {
    backgroundColor: '#EFF2F4',
  },
  summaryIconBalances: {
    backgroundColor: '#E8F0FE',
  },
  summaryIconSettlement: {
    backgroundColor: '#EEF4F1',
  },
  balanceTitle: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 26,
  },
  balanceAmountWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  balanceAmount: {
    ...typography.title,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  balanceAmountPositive: {
    color: palette.success,
  },
  balanceAmountNegative: {
    color: palette.warning,
  },
  balanceAmountNeutral: {
    color: palette.inkMuted,
  },
  balanceHint: {
    ...typography.eyebrow,
  },
  compactActionList: {
    gap: spacing.sm,
  },
  compactActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  compactActionTitle: {
    ...typography.title,
    fontSize: 19,
    lineHeight: 24,
  },
  balanceSheetSummary: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceSoft,
  },
  balanceSheetSummaryLabel: {
    ...typography.eyebrow,
  },
  balanceSheetSummaryAmount: {
    ...typography.display,
    fontSize: 30,
    lineHeight: 36,
  },
  balanceSheetSection: {
    gap: spacing.sm,
  },
  balanceSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surfaceMuted,
  },
  balanceSheetRowCopy: {
    flex: 1,
    gap: 2,
  },
  balanceSheetRowTitle: {
    ...typography.bodyStrong,
  },
  balanceSheetRowSubtitle: {
    ...typography.eyebrow,
  },
  balanceSheetEmpty: {
    ...typography.body,
    color: palette.inkMuted,
  },
  balanceDetailPositive: {
    ...typography.bodyStrong,
    color: palette.success,
  },
  balanceDetailNegative: {
    ...typography.bodyStrong,
    color: palette.warning,
  },
  inviteCodeCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.xs,
  },
  inviteCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  inviteCodeLabel: {
    ...typography.eyebrow,
  },
  inviteCodeValue: {
    ...typography.title,
    letterSpacing: 1.1,
  },
  notificationList: {
    gap: spacing.sm,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  notificationLead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  notificationUnreadDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: palette.warning,
    marginTop: spacing.sm,
  },
  notificationTypeLabel: {
    ...typography.eyebrow,
    color: palette.primary,
  },
  notificationFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  notificationChevron: {
    ...typography.title,
    color: palette.inkMuted,
    lineHeight: 20,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    flexShrink: 0,
  },
  pressed: {
    opacity: 0.82,
  },
});
