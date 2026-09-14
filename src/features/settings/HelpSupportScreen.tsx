import React, {useState} from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  AppCard,
  AppIcon,
  AppScreen,
  AppToast,
  ScreenBackButton,
  SectionHeading,
} from '../../components/ui';
import {createTypography, spacing} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';
import type {ScreenProps} from '../../app/navigation';
import {version as appVersion} from '../../../package.json';

const SUPPORT_EMAIL = 'support@splyt.app';

const FAQS: Array<{question: string; answer: string}> = [
  {
    question: 'How are expenses split?',
    answer:
      'Every expense is divided equally between the participants you pick. The last share absorbs any rounding so the parts always add back up to the total.',
  },
  {
    question: 'What is the central fund?',
    answer:
      'A shared pot everyone can top up. Spend paid from the fund never becomes any one person\u2019s debt, so it stays out of the settle-up maths.',
  },
  {
    question: 'How does settling up work?',
    answer:
      'Splyt works out the shortest set of transfers that clears every balance. Tap one to record it \u2014 you can log a smaller amount if only part of it was handed over.',
  },
  {
    question: 'Can I add someone without an account?',
    answer:
      'Yes. Add them as a member by name and they can be included in splits straight away. Invite them by email later to give them their own login.',
  },
];

export function HelpSupportScreen({navigation}: ScreenProps<'HelpSupport'>) {
  const styles = useStyles(createStyles);
  const [toast, setToast] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<string>();

  async function contactSupport() {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `Splyt support (v${appVersion})`,
    )}`;

    try {
      await Linking.openURL(url);
    } catch {
      setToast(`Email us at ${SUPPORT_EMAIL}`);
    }
  }

  return (
    <AppScreen
      variant="detail"
      title="Help & support"
      subtitle="Answers to the questions we hear most."
      leading={<ScreenBackButton onPress={() => navigation.goBack()} />}>
      <AppCard>
        <SectionHeading title="Common questions" />
        {FAQS.map((faq, index) => {
          const expanded = openQuestion === faq.question;

          return (
            <Pressable
              key={faq.question}
              accessibilityRole="button"
              accessibilityState={{expanded}}
              onPress={() => setOpenQuestion(expanded ? undefined : faq.question)}
              style={({pressed}) => [
                styles.faq,
                index > 0 ? styles.faqDivided : null,
                pressed ? styles.pressed : null,
              ]}>
              <View style={styles.faqHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <AppIcon name="chevron" tone="muted" size={16} />
              </View>
              {expanded ? <Text style={styles.answer}>{faq.answer}</Text> : null}
            </Pressable>
          );
        })}
      </AppCard>

      <AppCard>
        <SectionHeading title="Still stuck?" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Email support at ${SUPPORT_EMAIL}`}
          onPress={contactSupport}
          style={({pressed}) => [styles.contact, pressed ? styles.pressed : null]}>
          <View style={styles.copy}>
            <Text style={styles.question}>Contact support</Text>
            <Text style={styles.answer}>{SUPPORT_EMAIL}</Text>
          </View>
          <AppIcon name="chevron" tone="muted" size={16} />
        </Pressable>
      </AppCard>

      <Text style={styles.version}>Splyt v{appVersion}</Text>

      {toast ? <AppToast message={toast} /> : null}
    </AppScreen>
  );
}

const createStyles = (c: Colors) => {
  const t = createTypography(c);

  return StyleSheet.create({
    pressed: {opacity: 0.82},
    faq: {
      gap: spacing.xs,
    },
    faqDivided: {
      paddingTop: spacing.md,
      marginTop: spacing.md,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.hairline,
    },
    faqHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    question: {
      ...t.bodyStrong,
      flex: 1,
    },
    answer: {
      ...t.caption,
      color: c.inkMuted,
    },
    contact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    copy: {
      flex: 1,
      gap: 2,
    },
    version: {
      ...t.caption,
      color: c.inkMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  });
};
