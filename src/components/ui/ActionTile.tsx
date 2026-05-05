import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {surfaces} from '../../theme/tokens';
import {AppIcon, type AppIconName} from './AppIcon';
import {styles} from './styles';

export function ActionTile({
  title,
  subtitle,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: AppIconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        surfaces.card,
        styles.actionTile,
        pressed ? styles.buttonPressed : null,
      ]}>
      <View style={styles.actionTileIcon}>
        <AppIcon name={icon} tone="accent" />
      </View>
      <View style={styles.actionTileCopy}>
        <Text style={styles.actionTileTitle}>{title}</Text>
        <Text style={styles.actionTileSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}
