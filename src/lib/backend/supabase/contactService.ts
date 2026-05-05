import type {SupabaseClient} from '@supabase/supabase-js';
import type {Contact} from '../../../types/domain';
import {mapContact} from './mappers';
import type {ContactRow} from './types';
import {assertNoError, dedupeContacts} from './utils';

export async function listContacts(
  client: SupabaseClient,
  userId: string,
): Promise<Contact[]> {
  const {data, error} = await client
    .from('contacts')
    .select(
      'id, owner_user_id, contact_user_id, created_at, updated_at, contact_user:users!contacts_contact_user_id_fkey(display_name)',
    )
    .eq('owner_user_id', userId)
    .not('contact_user_id', 'is', null);

  assertNoError(error, 'Unable to load contacts.');

  return dedupeContacts((data ?? []).map(item => mapContact(item as ContactRow)));
}

export async function upsertContacts(
  client: SupabaseClient,
  userId: string,
  contacts: Array<{userId: string}>,
) {
  const normalizedContacts = contacts.filter(contact => contact.userId.length > 0);

  if (normalizedContacts.length === 0) {
    return listContacts(client, userId);
  }

  const {data: existingRows, error: existingError} = await client
    .from('contacts')
    .select('*')
    .eq('owner_user_id', userId);

  assertNoError(existingError, 'Unable to load existing contacts.');

  const existingByKey = new Map(
    (existingRows ?? []).map(item => {
      const row = item as ContactRow;
      return [row.contact_user_id, row] as const;
    }),
  );

  const rowsToInsert: Array<{
    owner_user_id: string;
    contact_user_id: string;
  }> = [];

  normalizedContacts.forEach(contact => {
    if (existingByKey.has(contact.userId)) {
      return;
    }

    rowsToInsert.push({
      owner_user_id: userId,
      contact_user_id: contact.userId,
    });
  });

  if (rowsToInsert.length > 0) {
    const {error} = await client.from('contacts').insert(rowsToInsert);
    assertNoError(error, 'Unable to save contacts.');
  }

  return listContacts(client, userId);
}
