export type CurrencyCode = 'USD' | 'PHP';
export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';
export type MemberStatus = 'invited' | 'joined' | 'declined' | 'removed';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';
export type PaymentSource = 'personal' | 'central_fund';
export type SplitType = 'equal';
export type EventIconName =
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

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
};

export type ProfileAvatarAsset = {
  uri: string;
  fileName?: string;
  type?: string;
};

export type Contact = {
  id: string;
  ownerUserId: string;
  userId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

export type Event = {
  id: string;
  name: string;
  description?: string;
  currency: CurrencyCode;
  icon: EventIconName;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
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

export type PendingInvite = {
  invite: Invite;
  event: Event;
  invitedByUser: {
    id: string;
    displayName: string;
    email: string;
  };
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
  expenseSplits: ExpenseSplit[];
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

export type UpdateUserProfileInput = {
  displayName: string;
  avatar?: ProfileAvatarAsset;
  removeAvatar?: boolean;
};

export type CreateEventInput = {
  name: string;
  description?: string;
  currency: CurrencyCode;
  icon?: EventIconName;
  startDate?: string;
  endDate?: string;
  members?: Array<
    | {
        kind: 'contact';
        displayName: string;
        userId?: string;
      }
    | {
        kind: 'email_invite';
        email: string;
      }
  >;
};

export type UpdateEventInput = {
  eventId: string;
  name: string;
  description?: string;
  icon?: EventIconName;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
};

export type JoinEventInput = {
  inviteCode: string;
};

export type RespondToInviteInput = {
  inviteId: string;
  action: 'accept' | 'decline';
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

export type UpdateExpenseInput = CreateExpenseInput & {
  expenseId: string;
};

export type CreateContributionInput = {
  eventId: string;
  memberId: string;
  amount: number;
};
