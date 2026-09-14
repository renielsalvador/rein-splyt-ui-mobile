import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useAppStyles} from './styles';

export function SectionHeading({
  title,
  detail,
  onDetailPress,
}: {
  title: string;
  detail?: string;
  onDetailPress?: () => void;
}) {
  const styles = useAppStyles();
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionHeadingTitle}>{title}</Text>
      {detail ? (
        onDetailPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${detail}, ${title}`}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
            onPress={onDetailPress}>
            <Text style={styles.sectionHeadingDetail}>{detail}</Text>
          </Pressable>
        ) : (
          <Text style={styles.sectionHeadingDetail}>{detail}</Text>
        )
      ) : null}
    </View>
  );
}
