import {buildActivityFeed} from '../src/features/events/activityFeed';
import type {Event, EventSummary, MemberBalance} from '../src/types/domain';

describe('buildActivityFeed', () => {
  test('builds a reverse-chronological feed from event summaries', () => {
    const event: Event = {
      id: 'event_1',
      name: 'Palawan Trip',
      description: 'Island weekend',
      currency: 'PHP',
      icon: 'beach',
      isActive: true,
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      createdBy: 'user_owner',
      createdAt: '2026-05-01T10:00:00.000Z',
      updatedAt: '2026-05-01T10:00:00.000Z',
    };

    const summary: EventSummary = {
      event,
      members: [
        {
          id: 'member_owner',
          eventId: event.id,
          userId: 'user_owner',
          displayName: 'Tina',
          role: 'owner',
          status: 'joined',
          joinedAt: '2026-05-01T10:00:00.000Z',
        },
        {
          id: 'member_guest',
          eventId: event.id,
          displayName: 'alex@example.com',
          role: 'member',
          status: 'invited',
          joinedAt: '2026-05-03T08:00:00.000Z',
        },
      ],
      expenses: [
        {
          id: 'expense_1',
          eventId: event.id,
          amount: 2400,
          currency: 'PHP',
          title: 'Villa deposit',
          paidByMemberId: 'member_owner',
          paymentSource: 'personal',
          createdBy: 'user_owner',
          createdAt: '2026-05-04T09:00:00.000Z',
          updatedAt: '2026-05-04T09:00:00.000Z',
        },
      ],
      expenseSplits: [
        {
          id: 'split_1',
          expenseId: 'expense_1',
          memberId: 'member_owner',
          splitType: 'equal',
          shareAmount: 1200,
        },
        {
          id: 'split_2',
          expenseId: 'expense_1',
          memberId: 'member_guest',
          splitType: 'equal',
          shareAmount: 1200,
        },
      ],
      invites: [],
      fund: {
        id: 'fund_1',
        eventId: event.id,
        name: 'Palawan Trip Fund',
        currency: 'PHP',
        createdAt: '2026-05-01T10:00:00.000Z',
      },
      contributions: [
        {
          id: 'contribution_1',
          fundId: 'fund_1',
          memberId: 'member_owner',
          amount: 500,
          createdAt: '2026-05-05T07:00:00.000Z',
        },
      ],
    };

    const balances: Record<string, MemberBalance[]> = {
      [event.id]: [
        {
          memberId: 'member_owner',
          displayName: 'Tina',
          paid: 2900,
          owed: 1200,
          net: 1700,
        },
      ],
    };

    const feed = buildActivityFeed(
      [event],
      {[event.id]: summary},
      balances,
    );

    expect(feed.map(entry => entry.id)).toEqual([
      'contribution:contribution_1',
      'expense:expense_1',
      'member:member_guest:invited',
      'event:event_1',
    ]);

    expect(feed[0]).toMatchObject({
      title: 'Tina added to Palawan Trip Fund',
    });
    expect(feed[1]).toMatchObject({
      title: 'Villa deposit',
    });
    expect(feed[2]).toMatchObject({
      title: 'alex@example.com was added to Palawan Trip',
    });
  });
});
