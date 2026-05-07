import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {appConfig} from '../../config/appConfig';

let supabaseClient:
  | ReturnType<typeof createClient>
  | undefined;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
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
