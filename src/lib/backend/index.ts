import {hasSupabaseConfig} from '../../config/appConfig';
import {MockBackend} from './mockBackend';
import {getSupabaseClient} from './supabaseClient';
import {SupabaseBackend} from './supabaseBackend';
import type {AppBackend} from './types';

let backendPromise: Promise<AppBackend> | undefined;

async function createBackend() {
  if (hasSupabaseConfig()) {
    const backend = new SupabaseBackend(getSupabaseClient());
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
