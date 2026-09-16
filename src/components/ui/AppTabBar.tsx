import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {radii, spacing, typeScale} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles, useTheme} from '../../theme/ThemeProvider';

export type TabName = 'Home' | 'Balances' | 'Activity';

export const TAB_BAR_HEIGHT = 64;

/** Outline at rest, filled when selected — the fill is what carries the state. */
const TABS: {name: TabName; label: string; icon: string; activeIcon: string}[] = [
  {name: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home'},
  {name: 'Balances', label: 'Balances', icon: 'scale-balance', activeIcon: 'scale-balance'},
  {
    name: 'Activity',
    label: 'Activity',
    icon: 'chart-timeline-variant',
    activeIcon: 'chart-timeline-variant',
  },
];

export function AppTabBar({
  currentTab,
  onTabPress,
  bottomInset = 0,
}: {
  currentTab: TabName;
  onTabPress: (tab: TabName) => void;
  bottomInset?: number;
}) {
  const {colors} = useTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={[styles.bar, {paddingBottom: bottomInset}]}>
      {TABS.map(({name, label, icon, activeIcon}) => {
        const active = currentTab === name;
        return (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            accessibilityLabel={label}
            onPress={() => onTabPress(name)}
            style={styles.item}>
            <MaterialCommunityIcons
              name={active ? activeIcon : icon}
              size={24}
              color={active ? colors.ink : colors.inkMuted}
            />
            <Text
              style={[styles.label, active && styles.labelActive]}
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopLeftRadius: radii.sheet,
      borderTopRightRadius: radii.sheet,
      paddingTop: 10,
      paddingHorizontal: spacing.sm,
      // Replaces the hairline top border; the lift is the whole separation.
      shadowColor: colors.shadow,
      shadowOpacity: colors.shadowOpacity * 1.8,
      shadowRadius: 28,
      shadowOffset: {width: 0, height: -8},
      elevation: 16,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 5,
      height: TAB_BAR_HEIGHT - 10,
      paddingTop: 6,
    },
    label: {
      ...typeScale.caption,
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: -0.1,
      color: colors.inkMuted,
    },
    labelActive: {
      fontWeight: '600',
      color: colors.ink,
    },
  });
