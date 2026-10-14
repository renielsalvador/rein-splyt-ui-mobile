import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Text, View} from 'react-native';
import type {ToastTone} from '../../app/AppProvider';
import {useAppStyles} from './styles';

export function AppToast({message, tone = 'info'}: {message: string; tone?: ToastTone}) {
  const styles = useAppStyles();
  return (
    <View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        tone === 'success' ? styles.toastSuccess : null,
        tone === 'danger' ? styles.toastDanger : null,
      ]}>
      <Text style={styles.toastText} numberOfLines={3}>
        {message}
      </Text>
    </View>
  );
}

export function AnimatedToast({
  message,
  tone,
  animationKey,
}: {
  message: string;
  tone: ToastTone;
  animationKey: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animationKey, progress]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        opacity: progress,
        transform: [
          {translateY: progress.interpolate({inputRange: [0, 1], outputRange: [12, 0]})},
        ],
      }}>
      <AppToast message={message} tone={tone} />
    </Animated.View>
  );
}
