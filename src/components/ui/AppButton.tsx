import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon, type AppIconName} from './AppIcon';
import {styles} from './styles';

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: AppIconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary,
        disabled ? styles.buttonDisabled : null,
        pressed ? styles.buttonPressed : null,
      ]}>
      <View style={styles.buttonContent}>
        {icon ? (
          <AppIcon
            name={icon}
            tone={variant === 'primary' ? 'inverted' : 'accent'}
            size={15}
          />
        ) : null}
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' ? styles.buttonTextPrimary : styles.buttonTextSecondary,
          ]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
