import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {styles} from './styles';

export function AppScreen({
  title,
  subtitle,
  children,
  leading,
  actions,
  headerVariant = 'main',
  footerOverlay,
}: React.PropsWithChildren<{
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  headerVariant?: 'main' | 'detail';
  footerOverlay?: React.ReactNode;
}>) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="always"
        keyboardShouldPersistTaps="handled">
        {headerVariant === 'detail' ? (
          <View style={styles.detailHeader}>
            <View style={styles.detailHeaderRow}>
              <View style={styles.detailHeaderLeading}>{leading}</View>
              <View style={styles.detailHeaderBody}>
                <Text style={styles.detailTitle}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              </View>
              <View style={styles.detailHeaderTrailing}>{actions}</View>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            {leading || actions ? (
              <View style={styles.headerActions}>
                <View style={styles.headerLeading}>{leading}</View>
                <View style={styles.headerTrailing}>{actions}</View>
              </View>
            ) : null}
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
        )}
        {children}
      </ScrollView>
      {footerOverlay ? <View style={styles.footerOverlay}>{footerOverlay}</View> : null}
    </SafeAreaView>
  );
}
