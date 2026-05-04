import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  AppBackend,
  AppSession,
} from './types';
import type {
  AuthFormValues,
  CreateContributionInput,
  CreateEventInput,
  CreateExpenseInput,
  Event,
  EventMember,
  EventSummary,
  ExpenseSplit,
  Invite,
  SettlementInstruction,
  UpdateExpenseInput,
  UserProfile,
} from '../../types/domain';

type DatabaseUserRow = {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  currency: 'USD' | 'PHP';
  created_by: string;
  created_at: string;
  updated_at: string;
};

type EventMemberRow = {
  id: string;
  event_id: string;
  user_id: string | null;
  display_name: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'invited' | 'joined' | 'declined' | 'removed';
  joined_at: string;
};

type InviteRow = {
  id: string;
  event_id: string;
  invited_by: string;
  invite_code: string;
  invited_email: string | null;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expires_at: string;
  created_at: string;
};

type ExpenseRow = {
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

type CentralFundRow = {
  id: string;
  event_id: string;
  name: string;
  currency: 'USD' | 'PHP';
  created_at: string;
};

type ExpenseSplitRow = {
  id: string;
  expense_id: string;
  member_id: string;
  split_type: 'equal';
  share_amount: number | string;
};

type ContributionRow = {
  id: string;
  fund_id: string;
  member_id: string;
  amount: number | string;
  created_at: string;
};

type BalanceRow = {
  member_id: string;
  display_name: string;
  paid: number | string;
  owed: number | string;
  net: number | string;
};

type SettlementRow = {
  from_member_id: string;
  from_display_name: string;
  to_member_id: string;
  to_display_name: string;
  amount: number | string;
};

function normalizeError(error: unknown, fallback: string) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : fallback;

  if (message.toLowerCase().includes('stack depth limit exceeded')) {
    return 'Supabase schema fix is not applied yet. Run migration 202605040002_fix_membership_helper_rls_recursion.sql to remove the recursive RLS check.';
  }

  return message;
}

function assertNoError(
  error: unknown,
  fallback: string,
): asserts error is null | undefined {
  if (error) {
    throw new Error(normalizeError(error, fallback));
  }
}

function toNumber(value: number | string) {
  return typeof value === 'number' ? value : Number(value);
}

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function mapUser(row: DatabaseUserRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

function mapEvent(row: EventRow): Event {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    currency: row.currency,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMember(row: EventMemberRow): EventMember {
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

function mapInvite(row: InviteRow): Invite {
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

function mapExpense(row: ExpenseRow) {
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

function mapFund(row: CentralFundRow) {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    currency: row.currency,
    createdAt: row.created_at,
  };
}

function mapExpenseSplit(row: ExpenseSplitRow): ExpenseSplit {
  return {
    id: row.id,
    expenseId: row.expense_id,
    memberId: row.member_id,
    splitType: row.split_type,
    shareAmount: toNumber(row.share_amount),
  };
}

function mapContribution(row: ContributionRow) {
  return {
    id: row.id,
    fundId: row.fund_id,
    memberId: row.member_id,
    amount: toNumber(row.amount),
    createdAt: row.created_at,
  };
}

export class SupabaseBackend implements AppBackend {
  constructor(private readonly client: SupabaseClient) {}

  async initialize() {
    return;
  }

  async getSession(): Promise<AppSession | null> {
    const {data, error} = await this.client.auth.getSession();
    assertNoError(error, 'Unable to restore the current session.');

    const userId = data.session?.user.id;
    if (!userId) {
      return null;
    }

    return this.loadSessionForUser(userId);
  }

  async signIn(input: AuthFormValues): Promise<AppSession> {
    const {data, error} = await this.client.auth.signInWithPassword({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });

    assertNoError(error, 'Unable to sign in.');

    if (!data.user) {
      throw new Error('Supabase did not return a user session.');
    }

    return this.loadSessionForUser(data.user.id);
  }

  async signUp(input: Required<AuthFormValues>): Promise<AppSession> {
    const {data, error} = await this.client.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          display_name: input.displayName.trim(),
        },
      },
    });

    assertNoError(error, 'Unable to create the account.');

    if (!data.user) {
      throw new Error('Supabase did not create a user.');
    }

    const session = await this.loadSessionForUser(data.user.id);

    if (!session) {
      throw new Error(
        'Sign-up succeeded, but no active session was created. Disable email confirmation for the MVP or handle pending confirmation in the UI.',
      );
    }

    return session;
  }

  async signOut() {
    const {error} = await this.client.auth.signOut();
    assertNoError(error, 'Unable to sign out.');
  }

  async listEvents(_userId: string) {
    const {data, error} = await this.client
      .from('events')
      .select('*')
      .order('updated_at', {ascending: false});

    assertNoError(error, 'Unable to load events.');

    return (data ?? []).map(item => mapEvent(item as EventRow));
  }

  async createEvent(_userId: string, input: CreateEventInput) {
    const {data, error} = await this.client.rpc('create_event_with_owner', {
      p_name: input.name.trim(),
      p_description: input.description?.trim() || null,
      p_currency: input.currency,
    });

    assertNoError(error, 'Unable to create the event.');

    if (!data) {
      throw new Error('Event creation returned no data.');
    }

    return mapEvent((Array.isArray(data) ? data[0] : data) as EventRow);
  }

  async joinEvent(_userId: string, input: {inviteCode: string}) {
    const {data, error} = await this.client.rpc('join_event_by_code', {
      p_invite_code: input.inviteCode.trim().toUpperCase(),
    });

    assertNoError(error, 'Unable to join the event.');

    if (!data) {
      throw new Error('Join event returned no data.');
    }

    return mapEvent((Array.isArray(data) ? data[0] : data) as EventRow);
  }

  async getEventSummary(eventId: string): Promise<EventSummary> {
    const [
      eventResult,
      membersResult,
      expensesResult,
      splitsResult,
      invitesResult,
      fundResult,
    ] = await Promise.all([
      this.client.from('events').select('*').eq('id', eventId).maybeSingle(),
      this.client
        .from('event_members')
        .select('*')
        .eq('event_id', eventId)
        .order('joined_at', {ascending: true}),
      this.client
        .from('expenses')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', {ascending: true}),
      this.client.from('expense_splits').select('id, expense_id, member_id, split_type, share_amount'),
      this.client
        .from('invites')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', {ascending: false}),
      this.client
        .from('central_funds')
        .select('*')
        .eq('event_id', eventId)
        .maybeSingle(),
    ]);

    assertNoError(eventResult.error, 'Unable to load the event.');
    assertNoError(membersResult.error, 'Unable to load event members.');
    assertNoError(expensesResult.error, 'Unable to load event expenses.');
    assertNoError(splitsResult.error, 'Unable to load event expense splits.');
    assertNoError(invitesResult.error, 'Unable to load event invites.');
    assertNoError(fundResult.error, 'Unable to load the event fund.');

    if (!eventResult.data) {
      throw new Error('Event not found.');
    }

    if (!fundResult.data) {
      throw new Error('Central fund not found for the event.');
    }

    const contributionsResult = await this.client
      .from('central_fund_contributions')
      .select('*')
      .eq('fund_id', fundResult.data.id)
      .order('created_at', {ascending: false});

    assertNoError(
      contributionsResult.error,
      'Unable to load central fund contributions.',
    );

    return {
      event: mapEvent(eventResult.data as EventRow),
      members: (membersResult.data ?? []).map(item => mapMember(item as EventMemberRow)),
      expenses: (expensesResult.data ?? []).map(item => mapExpense(item as ExpenseRow)),
      expenseSplits: (splitsResult.data ?? [])
        .map(item => mapExpenseSplit(item as ExpenseSplitRow))
        .filter(split =>
          (expensesResult.data ?? []).some(expense => expense.id === split.expenseId),
        ),
      invites: (invitesResult.data ?? []).map(item => mapInvite(item as InviteRow)),
      fund: mapFund(fundResult.data as CentralFundRow),
      contributions: (contributionsResult.data ?? []).map(item =>
        mapContribution(item as ContributionRow),
      ),
    };
  }

  async addManualMember(eventId: string, displayName: string) {
    const {data, error} = await this.client
      .from('event_members')
      .insert({
        event_id: eventId,
        display_name: displayName.trim(),
        role: 'member',
        status: 'invited',
      })
      .select('*')
      .single();

    assertNoError(error, 'Unable to add the placeholder member.');

    return mapMember(data as EventMemberRow);
  }

  async createInvite(eventId: string, invitedBy: string, invitedEmail?: string) {
    let attempts = 0;

    while (attempts < 3) {
      const {data, error} = await this.client
        .from('invites')
        .insert({
          event_id: eventId,
          invited_by: invitedBy,
          invite_code: createInviteCode(),
          invited_email: invitedEmail?.trim().toLowerCase() || null,
          status: 'pending',
          expires_at: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7,
          ).toISOString(),
        })
        .select('*')
        .single();

      if (!error) {
        return mapInvite(data as InviteRow);
      }

      if (error.code !== '23505') {
        throw new Error(normalizeError(error, 'Unable to create the invite.'));
      }

      attempts += 1;
    }

    throw new Error('Unable to generate a unique invite code.');
  }

  async createExpense(_userId: string, input: CreateExpenseInput) {
    const {error} = await this.client.rpc('create_expense_with_equal_split', {
      p_event_id: input.eventId,
      p_title: input.title.trim(),
      p_amount: input.amount,
      p_currency: input.currency,
      p_paid_by_member_id: input.paidByMemberId,
      p_payment_source: input.paymentSource,
      p_participant_member_ids: input.participantMemberIds,
      p_note: input.note?.trim() || null,
    });

    assertNoError(error, 'Unable to save the expense.');
  }

  async updateExpense(_userId: string, input: UpdateExpenseInput) {
    const {error} = await this.client.rpc('update_expense_with_equal_split', {
      p_expense_id: input.expenseId,
      p_title: input.title.trim(),
      p_amount: input.amount,
      p_paid_by_member_id: input.paidByMemberId,
      p_payment_source: input.paymentSource,
      p_participant_member_ids: input.participantMemberIds,
      p_note: input.note?.trim() || null,
    });

    assertNoError(error, 'Unable to update the expense.');
  }

  async addCentralFundContribution(_userId: string, input: CreateContributionInput) {
    const {error} = await this.client.rpc('add_central_fund_contribution', {
      p_event_id: input.eventId,
      p_member_id: input.memberId,
      p_amount: input.amount,
    });

    assertNoError(error, 'Unable to save the central fund contribution.');
  }

  async getBalances(eventId: string) {
    const {data, error} = await this.client.rpc('get_event_balances', {
      p_event_id: eventId,
    });

    assertNoError(error, 'Unable to compute balances.');

    return (data ?? []).map((item: BalanceRow) => {
      const row = item;
      return {
        memberId: row.member_id,
        displayName: row.display_name,
        paid: toNumber(row.paid),
        owed: toNumber(row.owed),
        net: toNumber(row.net),
      };
    });
  }

  async getSettlementPlan(eventId: string) {
    const {data, error} = await this.client.rpc('get_settlement_plan', {
      p_event_id: eventId,
    });

    assertNoError(error, 'Unable to compute settlement instructions.');

    return (data ?? []).map((item: SettlementRow) => {
      const row = item;
      return {
        fromMemberId: row.from_member_id,
        fromDisplayName: row.from_display_name,
        toMemberId: row.to_member_id,
        toDisplayName: row.to_display_name,
        amount: toNumber(row.amount),
      } satisfies SettlementInstruction;
    });
  }

  private async loadSessionForUser(userId: string): Promise<AppSession> {
    const {data, error} = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    assertNoError(error, 'Unable to load the user profile.');

    if (!data) {
      throw new Error(
        'User profile not found. Ensure the Supabase profile trigger has been applied.',
      );
    }

    return {user: mapUser(data as DatabaseUserRow)};
  }
}
