import type {
  Expense,
  ExpenseSplit,
  EventMember,
  Settlement,
} from '../../types/domain';

export type BalanceBreakdownLine = {
  id: string;
  kind: 'expense' | 'settlement';
  label: string;
  detail: string;
  /** Positive means they owe you, negative means you owe them. */
  amount: number;
  occurredAt: string;
};

export type BalanceBreakdown = {
  lines: BalanceBreakdownLine[];
  net: number;
};

/**
 * Why do I owe this person? Walks every expense the two of us share and every
 * settlement between us, from the perspective of `selfMemberId`.
 *
 * Central-fund expenses are excluded: nobody paid them personally, so they
 * create no debt between two members.
 */
export function buildBalanceBreakdown({
  selfMemberId,
  otherMemberId,
  expenses,
  expenseSplits,
  settlements,
  members,
}: {
  selfMemberId: string;
  otherMemberId: string;
  expenses: Expense[];
  expenseSplits: ExpenseSplit[];
  settlements: Settlement[];
  members: EventMember[];
}): BalanceBreakdown {
  const nameOf = (memberId: string) =>
    members.find(member => member.id === memberId)?.displayName ?? 'Unknown';
  const lines: BalanceBreakdownLine[] = [];

  for (const expense of expenses) {
    if (expense.paymentSource === 'central_fund') {
      continue;
    }

    const splits = expenseSplits.filter(split => split.expenseId === expense.id);
    const payer = expense.paidByMemberId;

    if (payer === selfMemberId) {
      const theirShare = splits.find(split => split.memberId === otherMemberId);
      if (theirShare && theirShare.shareAmount !== 0) {
        lines.push({
          id: `${expense.id}:owed`,
          kind: 'expense',
          label: expense.title,
          detail: `You paid · ${nameOf(otherMemberId)}'s share`,
          amount: theirShare.shareAmount,
          occurredAt: expense.createdAt,
        });
      }
      continue;
    }

    if (payer === otherMemberId) {
      const myShare = splits.find(split => split.memberId === selfMemberId);
      if (myShare && myShare.shareAmount !== 0) {
        lines.push({
          id: `${expense.id}:owing`,
          kind: 'expense',
          label: expense.title,
          detail: `${nameOf(otherMemberId)} paid · your share`,
          amount: -myShare.shareAmount,
          occurredAt: expense.createdAt,
        });
      }
    }
  }

  for (const settlement of settlements) {
    const isOutbound =
      settlement.fromMemberId === selfMemberId && settlement.toMemberId === otherMemberId;
    const isInbound =
      settlement.fromMemberId === otherMemberId && settlement.toMemberId === selfMemberId;

    if (!isOutbound && !isInbound) {
      continue;
    }

    lines.push({
      id: settlement.id,
      kind: 'settlement',
      label: settlement.note?.trim() || 'Payment recorded',
      detail: isOutbound
        ? `You paid ${nameOf(otherMemberId)}`
        : `${nameOf(otherMemberId)} paid you`,
      // A payment out cancels what you owe, so it moves the balance the same way
      // as them owing you.
      amount: isOutbound ? settlement.amount : -settlement.amount,
      occurredAt: settlement.createdAt,
    });
  }

  lines.sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));

  return {
    lines,
    net: roundAmount(lines.reduce((total, line) => total + line.amount, 0)),
  };
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}
