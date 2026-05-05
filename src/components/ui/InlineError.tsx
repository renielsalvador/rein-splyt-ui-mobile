import React from 'react';
import {Text} from 'react-native';
import {styles} from './styles';

export function InlineError({message}: {message?: string}) {
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}
