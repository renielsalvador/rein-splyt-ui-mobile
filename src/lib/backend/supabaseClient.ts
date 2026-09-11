import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import type {BackendConfig} from '../../config/appConfig';

let supabaseClient:
  | ReturnType<typeof createClient>
  | undefined;

export function getSupabaseClient(
  config: Extract<BackendConfig, {mode: 'supabase'}>,
) {
  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: AsyncStorage,
      },
    });
  }

  return supabaseClient;
}
