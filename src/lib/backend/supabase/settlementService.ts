import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  CreateSettlementInput,
  CurrencyCode,
  Settlement,
} from '../../../types/domain';
import type {SettlementRecordRow} from './types';
import {assertNoError, toNumber} from './utils';

export async function listSettlements(
  client: SupabaseClient,
  eventId: string,
): Promise<Settlement[]> {
  const {data, error} = await client.rpc('list_event_settlements', {
    p_event_id: eventId,
  });

  assertNoError(error, 'Unable to load recorded payments.');

  return (data ?? []).map((item: SettlementRecordRow) => ({
    id: item.id,
    eventId: item.event_id,
    fromMemberId: item.from_member_id,
    fromDisplayName: item.from_display_name,
    toMemberId: item.to_member_id,
    toDisplayName: item.to_display_name,
    amount: toNumber(item.amount),
    currency: item.currency as CurrencyCode,
    note: item.note ?? undefined,
    recordedBy: item.recorded_by,
    createdAt: item.created_at,
  }));
}

export async function recordSettlement(
  client: SupabaseClient,
  input: CreateSettlementInput,
) {
  const {error} = await client.rpc('record_settlement', {
    p_event_id: input.eventId,
    p_from_member_id: input.fromMemberId,
    p_to_member_id: input.toMemberId,
    p_amount: input.amount,
    p_note: input.note?.trim() || null,
  });

  assertNoError(error, 'Unable to record the payment.');
}
