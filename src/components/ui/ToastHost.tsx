import React from 'react';
import {View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {AnimatedToast} from './AppToast';
import {useAppStyles} from './styles';

// Anchored to the bottom: the top edge is covered by the Dynamic Island and the
// status bar on modern iPhones, which hid the toast entirely.
export function ToastHost({bottomInset = 0}: {bottomInset?: number}) {
  const {toast} = useApp();
  const styles = useAppStyles();

  if (!toast) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.toastHost, {bottom: bottomInset}]}>
      <AnimatedToast message={toast.message} tone={toast.tone} animationKey={toast.id} />
    </View>
  );
}
