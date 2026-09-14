import React, {useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {useTheme} from '../../theme/ThemeProvider';
import {useAppStyles} from './styles';
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
  errorMessage,
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
  errorMessage?: string;
}) {
  const {colors: c} = useTheme();
  const styles = useAppStyles();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          multiline ? styles.inputWrapperMultiline : null,
          focused ? styles.inputWrapperFocused : null,
          errorMessage ? styles.inputWrapperError : null,
        ]}>
        {prefixIcon ? (
          <AppIcon name={prefixIcon} tone="muted" size={16} />
        ) : null}
        <TextInput
          style={[
            styles.input,
            multiline ? styles.inputMultiline : styles.inputSingleLine,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.inkMuted}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}
