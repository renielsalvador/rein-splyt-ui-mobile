import React from 'react';
import {Text} from 'react-native';
import {AppCard} from './AppCard';
import {styles} from './styles';

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <AppCard tone="warm">
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </AppCard>
  );
}
