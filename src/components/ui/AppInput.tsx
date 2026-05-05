import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {palette} from '../../theme/tokens';
import {styles} from './styles';
import {AppIcon, type AppIconName} from './AppIcon';

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false,
  autoCapitalize = 'sentences',
  autoFocus = false,
  prefixIcon,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  prefixIcon?: AppIconName;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad';
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          multiline ? styles.inputWrapperMultiline : null,
          focused ? styles.inputWrapperFocused : null,
        ]}>
        {prefixIcon ? (
          <AppIcon name={prefixIcon} tone="muted" size={16} />
        ) : null}
        <TextInput
          style={[styles.input, multiline ? styles.inputMultiline : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.inkMuted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}
