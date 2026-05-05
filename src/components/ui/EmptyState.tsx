import React from 'react';
import {Text, View} from 'react-native';
import {spacing} from '../../theme/tokens';
import {styles} from './styles';

export function EmptyState({title, body}: {title: string; body: string}) {
  return (
    <View style={{gap: spacing.xs, paddingVertical: spacing.lg}}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}
