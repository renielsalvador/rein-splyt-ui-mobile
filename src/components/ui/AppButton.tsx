import React, {useRef} from 'react';
import {ActivityIndicator, Animated, Pressable, Text, View} from 'react-native';
import {AppIcon, type AppIconName} from './AppIcon';
import {styles} from './styles';
import {palette} from '../../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'black' | 'destructive';

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  size = 'default',
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: AppIconName;
  size?: 'default' | 'sm' | 'compact';
}) {
  const baseStyle =
    size === 'sm'
      ? styles.buttonSm
      : size === 'compact'
        ? styles.buttonCompact
        : styles.button;

  const variantStyle =
    variant === 'primary'
      ? styles.buttonPrimary
      : variant === 'secondary'
        ? styles.buttonSecondary
        : variant === 'black'
          ? styles.buttonBlack
          : styles.buttonDestructive;

  const textStyle =
    variant === 'primary'
      ? styles.buttonTextPrimary
      : variant === 'secondary'
        ? styles.buttonTextSecondary
        : variant === 'black'
          ? styles.buttonTextBlack
          : styles.buttonTextDestructive;

  const iconTone =
    variant === 'secondary' ? 'accent' : 'inverted';
  const spinnerColor = variant === 'secondary' ? palette.primary : palette.surface;
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  }

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{disabled: isDisabled, busy: loading}}
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        style={({pressed}) => [
          baseStyle,
          variantStyle,
          isDisabled ? styles.buttonDisabled : null,
          pressed ? styles.buttonPressed : null,
        ]}>
        <View style={styles.buttonContent}>
          {loading ? (
            <ActivityIndicator color={spinnerColor} size="small" />
          ) : icon ? (
            <AppIcon name={icon} tone={iconTone} size={16} />
          ) : null}
          <Text style={[styles.buttonText, textStyle]} maxFontSizeMultiplier={1.6}>
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
