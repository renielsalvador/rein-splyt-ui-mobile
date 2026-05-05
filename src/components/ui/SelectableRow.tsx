import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {AppIcon, type AppIconName} from './AppIcon';
import {styles} from './styles';

export function SelectableRow({
  label,
  detail,
  icon = 'person',
  selected = false,
  onPress,
}: {
  label: string;
  detail?: string;
  icon?: AppIconName;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.selectableRow,
        selected ? styles.selectableRowSelected : null,
        pressed ? styles.buttonPressed : null,
      ]}>
      <View style={styles.selectableRowLead}>
        <View style={[styles.selectableRowIcon, selected ? styles.selectableRowIconSelected : null]}>
          <AppIcon name={icon} tone={selected ? 'inverted' : 'accent'} size={16} />
        </View>
        <View style={styles.selectableRowCopy}>
          <Text style={styles.selectableRowTitle}>{label}</Text>
          {detail ? <Text style={styles.selectableRowDetail}>{detail}</Text> : null}
        </View>
      </View>
      <View style={[styles.selectionMark, selected ? styles.selectionMarkActive : null]}>
        {selected ? <AppIcon name="check" tone="inverted" size={11} /> : null}
      </View>
    </Pressable>
  );
}
