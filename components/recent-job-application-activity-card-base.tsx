import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useReachTheme } from '@/components/reach-theme-provider';
import {
  RecentJobApplicationActivityPoint,
  useRecentJobApplicationActivity,
} from '@/hooks/use-recent-job-application-activity';
import {
  RecentJobApplicationElapsedTimePoint,
  useRecentJobApplicationElapsedTime,
} from '@/hooks/use-recent-job-application-elapsed-time';

type JobApplicationActivityChartProps = {
  accentColor: string;
  ariaLabel?: string;
  data: RecentJobApplicationActivityPoint[] | RecentJobApplicationElapsedTimePoint[];
  formatYLabel?: (value: number) => string;
  gradientId?: string;
  gridColor: string;
  labelColor: string;
  secondaryAccentColor?: string;
  secondaryData?: RecentJobApplicationActivityPoint[];
  secondaryFormatYLabel?: (value: number) => string;
};

type RecentJobApplicationActivityCardBaseProps = {
  ChartComponent: (props: JobApplicationActivityChartProps) => React.ReactNode;
};

export function RecentJobApplicationActivityCardBase({
  ChartComponent,
}: RecentJobApplicationActivityCardBaseProps) {
  const { theme } = useReachTheme();
  const dashboard = theme.dashboard;
  const dashboardValueColor = dashboard.value;
  const { activity, error, isLoading, refresh, stats } = useRecentJobApplicationActivity();
  const {
    elapsedTime,
    error: elapsedTimeError,
    isLoading: elapsedTimeLoading,
    refresh: refreshElapsedTime,
    stats: elapsedTimeStats,
  } = useRecentJobApplicationElapsedTime();
  const averageLabel = stats.average.toFixed(1);
  const elapsedAverageLabel = `${elapsedTimeStats.average.toFixed(1)}h`;
  const elapsedFastestLabel = `${elapsedTimeStats.fastest.toFixed(1)}h`;
  const elapsedHoursColor = dashboard.signalBarActive;
  const isChartLoading = isLoading || elapsedTimeLoading;

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshElapsedTime();
    }, [refresh, refreshElapsedTime])
  );

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
      <LinearGradient
        colors={[dashboard.noteBackground, 'rgba(255,255,255,0)']}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={styles.cardGlow}
      />

      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: dashboard.label }]}>10-day applications</Text>
          <Text style={[styles.title, { color: dashboardValueColor }]}>
            Daily Application Productivity
          </Text>
          <Text style={[styles.subtitle, { color: dashboard.body }]}>
            Elapsed application hours and jobs applied across the most recent 10-day window.
          </Text>
        </View>

        <View style={[styles.totalPill, { backgroundColor: dashboard.noteBackground }]}>
          <Text style={[styles.totalValue, { color: dashboardValueColor }]}>
            {isLoading ? '--' : stats.total}
          </Text>
          <Text style={[styles.totalLabel, { color: dashboard.label }]}>total</Text>
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: elapsedHoursColor }]} />
          <Text style={[styles.legendLabel, { color: dashboard.body }]}>hours, left axis</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: dashboardValueColor }]} />
          <Text style={[styles.legendLabel, { color: dashboard.body }]}>
            applications, right axis
          </Text>
        </View>
      </View>

      <View style={styles.chartWrap}>
        <ChartComponent
          accentColor={elapsedHoursColor}
          ariaLabel="Recent job application elapsed time and application count bar chart"
          data={elapsedTime}
          formatYLabel={(value) => value.toFixed(1)}
          gradientId="recentJobApplicationBars"
          gridColor={dashboard.cardBorder}
          labelColor={dashboard.label}
          secondaryAccentColor={dashboardValueColor}
          secondaryData={activity}
          secondaryFormatYLabel={(value) => `${Math.round(value)}`}
        />
        {isChartLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={dashboardValueColor} />
          </View>
        ) : null}
      </View>

      <View style={styles.statRow}>
        <View style={[styles.statChip, { borderColor: dashboard.cardBorder }]}>
          <Text style={[styles.statValue, { color: dashboardValueColor }]}>{stats.peak}</Text>
          <Text style={[styles.statLabel, { color: dashboard.body }]}>best day</Text>
        </View>
        <View style={[styles.statChip, { borderColor: dashboard.cardBorder }]}>
          <Text style={[styles.statValue, { color: dashboardValueColor }]}>{averageLabel}</Text>
          <Text style={[styles.statLabel, { color: dashboard.body }]}>daily avg</Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={[styles.statChip, { borderColor: dashboard.cardBorder }]}>
          <Text style={[styles.statValue, { color: dashboardValueColor }]}>{elapsedFastestLabel}</Text>
          <Text style={[styles.statLabel, { color: dashboard.body }]}>Fastest Time</Text>
        </View>
        <View style={[styles.statChip, { borderColor: dashboard.cardBorder }]}>
          <Text style={[styles.statValue, { color: dashboardValueColor }]}>{elapsedAverageLabel}</Text>
          <Text style={[styles.statLabel, { color: dashboard.body }]}>avg span</Text>
        </View>
      </View>

      {error ? <Text style={[styles.errorText, { color: dashboard.body }]}>{error}</Text> : null}
      {elapsedTimeError ? (
        <Text style={[styles.errorText, { color: dashboard.body }]}>{elapsedTimeError}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    overflow: 'hidden',
    padding: 22,
    position: 'relative',
  },
  cardGlow: {
    height: 180,
    opacity: 0.56,
    position: 'absolute',
    right: -80,
    top: -80,
    width: 220,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    gap: 5,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 420,
  },
  totalPill: {
    alignItems: 'center',
    borderRadius: 18,
    minWidth: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chartWrap: {
    height: 240,
    marginHorizontal: -8,
    position: 'relative',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendSwatch: {
    borderRadius: 999,
    height: 9,
    width: 9,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
