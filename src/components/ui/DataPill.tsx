import React from 'react';
import {Text, View} from 'react-native';
import {styles} from './styles';

export function DataPill({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'accent';
}) {
  return (
    <View style={[styles.pill, tone === 'accent' ? styles.pillAccent : null]}>
      <Text style={[styles.pillText, tone === 'accent' ? styles.pillTextAccent : null]}>
        {label}
      </Text>
    </View>
  );
}
