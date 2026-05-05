import {MockBackend} from '../src/lib/backend/mockBackend';

describe('MockBackend invited members', () => {
  async function createOwnerAndEvent() {
    const backend = new MockBackend();
    await backend.initialize();
    const suffix = Math.random().toString(36).slice(2, 8);

    const ownerSession = await backend.signUp({
      email: `owner-${suffix}@example.com`,
      password: 'password123',
      displayName: 'Owner',
    });

    const event = await backend.createEvent(ownerSession.user.id, {
      name: 'Beach Trip',
      currency: 'USD',
      startDate: '2026-05-06',
      endDate: '2026-05-09',
    });

    return {backend, event, ownerSession};
  }

  test('email invites create placeholder participants that can be split into balances', async () => {
    const {backend, event, ownerSession} = await createOwnerAndEvent();
    const guestEmail = `guest-${Math.random().toString(36).slice(2, 8)}@example.com`;

    await backend.createInvite(event.id, ownerSession.user.id, {
      email: guestEmail,
    });

    const summary = await backend.getEventSummary(event.id);
    const ownerMember = summary.members.find(member => member.userId === ownerSession.user.id);
    const invitedMember = summary.members.find(
      member => member.displayName === guestEmail,
    );

    expect(invitedMember).toMatchObject({
      displayName: guestEmail,
      status: 'invited',
    });

    await backend.createExpense(ownerSession.user.id, {
      eventId: event.id,
      title: 'Villa deposit',
      amount: 120,
      currency: 'USD',
      paidByMemberId: ownerMember?.id ?? '',
      paymentSource: 'personal',
      participantMemberIds: [ownerMember?.id ?? '', invitedMember?.id ?? ''],
    });

    const balances = await backend.getBalances(event.id);
    const guestBalance = balances.find(balance => balance.memberId === invitedMember?.id);

    expect(guestBalance?.owed).toBe(60);
    expect(guestBalance?.net).toBe(-60);
  });

  test('accepting an invite promotes the placeholder member instead of duplicating it', async () => {
    const {backend, event, ownerSession} = await createOwnerAndEvent();
    const guestEmail = `guest-${Math.random().toString(36).slice(2, 8)}@example.com`;
    const guestSession = await backend.signUp({
      email: guestEmail,
      password: 'password123',
      displayName: 'Guest',
    });

    await backend.signOut();
    await backend.signIn({
      email: ownerSession.user.email,
      password: 'password123',
    });

    const invite = await backend.createInvite(event.id, ownerSession.user.id, {
      userId: guestSession.user.id,
    });

    const invitedSummary = await backend.getEventSummary(event.id);
    const placeholder = invitedSummary.members.find(
      member => member.userId === guestSession.user.id,
    );

    expect(placeholder?.status).toBe('invited');

    await backend.respondToInvite(guestSession.user.id, {
      inviteId: invite.id,
      action: 'accept',
    });

    const joinedSummary = await backend.getEventSummary(event.id);
    const guestMembers = joinedSummary.members.filter(
      member => member.userId === guestSession.user.id,
    );

    expect(guestMembers).toHaveLength(1);
    expect(guestMembers[0]).toMatchObject({
      displayName: 'Guest',
      status: 'joined',
    });
  });

  test('joining by invite code reuses the existing placeholder member', async () => {
    const {backend, event, ownerSession} = await createOwnerAndEvent();
    const guestEmail = `guest-${Math.random().toString(36).slice(2, 8)}@example.com`;

    const invite = await backend.createInvite(event.id, ownerSession.user.id, {
      email: guestEmail,
    });

    const guestSession = await backend.signUp({
      email: guestEmail,
      password: 'password123',
      displayName: 'Guest',
    });

    await backend.joinEvent(guestSession.user.id, {
      inviteCode: invite.inviteCode,
    });

    const summary = await backend.getEventSummary(event.id);
    const guestMembers = summary.members.filter(
      member => member.userId === guestSession.user.id || member.displayName === 'Guest',
    );

    expect(guestMembers).toHaveLength(1);
    expect(guestMembers[0]).toMatchObject({
      displayName: 'Guest',
      status: 'joined',
    });
  });
});
