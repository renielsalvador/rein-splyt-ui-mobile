import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

type BrandLogoProps = {
  size?: number;
};

export function BrandLogo({size = 28}: BrandLogoProps) {
  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Image
        source={require('../../../assets/branding/splyt-app-icon-no-bg-white.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
