import type {
  AuthFormValues,
  Contact,
  CreateContributionInput,
  CreateEventInput,
  CreateExpenseInput,
  Event,
  EventMember,
  EventSummary,
  Invite,
  JoinEventInput,
  MemberBalance,
  PendingInvite,
  RespondToInviteInput,
  SettlementInstruction,
  UpdateEventInput,
  UpdateExpenseInput,
  UserProfile,
} from '../../types/domain';

export type InviteRecipient = {
  email?: string;
  userId?: string;
};

export type AppSession = {
  user: UserProfile;
};

export interface AppBackend {
  initialize(): Promise<void>;
  getSession(): Promise<AppSession | null>;
  signIn(input: AuthFormValues): Promise<AppSession>;
  signUp(input: Required<AuthFormValues>): Promise<AppSession>;
  signInWithGoogle(): Promise<void>;
  completeAuthRedirect(url: string): Promise<AppSession | null>;
  signOut(): Promise<void>;
  listPendingInvites(email: string): Promise<PendingInvite[]>;
  respondToInvite(userId: string, input: RespondToInviteInput): Promise<Event | null>;
  listEvents(userId: string): Promise<Event[]>;
  listContacts(userId: string): Promise<Contact[]>;
  upsertContacts(userId: string, contacts: Array<{userId: string}>): Promise<Contact[]>;
  createEvent(userId: string, input: CreateEventInput): Promise<Event>;
  updateEvent(userId: string, input: UpdateEventInput): Promise<Event>;
  deleteEvent(userId: string, eventId: string): Promise<void>;
  joinEvent(userId: string, input: JoinEventInput): Promise<Event>;
  getEventSummary(eventId: string): Promise<EventSummary>;
  addManualMember(eventId: string, displayName: string): Promise<EventMember>;
  createInvite(eventId: string, invitedBy: string, recipient?: InviteRecipient): Promise<Invite>;
  createExpense(userId: string, input: CreateExpenseInput): Promise<void>;
  updateExpense(userId: string, input: UpdateExpenseInput): Promise<void>;
  addCentralFundContribution(
    userId: string,
    input: CreateContributionInput,
  ): Promise<void>;
  getBalances(eventId: string): Promise<MemberBalance[]>;
  getSettlementPlan(eventId: string): Promise<SettlementInstruction[]>;
}
