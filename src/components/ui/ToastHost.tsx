import React from 'react';
import {View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import {AnimatedToast} from './AppToast';
import {useAppStyles} from './styles';

// Anchored to the top: a bottom toast would have to dodge the tab bar, sticky footer
// CTAs and the keyboard, and would still lose to any of them when they move.
export function ToastHost({topInset = 0}: {topInset?: number}) {
  const {toast} = useApp();
  const styles = useAppStyles();

  if (!toast) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.toastHost, {top: topInset}]}>
      <AnimatedToast message={toast.message} tone={toast.tone} animationKey={toast.id} />
    </View>
  );
}
