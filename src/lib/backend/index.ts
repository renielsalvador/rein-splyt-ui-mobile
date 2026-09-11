import {resolveBackendConfig} from '../../config/appConfig';
import {MockBackend} from './mockBackend';
import {getSupabaseClient} from './supabaseClient';
import {SupabaseBackend} from './supabaseBackend';
import type {AppBackend} from './types';

let backendPromise: Promise<AppBackend> | undefined;

async function createBackend() {
  const config = resolveBackendConfig();

  if (config.mode === 'supabase') {
    const backend = new SupabaseBackend(getSupabaseClient(config));
    await backend.initialize();
    return backend;
  }

  const backend = new MockBackend();
  await backend.initialize();
  return backend;
}

export function getBackend() {
  if (!backendPromise) {
    backendPromise = createBackend();
  }

  return backendPromise;
}
