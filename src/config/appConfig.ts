import Config from 'react-native-config';
import type {NativeConfig} from 'react-native-config';

export const backendModes = ['mock', 'supabase'] as const;

export type BackendMode = (typeof backendModes)[number];

export type BackendConfig =
  | {mode: 'mock'}
  | {mode: 'supabase'; supabaseUrl: string; supabaseAnonKey: string};

const authRedirectScheme = 'splytuimobile';

function read(source: NativeConfig, key: keyof NativeConfig) {
  return (source[key] ?? '').trim();
}

function isBackendMode(value: string): value is BackendMode {
  return (backendModes as readonly string[]).includes(value);
}

function isSupportedSupabaseUrl(value: string) {
  try {
    const {protocol} = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export function resolveBackendConfig(
  source: NativeConfig = Config,
): BackendConfig {
  const mode = read(source, 'BACKEND_MODE');

  if (!mode) {
    throw new Error(
      `BACKEND_MODE is not set. Set BACKEND_MODE to one of: ${backendModes.join(
        ', ',
      )}.`,
    );
  }

  if (!isBackendMode(mode)) {
    throw new Error(
      `BACKEND_MODE "${mode}" is not supported. Use one of: ${backendModes.join(
        ', ',
      )}.`,
    );
  }

  if (mode === 'mock') {
    return {mode};
  }

  const supabaseUrl = read(source, 'SUPABASE_URL');
  const supabaseAnonKey = read(source, 'SUPABASE_ANON_KEY');

  if (!supabaseUrl) {
    throw new Error('BACKEND_MODE=supabase requires SUPABASE_URL to be set.');
  }

  if (!isSupportedSupabaseUrl(supabaseUrl)) {
    throw new Error(
      'SUPABASE_URL must be an absolute http or https URL, for example http://127.0.0.1:54321.',
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'BACKEND_MODE=supabase requires SUPABASE_ANON_KEY (the publishable key) to be set.',
    );
  }

  return {mode, supabaseUrl, supabaseAnonKey};
}

export function getAuthRedirectUrl() {
  return `${authRedirectScheme}://auth/callback`;
}
