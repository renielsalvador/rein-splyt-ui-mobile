import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {radii, spacing, typeScale} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';

/**
 * A named band across the screen with an optional fact on the right. Sentence
 * case, because a rule is a heading — not an eyebrow to be shouted.
 */
export function SectionRule({title, detail}: {title: string; detail?: string}) {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.row} accessibilityRole="header">
      <Text style={styles.title} maxFontSizeMultiplier={1.4}>
        {title}
      </Text>
      <View style={styles.line} />
      {detail ? (
        <Text style={styles.detail} maxFontSizeMultiplier={1.3} numberOfLines={1}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

export function StatusChip({
  label,
  tone = 'soft',
}: {
  label: string;
  tone?: 'live' | 'soft' | 'action';
}) {
  const styles = useStyles(createStyles);

  return (
    <View style={[styles.chip, styles[`chip_${tone}` as const]]}>
      <Text style={[styles.chipLabel, styles[`chipLabel_${tone}` as const]]} maxFontSizeMultiplier={1.2}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 4,
      marginTop: spacing.xs + 2,
    },
    title: {
      ...typeScale.bodyStrong,
      fontSize: 13.5,
      fontWeight: '600',
      color: colors.ink,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.rule,
    },
    detail: {
      ...typeScale.caption,
      fontSize: 12.5,
      color: colors.inkMuted,
    },
    chip: {
      height: 26,
      paddingHorizontal: 10,
      borderRadius: radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chip_live: {backgroundColor: colors.brand},
    chip_soft: {backgroundColor: colors.brandSoft},
    chip_action: {backgroundColor: colors.actionInk},
    chipLabel: {
      ...typeScale.caption,
      fontSize: 12,
      fontWeight: '600',
    },
    chipLabel_live: {color: colors.onBrand},
    chipLabel_soft: {color: colors.onBrandSoft},
    chipLabel_action: {color: colors.onActionInk},
  });
