import type {SupabaseClient} from '@supabase/supabase-js';
import type {PaymentMethod, PaymentMethodAsset} from '../../../types/domain';
import {assertNoError} from './utils';
import type {PaymentMethodRow} from './types';

const BUCKET = 'payment-qr';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function mapPaymentMethod(row: PaymentMethodRow): PaymentMethod {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    qrPath: row.qr_path,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

export async function listPaymentMethods(client: SupabaseClient, userId: string) {
  const {data, error} = await client
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', {ascending: false})
    .order('created_at', {ascending: true});

  assertNoError(error, 'Unable to load payment options.');

  return (data as PaymentMethodRow[]).map(mapPaymentMethod);
}

export async function addPaymentMethod(
  client: SupabaseClient,
  userId: string,
  label: string,
  asset: PaymentMethodAsset,
) {
  const extension = asset.fileName?.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}-qr.${extension}`;
  const response = await fetch(asset.uri);
  const blob = await response.arrayBuffer();

  const {error: uploadError} = await client.storage
    .from(BUCKET)
    .upload(path, blob, {contentType: asset.type ?? 'image/jpeg', upsert: false});

  assertNoError(uploadError, 'Unable to upload that QR code.');

  // The first one saved becomes the default, so there is always a payable option.
  const existing = await listPaymentMethods(client, userId);

  const {data, error} = await client
    .from('payment_methods')
    .insert({
      user_id: userId,
      label: label.trim(),
      qr_path: path,
      is_primary: existing.length === 0,
    })
    .select('*')
    .single();

  assertNoError(error, 'Unable to save that payment option.');

  return mapPaymentMethod(data as PaymentMethodRow);
}

export async function setPrimaryPaymentMethod(
  client: SupabaseClient,
  paymentMethodId: string,
) {
  const {data, error} = await client.rpc('set_primary_payment_method', {
    p_payment_method_id: paymentMethodId,
  });

  assertNoError(error, 'Unable to set that as your primary option.');

  return mapPaymentMethod(data as PaymentMethodRow);
}

export async function deletePaymentMethod(
  client: SupabaseClient,
  paymentMethodId: string,
  qrPath: string,
) {
  const {error} = await client.from('payment_methods').delete().eq('id', paymentMethodId);

  assertNoError(error, 'Unable to remove that payment option.');

  // The row is the source of truth; a stray object is harmless if this fails.
  await client.storage.from(BUCKET).remove([qrPath]);
}

export async function getPaymentMethodUrl(client: SupabaseClient, qrPath: string) {
  const {data, error} = await client.storage
    .from(BUCKET)
    .createSignedUrl(qrPath, SIGNED_URL_TTL_SECONDS);

  assertNoError(error, 'Unable to open that QR code.');

  return data?.signedUrl ?? undefined;
}
