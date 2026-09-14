import React from 'react';
import {View} from 'react-native';
import {styles} from './styles';

/**
 * Full-bleed tinted band for the top of the body container. Cancels the scroll
 * padding so its fill meets the screen edges while its content keeps the 16pt margin.
 */
export function AppHeroBand({children}: {children: React.ReactNode}) {
  return <View style={styles.heroBand}>{children}</View>;
}
