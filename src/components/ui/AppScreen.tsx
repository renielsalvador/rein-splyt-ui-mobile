import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {radii, spacing, typeScale} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles, useTheme} from '../../theme/ThemeProvider';
import {TAB_BAR_HEIGHT} from './AppTabBar';

export type TitleAction = {
  label: string;
  icon?: string;
  onPress: () => void;
};

export function AppScreen({
  title,
  subtitle,
  titleAction,
  children,
  leading,
  actions,
  headerLeft,
  headerRight,
  variant = 'main',
  footerOverlay,
  grayBody = false,
  hasTabBar = false,
  tabBarBottomInset = 0,
}: React.PropsWithChildren<{
  title?: string;
  subtitle?: string;
  titleAction?: TitleAction;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  variant?: 'main' | 'detail' | 'auth';
  footerOverlay?: React.ReactNode;
  grayBody?: boolean;
  hasTabBar?: boolean;
  tabBarBottomInset?: number;
}>) {
  const {colors} = useTheme();
  const styles = useStyles(createStyles);
  const [footerHeight, setFooterHeight] = useState(0);

  // onLayout never fires on unmount, so a transient footer would strand its padding.
  useEffect(() => {
    if (!footerOverlay) {
      setFooterHeight(0);
    }
  }, [footerOverlay]);
  const tabBarPadding = hasTabBar ? TAB_BAR_HEIGHT + tabBarBottomInset + spacing.lg : undefined;
  // The footer is pinned over the scroll view, so its height has to be reserved.
  const scrollBottomPadding = Math.max(
    tabBarPadding ?? 0,
    footerHeight > 0 ? footerHeight + spacing.md : 0,
    spacing.xl,
  );

  if (variant === 'auth') {
    return (
      <KeyboardAvoidingView
        style={[styles.flex, {backgroundColor: colors.surface}]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.authContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const hasTitleRow = Boolean(title || titleAction);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>{leading ?? headerLeft ?? null}</View>
          {actions || headerRight ? (
            <View style={styles.headerRight}>{actions ?? headerRight}</View>
          ) : null}
        </View>
      </View>

      <View style={[styles.body, grayBody ? {backgroundColor: colors.panel} : null]}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.bodyContent, {paddingBottom: scrollBottomPadding}]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          {hasTitleRow ? (
            <View style={styles.titleRow}>
              <View style={styles.flex}>
                {title ? <Text style={styles.title}>{title}</Text> : null}
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              {titleAction ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={titleAction.label}
                  onPress={titleAction.onPress}
                  style={({pressed}) => [styles.titlePill, pressed ? styles.pressed : null]}>
                  {titleAction.icon ? (
                    <MaterialCommunityIcons
                      name={titleAction.icon}
                      size={17}
                      color={colors.onActionInk}
                    />
                  ) : null}
                  <Text style={styles.titlePillLabel} maxFontSizeMultiplier={1.2}>
                    {titleAction.label}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {children}
        </ScrollView>
        {footerOverlay ? (
          <View
            style={styles.footerOverlay}
            onLayout={event => setFooterHeight(event.nativeEvent.layout.height)}>
            {footerOverlay}
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    flex: {flex: 1},
    authContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xl,
      gap: spacing.md,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      zIndex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },
    body: {
      flex: 1,
      backgroundColor: colors.panel,
      borderTopLeftRadius: radii.sheet,
      borderTopRightRadius: radii.sheet,
      marginTop: -20,
      overflow: 'hidden',
      zIndex: 2,
    },
    bodyContent: {
      padding: spacing.md,
      paddingTop: 22,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    title: {
      ...typeScale.pageTitle,
      color: colors.ink,
    },
    subtitle: {
      ...typeScale.body,
      color: colors.inkMuted,
      marginTop: 2,
    },
    titlePill: {
      height: 40,
      borderRadius: radii.pill,
      backgroundColor: colors.actionInk,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: spacing.md,
    },
    titlePillLabel: {
      ...typeScale.button,
      fontSize: 14.5,
      color: colors.onActionInk,
    },
    pressed: {opacity: 0.82, transform: [{scale: 0.97}]},
    footerOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: spacing.md,
      backgroundColor: colors.panel,
      shadowColor: colors.shadow,
      shadowOpacity: colors.shadowOpacity * 1.6,
      shadowRadius: 20,
      shadowOffset: {width: 0, height: -6},
      elevation: 12,
    },
  });
