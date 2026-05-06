import React from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, Text, View} from 'react-native';
import {styles} from './styles';
import {spacing} from '../../theme/tokens';

export function AppScreen({
  title,
  subtitle,
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
  const tabBarPadding = hasTabBar ? 64 + tabBarBottomInset : undefined;

  if (variant === 'auth') {
    return (
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: '#FFFFFF'}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: spacing.md,
            paddingTop: spacing.xl,
            paddingBottom: spacing.xl,
            gap: spacing.md,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.gradientHeader}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {leading ?? headerLeft ?? null}
          </View>
          {(actions || headerRight) ? (
            <View style={styles.headerRight}>
              {actions ?? headerRight}
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.bodyContainer, grayBody ? styles.bodyContainerGray : null]}>
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={[
            styles.bodyScrollContent,
            tabBarPadding ? {paddingBottom: tabBarPadding} : null,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}>
          {title ? (
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>{title}</Text>
              {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
            </View>
          ) : null}
          {children}
        </ScrollView>
        {footerOverlay ? (
          <View style={styles.footerOverlay}>{footerOverlay}</View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
