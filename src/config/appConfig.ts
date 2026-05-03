export const appConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
} as const;

export function hasSupabaseConfig() {
  return Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey);
}
