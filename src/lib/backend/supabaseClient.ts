import 'react-native-url-polyfill/auto';
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
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseClient;
}
