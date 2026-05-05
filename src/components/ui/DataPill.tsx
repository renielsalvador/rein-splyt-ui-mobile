import React from 'react';
import {Text, View} from 'react-native';
import {styles} from './styles';

export type PillTone = 'default' | 'accent' | 'danger' | 'info' | 'success' | 'outline';

export function DataPill({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: PillTone;
}) {
  const containerStyle =
    tone === 'accent'
      ? styles.pillAccent
      : tone === 'danger'
        ? styles.pillDanger
        : tone === 'info'
          ? styles.pillInfo
          : tone === 'success'
            ? styles.pillSuccess
            : tone === 'outline'
              ? styles.pillOutline
              : styles.pillDefault;

  const textStyle =
    tone === 'outline'
      ? styles.pillTextOutline
      : tone === 'default'
        ? styles.pillText
        : styles.pillTextLight;

  return (
    <View style={[styles.pill, containerStyle]}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}
