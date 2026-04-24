import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import { useReachTheme } from '@/components/reach-theme-provider';
import { useDailyUniqueOutreachCount } from '@/hooks/use-daily-unique-outreach-count';

const BAR_HEIGHTS = [14, 22, 30, 38, 46];
const DAILY_GOAL = 10;

function getFilledBarCount(count: number) {
  if (count <= 0) {
    return 0;
  }

  return Math.min(BAR_HEIGHTS.length, Math.floor(count / 2));
}

function formatCurrentMoment(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function DailyOutreachSignalCard() {
  const { theme } = useReachTheme();
  const dashboard = theme.dashboard;
  const dashboardValueColor = dashboard.value;
  const [now, setNow] = useState(() => new Date());
  const { count, isLoading, error } = useDailyUniqueOutreachCount(now);

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, [])
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const filledBars = useMemo(() => getFilledBarCount(count), [count]);
  const progressLabel = isLoading ? 'Loading today...' : `${count} / ${DAILY_GOAL} unique contacts`;
  const supportingCopy = error
    ? error
    : count >= DAILY_GOAL
      ? 'Signal is fully charged for today.'
      : 'Every full 2 unique contacts lights up one more bar.';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dashboard.cardBackground,
          borderColor: dashboard.cardBorder,
          boxShadow: dashboard.cardShadow,
        },
      ]}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: dashboard.label }]}>Today&apos;s Signal</Text>
          <Text style={[styles.title, { color: dashboardValueColor }]}>{formatCurrentMoment(now)}</Text>
          <Text style={[styles.subtitle, { color: dashboard.body }]}>{progressLabel}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={[styles.signalWrap, { backgroundColor: dashboard.signalPanel }]}>
          {BAR_HEIGHTS.map((height, index) => {
            const active = index < filledBars;

            return (
              <View
                key={height}
                style={[
                  styles.bar,
                  { height, opacity: active ? 1 : 0.2 },
                  {
                    backgroundColor: active
                      ? dashboard.signalBarActive
                      : dashboard.signalBarInactive,
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.meta}>
          <Text style={[styles.count, { color: dashboardValueColor }]}>{isLoading ? '...' : count}</Text>
          <Text style={[styles.countLabel, { color: dashboard.label }]}>
            unique contacts logged today
          </Text>
          <Text style={[styles.hint, { color: dashboard.body }]}>{supportingCopy}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 28,
    gap: 18,
    padding: 22,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  body: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
  },
  signalWrap: {
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 104,
    minWidth: 108,
    paddingHorizontal: 14,
    paddingBottom: 18,
    paddingTop: 14,
  },
  bar: {
    borderRadius: 999,
    width: 10,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  count: {
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 48,
  },
  countLabel: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
  },
});
