import {buildBalanceBreakdown} from '../src/features/balances/balanceBreakdown';
import type {Expense, ExpenseSplit, EventMember, Settlement} from '../src/types/domain';

const members: EventMember[] = [
  {
    id: 'me',
    eventId: 'event_1',
    displayName: 'Ren',
    role: 'owner',
    status: 'joined',
    joinedAt: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'them',
    eventId: 'event_1',
    displayName: 'Kim',
    role: 'member',
    status: 'joined',
    joinedAt: '2026-05-01T00:00:00.000Z',
  },
];

function buildExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 'expense_1',
    eventId: 'event_1',
    title: 'Dinner',
    amount: 1000,
    currency: 'PHP',
    paidByMemberId: 'me',
    paymentSource: 'personal',
    createdBy: 'user_1',
    createdAt: '2026-05-02T00:00:00.000Z',
    updatedAt: '2026-05-02T00:00:00.000Z',
    ...overrides,
  };
}

function buildSplit(overrides: Partial<ExpenseSplit>): ExpenseSplit {
  return {
    id: 'split_1',
    expenseId: 'expense_1',
    memberId: 'them',
    splitType: 'equal',
    shareAmount: 500,
    ...overrides,
  };
}

function buildSettlement(overrides: Partial<Settlement>): Settlement {
  return {
    id: 'settlement_1',
    eventId: 'event_1',
    fromMemberId: 'them',
    fromDisplayName: 'Kim',
    toMemberId: 'me',
    toDisplayName: 'Ren',
    amount: 200,
    currency: 'PHP',
    recordedBy: 'user_1',
    createdAt: '2026-05-03T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildBalanceBreakdown', () => {
  it('counts their share of what you paid as owed to you', () => {
    const result = buildBalanceBreakdown({
      selfMemberId: 'me',
      otherMemberId: 'them',
      expenses: [buildExpense({})],
      expenseSplits: [buildSplit({})],
      settlements: [],
      members,
    });

    expect(result.net).toBe(500);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toMatchObject({kind: 'expense', amount: 500});
  });

  it('counts your share of what they paid as owed by you', () => {
    const result = buildBalanceBreakdown({
      selfMemberId: 'me',
      otherMemberId: 'them',
      expenses: [buildExpense({paidByMemberId: 'them'})],
      expenseSplits: [buildSplit({memberId: 'me'})],
      settlements: [],
      members,
    });

    expect(result.net).toBe(-500);
  });

  it('ignores central fund expenses because nobody paid them personally', () => {
    const result = buildBalanceBreakdown({
      selfMemberId: 'me',
      otherMemberId: 'them',
      expenses: [buildExpense({paymentSource: 'central_fund'})],
      expenseSplits: [buildSplit({})],
      settlements: [],
      members,
    });

    expect(result.lines).toHaveLength(0);
    expect(result.net).toBe(0);
  });

  it('ignores expenses that neither of you paid', () => {
    const result = buildBalanceBreakdown({
      selfMemberId: 'me',
      otherMemberId: 'them',
      expenses: [buildExpense({paidByMemberId: 'someone_else'})],
      expenseSplits: [buildSplit({memberId: 'me'})],
      settlements: [],
      members,
    });

    expect(result.lines).toHaveLength(0);
  });

  it('nets recorded settlements against the expense total', () => {
    const result = buildBalanceBreakdown({
      selfMemberId: 'me',
      otherMemberId: 'them',
      expenses: [buildExpense({})],
      expenseSplits: [buildSplit({})],
      settlements: [buildSettlement({})],
      members,
    });

    expect(result.net).toBe(300);
    expect(result.lines).toHaveLength(2);
  });

  it('sums to zero once the debt is paid off', () => {
    const result = buildBalanceBreakdown({
      selfMemberId: 'me',
      otherMemberId: 'them',
      expenses: [buildExpense({})],
      expenseSplits: [buildSplit({})],
      settlements: [buildSettlement({amount: 500})],
      members,
    });

    expect(result.net).toBe(0);
  });

  it('orders lines newest first', () => {
    const result = buildBalanceBreakdown({
      selfMemberId: 'me',
      otherMemberId: 'them',
      expenses: [
        buildExpense({id: 'old', createdAt: '2026-05-01T00:00:00.000Z'}),
        buildExpense({id: 'new', createdAt: '2026-05-09T00:00:00.000Z'}),
      ],
      expenseSplits: [
        buildSplit({id: 's1', expenseId: 'old'}),
        buildSplit({id: 's2', expenseId: 'new'}),
      ],
      settlements: [],
      members,
    });

    expect(result.lines.map(line => line.id)).toEqual(['new:owed', 'old:owed']);
  });
});
