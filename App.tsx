import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {palette, radii, spacing, surfaces, typography} from './src/theme/tokens';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={palette.canvas} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: safeAreaInsets.top + spacing.lg,
          paddingBottom: safeAreaInsets.bottom + spacing.xxxl,
        },
      ]}>
      <Header />
      <BalanceHero />
      <View style={styles.sectionGap}>
        <SectionTitle title="Shared cards" action="View all" />
        <View style={styles.cardDeck}>
          <BankCard
            amount="$4 556.15"
            label="Trip reserve"
            suffix="•••• 4568"
            dark
          />
          <BankCard
            amount="$2 180.00"
            label="Group fund"
            suffix="4 members"
          />
        </View>
      </View>
      <View style={styles.gridRow}>
        <StatCard label="This month" value="$1 284.10" note="12 expenses" />
        <StatCard label="You are owed" value="$348.40" note="3 balances" />
      </View>
      <View style={styles.sectionGap}>
        <SectionTitle title="Analytics" action="October" />
        <AnalyticsCard />
      </View>
      <View style={styles.sectionGap}>
        <SectionTitle title="Recent transactions" action="View all" />
        <TransactionsCard />
      </View>
    </ScrollView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>DC</Text>
        </View>
        <View>
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.headerName}>Diane Cruz</Text>
        </View>
      </View>
      <RoundButton label="◌" />
    </View>
  );
}

function BalanceHero() {
  return (
    <View style={[surfaces.card, styles.heroCard]}>
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.eyebrow}>Available balance</Text>
          <Text style={styles.balanceValue}>$10 524.15</Text>
        </View>
        <View style={styles.heroActions}>
          <RoundButton label="+" filled />
          <RoundButton label="⇄" filled />
        </View>
      </View>
      <View style={styles.heroFooter}>
        <Text style={styles.heroCaption}>
          Clean, shared expense management for every trip.
        </Text>
        <View style={styles.heroAccent} />
      </View>
    </View>
  );
}

function SectionTitle({title, action}: {title: string; action: string}) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      <Text style={styles.sectionAction}>{action}</Text>
    </View>
  );
}

function BankCard({
  amount,
  label,
  suffix,
  dark = false,
}: {
  amount: string;
  label: string;
  suffix: string;
  dark?: boolean;
}) {
  return (
    <View
      style={[
        dark ? styles.darkBankCard : styles.lightBankCard,
        styles.bankCard,
      ]}>
      <Text style={dark ? styles.darkCardAmount : styles.lightCardAmount}>
        {amount}
      </Text>
      <View>
        <Text style={dark ? styles.darkCardLabel : styles.lightCardLabel}>
          {label}
        </Text>
        <Text style={dark ? styles.darkCardSuffix : styles.lightCardSuffix}>
          {suffix}
        </Text>
      </View>
      <View style={styles.cardPattern} />
    </View>
  );
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <View style={[surfaces.card, styles.statCard]}>
      <Text style={styles.eyebrow}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

function AnalyticsCard() {
  return (
    <View style={[surfaces.card, styles.analyticsCard]}>
      <View style={styles.chipRow}>
        <Chip label="Expenses" active />
        <Chip label="Income" />
        <Chip label="Limits" />
      </View>
      <View style={styles.analyticsBody}>
        <View style={styles.analyticsCopy}>
          <Text style={styles.eyebrow}>Total expenses</Text>
          <Text style={styles.analyticsValue}>$2 316.27</Text>
          <Text style={styles.analyticsMonth}>October overview</Text>
        </View>
        <ExpenseRing />
      </View>
      <View style={styles.legendRow}>
        <LegendDot color={palette.chartOrange} label="Transport 24%" />
        <LegendDot color={palette.chartMint} label="Food 19%" />
      </View>
      <View style={styles.legendRow}>
        <LegendDot color={palette.chartLavender} label="Travel 11%" />
        <LegendDot color={palette.chartYellow} label="Lodging 46%" />
      </View>
    </View>
  );
}

function Chip({label, active = false}: {label: string; active?: boolean}) {
  return (
    <View style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
      <Text style={active ? styles.chipTextActive : styles.chipTextIdle}>
        {label}
      </Text>
    </View>
  );
}

function ExpenseRing() {
  return (
    <View style={styles.ringWrap}>
      <View style={styles.ringTrack} />
      <View style={[styles.ringSegmentHorizontal, styles.segmentTop]} />
      <View style={[styles.ringSegmentVertical, styles.segmentRight]} />
      <View style={[styles.ringSegmentHorizontal, styles.segmentBottom]} />
      <View style={[styles.ringSegmentVertical, styles.segmentLeft]} />
      <View style={styles.ringCenter}>
        <Text style={styles.ringCenterLabel}>October</Text>
      </View>
    </View>
  );
}

function LegendDot({color, label}: {color: string; label: string}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, {backgroundColor: color}]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function TransactionsCard() {
  const transactions = [
    {merchant: 'Starbucks Coffee', date: 'Aug 24, 5:27 PM', amount: '-$14.99'},
    {merchant: 'DKNY', date: 'Aug 20, 2:14 PM', amount: '-$40.00'},
    {merchant: 'Netflix', date: 'Aug 12, 7:25 PM', amount: '-$70.00'},
    {merchant: 'KFC', date: 'Aug 06, 5:12 PM', amount: '-$12.60'},
  ];

  return (
    <View style={[surfaces.card, styles.transactionsCard]}>
      {transactions.map(item => (
        <View key={`${item.merchant}-${item.date}`} style={styles.transactionRow}>
          <View style={styles.transactionAvatar}>
            <Text style={styles.transactionAvatarText}>
              {item.merchant.slice(0, 1)}
            </Text>
          </View>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionName}>{item.merchant}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>
          <Text style={styles.transactionAmount}>{item.amount}</Text>
        </View>
      ))}
    </View>
  );
}

function RoundButton({
  label,
  filled = false,
}: {
  label: string;
  filled?: boolean;
}) {
  return (
    <View style={[styles.roundButton, filled ? styles.roundFilled : styles.roundGhost]}>
      <Text style={filled ? styles.roundFilledLabel : styles.roundGhostLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: palette.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.bodyStrong,
  },
  eyebrow: {
    ...typography.eyebrow,
  },
  headerName: {
    ...typography.title,
    fontSize: 28,
    lineHeight: 32,
  },
  heroCard: {
    padding: spacing.xl,
    backgroundColor: palette.canvasWarm,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceValue: {
    ...typography.display,
    marginTop: spacing.xs,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroFooter: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.lg,
  },
  heroCaption: {
    ...typography.body,
    color: palette.inkMuted,
    flex: 1,
  },
  heroAccent: {
    width: 92,
    height: 92,
    borderRadius: radii.xl,
    backgroundColor: palette.accent,
    opacity: 0.22,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  roundFilled: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  roundGhost: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
  },
  roundFilledLabel: {
    ...typography.bodyStrong,
    color: palette.surface,
  },
  roundGhostLabel: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
  sectionGap: {
    gap: spacing.lg,
  },
  sectionTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    ...typography.title,
    fontSize: 22,
    lineHeight: 28,
  },
  sectionAction: {
    ...typography.bodyStrong,
    color: palette.accent,
  },
  cardDeck: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  bankCard: {
    flex: 1,
    minHeight: 188,
    borderRadius: radii.xl,
    padding: spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  darkBankCard: {
    backgroundColor: '#071218',
  },
  lightBankCard: {
    backgroundColor: palette.accent,
  },
  darkCardAmount: {
    ...typography.title,
    color: palette.surface,
  },
  lightCardAmount: {
    ...typography.title,
  },
  darkCardLabel: {
    ...typography.body,
    color: palette.surface,
  },
  lightCardLabel: {
    ...typography.body,
  },
  darkCardSuffix: {
    ...typography.eyebrow,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: spacing.xs,
  },
  lightCardSuffix: {
    ...typography.eyebrow,
    color: 'rgba(12, 35, 42, 0.72)',
    marginTop: spacing.xs,
  },
  cardPattern: {
    position: 'absolute',
    right: -12,
    top: 28,
    width: 96,
    height: 132,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    opacity: 0.28,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
  },
  statValue: {
    ...typography.title,
    marginTop: spacing.sm,
  },
  statNote: {
    ...typography.eyebrow,
    marginTop: spacing.xs,
  },
  analyticsCard: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    height: 34,
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  chipIdle: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
  },
  chipTextActive: {
    ...typography.eyebrow,
    color: palette.surface,
  },
  chipTextIdle: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  analyticsBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.lg,
  },
  analyticsCopy: {
    flex: 1,
  },
  analyticsValue: {
    ...typography.amount,
    marginTop: spacing.xs,
  },
  analyticsMonth: {
    ...typography.body,
    color: palette.inkMuted,
    marginTop: spacing.xs,
  },
  ringWrap: {
    width: 164,
    height: 164,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
    width: 154,
    height: 154,
    borderRadius: radii.pill,
    borderWidth: 14,
    borderColor: 'rgba(12, 35, 42, 0.06)',
  },
  ringSegmentHorizontal: {
    position: 'absolute',
    width: 76,
    height: 20,
    borderRadius: radii.pill,
  },
  ringSegmentVertical: {
    position: 'absolute',
    width: 20,
    height: 74,
    borderRadius: radii.pill,
  },
  segmentTop: {
    top: 10,
    backgroundColor: palette.chartLavender,
  },
  segmentRight: {
    right: 6,
    backgroundColor: palette.accent,
  },
  segmentBottom: {
    bottom: 8,
    width: 82,
    backgroundColor: palette.chartMint,
  },
  segmentLeft: {
    left: 8,
    backgroundColor: palette.chartOrange,
  },
  ringCenter: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenterLabel: {
    ...typography.bodyStrong,
    fontSize: 18,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
  legendLabel: {
    ...typography.eyebrow,
    color: palette.ink,
  },
  transactionsCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  transactionAvatar: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionAvatarText: {
    ...typography.bodyStrong,
    color: palette.accent,
  },
  transactionMeta: {
    flex: 1,
  },
  transactionName: {
    ...typography.bodyStrong,
  },
  transactionDate: {
    ...typography.eyebrow,
    marginTop: 2,
  },
  transactionAmount: {
    ...typography.bodyStrong,
    color: palette.ink,
  },
});

export default App;
