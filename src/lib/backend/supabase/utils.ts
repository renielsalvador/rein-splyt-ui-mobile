import type {Contact} from '../../../types/domain';

export function normalizeError(error: unknown, fallback: string) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ? error.message
        : fallback;

  if (message.toLowerCase().includes('stack depth limit exceeded')) {
    return 'Supabase schema fix is not applied yet. Run migration 202605040002_fix_membership_helper_rls_recursion.sql to remove the recursive RLS check.';
  }

  return message;
}

export function assertNoError(
  error: unknown,
  fallback: string,
): asserts error is null | undefined {
  if (error) {
    throw new Error(normalizeError(error, fallback));
  }
}

export function toNumber(value: number | string) {
  return typeof value === 'number' ? value : Number(value);
}

export function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function dedupeContacts(contacts: Contact[]) {
  return contacts
    .filter(
      (contact, index, items) =>
        items.findIndex(item => item.userId === contact.userId) === index,
    )
    .sort((left, right) => left.displayName.localeCompare(right.displayName));
}
