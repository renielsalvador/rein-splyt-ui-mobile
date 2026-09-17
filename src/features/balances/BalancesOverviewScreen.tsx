import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useApp} from '../../app/AppProvider';
import type {ScreenProps} from '../../app/navigation';
import {
  AppAvatar,
  AppIcon,
  AppScreen,
  BrandLogo,
  EmptyState,
  HeaderMenuButton,
  MoneyValue,
  NotificationButton,
  SectionRule,
} from '../../components/ui';
import {AccountSheet} from '../settings/AccountSheet';
import {cardShadow, radii, spacing, typeScale} from '../../theme/tokens';
import type {Colors} from '../../theme/tokens';
import {useStyles} from '../../theme/ThemeProvider';
import {formatCurrencyCompact} from '../../lib/utils/format';
import type {CurrencyCode} from '../../types/domain';

type Counterparty = {
  key: string;
  displayName: string;
  currency: CurrencyCode;
  /** Positive means they owe you; negative means you owe them. */
  net: number;
  entries: number;
  eventNames: string[];
  eventIds: string[];
  /** Placeholder members have no account, so they can never merge across events. */
  eventScoped: boolean;
};

type FundLine = {
  eventId: string;
  eventName: string;
  currency: CurrencyCode;
  pooled: number;
  spent: number;
};

export function BalancesOverviewScreen({
  navigation,
  hasTabBar,
  tabBarBottomInset,
}: ScreenProps<'BalancesOverview'> & {hasTabBar?: boolean; tabBarBottomInset?: number}) {
  const {currentUser, events, summaries, settlements, hydrateEvent, pendingInvites} = useApp();
  const styles = useStyles(createStyles);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    events.forEach(event => {
      if (!summaries[event.id]) {
        hydrateEvent(event.id).catch(() => undefined);
      }
    });
  }, [events, hydrateEvent, summaries]);

  const hydratedCount = events.filter(event => settlements[event.id]).length;
  const stillLoading = hydratedCount < events.length;

  const {owed, owing, settled, totals} = useMemo(() => {
    const byKey = new Map<string, Counterparty>();

    events.forEach(event => {
      const summary = summaries[event.id];
      const instructions = settlements[event.id];
      if (!summary || !instructions) {
        return;
      }

      const selfMemberId = summary.members.find(
        member => member.userId === currentUser?.id,
      )?.id;
      if (!selfMemberId) {
        return;
      }

      instructions.forEach(instruction => {
        const isDebtor = instruction.fromMemberId === selfMemberId;
        const isCreditor = instruction.toMemberId === selfMemberId;
        if (!isDebtor && !isCreditor) {
          return;
        }

        const otherMemberId = isDebtor ? instruction.toMemberId : instruction.fromMemberId;
        const otherName = isDebtor ? instruction.toDisplayName : instruction.fromDisplayName;
        const otherUserId = summary.members.find(member => member.id === otherMemberId)?.userId;
        const eventScoped = !otherUserId;
        const identity = otherUserId ?? `${event.id}:${otherMemberId}`;
        const key = `${identity}:${event.currency}`;

        const existing = byKey.get(key);
        const delta = isDebtor ? -instruction.amount : instruction.amount;

        if (existing) {
          existing.net += delta;
          existing.entries += 1;
          if (!existing.eventNames.includes(event.name)) {
            existing.eventNames.push(event.name);
          }
          if (!existing.eventIds.includes(event.id)) {
            existing.eventIds.push(event.id);
          }
          return;
        }

        byKey.set(key, {
          key,
          displayName: otherName,
          currency: event.currency,
          net: delta,
          entries: 1,
          eventNames: [event.name],
          eventIds: [event.id],
          eventScoped,
        });
      });
    });

    const all = [...byKey.values()];
    const totalsByCurrency = new Map<CurrencyCode, number>();
    all.forEach(person => {
      totalsByCurrency.set(
        person.currency,
        (totalsByCurrency.get(person.currency) ?? 0) + person.net,
      );
    });

    return {
      owed: all.filter(person => person.net > 0.005).sort((a, b) => b.net - a.net),
      owing: all.filter(person => person.net < -0.005).sort((a, b) => a.net - b.net),
      settled: all.filter(person => Math.abs(person.net) <= 0.005),
      totals: [...totalsByCurrency.entries()],
    };
  }, [currentUser?.id, events, settlements, summaries]);

  const funds = useMemo<FundLine[]>(
    () =>
      events
        .map(event => {
          const summary = summaries[event.id];
          if (!summary?.fund) {
            return undefined;
          }
          const pooled = summary.contributions.reduce(
            (sum, contribution) => sum + contribution.amount,
            0,
          );
          const spent = summary.expenses
            .filter(expense => expense.paymentSource === 'central_fund')
            .reduce((sum, expense) => sum + expense.amount, 0);
          if (pooled === 0 && spent === 0) {
            return undefined;
          }
          return {
            eventId: event.id,
            eventName: event.name,
            currency: event.currency,
            pooled,
            spent,
          };
        })
        .filter((line): line is FundLine => Boolean(line)),
    [events, summaries],
  );

  const hasAnything = owed.length > 0 || owing.length > 0 || settled.length > 0;
  const owedTotal = owed.reduce((sum, person) => sum + person.net, 0);
  const owingTotal = owing.reduce((sum, person) => sum + Math.abs(person.net), 0);

  return (
    <>
      <AppScreen
        variant="main"
        hasTabBar={hasTabBar}
        tabBarBottomInset={tabBarBottomInset}
        title="Balances"
        headerLeft={
          <View style={styles.brandRow}>
            <BrandLogo />
            <Text style={styles.brandName}>Balances</Text>
          </View>
        }
        headerRight={
          <>
            <NotificationButton
              unreadCount={pendingInvites.length}
              onPress={() => navigation.navigate('Activity')}
            />
            <HeaderMenuButton
              onPress={() => setAccountOpen(true)}
              avatarUrl={currentUser?.avatarUrl}
              avatarFallbackLabel={currentUser?.displayName}
            />
          </>
        }>
        {totals.length > 0 ? (
          <View style={styles.hero}>
            {totals.map(([currency, net]) => (
              <View key={currency} style={styles.heroBlock}>
                <Text style={styles.heroLabel}>
                  {Math.abs(net) <= 0.005
                    ? 'Across all trips'
                    : net < 0
                      ? 'You owe, across all trips'
                      : "You're owed, across all trips"}
                </Text>
                <MoneyValue
                  value={net}
                  currency={currency}
                  size="hero"
                  absolute
                  tone={Math.abs(net) <= 0.005 ? 'muted' : net < 0 ? 'negative' : 'positive'}
                />
              </View>
            ))}
            <Text style={styles.heroMeta}>
              {stillLoading
                ? `Adding up ${events.length - hydratedCount} more trip${
                    events.length - hydratedCount === 1 ? '' : 's'
                  }…`
                : `${owed.length + owing.length} open · ${settled.length} settled`}
            </Text>
          </View>
        ) : null}

        {!hasAnything && !stillLoading ? (
          <EmptyState
            title="Nothing to settle"
            body="Once your group logs expenses, who owes whom shows up here across every trip."
          />
        ) : null}

        {owing.length > 0 ? (
          <>
            <SectionRule title="You owe" detail={formatTotal(owingTotal, owing[0].currency)} />
            {owing.map(person => (
              <PersonRow
                key={person.key}
                person={person}
                onSettle={id => navigation.navigate('Settlement', {eventId: id})}
              />
            ))}
          </>
        ) : null}

        {owed.length > 0 ? (
          <>
            <SectionRule title="You're owed" detail={formatTotal(owedTotal, owed[0].currency)} />
            {owed.map(person => (
              <PersonRow
                key={person.key}
                person={person}
                onSettle={id => navigation.navigate('Settlement', {eventId: id})}
              />
            ))}
          </>
        ) : null}

        {settled.length > 0 ? (
          <>
            <SectionRule title="Settled" />
            {settled.map(person => (
              <PersonRow key={person.key} person={person} dimmed />
            ))}
          </>
        ) : null}

        {funds.length > 0 ? (
          <>
            <SectionRule title="Central funds" />
            {funds.map(fund => (
              <Pressable
                key={fund.eventId}
                accessibilityRole="button"
                accessibilityLabel={`Open the central fund for ${fund.eventName}`}
                onPress={() => navigation.navigate('CentralFund', {eventId: fund.eventId})}
                style={({pressed}) => [styles.row, pressed ? styles.pressed : null]}>
                <View style={styles.badge}>
                  <AppIcon name="fund" tone="accent" size={18} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {fund.eventName}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {`${formatTotal(fund.pooled, fund.currency)} pooled · ${formatTotal(
                      fund.spent,
                      fund.currency,
                    )} spent`}
                  </Text>
                </View>
                <View style={styles.trailing}>
                  <MoneyValue
                    value={fund.pooled - fund.spent}
                    currency={fund.currency}
                    size="inline"
                  />
                  <Text style={styles.rowMeta}>left</Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : null}
      </AppScreen>

      <AccountSheet
        visible={accountOpen}
        onClose={() => setAccountOpen(false)}
        onOpenProfile={() => {
          setAccountOpen(false);
          navigation.navigate('AccountUpdate');
        }}
        onOpenHelp={() => navigation.navigate('HelpSupport')}
        onOpenDeleteAccount={() => navigation.navigate('DeleteAccount')}
        onOpenNotifications={() => navigation.navigate('NotificationSettings')}
      />
    </>
  );
}

function PersonRow({
  person,
  dimmed = false,
  onSettle,
}: {
  person: Counterparty;
  dimmed?: boolean;
  onSettle?: (eventId: string) => void;
}) {
  const styles = useStyles(createStyles);
  const settledUp = Math.abs(person.net) <= 0.005;
  // A counterparty spanning several trips has no single settle-up screen to open.
  const settleEventId =
    !settledUp && person.eventIds.length === 1 ? person.eventIds[0] : undefined;

  const content = (
    <>
      <AppAvatar name={person.displayName} size="md" />
      <View style={styles.flex}>
        <Text style={[styles.rowName, dimmed ? styles.dimText : null]} numberOfLines={1}>
          {person.displayName}
        </Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {person.eventScoped
            ? `${person.eventNames[0]} · no account yet`
            : person.eventNames.join(' · ')}
        </Text>
      </View>
      <View style={styles.trailing}>
        {settledUp ? (
          <Text style={styles.rowMeta}>Settled up</Text>
        ) : (
          <>
            <MoneyValue
              value={person.net}
              currency={person.currency}
              size="inline"
              absolute
              tone={person.net < 0 ? 'negative' : 'positive'}
            />
            <Text style={styles.rowMeta}>
              {person.entries} expense{person.entries === 1 ? '' : 's'}
            </Text>
          </>
        )}
      </View>
    </>
  );

  if (!onSettle || !settleEventId) {
    return <View style={[styles.row, dimmed ? styles.rowDim : null]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Settle up with ${person.displayName}`}
      onPress={() => onSettle(settleEventId)}
      style={({pressed}) => [
        styles.row,
        dimmed ? styles.rowDim : null,
        pressed ? styles.pressed : null,
      ]}>
      {content}
    </Pressable>
  );
}

function formatTotal(value: number, currency: CurrencyCode) {
  return formatCurrencyCompact(value, currency);
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    flex: {flex: 1, minWidth: 0},
    pressed: {opacity: 0.82},
    brandRow: {flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1},
    brandName: {...typeScale.bodyStrong, fontSize: 18, color: colors.onHeader},

    hero: {
      backgroundColor: colors.brandSoft,
      borderRadius: radii.xl,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    heroBlock: {gap: 3},
    heroLabel: {...typeScale.caption, fontSize: 12.5, color: colors.onBrandSoft},
    heroMeta: {...typeScale.caption, fontSize: 12.5, color: colors.onBrandSoft},

    row: {
      backgroundColor: colors.surface,
      borderRadius: radii.lg,
      paddingVertical: 13,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 4,
      ...cardShadow(colors),
    },
    rowDim: {backgroundColor: colors.surfaceSunken, shadowOpacity: 0, elevation: 0},
    rowName: {...typeScale.bodyStrong, fontSize: 15.5, color: colors.ink},
    rowMeta: {...typeScale.caption, fontSize: 12.5, color: colors.inkMuted, marginTop: 2},
    dimText: {color: colors.inkMuted},
    trailing: {alignItems: 'flex-end'},
    badge: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.brandSofter,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
