import Config from 'react-native-config';

export const appConfig = {
  supabaseUrl: Config.SUPABASE_URL ?? '',
  supabaseAnonKey: Config.SUPABASE_ANON_KEY ?? '',
} as const;

export function hasSupabaseConfig() {
  return Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey);
}
