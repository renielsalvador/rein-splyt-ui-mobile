import 'react-native-url-polyfill/auto';
import {createClient} from '@supabase/supabase-js';
import {appConfig, hasSupabaseConfig} from '../../config/appConfig';
import {MockBackend} from './mockBackend';
import type {AppBackend} from './types';

let backendPromise: Promise<AppBackend> | undefined;

async function createBackend() {
  if (hasSupabaseConfig()) {
    createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
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
