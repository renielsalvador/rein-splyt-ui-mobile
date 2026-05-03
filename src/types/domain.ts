export type CurrencyCode = 'USD' | 'PHP';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type MemberStatus = 'invited' | 'joined' | 'declined' | 'removed';
export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type PaymentSource = 'personal' | 'central_fund';
export type SplitType = 'equal';

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
};

export type Event = {
  id: string;
  name: string;
  description?: string;
  currency: CurrencyCode;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type EventMember = {
  id: string;
  eventId: string;
  userId?: string;
  displayName: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
};

export type Invite = {
  id: string;
  eventId: string;
  invitedBy: string;
  inviteCode: string;
  invitedEmail?: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  eventId: string;
  amount: number;
  currency: CurrencyCode;
  title: string;
  note?: string;
  paidByMemberId: string;
  paymentSource: PaymentSource;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseSplit = {
  id: string;
  expenseId: string;
  memberId: string;
  splitType: SplitType;
  shareAmount: number;
};

export type CentralFund = {
  id: string;
  eventId: string;
  name: string;
  currency: CurrencyCode;
  createdAt: string;
};

export type CentralFundContribution = {
  id: string;
  fundId: string;
  memberId: string;
  amount: number;
  createdAt: string;
};

export type EventSummary = {
  event: Event;
  members: EventMember[];
  expenses: Expense[];
  invites: Invite[];
  fund: CentralFund;
  contributions: CentralFundContribution[];
};

export type MemberBalance = {
  memberId: string;
  displayName: string;
  paid: number;
  owed: number;
  net: number;
};

export type SettlementInstruction = {
  fromMemberId: string;
  fromDisplayName: string;
  toMemberId: string;
  toDisplayName: string;
  amount: number;
};

export type AuthFormValues = {
  email: string;
  password: string;
  displayName?: string;
};

export type CreateEventInput = {
  name: string;
  description?: string;
  currency: CurrencyCode;
};

export type JoinEventInput = {
  inviteCode: string;
};

export type CreateExpenseInput = {
  eventId: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  paidByMemberId: string;
  paymentSource: PaymentSource;
  participantMemberIds: string[];
  note?: string;
};

export type CreateContributionInput = {
  eventId: string;
  memberId: string;
  amount: number;
};
