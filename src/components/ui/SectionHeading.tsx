import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {styles} from './styles';

export function SectionHeading({
  title,
  detail,
  onDetailPress,
}: {
  title: string;
  detail?: string;
  onDetailPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionHeadingTitle}>{title}</Text>
      {detail ? (
        onDetailPress ? (
          <Pressable onPress={onDetailPress}>
            <Text style={styles.sectionHeadingDetail}>{detail}</Text>
          </Pressable>
        ) : (
          <Text style={styles.sectionHeadingDetail}>{detail}</Text>
        )
      ) : null}
    </View>
  );
}
