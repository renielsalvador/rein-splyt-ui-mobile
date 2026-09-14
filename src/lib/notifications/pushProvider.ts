import {Platform} from 'react-native';

export type PushPlatform = 'ios' | 'android';

/**
 * Seam for a real FCM/APNs integration. Swap NoopPushProvider for a concrete
 * implementation once a messaging project exists; nothing else needs to change.
 */
export type PushProvider = {
  isSupported(): boolean;
  requestPermission(): Promise<boolean>;
  getToken(): Promise<string | null>;
  onTokenRefresh(listener: (token: string) => void): () => void;
};

export const NoopPushProvider: PushProvider = {
  isSupported: () => false,
  requestPermission: async () => false,
  getToken: async () => null,
  onTokenRefresh: () => () => undefined,
};

let provider: PushProvider = NoopPushProvider;

export function setPushProvider(next: PushProvider) {
  provider = next;
}

export function getPushProvider() {
  return provider;
}

export function currentPushPlatform(): PushPlatform {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}
