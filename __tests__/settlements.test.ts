import {MockBackend} from '../src/lib/backend/mockBackend';

describe('MockBackend settlements', () => {
  async function createEventWithDebt() {
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

    const guest = await backend.addManualMember(event.id, 'Guest');
    const summary = await backend.getEventSummary(event.id);
    const owner = summary.members.find(member => member.userId === ownerSession.user.id);

    // Owner fronts 1000 split evenly, leaving the guest owing 500.
    await backend.createExpense(ownerSession.user.id, {
      eventId: event.id,
      title: 'Villa deposit',
      amount: 1000,
      currency: 'USD',
      paidByMemberId: owner?.id ?? '',
      paymentSource: 'personal',
      participantMemberIds: [owner?.id ?? '', guest.id],
    });

    return {backend, event, ownerSession, ownerId: owner?.id ?? '', guestId: guest.id};
  }

  test('a partial payment shrinks the outstanding plan', async () => {
    const {backend, event, ownerSession, ownerId, guestId} = await createEventWithDebt();

    const before = await backend.getSettlementPlan(event.id);
    expect(before).toHaveLength(1);
    expect(before[0]).toMatchObject({
      fromMemberId: guestId,
      toMemberId: ownerId,
      amount: 500,
    });

    await backend.recordSettlement(ownerSession.user.id, {
      eventId: event.id,
      fromMemberId: guestId,
      toMemberId: ownerId,
      amount: 200,
    });

    const after = await backend.getSettlementPlan(event.id);
    expect(after).toHaveLength(1);
    expect(after[0].amount).toBe(300);

    const balances = await backend.getBalances(event.id);
    const guestBalance = balances.find(balance => balance.memberId === guestId);
    const ownerBalance = balances.find(balance => balance.memberId === ownerId);

    expect(guestBalance).toMatchObject({settledOut: 200, settledIn: 0, net: -300});
    expect(ownerBalance).toMatchObject({settledOut: 0, settledIn: 200, net: 300});
  });

  test('settling the remainder clears every balance', async () => {
    const {backend, event, ownerSession, ownerId, guestId} = await createEventWithDebt();

    await backend.recordSettlement(ownerSession.user.id, {
      eventId: event.id,
      fromMemberId: guestId,
      toMemberId: ownerId,
      amount: 200,
    });
    await backend.recordSettlement(ownerSession.user.id, {
      eventId: event.id,
      fromMemberId: guestId,
      toMemberId: ownerId,
      amount: 300,
    });

    expect(await backend.getSettlementPlan(event.id)).toEqual([]);

    const balances = await backend.getBalances(event.id);
    balances.forEach(balance => expect(balance.net).toBe(0));
  });

  test('rejects an amount above what is outstanding', async () => {
    const {backend, event, ownerSession, ownerId, guestId} = await createEventWithDebt();

    await expect(
      backend.recordSettlement(ownerSession.user.id, {
        eventId: event.id,
        fromMemberId: guestId,
        toMemberId: ownerId,
        amount: 600,
      }),
    ).rejects.toThrow(/exceeds/i);

    expect(await backend.listSettlements(event.id)).toHaveLength(0);
  });

  test('rejects a payment in the wrong direction', async () => {
    const {backend, event, ownerSession, ownerId, guestId} = await createEventWithDebt();

    await expect(
      backend.recordSettlement(ownerSession.user.id, {
        eventId: event.id,
        fromMemberId: ownerId,
        toMemberId: guestId,
        amount: 100,
      }),
    ).rejects.toThrow(/nothing outstanding/i);
  });

  test('recorded payments surface in the event summary', async () => {
    const {backend, event, ownerSession, ownerId, guestId} = await createEventWithDebt();

    await backend.recordSettlement(ownerSession.user.id, {
      eventId: event.id,
      fromMemberId: guestId,
      toMemberId: ownerId,
      amount: 500,
      note: 'Paid in cash',
    });

    const summary = await backend.getEventSummary(event.id);

    expect(summary.settlements).toHaveLength(1);
    expect(summary.settlements[0]).toMatchObject({
      fromDisplayName: 'Guest',
      toDisplayName: 'Owner',
      amount: 500,
      currency: 'USD',
      note: 'Paid in cash',
      recordedBy: ownerSession.user.id,
    });
  });
});
