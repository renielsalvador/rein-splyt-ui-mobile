import type {SupabaseClient} from '@supabase/supabase-js';
import type {AuthFormValues} from '../../../types/domain';
import type {AppSession} from '../types';
import type {DatabaseUserRow} from './types';
import {mapUser} from './mappers';
import {assertNoError} from './utils';

export async function getSession(
  client: SupabaseClient,
): Promise<AppSession | null> {
  const {data, error} = await client.auth.getSession();
  assertNoError(error, 'Unable to restore the current session.');

  const userId = data.session?.user.id;
  if (!userId) {
    return null;
  }

  return loadSessionForUser(client, userId);
}

export async function signIn(
  client: SupabaseClient,
  input: AuthFormValues,
): Promise<AppSession> {
  const {data, error} = await client.auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });

  assertNoError(error, 'Unable to sign in.');

  if (!data.user) {
    throw new Error('Supabase did not return a user session.');
  }

  return loadSessionForUser(client, data.user.id);
}

export async function signUp(
  client: SupabaseClient,
  input: Required<AuthFormValues>,
): Promise<AppSession> {
  const {data, error} = await client.auth.signUp({
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

  const session = await loadSessionForUser(client, data.user.id);

  if (!session) {
    throw new Error(
      'Sign-up succeeded, but no active session was created. Disable email confirmation for the MVP or handle pending confirmation in the UI.',
    );
  }

  return session;
}

export async function signOut(client: SupabaseClient) {
  const {error} = await client.auth.signOut();
  assertNoError(error, 'Unable to sign out.');
}

export async function loadSessionForUser(
  client: SupabaseClient,
  userId: string,
): Promise<AppSession> {
  const {data, error} = await client
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
