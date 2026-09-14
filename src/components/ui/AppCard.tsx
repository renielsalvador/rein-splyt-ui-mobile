import React from 'react';
import {View} from 'react-native';
import {cardSurface} from '../../theme/tokens';
import {useTheme} from '../../theme/ThemeProvider';
import {useAppStyles} from './styles';

export function AppCard({
  children,
  tone = 'default',
}: React.PropsWithChildren<{tone?: 'default' | 'warm' | 'accent'}>) {
  const {colors: c} = useTheme();
  const styles = useAppStyles();
  if (tone === 'accent') {
    return <View style={styles.cardAccent}>{children}</View>;
  }

  return (
    <View
      style={[
        cardSurface(c),
        styles.card,
        tone === 'warm' ? styles.cardWarm : null,
      ]}>
      {children}
    </View>
  );
}
