import type {
  AuthFormValues,
  CreateContributionInput,
  CreateEventInput,
  CreateExpenseInput,
  Event,
  EventMember,
  EventSummary,
  Invite,
  JoinEventInput,
  MemberBalance,
  SettlementInstruction,
  UpdateExpenseInput,
  UserProfile,
} from '../../types/domain';

export type AppSession = {
  user: UserProfile;
};

export interface AppBackend {
  initialize(): Promise<void>;
  getSession(): Promise<AppSession | null>;
  signIn(input: AuthFormValues): Promise<AppSession>;
  signUp(input: Required<AuthFormValues>): Promise<AppSession>;
  signOut(): Promise<void>;
  listEvents(userId: string): Promise<Event[]>;
  createEvent(userId: string, input: CreateEventInput): Promise<Event>;
  joinEvent(userId: string, input: JoinEventInput): Promise<Event>;
  getEventSummary(eventId: string): Promise<EventSummary>;
  addManualMember(eventId: string, displayName: string): Promise<EventMember>;
  createInvite(eventId: string, invitedBy: string, invitedEmail?: string): Promise<Invite>;
  createExpense(userId: string, input: CreateExpenseInput): Promise<void>;
  updateExpense(userId: string, input: UpdateExpenseInput): Promise<void>;
  addCentralFundContribution(
    userId: string,
    input: CreateContributionInput,
  ): Promise<void>;
  getBalances(eventId: string): Promise<MemberBalance[]>;
  getSettlementPlan(eventId: string): Promise<SettlementInstruction[]>;
}
