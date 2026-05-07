import type {SupabaseClient} from '@supabase/supabase-js';
import type {AppBackend, AppSession, AuthRedirectResult, InviteRecipient} from './types';
import type {
  AuthFormValues,
  CreateContributionInput,
  CreateEventInput,
  CreateExpenseInput,
  RespondToInviteInput,
  UpdateEventInput,
  UpdateExpenseInput,
  UpdateUserProfileInput,
} from '../../types/domain';
import {
  completeAuthRedirect,
  getSession,
  requestPasswordReset,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  updatePassword,
  updateProfile,
} from './supabase/authService';
import {
  getBalances,
  getSettlementPlan,
} from './supabase/balanceService';
import {listContacts, upsertContacts} from './supabase/contactService';
import {
  addCentralFundContribution,
} from './supabase/fundService';
import {
  addManualMember,
  createEvent,
  deleteEvent,
  getEventSummary,
  joinEvent,
  listEvents,
  updateEvent,
} from './supabase/eventService';
import {
  createInvite,
  listPendingInvites,
  respondToInvite,
} from './supabase/inviteService';
import {
  createExpense,
  updateExpense,
} from './supabase/expenseService';

export class SupabaseBackend implements AppBackend {
  constructor(private readonly client: SupabaseClient) {}

  async initialize() {
    return;
  }

  async getSession(): Promise<AppSession | null> {
    return getSession(this.client);
  }

  async signIn(input: AuthFormValues): Promise<AppSession> {
    return signIn(this.client, input);
  }

  async signUp(input: Required<AuthFormValues>): Promise<AppSession> {
    return signUp(this.client, input);
  }

  async signInWithGoogle() {
    return signInWithGoogle(this.client);
  }

  async requestPasswordReset(email: string) {
    return requestPasswordReset(this.client, email);
  }

  async completeAuthRedirect(url: string): Promise<AuthRedirectResult | null> {
    return completeAuthRedirect(this.client, url);
  }

  async updatePassword(password: string) {
    return updatePassword(this.client, password);
  }

  async signOut() {
    return signOut(this.client);
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput) {
    return updateProfile(this.client, userId, input);
  }

  async listPendingInvites(email: string) {
    return listPendingInvites(this.client, email);
  }

  async respondToInvite(_userId: string, input: RespondToInviteInput) {
    return respondToInvite(this.client, input);
  }

  async listEvents(_userId: string) {
    return listEvents(this.client);
  }

  async listContacts(userId: string) {
    return listContacts(this.client, userId);
  }

  async upsertContacts(userId: string, contacts: Array<{userId: string}>) {
    return upsertContacts(this.client, userId, contacts);
  }

  async createEvent(_userId: string, input: CreateEventInput) {
    return createEvent(this.client, input);
  }

  async updateEvent(_userId: string, input: UpdateEventInput) {
    return updateEvent(this.client, input);
  }

  async deleteEvent(_userId: string, eventId: string) {
    return deleteEvent(this.client, eventId);
  }

  async joinEvent(_userId: string, input: {inviteCode: string}) {
    return joinEvent(this.client, input);
  }

  async getEventSummary(eventId: string) {
    return getEventSummary(this.client, eventId);
  }

  async addManualMember(eventId: string, displayName: string) {
    return addManualMember(this.client, eventId, displayName);
  }

  async createInvite(eventId: string, invitedBy: string, recipient?: InviteRecipient) {
    return createInvite(this.client, eventId, invitedBy, recipient);
  }

  async createExpense(_userId: string, input: CreateExpenseInput) {
    return createExpense(this.client, input);
  }

  async updateExpense(_userId: string, input: UpdateExpenseInput) {
    return updateExpense(this.client, input);
  }

  async addCentralFundContribution(
    _userId: string,
    input: CreateContributionInput,
  ) {
    return addCentralFundContribution(this.client, input);
  }

  async getBalances(eventId: string) {
    return getBalances(this.client, eventId);
  }

  async getSettlementPlan(eventId: string) {
    return getSettlementPlan(this.client, eventId);
  }
}
