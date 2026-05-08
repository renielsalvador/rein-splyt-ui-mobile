import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from '../../../types/domain';
import {assertNoError} from './utils';

async function uploadExpenseReceipt(
  client: SupabaseClient,
  input: CreateExpenseInput | UpdateExpenseInput,
) {
  if (!input.receipts?.length) {
    return [];
  }

  const bucket = client.storage.from('expense-receipts');
  const uploads = await Promise.all(
    input.receipts.slice(0, 3).map(async (receipt, index) => {
      if ('url' in receipt) {
        return receipt;
      }

      const response = await fetch(receipt.uri);
      const fileBuffer = await response.arrayBuffer();
      const extension =
        receipt.fileName?.split('.').pop()?.toLowerCase() ??
        receipt.type?.split('/').pop()?.toLowerCase() ??
        'jpg';
      const path = `${input.eventId}/${Date.now()}-${index}-receipt.${extension}`;
      const {error} = await bucket.upload(path, fileBuffer, {
        contentType: receipt.type ?? 'image/jpeg',
        upsert: true,
      });

      assertNoError(error, 'Unable to upload the receipt.');

      return {
        url: bucket.getPublicUrl(path).data.publicUrl,
        fileName: receipt.fileName,
        type: receipt.type,
      };
    }),
  );

  return uploads;
}

export async function createExpense(
  client: SupabaseClient,
  input: CreateExpenseInput,
) {
  const receipts = await uploadExpenseReceipt(client, input);
  const {error} = await client.rpc('create_expense_with_equal_split', {
    p_event_id: input.eventId,
    p_title: input.title.trim(),
    p_amount: input.amount,
    p_currency: input.currency,
    p_paid_by_member_id: input.paidByMemberId,
    p_payment_source: input.paymentSource,
    p_participant_member_ids: input.participantMemberIds,
    p_note: input.note?.trim() || null,
    p_receipts: receipts,
  });

  assertNoError(error, 'Unable to save the expense.');
}

export async function updateExpense(
  client: SupabaseClient,
  input: UpdateExpenseInput,
) {
  const receipts = await uploadExpenseReceipt(client, input);
  const {error} = await client.rpc('update_expense_with_equal_split', {
    p_expense_id: input.expenseId,
    p_title: input.title.trim(),
    p_amount: input.amount,
    p_paid_by_member_id: input.paidByMemberId,
    p_payment_source: input.paymentSource,
    p_participant_member_ids: input.participantMemberIds,
    p_note: input.note?.trim() || null,
    p_clear_receipts: input.clearReceipts ?? false,
    p_receipts: receipts.length > 0 ? receipts : null,
  });

  assertNoError(error, 'Unable to update the expense.');
}
