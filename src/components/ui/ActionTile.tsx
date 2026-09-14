import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {cardSurface} from '../../theme/tokens';
import {useTheme} from '../../theme/ThemeProvider';
import {AppIcon, type AppIconName} from './AppIcon';
import {useAppStyles} from './styles';

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
  const {colors: c} = useTheme();
  const styles = useAppStyles();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        cardSurface(c),
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
