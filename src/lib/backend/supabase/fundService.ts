import type {SupabaseClient} from '@supabase/supabase-js';
import type {CreateContributionInput} from '../../../types/domain';
import {assertNoError} from './utils';

export async function addCentralFundContribution(
  client: SupabaseClient,
  input: CreateContributionInput,
) {
  const {error} = await client.rpc('add_central_fund_contribution', {
    p_event_id: input.eventId,
    p_member_id: input.memberId,
    p_amount: input.amount,
  });

  assertNoError(error, 'Unable to save the central fund contribution.');
}
