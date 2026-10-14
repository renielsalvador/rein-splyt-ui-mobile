import React, {useCallback, useEffect, useState} from 'react';
import {Image, Pressable, Text, View} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useApp} from '../../app/AppProvider';
import {
  AppButton,
  AppCard,
  AppIcon,
  AppInput,
  AppScreen,
  DataPill,
  EmptyState,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {getBackend} from '../../lib/backend';
import type {PaymentMethod} from '../../types/domain';
import {createTypography, radii, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';
import type {ScreenProps} from '../../app/navigation';

export function PaymentOptionsScreen({navigation}: ScreenProps<'PaymentOptions'>) {
  const styles = useStyles(createStyles);
  const {currentUser, showToast} = useApp();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    const backend = await getBackend();
    const next = await backend.listPaymentMethods(currentUser.id);
    setMethods(next);
    setLoading(false);

    const urls: Record<string, string> = {};
    for (const method of next) {
      const url = await backend.getPaymentMethodUrl(method.qrPath);
      if (url) {
        urls[method.id] = url;
      }
    }
    setPreviews(urls);
  }, [currentUser]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  async function addMethod() {
    if (!currentUser) {
      return;
    }

    const result = await launchImageLibrary({mediaType: 'photo', selectionLimit: 1});
    const asset = result.assets?.[0];

    if (!asset?.uri) {
      return;
    }

    setSaving(true);
    try {
      const backend = await getBackend();
      await backend.addPaymentMethod(currentUser.id, label.trim() || 'Bank QR', {
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.type,
      });
      setLabel('');
      await refresh();
      showToast('Payment option saved');
    } catch (addError) {
      showToast(
        addError instanceof Error ? addError.message : 'Could not save that QR code.',
        'danger',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppScreen
      variant="detail"
      title="Payment options"
      subtitle="Save the QR codes people can use to pay you back."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <SectionHeading title="Add a QR code" />
        <AppInput
          label="Label"
          value={label}
          onChangeText={setLabel}
          placeholder="BPI, GCash, Maya"
        />
        <AppButton
          label="Choose image"
          icon="camera"
          loading={saving}
          onPress={() => addMethod().catch(() => undefined)}
        />
      </AppCard>

      {loading ? (
        <EmptyState title="Loading" body="Fetching your saved payment options." />
      ) : methods.length === 0 ? (
        <EmptyState
          title="No payment options yet"
          body="Add a bank or wallet QR code so members can settle up with you."
        />
      ) : (
        <AppCard>
          <SectionHeading title="Saved" detail={`${methods.length}`} />
          {methods.map(method => (
            <View key={method.id} style={styles.methodRow}>
              {previews[method.id] ? (
                <Image source={{uri: previews[method.id]}} style={styles.qrThumb} />
              ) : (
                <View style={styles.qrThumb} />
              )}
              <View style={styles.methodBody}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                {method.isPrimary ? (
                  <DataPill label="Primary" tone="success" />
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      getBackend()
                        .then(backend => backend.setPrimaryPaymentMethod(method.id))
                        .then(() => refresh())
                        .then(() => showToast(`${method.label} is now primary`))
                        .catch(() => showToast('Could not update that.', 'danger'));
                    }}>
                    <Text style={styles.methodAction}>Make primary</Text>
                  </Pressable>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${method.label}`}
                onPress={() => {
                  getBackend()
                    .then(backend =>
                      backend.deletePaymentMethod(method.id, method.qrPath),
                    )
                    .then(() => refresh())
                    .then(() => showToast(`${method.label} removed`, 'info'))
                    .catch(() => showToast('Could not remove that.', 'danger'));
                }}>
                <AppIcon name="delete" tone="danger" size={18} />
              </Pressable>
            </View>
          ))}
        </AppCard>
      )}
    </AppScreen>
  );
}

const createStyles = (c: Colors) => {
  const t = createTypography(c);
  return {
    methodRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      paddingVertical: spacing.sm,
    },
    qrThumb: {
      width: 48,
      height: 48,
      borderRadius: radii.sm,
      backgroundColor: c.surfaceField,
    },
    methodBody: {
      flex: 1,
      alignItems: 'flex-start' as const,
      gap: spacing.xs,
    },
    methodLabel: t.body,
    methodAction: {
      ...t.caption,
      color: c.brand,
    },
  };
};
