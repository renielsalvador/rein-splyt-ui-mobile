import React from 'react';
import {View} from 'react-native';
import {surfaces} from '../../theme/tokens';
import {styles} from './styles';

export function AppCard({
  children,
  tone = 'default',
}: React.PropsWithChildren<{tone?: 'default' | 'warm' | 'accent'}>) {
  return (
    <View
      style={[
        surfaces.card,
        styles.card,
        tone === 'warm' ? styles.cardWarm : null,
        tone === 'accent' ? styles.cardAccent : null,
      ]}>
      {children}
    </View>
  );
}
