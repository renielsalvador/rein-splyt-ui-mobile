import {
  getAuthRedirectUrl,
  resolveBackendConfig,
} from '../src/config/appConfig';

describe('resolveBackendConfig', () => {
  it('selects the mock backend without Supabase credentials', () => {
    expect(resolveBackendConfig({BACKEND_MODE: 'mock'})).toEqual({mode: 'mock'});
  });

  it('selects Supabase when the mode, URL, and publishable key are set', () => {
    expect(
      resolveBackendConfig({
        BACKEND_MODE: 'supabase',
        SUPABASE_URL: 'http://127.0.0.1:54321',
        SUPABASE_ANON_KEY: 'sb_publishable_local',
      }),
    ).toEqual({
      mode: 'supabase',
      supabaseUrl: 'http://127.0.0.1:54321',
      supabaseAnonKey: 'sb_publishable_local',
    });
  });

  it('rejects a missing backend mode instead of guessing one', () => {
    expect(() => resolveBackendConfig({})).toThrow(/BACKEND_MODE/);
  });

  it('rejects an unknown backend mode', () => {
    expect(() => resolveBackendConfig({BACKEND_MODE: 'staging'})).toThrow(
      /mock/,
    );
  });

  it('rejects Supabase mode without a URL', () => {
    expect(() =>
      resolveBackendConfig({
        BACKEND_MODE: 'supabase',
        SUPABASE_ANON_KEY: 'sb_publishable_local',
      }),
    ).toThrow(/SUPABASE_URL/);
  });

  it('rejects Supabase mode without a publishable key', () => {
    expect(() =>
      resolveBackendConfig({
        BACKEND_MODE: 'supabase',
        SUPABASE_URL: 'http://127.0.0.1:54321',
      }),
    ).toThrow(/SUPABASE_ANON_KEY/);
  });

  it('rejects a Supabase URL that is not http or https', () => {
    expect(() =>
      resolveBackendConfig({
        BACKEND_MODE: 'supabase',
        SUPABASE_URL: 'ftp://127.0.0.1:54321',
        SUPABASE_ANON_KEY: 'sb_publishable_local',
      }),
    ).toThrow(/SUPABASE_URL/);
  });

  it('ignores Supabase credentials in mock mode', () => {
    expect(
      resolveBackendConfig({
        BACKEND_MODE: 'mock',
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_ANON_KEY: 'sb_publishable_local',
      }),
    ).toEqual({mode: 'mock'});
  });

  it('never leaks the publishable key through a validation error', () => {
    let message = '';

    try {
      resolveBackendConfig({
        BACKEND_MODE: 'supabase',
        SUPABASE_ANON_KEY: 'sb_publishable_secret_value',
      });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).toContain('SUPABASE_URL');
    expect(message).not.toContain('sb_publishable_secret_value');
  });
});

describe('getAuthRedirectUrl', () => {
  it('returns the registered mobile auth callback', () => {
    expect(getAuthRedirectUrl()).toBe('splytuimobile://auth/callback');
  });
});
