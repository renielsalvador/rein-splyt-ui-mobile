import React from 'react';
import {View} from 'react-native';
import {surfaces} from '../../theme/tokens';
import {styles} from './styles';

export function AppCard({
  children,
  tone = 'default',
}: React.PropsWithChildren<{tone?: 'default' | 'warm' | 'accent'}>) {
  if (tone === 'accent') {
    return <View style={styles.cardAccent}>{children}</View>;
  }

  return (
    <View
      style={[
        surfaces.card,
        styles.card,
        tone === 'warm' ? styles.cardWarm : null,
      ]}>
      {children}
    </View>
  );
}
