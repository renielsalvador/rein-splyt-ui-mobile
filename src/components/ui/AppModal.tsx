import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {cardSurface} from '../../theme/tokens';
import {useTheme} from '../../theme/ThemeProvider';
import {IconButton} from './AppIcon';
import {useAppStyles} from './styles';

export function AppModal({
  visible,
  title,
  subtitle,
  onClose,
  scrollable = false,
  children,
}: React.PropsWithChildren<{
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  scrollable?: boolean;
}>) {
  const {colors: c} = useTheme();
  const styles = useAppStyles();
  const [rendered, setRendered] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const sheetTranslateY = useRef(new Animated.Value(visible ? 0 : 28)).current;

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 28,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        setRendered(false);
      }
    });
  }, [backdropOpacity, sheetTranslateY, visible]);

  if (!rendered) {
    return null;
  }

  return (
    <Modal
      visible={rendered}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View
          pointerEvents="none"
          style={[styles.modalBackdropTint, {opacity: backdropOpacity}]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.modalBackdrop}
          onPress={onClose}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.modalSheet,
            {
              transform: [{translateY: sheetTranslateY}],
            },
          ]}>
          <View style={styles.modalHandle} />
          <View style={[cardSurface(c), styles.modalCard]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalCopy}>
                <Text style={styles.modalTitle}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              <IconButton
                icon="close"
                onPress={onClose}
                accessibilityLabel="Close modal"
              />
            </View>
            {scrollable ? (
              <ScrollView
                style={styles.modalBodyScroll}
                contentContainerStyle={styles.modalBodyScrollContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                automaticallyAdjustKeyboardInsets
                showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            ) : (
              <View style={styles.modalBody}>{children}</View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
