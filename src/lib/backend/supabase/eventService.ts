import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  CreateEventInput,
  EventSummary,
  JoinEventInput,
  UpdateEventInput,
} from '../../../types/domain';
import {
  mapContribution,
  mapEvent,
  mapExpense,
  mapExpenseSplit,
  mapFund,
  mapInvite,
  mapMember,
} from './mappers';
import type {
  CentralFundRow,
  ContributionRow,
  EventMemberRow,
  EventRow,
  ExpenseRow,
  ExpenseSplitRow,
  InviteRow,
} from './types';
import {assertNoError, normalizeDisplayName} from './utils';

export async function listEvents(client: SupabaseClient) {
  const {data, error} = await client
    .from('events')
    .select('*')
    .order('updated_at', {ascending: false});

  assertNoError(error, 'Unable to load events.');

  return (data ?? []).map(item => mapEvent(item as EventRow));
}

export async function createEvent(
  client: SupabaseClient,
  input: CreateEventInput,
) {
  const {data, error} = await client.rpc('create_event_with_owner', {
    p_name: input.name.trim(),
    p_description: input.description?.trim() || null,
    p_currency: input.currency,
    p_icon: input.icon ?? 'event',
    p_start_date: input.startDate,
    p_end_date: input.endDate,
  });

  assertNoError(error, 'Unable to create the event.');

  if (!data) {
    throw new Error('Event creation returned no data.');
  }

  return mapEvent((Array.isArray(data) ? data[0] : data) as EventRow);
}

export async function joinEvent(
  client: SupabaseClient,
  input: JoinEventInput,
) {
  const {data, error} = await client.rpc('join_event_by_code', {
    p_invite_code: input.inviteCode.trim().toUpperCase(),
  });

  assertNoError(error, 'Unable to join the event.');

  if (!data) {
    throw new Error('Join event returned no data.');
  }

  return mapEvent((Array.isArray(data) ? data[0] : data) as EventRow);
}

export async function updateEvent(
  client: SupabaseClient,
  input: UpdateEventInput,
) {
  const {data, error} = await client.rpc('update_event_details', {
    p_event_id: input.eventId,
    p_name: input.name.trim(),
    p_description: input.description?.trim() || null,
    p_icon: input.icon ?? 'event',
    p_start_date: input.startDate,
    p_end_date: input.endDate,
  });

  assertNoError(error, 'Unable to update the event.');

  if (!data) {
    throw new Error('Event update returned no data.');
  }

  return mapEvent((Array.isArray(data) ? data[0] : data) as EventRow);
}

export async function deleteEvent(
  client: SupabaseClient,
  eventId: string,
) {
  const {error} = await client.rpc('delete_event_with_related_records', {
    p_event_id: eventId,
  });

  assertNoError(error, 'Unable to delete the event.');
}

export async function getEventSummary(
  client: SupabaseClient,
  eventId: string,
): Promise<EventSummary> {
  const [
    eventResult,
    membersResult,
    expensesResult,
    splitsResult,
    invitesResult,
    fundResult,
  ] = await Promise.all([
    client.from('events').select('*').eq('id', eventId).maybeSingle(),
    client
      .from('event_members')
      .select('*')
      .eq('event_id', eventId)
      .order('joined_at', {ascending: true}),
    client
      .from('expenses')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', {ascending: true}),
    client
      .from('expense_splits')
      .select('id, expense_id, member_id, split_type, share_amount'),
    client
      .from('invites')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', {ascending: false}),
    client.from('central_funds').select('*').eq('event_id', eventId).maybeSingle(),
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

  const contributionsResult = await client
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
    members: (membersResult.data ?? []).map(item =>
      mapMember(item as EventMemberRow),
    ),
    expenses: (expensesResult.data ?? []).map(item =>
      mapExpense(item as ExpenseRow),
    ),
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

export async function addManualMember(
  client: SupabaseClient,
  eventId: string,
  displayName: string,
) {
  const {data, error} = await client
    .from('event_members')
    .insert({
      event_id: eventId,
      display_name: normalizeDisplayName(displayName),
      role: 'member',
      status: 'invited',
    })
    .select('*')
    .single();

  assertNoError(error, 'Unable to add the placeholder member.');

  return mapMember(data as EventMemberRow);
}
