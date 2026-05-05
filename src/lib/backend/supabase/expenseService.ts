import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from '../../../types/domain';
import {assertNoError} from './utils';

export async function createExpense(
  client: SupabaseClient,
  input: CreateExpenseInput,
) {
  const {error} = await client.rpc('create_expense_with_equal_split', {
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

export async function updateExpense(
  client: SupabaseClient,
  input: UpdateExpenseInput,
) {
  const {error} = await client.rpc('update_expense_with_equal_split', {
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
