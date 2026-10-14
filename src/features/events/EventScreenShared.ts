import {formatDateLabel} from '../../lib/utils/format';
import type {
  EventIconName,
  ExpenseSplit,
  MemberBalance,
  MemberRole,
  PendingInvite,
  SettlementInstruction,
} from '../../types/domain';

export const EVENT_ICON_OPTIONS: Array<{name: EventIconName; label: string}> = [
  {name: 'event', label: 'Classic'},
  {name: 'trip', label: 'Trip'},
  {name: 'plane', label: 'Flight'},
  {name: 'beach', label: 'Beach'},
  {name: 'food', label: 'Food'},
  {name: 'party', label: 'Party'},
  {name: 'work', label: 'Work'},
  {name: 'home', label: 'Home'},
  {name: 'gift', label: 'Gift'},
  {name: 'music', label: 'Music'},
  {name: 'camera', label: 'Photo'},
  {name: 'sports', label: 'Sports'},
  {name: 'shopping', label: 'Shopping'},
  {name: 'game', label: 'Games'},
  {name: 'study', label: 'Study'},
];

export type SelectedMemberDraft =
  | {
      id: string;
      kind: 'contact';
      label: string;
      contactId: string;
      userId?: string;
    }
  | {
      id: string;
      kind: 'email_invite';
      label: string;
      email: string;
    };

export type MemberRosterRow = {
  id: string;
  displayName: string;
  email?: string;
  joinedLabel: string;
  statusLabel: 'Joined' | 'Pending';
  role: MemberRole;
  roleLabel?: string;
};

export function formatSelfDisplayName(
  displayName: string,
  isCurrentUser: boolean | undefined,
) {
  return isCurrentUser ? `${displayName} (me)` : displayName;
}

/**
 * Transaction copy reads in the first person — "You paid Charlie", "Charlie paid
 * you", "Paid by me" — so the reader never has to recognise their own name.
 */
export function formatActorName(
  displayName: string,
  isCurrentUser: boolean | undefined,
  form: 'subject' | 'object' | 'standalone' = 'subject',
) {
  if (!isCurrentUser) {
    return displayName;
  }
  if (form === 'standalone') {
    return 'Me';
  }
  return form === 'subject' ? 'You' : 'you';
}

// Everyone in an event is a participant by default, so a split that covers fewer
// people than the roster is the thing worth surfacing.
export function describeExpenseSplit(
  splits: ExpenseSplit[],
  expenseId: string,
  memberCount: number,
) {
  const participants = splits.filter(split => split.expenseId === expenseId).length;

  if (participants === 0) {
    return undefined;
  }

  return participants === memberCount
    ? `Split ${participants} ways`
    : `Split ${participants} of ${memberCount}`;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function buildSettlementInstructions(
  balances: MemberBalance[],
): SettlementInstruction[] {
  const creditors = balances
    .filter(balance => balance.net > 0)
    .map(balance => ({...balance}));
  const debtors = balances
    .filter(balance => balance.net < 0)
    .map(balance => ({...balance, net: Math.abs(balance.net)}));
  const instructions: SettlementInstruction[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.round(Math.min(creditor.net, debtor.net) * 100) / 100;

    instructions.push({
      fromMemberId: debtor.memberId,
      fromDisplayName: debtor.displayName,
      toMemberId: creditor.memberId,
      toDisplayName: creditor.displayName,
      amount,
    });

    creditor.net = Math.round((creditor.net - amount) * 100) / 100;
    debtor.net = Math.round((debtor.net - amount) * 100) / 100;

    if (creditor.net === 0) {
      creditorIndex += 1;
    }

    if (debtor.net === 0) {
      debtorIndex += 1;
    }
  }

  return instructions;
}

export function describeInviteDate(createdAt: string, expiresAt: string) {
  return `Received ${formatDateLabel(createdAt)} • Expires ${formatDateLabel(expiresAt)}`;
}

export function getInvitePreview(pendingInvite: PendingInvite) {
  if (pendingInvite.event.description?.trim()) {
    return pendingInvite.event.description.trim();
  }

  return `${pendingInvite.invitedByUser.displayName} invited you to join ${pendingInvite.event.name}.`;
}
