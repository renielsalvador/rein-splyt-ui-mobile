import type {SupabaseClient} from '@supabase/supabase-js';
import type {
  CurrencyCode,
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
  UpdateUserPreferencesInput,
  UserPreferences,
} from '../../../types/domain';
import type {NotificationPreferencesRow, UserPreferencesRow} from './types';
import {assertNoError} from './utils';

const DEFAULT_USER_PREFERENCES: UserPreferences = {preferredCurrency: 'PHP'};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: false,
  expenses: true,
  settlements: true,
  invites: true,
  eventUpdates: true,
};

function mapUserPreferences(row: UserPreferencesRow): UserPreferences {
  return {preferredCurrency: row.preferred_currency as CurrencyCode};
}

function mapNotificationPreferences(
  row: NotificationPreferencesRow,
): NotificationPreferences {
  return {
    pushEnabled: row.push_enabled,
    expenses: row.expenses,
    settlements: row.settlements,
    invites: row.invites,
    eventUpdates: row.event_updates,
  };
}

// Preferences are non-essential and always have defaults, so a read failure must never
// block sign-in. Writes still surface their errors.
export async function getUserPreferences(
  client: SupabaseClient,
  userId: string,
): Promise<UserPreferences> {
  const {data, error} = await client
    .from('user_preferences')
    .select('user_id, preferred_currency')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_USER_PREFERENCES;
  }

  return mapUserPreferences(data);
}

export async function updateUserPreferences(
  client: SupabaseClient,
  userId: string,
  input: UpdateUserPreferencesInput,
): Promise<UserPreferences> {
  const {data, error} = await client
    .from('user_preferences')
    .upsert(
      {user_id: userId, preferred_currency: input.preferredCurrency},
      {onConflict: 'user_id'},
    )
    .select('user_id, preferred_currency')
    .single();

  assertNoError(error, 'Unable to save your preferences.');

  return mapUserPreferences(data);
}

export async function getNotificationPreferences(
  client: SupabaseClient,
  userId: string,
): Promise<NotificationPreferences> {
  const {data, error} = await client
    .from('notification_preferences')
    .select('user_id, push_enabled, expenses, settlements, invites, event_updates')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  return mapNotificationPreferences(data);
}

export async function updateNotificationPreferences(
  client: SupabaseClient,
  userId: string,
  input: UpdateNotificationPreferencesInput,
): Promise<NotificationPreferences> {
  const current = await getNotificationPreferences(client, userId);
  const next = {...current, ...input};

  const {data, error} = await client
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        push_enabled: next.pushEnabled,
        expenses: next.expenses,
        settlements: next.settlements,
        invites: next.invites,
        event_updates: next.eventUpdates,
      },
      {onConflict: 'user_id'},
    )
    .select('user_id, push_enabled, expenses, settlements, invites, event_updates')
    .single();

  assertNoError(error, 'Unable to save your notification settings.');

  return mapNotificationPreferences(data);
}

export async function registerDeviceToken(
  client: SupabaseClient,
  token: string,
  platform: 'ios' | 'android',
) {
  const {error} = await client.rpc('register_device_token', {
    p_token: token,
    p_platform: platform,
  });

  assertNoError(error, 'Unable to register this device for notifications.');
}

export async function unregisterDeviceToken(client: SupabaseClient, token: string) {
  const {error} = await client.rpc('unregister_device_token', {p_token: token});

  assertNoError(error, 'Unable to unregister this device.');
}
