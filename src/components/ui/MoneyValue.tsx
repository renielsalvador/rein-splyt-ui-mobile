import React from 'react';
import {StyleSheet, Text} from 'react-native';
import type {TextStyle} from 'react-native';
import {formatCurrency} from '../../lib/utils/format';
import {palette, typography} from '../../theme/tokens';
import type {CurrencyCode} from '../../types/domain';

export type MoneyTone = 'default' | 'positive' | 'negative' | 'muted' | 'inverted';
export type MoneySize = 'hero' | 'amount' | 'value' | 'inline';

const toneColor: Record<MoneyTone, string> = {
  default: palette.ink,
  positive: palette.primary,
  negative: palette.dangerText,
  muted: palette.inkMuted,
  inverted: palette.surface,
};

/**
 * The single money display in the app. Owns size, weight, tabular figures, and tone so
 * the same value can never mean two different things on two screens.
 */
export function MoneyValue({
  value,
  currency,
  tone = 'default',
  size = 'value',
  absolute = false,
  style,
}: {
  value: number;
  currency: CurrencyCode;
  tone?: MoneyTone;
  size?: MoneySize;
  absolute?: boolean;
  style?: TextStyle;
}) {
  const amount = absolute ? Math.abs(value) : value;

  return (
    <Text
      style={[styles[size], {color: toneColor[tone]}, style]}
      maxFontSizeMultiplier={1.6}
      numberOfLines={1}>
      {formatCurrency(amount, currency)}
    </Text>
  );
}

export function balanceTone(net: number): MoneyTone {
  if (net > 0) {
    return 'positive';
  }
  if (net < 0) {
    return 'negative';
  }
  return 'muted';
}

/** The sign stated in words, so meaning never rides on color alone. */
export function balanceLabel(net: number, isSelf: boolean) {
  if (net > 0) {
    return isSelf ? "You're owed" : 'Is owed';
  }
  if (net < 0) {
    return isSelf ? 'You owe' : 'Owes';
  }
  return 'Settled up';
}

const styles = StyleSheet.create({
  hero: {
    ...typography.amount,
    fontSize: 36,
    lineHeight: 42,
    fontVariant: ['tabular-nums'],
  },
  amount: {
    ...typography.amount,
    fontVariant: ['tabular-nums'],
  },
  value: {
    ...typography.cardTitle,
    fontVariant: ['tabular-nums'],
  },
  inline: {
    ...typography.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
});
