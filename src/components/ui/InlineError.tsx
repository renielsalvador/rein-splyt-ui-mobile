import React from 'react';
import {Text} from 'react-native';
import {useAppStyles} from './styles';

export function InlineError({message}: {message?: string}) {
  const styles = useAppStyles();
  if (!message) {
    return null;
  }

  return <Text style={styles.errorText}>{message}</Text>;
}
