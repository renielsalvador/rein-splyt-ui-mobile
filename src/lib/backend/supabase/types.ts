export type DatabaseUserRow = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type ContactRow = {
  id: string;
  owner_user_id: string;
  contact_user_id: string;
  contact_user:
    | {
        display_name: string;
      }
    | {
        display_name: string;
      }[];
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  name: string;
  description: string | null;
  currency: 'USD' | 'PHP';
  icon:
    | 'event'
    | 'trip'
    | 'plane'
    | 'beach'
    | 'food'
    | 'party'
    | 'work'
    | 'home'
    | 'gift'
    | 'music'
    | 'camera'
    | 'sports'
    | 'shopping'
    | 'game'
    | 'study';
  is_active: boolean;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EventMemberRow = {
  id: string;
  event_id: string;
  user_id: string | null;
  display_name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'invited' | 'joined' | 'declined' | 'removed';
  joined_at: string;
};

export type InviteRow = {
  id: string;
  event_id: string;
  invited_by: string;
  invite_code: string;
  invited_email: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
};

export type PendingInviteRow = InviteRow & {
  event_name: string;
  event_description: string | null;
  event_currency: 'USD' | 'PHP';
  event_icon: EventRow['icon'];
  event_is_active: boolean;
  event_start_date: string;
  event_end_date: string;
  event_created_by: string;
  event_created_at: string;
  event_updated_at: string;
  invited_by_display_name: string;
  invited_by_email: string;
};

export type ExpenseRow = {
  id: string;
  event_id: string;
  amount: number | string;
  currency: 'USD' | 'PHP';
  title: string;
  note: string | null;
  paid_by_member_id: string;
  payment_source: 'personal' | 'central_fund';
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CentralFundRow = {
  id: string;
  event_id: string;
  name: string;
  currency: 'USD' | 'PHP';
  created_at: string;
};

export type ExpenseSplitRow = {
  id: string;
  expense_id: string;
  member_id: string;
  split_type: 'equal';
  share_amount: number | string;
};

export type ContributionRow = {
  id: string;
  fund_id: string;
  member_id: string;
  amount: number | string;
  created_at: string;
};

export type BalanceRow = {
  member_id: string;
  display_name: string;
  paid: number | string;
  owed: number | string;
  net: number | string;
};

export type SettlementRow = {
  from_member_id: string;
  from_display_name: string;
  to_member_id: string;
  to_display_name: string;
  amount: number | string;
};
