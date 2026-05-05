import React from 'react';
import {Text, View} from 'react-native';
import {styles} from './styles';

export function AppToast({message}: {message: string}) {
  return (
    <View pointerEvents="none" style={styles.toast}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}
