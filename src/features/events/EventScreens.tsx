import React, {useEffect, useMemo, useState} from 'react';
import {Clipboard, Pressable, ScrollView, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import type {ScreenProps} from '../../app/navigation';
import {
  AppButton,
  AppCard,
  AppIcon,
  AppInput,
  AppMenu,
  AppModal,
  AppScreen,
  AppToast,
  BrandLogo,
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
import {palette} from '../../theme/tokens';
import type {Contact, CurrencyCode, EventIconName} from '../../types/domain';
import {
  BalanceDetailsContent,
  DashboardBalanceSummaryCard,
  EventIconPicker,
  HomeEventCard,
  MemberRosterList,
  PendingInviteDetailCard,
  PendingInviteListItem,
  RecentExpenseListItem,
  SelectedMembersPreview,
} from './EventScreenComponents';
import {styles} from './EventScreenStyles';
import {
  buildSettlementInstructions,
  isEmailAddress,
  normalizeEmail,
  type SelectedMemberDraft,
} from './EventScreenShared';

export function HomeScreen({navigation, hasTabBar}: ScreenProps<'Home'> & {hasTabBar?: boolean}) {
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

  const totalSpend = useMemo(
    () =>
      events.reduce((sum, event) => {
        const summary = summaries[event.id];
        return sum + (summary?.expenses.reduce((s, e) => s + e.amount, 0) ?? 0);
      }, 0),
    [events, summaries],
  );

  const primaryCurrency = events[0]?.currency ?? 'PHP';

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

  const firstName = currentUser?.displayName?.split(' ')[0] ?? 'traveler';

  return (
    <>
      <AppScreen
        variant="main"
        hasTabBar={hasTabBar}
        headerLeft={
          <View style={styles.homeHeaderLeft}>
            <BrandLogo />
            <Text style={styles.homeHeaderUserName}>{`Hi, ${firstName}`}</Text>
          </View>
        }
        headerRight={
          <View style={styles.homeHeaderRight}>
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
                  avatarFallbackLabel={currentUser?.displayName}
                />
              )}
            />
          </View>
        }>
        <AppCard tone="accent">
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>Total tracked spend</Text>
            {events.length > 0 && (
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>
                  {events.length} event{events.length === 1 ? '' : 's'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.heroAmount}>{formatCurrency(totalSpend, primaryCurrency)}</Text>
          <Text style={styles.heroMeta}>Across all your active events</Text>
          <View style={styles.actionRow}>
            <View style={styles.actionRowItem}>
              <AppButton
                label="New event"
                icon="create"
                onPress={() => navigation.navigate('CreateEvent')}
              />
            </View>
            <View style={styles.actionRowItem}>
              <AppButton
                label="Join code"
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

        <View style={styles.statCardRow}>
          <View style={styles.statCard}>
            <View style={styles.statCardTopRow}>
              <Text style={styles.statCardLabel}>Active events</Text>
              <View style={[styles.statCardIconBadge, styles.statCardIconGreen]}>
                <AppIcon name="event" tone="inverted" size={16} />
              </View>
            </View>
            <Text style={styles.statCardValue}>{events.length}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statCardTopRow}>
              <Text style={styles.statCardLabel}>Invites</Text>
              <View style={[styles.statCardIconBadge, styles.statCardIconBlue]}>
                <AppIcon name="invite" tone="inverted" size={16} />
              </View>
            </View>
            <Text style={styles.statCardValue}>{pendingInvites.length}</Text>
          </View>
        </View>

        <SectionHeading
          title="Your events"
          detail="See all"
          onDetailPress={() => navigation.navigate('Events')}
        />
        {events.length === 0 ? (
          <EmptyState
            title="No events yet"
            body="Create a trip or join one with an invite code to start tracking shared spending."
          />
        ) : null}
        {events.slice(0, 3).map(event => {
          const summary = summaries[event.id];
          const totalEventSpend =
            summary?.expenses.reduce((sum, expense) => sum + expense.amount, 0) ?? 0;
          return (
            <HomeEventCard
              key={event.id}
              event={event}
              members={summary?.members ?? []}
              totalSpend={totalEventSpend}
              onPress={() => navigation.navigate('EventDashboard', {eventId: event.id})}
            />
          );
        })}
      </AppScreen>

      <AppModal
        visible={notificationModalVisible}
        title="Notifications"
        subtitle="Unread updates and invites that need your attention."
        scrollable
        onClose={() => setNotificationModalVisible(false)}>
        {pendingInvites.length === 0 ? (
          <EmptyState
            title="Nothing new"
            body="Unread invites and other alerts will appear here."
          />
        ) : (
          <ScrollView contentContainerStyle={styles.notificationList}>
            {pendingInvites.map(pendingInvite => (
              <PendingInviteListItem
                key={pendingInvite.invite.id}
                pendingInvite={pendingInvite}
                onPress={() => {
                  setNotificationModalVisible(false);
                  navigation.navigate('NotificationDetail', {
                    inviteId: pendingInvite.invite.id,
                  });
                }}
              />
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
      variant="detail"
      title="Notification"
      subtitle="Review the update and take action if needed."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      {!pendingInvite ? (
        <EmptyState
          title="Notification unavailable"
          body="This item may have already been handled or expired."
        />
      ) : (
        <PendingInviteDetailCard
          pendingInvite={pendingInvite}
          onAccept={() => {
            respondToInvite({inviteId: pendingInvite.invite.id, action: 'accept'})
              .then(event => {
                if (event) {
                  navigation.replace('EventDashboard', {eventId: event.id});
                } else {
                  navigation.goBack();
                }
              })
              .catch(() => undefined);
          }}
          onDecline={() => {
            respondToInvite({inviteId: pendingInvite.invite.id, action: 'decline'})
              .then(() => navigation.goBack())
              .catch(() => undefined);
          }}
        />
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
      variant="detail"
      title="Create event"
      subtitle="Start with a currency, a name, and a shared ledger."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIconModalVisible(true)}
          style={({pressed}) => [styles.eventIconSelector, pressed && styles.pressed]}>
          <View style={styles.eventIconSelectorBadge}>
            <AppIcon name={icon} tone="accent" size={28} />
          </View>
          <View style={{flex: 1, gap: 2}}>
            <Text style={styles.eventIconSelectorTitle}>Event icon</Text>
            <Text style={styles.eventMeta}>Tap to change</Text>
          </View>
          <AppIcon name="chevron" tone="muted" size={16} />
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
                ? `${selectedMembers.length} queued`
                : 'Optional'
            }
          />
          <Text style={styles.eventMeta}>
            Search contacts or type an email address to queue an invite.
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
          <SelectedMembersPreview
            selectedMembers={selectedMembers}
            onRemoveMember={removeSelectedMember}
          />
        </View>
        <View style={styles.actionRow}>
          <View style={styles.actionRowItem}>
            <AppButton
              label={`Currency: ${currency}`}
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
        scrollable
        onClose={() => setIconModalVisible(false)}>
        <EventIconPicker
          selectedIcon={icon}
          onSelect={nextIcon => {
            setIcon(nextIcon);
            setIconModalVisible(false);
          }}
        />
      </AppModal>

      <AppModal
        visible={memberModalVisible}
        title="Add members"
        subtitle={`${selectedMembers.length} queued for this event`}
        scrollable
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
                avatarLabel={contact.displayName}
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
  const {hydrateEvent, summaries, balances, currentUser, updateEvent, deleteEvent, error} =
    useApp();
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIcon, setEditIcon] = useState<EventIconName>('event');
  const [editFormError, setEditFormError] = useState<string>();
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const summary = summaries[eventId];
  const eventBalances = useMemo(() => balances[eventId] ?? [], [balances, eventId]);
  const event = summary?.event;

  useEffect(() => {
    hydrateEvent(eventId).catch(() => undefined);
  }, [eventId, hydrateEvent]);

  useEffect(() => {
    if (!event) {
      return;
    }
    setEditName(event.name);
    setEditDescription(event.description ?? '');
    setEditIcon(event.icon);
  }, [event]);

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
        variant="detail"
        title="Event dashboard"
        subtitle="Loading event details."
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
        variant="detail"
        title={event.name}
        subtitle={event.description || 'Shared expense workspace'}
        leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
        <AppCard tone="accent">
          <View style={styles.dashboardHeader}>
            <View style={styles.dashboardEventIconBadge}>
              <AppIcon name={event.icon} tone="accent" size={20} />
            </View>
            <View style={styles.dashboardStatusRow}>
              <Text style={styles.dashboardEventName} numberOfLines={1}>
                {event.name}
              </Text>
              <View style={styles.dashboardLiveBadge}>
                <Text style={styles.dashboardLiveBadgeText}>Live</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setEditFormError(undefined);
                setEditModalVisible(true);
              }}
              style={({pressed}) => [styles.dashboardEditButton, pressed && styles.pressed]}>
              <AppIcon name="edit" tone="accent" size={12} />
              <Text style={styles.dashboardEditText}>Edit</Text>
            </Pressable>
          </View>

          <Text style={styles.dashboardMemberCount}>
            {summary.members.length} member{summary.members.length === 1 ? '' : 's'}
          </Text>

          <View style={styles.dashboardMetrics}>
            <View style={styles.dashboardMetricItem}>
              <Text style={styles.dashboardMetricLabel}>Spend</Text>
              <Text style={styles.dashboardMetricValue}>
                {formatCurrency(totalSpend, event.currency)}
              </Text>
            </View>
            <View style={styles.dashboardMetricItem}>
              <Text style={styles.dashboardMetricLabel}>Fund</Text>
              <Text style={styles.dashboardMetricValue}>
                {formatCurrency(fundTotal, event.currency)}
              </Text>
            </View>
            {currentBalance ? (
              <View style={styles.dashboardMetricItem}>
                <Text style={styles.dashboardMetricLabel}>My balance</Text>
                <Text
                  style={[
                    styles.dashboardMetricValue,
                    currentBalance.net > 0
                      ? styles.dashboardMetricPositive
                      : currentBalance.net < 0
                        ? {color: palette.danger}
                        : null,
                  ]}>
                  {formatCurrency(Math.abs(currentBalance.net), event.currency)}
                </Text>
              </View>
            ) : null}
          </View>
        </AppCard>

        {currentBalance ? (
          <DashboardBalanceSummaryCard
            currentBalance={currentBalance}
            currency={event.currency}
            balanceLabel={balanceLabel}
            onPress={() => setShowBalanceDetails(true)}
          />
        ) : null}

        <View style={styles.shortcutRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('AddExpense', {eventId})}
            style={({pressed}) => [styles.shortcutItem, pressed && styles.pressed]}>
            <View style={styles.shortcutIconBubble}>
              <AppIcon name="expense" tone="accent" size={22} />
            </View>
            <Text style={styles.shortcutLabel}>Expense</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Balances', {eventId})}
            style={({pressed}) => [styles.shortcutItem, pressed && styles.pressed]}>
            <View style={styles.shortcutIconBubble}>
              <AppIcon name="balances" tone="accent" size={22} />
            </View>
            <Text style={styles.shortcutLabel}>Balances</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Settlement', {eventId})}
            style={({pressed}) => [styles.shortcutItem, pressed && styles.pressed]}>
            <View style={styles.shortcutIconBubble}>
              <AppIcon name="settlement" tone="accent" size={22} />
            </View>
            <Text style={styles.shortcutLabel}>Settle</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Members', {eventId})}
            style={({pressed}) => [styles.shortcutItem, pressed && styles.pressed]}>
            <View style={styles.shortcutIconBubble}>
              <AppIcon name="members" tone="accent" size={22} />
            </View>
            <Text style={styles.shortcutLabel}>Members</Text>
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
              <RecentExpenseListItem
                key={expense.id}
                title={expense.title}
                meta={`${payer?.displayName || 'Unknown payer'} · ${formatDateLabel(
                  expense.createdAt,
                )}${expense.updatedAt !== expense.createdAt ? ' · Edited' : ''}`}
                amountLabel={formatCurrency(expense.amount, event.currency)}
                onPress={() =>
                  navigation.navigate('AddExpense', {eventId, expenseId: expense.id})
                }
              />
            );
          })}

        <Pressable
          accessibilityRole="button"
          onPress={() => setDeleteConfirmVisible(true)}
          style={({pressed}) => [styles.deleteEventButton, pressed && styles.pressed]}>
          <AppIcon name="delete" tone="default" size={14} />
          <Text style={styles.deleteEventButtonText}>Delete event</Text>
        </Pressable>
        <InlineError message={error ?? undefined} />
      </AppScreen>

      <AppModal
        visible={editModalVisible}
        title="Edit event"
        subtitle="Update the name, description, or icon."
        scrollable
        onClose={() => {
          setEditModalVisible(false);
          setEditFormError(undefined);
        }}>
        <View style={styles.eventIconSelector}>
          <View style={styles.eventIconSelectorBadge}>
            <AppIcon name={editIcon} tone="accent" size={28} />
          </View>
          <Text style={styles.eventIconSelectorTitle}>Event icon</Text>
        </View>
        <EventIconPicker selectedIcon={editIcon} onSelect={setEditIcon} />
        <AppInput
          label="Event name"
          value={editName}
          onChangeText={setEditName}
          placeholder="Boracay long weekend"
        />
        <AppInput
          label="Description"
          value={editDescription}
          onChangeText={setEditDescription}
          placeholder="Flights, villa, food, and shared activities"
          multiline
        />
        <AppButton
          label="Save changes"
          icon="edit"
          onPress={() => {
            const parsed = eventSchema.safeParse({
              name: editName,
              description: editDescription,
              currency: event.currency,
            });
            if (!parsed.success) {
              setEditFormError(parsed.error.issues[0]?.message);
              return;
            }
            setEditFormError(undefined);
            updateEvent({
              eventId,
              name: parsed.data.name,
              description: parsed.data.description,
              icon: editIcon,
            })
              .then(() => setEditModalVisible(false))
              .catch(() => undefined);
          }}
        />
        <InlineError message={editFormError ?? error ?? undefined} />
      </AppModal>

      <AppModal
        visible={deleteConfirmVisible}
        title="Delete event"
        subtitle="This removes the event, members, invites, expenses, and fund history."
        onClose={() => setDeleteConfirmVisible(false)}>
        <Text style={styles.deleteEventConfirmText}>
          Delete {event.name}? This action cannot be undone.
        </Text>
        <View style={styles.actionRow}>
          <View style={styles.actionRowItem}>
            <AppButton
              label="Cancel"
              variant="secondary"
              onPress={() => setDeleteConfirmVisible(false)}
            />
          </View>
          <View style={styles.actionRowItem}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                deleteEvent(eventId)
                  .then(() => {
                    setDeleteConfirmVisible(false);
                    setEditModalVisible(false);
                    navigation.replace('Home');
                  })
                  .catch(() => undefined);
              }}
              style={({pressed}) => [styles.deleteConfirmButton, pressed && styles.pressed]}>
              <AppIcon name="delete" tone="inverted" size={15} />
              <Text style={styles.deleteConfirmButtonText}>Delete event</Text>
            </Pressable>
          </View>
        </View>
        <InlineError message={error ?? undefined} />
      </AppModal>

      <AppModal
        visible={showBalanceDetails}
        title="My balance"
        subtitle="See who owes you and who you still need to pay."
        scrollable
        onClose={() => setShowBalanceDetails(false)}>
        <BalanceDetailsContent
          currentBalanceNet={currentBalance?.net ?? 0}
          currency={event.currency}
          owesYou={owesYou}
          youOwe={youOwe}
        />
      </AppModal>
    </>
  );
}

export function MembersScreen({navigation, route}: ScreenProps<'Members'>) {
  const {eventId} = route.params;
  const {summaries, addManualMember, createInvite, currentUser, error} = useApp();
  const summary = summaries[eventId];
  const [displayName, setDisplayName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [memberFormError, setMemberFormError] = useState<string>();
  const [inviteFormError, setInviteFormError] = useState<string>();
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
  const memberRows = useMemo(() => {
    if (!summary) {
      return [];
    }
    const pendingInviteRows = summary.invites
      .filter(invite => invite.status === 'pending' && !!invite.invitedEmail)
      .map(invite => ({
        id: `invite:${invite.id}`,
        displayName: invite.invitedEmail as string,
        email: invite.invitedEmail,
        joinedLabel: `Invited ${formatDateLabel(invite.createdAt)}`,
        statusLabel: 'Pending' as const,
      }));
    const joinedMemberRows = summary.members.map(member => ({
      id: member.id,
      displayName: member.displayName,
      email:
        currentUser && member.userId === currentUser.id ? currentUser.email : undefined,
      joinedLabel:
        member.status === 'joined'
          ? `Joined ${formatDateLabel(member.joinedAt)}`
          : `Added ${formatDateLabel(member.joinedAt)}`,
      statusLabel: member.status === 'joined' ? ('Joined' as const) : ('Pending' as const),
    }));
    return [...joinedMemberRows, ...pendingInviteRows];
  }, [currentUser, summary]);

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
        variant="detail"
        title="Members"
        subtitle="Loading member roster."
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
      variant="detail"
      title="Members"
      subtitle="Registered and placeholder members in one shared roster."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}
      footerOverlay={toastMessage ? <AppToast message={toastMessage} /> : null}>
      <AppCard tone="accent">
        <View style={styles.memberCodeHeader}>
          <SectionHeading title="Event code" />
          {latestInvite ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Generate new event code"
              onPress={() => {
                createInvite(eventId)
                  .then(() => setToastMessage('New event code generated'))
                  .catch(() => undefined);
              }}
              style={({pressed}) => [styles.refreshButtonLight, pressed && styles.pressed]}>
              <AppIcon name="refresh" tone="accent" size={15} />
            </Pressable>
          ) : null}
        </View>
        {latestInvite ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Clipboard.setString(latestInvite.inviteCode);
              setToastMessage('Event code copied');
            }}
            style={({pressed}) => [styles.inviteCodeDisplay, pressed && styles.pressed]}>
            <Text style={styles.inviteCodeLabel}>Event code</Text>
            <Text style={styles.inviteCodeValue}>{latestInvite.inviteCode}</Text>
            <Text style={styles.inviteCodeExpiry}>
              Tap to copy · Expires {formatDateLabel(latestInvite.expiresAt)}
            </Text>
          </Pressable>
        ) : (
          <AppButton
            label="Generate event code"
            icon="invite"
            onPress={() => {
              createInvite(eventId)
                .then(() => setToastMessage('Event code generated'))
                .catch(() => undefined);
            }}
          />
        )}
        <InlineError message={error ?? undefined} />
      </AppCard>

      <AppCard>
        <SectionHeading title="Add member manually" />
        <AppInput
          label="Display name"
          value={displayName}
          onChangeText={value => {
            setDisplayName(value);
            setMemberFormError(undefined);
          }}
          placeholder="Bea Santos"
        />
        <AppButton
          label="Add placeholder member"
          icon="members"
          onPress={() => {
            if (displayName.trim().length < 2) {
              setMemberFormError('Enter a display name.');
              return;
            }
            addManualMember(eventId, displayName)
              .then(() => {
                setDisplayName('');
                setMemberFormError(undefined);
              })
              .catch(() => undefined);
          }}
        />
        <InlineError message={memberFormError ?? undefined} />
      </AppCard>

      <AppCard>
        <SectionHeading title="Invite by email" />
        <AppInput
          label="Email address"
          value={inviteEmail}
          onChangeText={value => {
            setInviteEmail(value);
            setInviteFormError(undefined);
          }}
          placeholder="email@example.com"
          autoCapitalize="none"
        />
        <AppButton
          label="Send invite"
          icon="invite"
          onPress={() => {
            const normalizedEmail = normalizeEmail(inviteEmail);
            if (!isEmailAddress(normalizedEmail)) {
              setInviteFormError('Enter a valid email.');
              return;
            }
            createInvite(eventId, {email: normalizedEmail})
              .then(() => {
                setInviteEmail('');
                setInviteFormError(undefined);
                setToastMessage('Invite sent');
              })
              .catch(() => undefined);
          }}
        />
        <InlineError message={inviteFormError ?? undefined} />
      </AppCard>

      <SectionHeading title="Member list" detail={`${memberRows.length} total`} />
      <MemberRosterList members={memberRows} />
      <InlineError message={error ?? undefined} />
    </AppScreen>
  );
}
