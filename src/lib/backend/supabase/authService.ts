import type {SupabaseClient} from '@supabase/supabase-js';
import {Linking} from 'react-native';
import {getAuthRedirectUrl} from '../../../config/appConfig';
import type {AuthFormValues, UpdateUserProfileInput, UserProfile} from '../../../types/domain';
import type {AppSession, AuthRedirectResult} from '../types';
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

export async function signInWithGoogle(client: SupabaseClient): Promise<void> {
  const {data, error} = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectUrl(),
      skipBrowserRedirect: true,
    },
  });

  assertNoError(error, 'Unable to start Google sign in.');

  if (!data?.url) {
    throw new Error('Supabase did not return a Google sign-in URL.');
  }

  let authUrl: URL;

  try {
    authUrl = new URL(data.url);
  } catch {
    throw new Error(
      'Google sign-in returned an invalid URL. Check SUPABASE_URL and the OAuth redirect configuration.',
    );
  }

  if (authUrl.protocol !== 'https:' && authUrl.protocol !== 'http:') {
    throw new Error(
      'Google sign-in returned an invalid URL. Check SUPABASE_URL and the OAuth redirect configuration.',
    );
  }

  const canOpen = await Linking.canOpenURL(authUrl.toString());
  if (!canOpen) {
    throw new Error('Unable to open the Google sign-in page on this device.');
  }

  await Linking.openURL(authUrl.toString());
}

export async function requestPasswordReset(
  client: SupabaseClient,
  email: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
    throw new Error('Enter a valid email.');
  }

  const {error} = await client.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: getAuthRedirectUrl(),
  });

  assertNoError(error, 'Unable to send a password reset email.');
}

export async function completeAuthRedirect(
  client: SupabaseClient,
  url: string,
): Promise<AuthRedirectResult | null> {
  const params = extractAuthParams(url);
  if (!params) {
    return null;
  }

  if (params.errorDescription) {
    throw new Error(params.errorDescription);
  }

  if (!params.accessToken || !params.refreshToken) {
    throw new Error('Google sign-in did not return a complete Supabase session.');
  }

  const {data, error} = await client.auth.setSession({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
  });

  assertNoError(error, 'Unable to complete Google sign in.');

  if (!data.user) {
    throw new Error('Supabase did not return a user after Google sign in.');
  }

  const session = await loadSessionForUser(client, data.user.id);

  return {
    session,
    flow: params.type === 'recovery' ? 'recovery' : 'oauth',
  };
}

export async function updatePassword(
  client: SupabaseClient,
  password: string,
) {
  if (password.length < 6) {
    throw new Error('Use at least 6 characters.');
  }

  const {error} = await client.auth.updateUser({
    password,
  });
  assertNoError(error, 'Unable to update your password.');
}

export async function signOut(client: SupabaseClient) {
  const {error} = await client.auth.signOut();
  assertNoError(error, 'Unable to sign out.');
}

export async function updateProfile(
  client: SupabaseClient,
  userId: string,
  input: UpdateUserProfileInput,
): Promise<UserProfile> {
  const displayName = input.displayName.trim().replace(/\s+/g, ' ');

  if (displayName.length < 2) {
    throw new Error('Display name must be at least 2 characters.');
  }

  let avatarUrl: string | null | undefined;

  if (input.avatar) {
    const response = await fetch(input.avatar.uri);
    const imageBuffer = await response.arrayBuffer();
    const extension =
      input.avatar.fileName?.split('.').pop()?.toLowerCase() ??
      input.avatar.type?.split('/').pop()?.toLowerCase() ??
      'jpg';
    const path = `${userId}/avatar.${extension}`;
    const {error: uploadError} = await client.storage.from('avatars').upload(path, imageBuffer, {
      contentType: input.avatar.type ?? 'image/jpeg',
      upsert: true,
    });

    assertNoError(uploadError, 'Unable to upload your avatar.');

    const publicUrlResult = client.storage.from('avatars').getPublicUrl(path);
    avatarUrl = publicUrlResult.data.publicUrl;
  } else if (input.removeAvatar) {
    avatarUrl = null;
  }

  const {error: authError} = await client.auth.updateUser({
    data: {
      display_name: displayName,
      ...(avatarUrl !== undefined ? {avatar_url: avatarUrl} : {}),
    },
  });
  assertNoError(authError, 'Unable to update your account.');

  const {error: profileError} = await client
    .from('users')
    .update({
      display_name: displayName,
      ...(avatarUrl !== undefined ? {avatar_url: avatarUrl} : {}),
    })
    .eq('id', userId);
  assertNoError(profileError, 'Unable to update your profile.');

  return loadSessionForUser(client, userId).then(session => session.user);
}

function extractAuthParams(url: string) {
  const parsedUrl = new URL(url);
  const mergedParams = new URLSearchParams();

  for (const [key, value] of parsedUrl.searchParams.entries()) {
    mergedParams.set(key, value);
  }

  for (const [key, value] of new URLSearchParams(parsedUrl.hash.replace(/^#/, '')).entries()) {
    mergedParams.set(key, value);
  }

  const accessToken = mergedParams.get('access_token');
  const refreshToken = mergedParams.get('refresh_token');
  const errorDescription =
    mergedParams.get('error_description') ??
    mergedParams.get('error') ??
    mergedParams.get('error_code');
  const type = mergedParams.get('type');

  if (!accessToken && !refreshToken && !errorDescription && !type) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    errorDescription,
    type,
  };
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
