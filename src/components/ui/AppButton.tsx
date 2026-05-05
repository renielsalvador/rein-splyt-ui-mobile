import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon, type AppIconName} from './AppIcon';
import {styles} from './styles';

export type ButtonVariant = 'primary' | 'secondary' | 'black' | 'destructive';

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  size = 'default',
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: AppIconName;
  size?: 'default' | 'sm';
}) {
  const baseStyle = size === 'sm' ? styles.buttonSm : styles.button;

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

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        baseStyle,
        variantStyle,
        disabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
      ]}>
      <View style={styles.buttonContent}>
        {icon ? <AppIcon name={icon} tone={iconTone} size={16} /> : null}
        <Text style={[styles.buttonText, textStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
}
