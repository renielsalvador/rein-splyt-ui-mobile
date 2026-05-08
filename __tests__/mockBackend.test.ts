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

  test('updating the password replaces the current credential for future sign-ins', async () => {
    const backend = new MockBackend();
    await backend.initialize();
    const email = `owner-${Math.random().toString(36).slice(2, 8)}@example.com`;

    await backend.signUp({
      email,
      password: 'password123',
      displayName: 'Owner',
    });

    await backend.updatePassword('newpass456');
    await backend.signOut();

    await expect(
      backend.signIn({
        email,
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid email or password.');

    await expect(
      backend.signIn({
        email,
        password: 'newpass456',
      }),
    ).resolves.toMatchObject({
      user: {
        email,
      },
    });
  });

  test('events can be created without dates and later updated to set or clear them', async () => {
    const backend = new MockBackend();
    await backend.initialize();
    const suffix = Math.random().toString(36).slice(2, 8);

    const session = await backend.signUp({
      email: `owner-${suffix}@example.com`,
      password: 'password123',
      displayName: 'Owner',
    });

    const event = await backend.createEvent(session.user.id, {
      name: 'House bills',
      currency: 'PHP',
    });

    expect(event.startDate).toBeUndefined();
    expect(event.endDate).toBeUndefined();

    const datedEvent = await backend.updateEvent(session.user.id, {
      eventId: event.id,
      name: event.name,
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });

    expect(datedEvent.startDate).toBe('2026-05-01');
    expect(datedEvent.endDate).toBe('2026-05-31');

    const undatedEvent = await backend.updateEvent(session.user.id, {
      eventId: event.id,
      name: event.name,
      startDate: undefined,
      endDate: undefined,
    });

    expect(undatedEvent.startDate).toBeUndefined();
    expect(undatedEvent.endDate).toBeUndefined();
  });

  test('deleting an event removes dependent splits and fund contributions', async () => {
    const {backend, event, ownerSession} = await createOwnerAndEvent();
    const summary = await backend.getEventSummary(event.id);
    const ownerMember = summary.members.find(member => member.userId === ownerSession.user.id);

    await backend.addCentralFundContribution(ownerSession.user.id, {
      eventId: event.id,
      memberId: ownerMember?.id ?? '',
      amount: 250,
    });

    await backend.createExpense(ownerSession.user.id, {
      eventId: event.id,
      title: 'Utilities',
      amount: 120,
      currency: 'USD',
      paidByMemberId: ownerMember?.id ?? '',
      paymentSource: 'personal',
      participantMemberIds: [ownerMember?.id ?? ''],
    });

    const expenseIds = new Set(
      ((backend as any).state.expenses as Array<{id: string; eventId: string}>)
        .filter(item => item.eventId === event.id)
        .map(item => item.id),
    );
    const fundIds = new Set(
      ((backend as any).state.centralFunds as Array<{id: string; eventId: string}>)
        .filter(item => item.eventId === event.id)
        .map(item => item.id),
    );

    await backend.deleteEvent(ownerSession.user.id, event.id);

    await expect(backend.getEventSummary(event.id)).rejects.toThrow('Event not found.');
    expect(
      ((backend as any).state.expenseSplits as Array<{expenseId: string}>).filter(item =>
        expenseIds.has(item.expenseId),
      ),
    ).toHaveLength(0);
    expect(
      ((backend as any).state.contributions as Array<{fundId: string}>).filter(item =>
        fundIds.has(item.fundId),
      ),
    ).toHaveLength(0);
  });
});
