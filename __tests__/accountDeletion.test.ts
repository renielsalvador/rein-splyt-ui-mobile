import {MockBackend} from '../src/lib/backend/mockBackend';

describe('MockBackend account deletion', () => {
  async function signUp(backend: MockBackend, name: string) {
    const suffix = Math.random().toString(36).slice(2, 8);
    return backend.signUp({
      email: `${name}-${suffix}@example.com`,
      password: 'password123',
      displayName: name,
    });
  }

  test('requires an authenticated caller', async () => {
    const backend = new MockBackend();
    await backend.initialize();

    await expect(backend.deleteAccount()).rejects.toThrow(
      'You must be signed in to delete your account.',
    );
  });

  test('removes events where the user is the only member', async () => {
    const backend = new MockBackend();
    await backend.initialize();
    const session = await signUp(backend, 'Solo');

    const event = await backend.createEvent(session.user.id, {
      name: 'Solo Errands',
      currency: 'PHP',
    });

    await backend.deleteAccount();

    await expect(backend.getEventSummary(event.id)).rejects.toThrow();
    expect(await backend.getSession()).toBeNull();
  });

  test('deletes the event when no other account holder remains', async () => {
    const backend = new MockBackend();
    await backend.initialize();
    const owner = await signUp(backend, 'Owner');

    const event = await backend.createEvent(owner.user.id, {
      name: 'Errands',
      currency: 'PHP',
    });
    // Manual members have no login, so nobody could reach the event afterwards.
    await backend.addManualMember(event.id, 'Guest');

    await backend.deleteAccount();

    await expect(backend.getEventSummary(event.id)).rejects.toThrow();
  });

  test('keeps shared events, promotes an owner, and preserves other balances', async () => {
    const backend = new MockBackend();
    await backend.initialize();

    const owner = await signUp(backend, 'Owner');
    const event = await backend.createEvent(owner.user.id, {
      name: 'Cebu Weekend',
      currency: 'PHP',
    });

    const invite = await backend.createInvite(event.id, owner.user.id, {
      email: 'friend@example.com',
    });
    const friend = await backend.signUp({
      email: 'friend@example.com',
      password: 'password123',
      displayName: 'Friend',
    });
    await backend.respondToInvite(friend.user.id, {
      inviteId: invite.id,
      action: 'accept',
    });

    const members = (await backend.getEventSummary(event.id)).members;
    const ownerMember = members.find(member => member.userId === owner.user.id);
    const friendMember = members.find(member => member.userId === friend.user.id);

    await backend.createExpense(friend.user.id, {
      eventId: event.id,
      title: 'Ferry tickets',
      amount: 1200,
      currency: 'PHP',
      paidByMemberId: friendMember!.id,
      paymentSource: 'personal',
      participantMemberIds: [friendMember!.id, ownerMember!.id],
    });

    const friendBefore = (await backend.getBalances(event.id)).find(
      item => item.memberId === friendMember!.id,
    );

    // The owner deletes their account; the friend must keep the event.
    await backend.signIn({email: owner.user.email, password: 'password123'});
    await backend.deleteAccount();

    const summary = await backend.getEventSummary(event.id);
    const deleted = summary.members.find(member => member.displayName === 'Deleted user');
    const survivor = summary.members.find(member => member.id === friendMember!.id);

    expect(deleted).toMatchObject({status: 'removed', role: 'member'});
    expect(deleted?.userId).toBeUndefined();
    expect(survivor?.role).toBe('owner');

    const friendAfter = (await backend.getBalances(event.id)).find(
      item => item.memberId === friendMember!.id,
    );
    expect(friendAfter?.net).toBe(friendBefore?.net);
  });

  test('signing in again with the deleted credentials fails', async () => {
    const backend = new MockBackend();
    await backend.initialize();
    const suffix = Math.random().toString(36).slice(2, 8);
    const email = `gone-${suffix}@example.com`;

    await backend.signUp({email, password: 'password123', displayName: 'Gone'});
    await backend.deleteAccount();

    await expect(backend.signIn({email, password: 'password123'})).rejects.toThrow();
  });
});
