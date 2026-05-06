import {formatCurrency, formatDateLabel, formatDateRangeLabel} from '../../lib/utils/format';
import type {AppIconName} from '../../components/ui';
import type {Event, EventSummary, MemberBalance} from '../../types/domain';

export type ActivityFeedEntry = {
  id: string;
  eventId: string;
  timestamp: string;
  icon: AppIconName;
  title: string;
  body: string;
  meta: string;
};

function getMemberName(summary: EventSummary, memberId: string) {
  return (
    summary.members.find(member => member.id === memberId)?.displayName ?? 'Unknown member'
  );
}

function getBalanceName(balances: MemberBalance[], memberId: string) {
  return balances.find(balance => balance.memberId === memberId)?.displayName;
}

export function buildActivityFeed(
  events: Event[],
  summaries: Record<string, EventSummary>,
  balances: Record<string, MemberBalance[]>,
): ActivityFeedEntry[] {
  const entries: ActivityFeedEntry[] = [];

  events.forEach(event => {
    const summary = summaries[event.id];

    entries.push({
      id: `event:${event.id}`,
      eventId: event.id,
      timestamp: event.createdAt,
      icon: event.icon,
      title: event.name,
      body: `Event created for ${formatDateRangeLabel(event.startDate, event.endDate)}.`,
      meta: formatDateLabel(event.createdAt),
    });

    if (!summary) {
      return;
    }

    summary.members.forEach(member => {
      if (
        member.role === 'owner' &&
        member.status === 'joined' &&
        member.joinedAt === event.createdAt
      ) {
        return;
      }

      entries.push({
        id: `member:${member.id}:${member.status}`,
        eventId: event.id,
        timestamp: member.joinedAt,
        icon: member.status === 'joined' ? 'check' : 'members',
        title:
          member.status === 'joined'
            ? `${member.displayName} joined ${event.name}`
            : `${member.displayName} was added to ${event.name}`,
        body:
          member.status === 'joined'
            ? 'They can now participate in shared expenses and balances.'
            : 'They can already be included in expense splits and balance tracking.',
        meta: formatDateLabel(member.joinedAt),
      });
    });

    summary.expenses.forEach(expense => {
      const payerName = getMemberName(summary, expense.paidByMemberId);
      const participantCount = summary.expenseSplits.filter(
        split => split.expenseId === expense.id,
      ).length;

      entries.push({
        id: `expense:${expense.id}`,
        eventId: event.id,
        timestamp: expense.updatedAt,
        icon: 'expense',
        title: expense.title,
        body: `${payerName} logged ${formatCurrency(
          expense.amount,
          expense.currency,
        )} split across ${participantCount} participant${
          participantCount === 1 ? '' : 's'
        }.`,
        meta: `${event.name} • ${formatDateLabel(expense.updatedAt)}`,
      });
    });

    summary.contributions.forEach(contribution => {
      const balancesForEvent = balances[event.id] ?? [];
      const memberName =
        getBalanceName(balancesForEvent, contribution.memberId) ??
        getMemberName(summary, contribution.memberId);

      entries.push({
        id: `contribution:${contribution.id}`,
        eventId: event.id,
        timestamp: contribution.createdAt,
        icon: 'fund',
        title: `${memberName} added to ${event.name} Fund`,
        body: `${formatCurrency(contribution.amount, summary.fund.currency)} moved into the central fund.`,
        meta: formatDateLabel(contribution.createdAt),
      });
    });
  });

  return entries.sort((left, right) => {
    const timeDifference =
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime();

    if (timeDifference !== 0) {
      return timeDifference;
    }

    return right.id.localeCompare(left.id);
  });
}
