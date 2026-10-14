import {MockBackend} from '../src/lib/backend/mockBackend';

describe('MockBackend central fund balances', () => {
  async function createEventWithFund() {
    const backend = new MockBackend();
    await backend.initialize();
    const suffix = Math.random().toString(36).slice(2, 8);

    const ownerSession = await backend.signUp({
      email: `fund-owner-${suffix}@example.com`,
      password: 'password123',
      displayName: 'Owner',
    });

    const event = await backend.createEvent(ownerSession.user.id, {
      name: 'Kitty Trip',
      currency: 'USD',
      startDate: '2026-05-06',
      endDate: '2026-05-09',
    });

    const guest = await backend.addManualMember(event.id, 'Guest');
    const summary = await backend.getEventSummary(event.id);
    const ownerId = summary.members.find(member => member.userId === ownerSession.user.id)?.id ?? '';

    return {backend, event, ownerSession, ownerId, guestId: guest.id};
  }

  test('an unspent fund does not inflate anyone net position', async () => {
    const {backend, event, ownerSession, ownerId, guestId} = await createEventWithFund();

    await backend.addCentralFundContribution(ownerSession.user.id, {
      eventId: event.id,
      memberId: ownerId,
      amount: 600,
    });
    await backend.addCentralFundContribution(ownerSession.user.id, {
      eventId: event.id,
      memberId: guestId,
      amount: 400,
    });

    // Only 200 of the 1000 kitty is spent, leaving 800 unspent.
    await backend.createExpense(ownerSession.user.id, {
      eventId: event.id,
      title: 'Boat hire',
      amount: 200,
      currency: 'USD',
      paidByMemberId: ownerId,
      paymentSource: 'central_fund',
      participantMemberIds: [ownerId, guestId],
    });

    const balances = await backend.getBalances(event.id);
    const total = balances.reduce((sum, balance) => sum + balance.net, 0);

    expect(total).toBeCloseTo(0, 2);

    // The leftover is refunded pro rata, not split evenly: 60/40 of 800.
    expect(balances.find(balance => balance.memberId === ownerId)?.fundStake).toBeCloseTo(480, 2);
    expect(balances.find(balance => balance.memberId === guestId)?.fundStake).toBeCloseTo(320, 2);
  });

  test('a fund covering every expense leaves nobody owing anybody', async () => {
    const {backend, event, ownerSession, ownerId, guestId} = await createEventWithFund();

    await backend.addCentralFundContribution(ownerSession.user.id, {
      eventId: event.id,
      memberId: ownerId,
      amount: 500,
    });
    await backend.addCentralFundContribution(ownerSession.user.id, {
      eventId: event.id,
      memberId: guestId,
      amount: 500,
    });

    await backend.createExpense(ownerSession.user.id, {
      eventId: event.id,
      title: 'Full spend',
      amount: 1000,
      currency: 'USD',
      paidByMemberId: ownerId,
      paymentSource: 'central_fund',
      participantMemberIds: [ownerId, guestId],
    });

    const balances = await backend.getBalances(event.id);

    balances.forEach(balance => {
      expect(balance.fundStake).toBeCloseTo(0, 2);
      expect(balance.net).toBeCloseTo(0, 2);
    });
    expect(await backend.getSettlementPlan(event.id)).toEqual([]);
  });

  test('an overspent fund credits back no more than was contributed', async () => {
    const {backend, event, ownerSession, ownerId, guestId} = await createEventWithFund();

    await backend.addCentralFundContribution(ownerSession.user.id, {
      eventId: event.id,
      memberId: ownerId,
      amount: 1000,
    });

    await backend.createExpense(ownerSession.user.id, {
      eventId: event.id,
      title: 'Overspend',
      amount: 1500,
      currency: 'USD',
      paidByMemberId: ownerId,
      paymentSource: 'central_fund',
      participantMemberIds: [ownerId, guestId],
    });

    const balances = await backend.getBalances(event.id);
    const total = balances.reduce((sum, balance) => sum + balance.net, 0);

    balances.forEach(balance => expect(balance.fundStake).toBeCloseTo(0, 2));
    expect(balances.find(balance => balance.memberId === ownerId)?.net).toBeCloseTo(250, 2);
    expect(balances.find(balance => balance.memberId === guestId)?.net).toBeCloseTo(-750, 2);
    // The gap is the unfunded shortfall members still need to contribute.
    expect(total).toBeCloseTo(-500, 2);
  });
});
