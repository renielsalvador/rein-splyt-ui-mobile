import React from 'react';
import {StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../theme/ThemeProvider';

/**
 * The header field, painted as one layer behind the whole top of the screen —
 * status bar included, and deep enough to run past the body panel's shoulders.
 * Anything shorter leaves a seam where the flat backdrop meets the ramp.
 *
 * It is absolutely positioned and never enters layout, which is also what keeps
 * it from mis-measuring the header and clipping the row under the status bar.
 */
export function HeaderGradient({height = 260}: {height?: number}) {
  const {colors} = useTheme();

  return (
    <View pointerEvents="none" style={[styles.layer, {height}]}>
      <LinearGradient
        colors={[colors.headerFrom, colors.headerVia, colors.headerMid, colors.headerTo]}
        locations={[0, 0.34, 0.68, 1]}
        start={{x: 0.12, y: 0}}
        end={{x: 0.88, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[colors.headerBloom, colors.headerBloomMid, colors.headerBloomFade]}
        locations={[0, 0.42, 1]}
        start={{x: 0.94, y: 0}}
        end={{x: 0.06, y: 0.92}}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});
