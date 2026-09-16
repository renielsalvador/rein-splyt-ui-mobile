import React from 'react';
import {StyleSheet, Text} from 'react-native';
import type {TextStyle} from 'react-native';
import {formatCurrency} from '../../lib/utils/format';
import {typeScale} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useTheme} from '../../theme/ThemeProvider';
import type {CurrencyCode} from '../../types/domain';

export type MoneyTone = 'default' | 'positive' | 'negative' | 'muted' | 'inverted';
export type MoneySize = 'hero' | 'amount' | 'value' | 'inline';

function toneColor(colors: Colors, tone: MoneyTone) {
  switch (tone) {
    case 'positive':
      return colors.successText;
    case 'negative':
      return colors.dangerText;
    case 'muted':
      return colors.inkMuted;
    case 'inverted':
      return colors.onBrand;
    default:
      return colors.ink;
  }
}

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
  const {colors} = useTheme();
  const amount = absolute ? Math.abs(value) : value;

  return (
    <Text
      style={[styles[size], {color: toneColor(colors, tone)}, style]}
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
    ...typeScale.amount,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1.1,
    fontVariant: ['tabular-nums'],
  },
  amount: {
    ...typeScale.amount,
    fontVariant: ['tabular-nums'],
  },
  value: {
    ...typeScale.cardTitle,
    fontVariant: ['tabular-nums'],
  },
  inline: {
    ...typeScale.bodyStrong,
    fontVariant: ['tabular-nums'],
  },
});
