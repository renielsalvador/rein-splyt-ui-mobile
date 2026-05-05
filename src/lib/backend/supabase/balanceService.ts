import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  MemberBalance,
  SettlementInstruction,
} from '../../../types/domain';
import type {BalanceRow, SettlementRow} from './types';
import {assertNoError, toNumber} from './utils';

export async function getBalances(
  client: SupabaseClient,
  eventId: string,
): Promise<MemberBalance[]> {
  const {data, error} = await client.rpc('get_event_balances', {
    p_event_id: eventId,
  });

  assertNoError(error, 'Unable to compute balances.');

  return (data ?? []).map((item: BalanceRow) => ({
    memberId: item.member_id,
    displayName: item.display_name,
    paid: toNumber(item.paid),
    owed: toNumber(item.owed),
    net: toNumber(item.net),
  }));
}

export async function getSettlementPlan(
  client: SupabaseClient,
  eventId: string,
): Promise<SettlementInstruction[]> {
  const {data, error} = await client.rpc('get_settlement_plan', {
    p_event_id: eventId,
  });

  assertNoError(error, 'Unable to compute settlement instructions.');

  return (data ?? []).map((item: SettlementRow) => ({
    fromMemberId: item.from_member_id,
    fromDisplayName: item.from_display_name,
    toMemberId: item.to_member_id,
    toDisplayName: item.to_display_name,
    amount: toNumber(item.amount),
  }));
}
