import type {SupabaseClient} from '@supabase/supabase-js';
import type {Event, PendingInvite, RespondToInviteInput} from '../../../types/domain';
import type {InviteRecipient} from '../types';
import {mapEvent, mapInvite} from './mappers';
import type {EventRow, InviteRow, PendingInviteRow} from './types';
import {
  assertNoError,
  createInviteCode,
  normalizeEmail,
  normalizeError,
} from './utils';

export async function listPendingInvites(
  client: SupabaseClient,
  email: string,
): Promise<PendingInvite[]> {
  const {data, error} = await client.rpc('list_pending_invites_for_email', {
    p_email: normalizeEmail(email),
  });

  assertNoError(error, 'Unable to load pending invites.');

  return (data ?? []).map((item: unknown) => {
    const row = item as PendingInviteRow;

    return {
      invite: mapInvite(row),
      event: mapEvent({
        id: row.event_id,
        name: row.event_name,
        description: row.event_description,
        currency: row.event_currency,
        icon: row.event_icon,
        start_date: row.event_start_date,
        end_date: row.event_end_date,
        created_by: row.event_created_by,
        created_at: row.event_created_at,
        updated_at: row.event_updated_at,
      }),
      invitedByUser: {
        id: row.invited_by,
        displayName: row.invited_by_display_name,
        email: row.invited_by_email,
      },
    };
  });
}

export async function respondToInvite(
  client: SupabaseClient,
  input: RespondToInviteInput,
): Promise<Event | null> {
  const {data, error} = await client.rpc('respond_to_event_invite', {
    p_invite_id: input.inviteId,
    p_action: input.action,
  });

  assertNoError(error, 'Unable to update the invite.');

  if (!data) {
    return null;
  }

  return mapEvent((Array.isArray(data) ? data[0] : data) as EventRow);
}

export async function createInvite(
  client: SupabaseClient,
  eventId: string,
  invitedBy: string,
  recipient?: InviteRecipient,
) {
  let attempts = 0;

  while (attempts < 3) {
    const {data, error} = await client.rpc('create_event_invite', {
      p_event_id: eventId,
      p_invited_by: invitedBy,
      p_invite_code: createInviteCode(),
      p_invited_email: recipient?.email?.trim().toLowerCase() || null,
      p_invited_user_id: recipient?.userId ?? null,
      p_expires_at: new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7,
      ).toISOString(),
    });

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
