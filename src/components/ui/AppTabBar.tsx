import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {AppIcon} from './AppIcon';
import {styles} from './styles';

export type TabName = 'Home' | 'Events' | 'Activity' | 'Settings';

function HomeIcon({active}: {active: boolean}) {
  return (
    <View style={localStyles.iconWrap}>
      <AppIcon name="home" size={20} tone={active ? 'default' : 'muted'} />
    </View>
  );
}

function EventsIcon({active}: {active: boolean}) {
  return (
    <View style={localStyles.iconWrap}>
      <AppIcon name="calendar" size={20} tone={active ? 'default' : 'muted'} />
    </View>
  );
}

function ActivityIcon({active}: {active: boolean}) {
  return (
    <View style={localStyles.iconWrap}>
      <AppIcon name="activity" size={20} tone={active ? 'default' : 'muted'} />
    </View>
  );
}

function SettingsIcon({active}: {active: boolean}) {
  return (
    <View style={localStyles.iconWrap}>
      <AppIcon name="settings" size={20} tone={active ? 'default' : 'muted'} />
    </View>
  );
}

const TABS: {name: TabName; label: string; Icon: React.ComponentType<{active: boolean}>}[] = [
  {name: 'Home', label: 'Home', Icon: HomeIcon},
  {name: 'Events', label: 'Events', Icon: EventsIcon},
  {name: 'Activity', label: 'Activity', Icon: ActivityIcon},
  {name: 'Settings', label: 'Settings', Icon: SettingsIcon},
];

export function AppTabBar({
  currentTab,
  onTabPress,
}: {
  currentTab: TabName;
  onTabPress: (tab: TabName) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {TABS.map(({name, label, Icon}) => {
        const active = currentTab === name;
        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => onTabPress(name)}
            style={styles.tabItem}>
            <Icon active={active} />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const localStyles = StyleSheet.create({
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
