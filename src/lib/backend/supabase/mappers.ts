import type {
  Contact,
  Event,
  EventMember,
  ExpenseSplit,
  Invite,
  UserProfile,
} from '../../../types/domain';
import type {
  CentralFundRow,
  ContactRow,
  ContributionRow,
  DatabaseUserRow,
  EventMemberRow,
  EventRow,
  ExpenseRow,
  ExpenseSplitRow,
  InviteRow,
} from './types';
import {toNumber} from './utils';

export function mapUser(row: DatabaseUserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapContact(row: ContactRow): Contact {
  const linkedUser =
    Array.isArray(row.contact_user) ? row.contact_user[0] : row.contact_user;

  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    userId: row.contact_user_id,
    displayName: linkedUser?.display_name ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapEvent(row: EventRow): Event {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    currency: row.currency,
    icon: row.icon,
    isActive: row.is_active,
    startDate: row.start_date,
    endDate: row.end_date,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMember(row: EventMemberRow): EventMember {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id ?? undefined,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
  };
}

export function mapInvite(row: InviteRow): Invite {
  return {
    id: row.id,
    eventId: row.event_id,
    invitedBy: row.invited_by,
    inviteCode: row.invite_code,
    invitedEmail: row.invited_email ?? undefined,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function mapExpense(row: ExpenseRow) {
  return {
    id: row.id,
    eventId: row.event_id,
    amount: toNumber(row.amount),
    currency: row.currency,
    title: row.title,
    note: row.note ?? undefined,
    paidByMemberId: row.paid_by_member_id,
    paymentSource: row.payment_source,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFund(row: CentralFundRow) {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

export function mapExpenseSplit(row: ExpenseSplitRow): ExpenseSplit {
  return {
    id: row.id,
    expenseId: row.expense_id,
    memberId: row.member_id,
    splitType: row.split_type,
    shareAmount: toNumber(row.share_amount),
  };
}

export function mapContribution(row: ContributionRow) {
  return {
    id: row.id,
    fundId: row.fund_id,
    memberId: row.member_id,
    amount: toNumber(row.amount),
    createdAt: row.created_at,
  };
}
