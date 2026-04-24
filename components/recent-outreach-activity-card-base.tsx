import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useReachTheme } from '@/components/reach-theme-provider';
import {
  RecentOutreachElapsedTimePoint,
  useRecentOutreachElapsedTime,
} from '@/hooks/use-recent-outreach-elapsed-time';
import {
  RecentOutreachActivityPoint,
  useRecentOutreachActivity,
} from '@/hooks/use-recent-outreach-activity';

type OutreachActivityChartProps = {
  accentColor: string;
  ariaLabel?: string;
  data: RecentOutreachActivityPoint[] | RecentOutreachElapsedTimePoint[];
  formatYLabel?: (value: number) => string;
  gradientId?: string;
  gridColor: string;
  labelColor: string;
  secondaryAccentColor?: string;
  secondaryData?: RecentOutreachActivityPoint[];
  secondaryFormatYLabel?: (value: number) => string;
};

type RecentOutreachActivityCardBaseProps = {
  ChartComponent: (props: OutreachActivityChartProps) => React.ReactNode;
};

export function RecentOutreachActivityCardBase({
  ChartComponent,
}: RecentOutreachActivityCardBaseProps) {
  const { theme } = useReachTheme();
  const dashboard = theme.dashboard;
  const dashboardValueColor = dashboard.value;
  const { activity, error, isLoading, stats } = useRecentOutreachActivity();
  const {
    elapsedTime,
    error: elapsedTimeError,
    isLoading: elapsedTimeLoading,
    stats: elapsedTimeStats,
  } = useRecentOutreachElapsedTime();
  const averageLabel = stats.average.toFixed(1);
  const elapsedPeakLabel = `${elapsedTimeStats.peak.toFixed(1)}h`;
  const elapsedAverageLabel = `${elapsedTimeStats.average.toFixed(1)}h`;
  const elapsedHoursColor = dashboard.signalBarActive;
  const isChartLoading = isLoading || elapsedTimeLoading;

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
          <Text style={[styles.eyebrow, { color: dashboard.label }]}>10-day productivity</Text>
          <Text style={[styles.title, { color: dashboardValueColor }]}>
            Daily Outreach Productivity
          </Text>
          <Text style={[styles.subtitle, { color: dashboard.body }]}>
            Elapsed outreach hours and unique contacts across the most recent 10-day window.
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
            unique contacts, right axis
          </Text>
        </View>
      </View>

      <View style={styles.chartWrap}>
        <ChartComponent
          accentColor={elapsedHoursColor}
          ariaLabel="Recent outreach elapsed time and unique contacts bar chart"
          data={elapsedTime}
          formatYLabel={(value) => value.toFixed(1)}
          gradientId="recentOutreachElapsedHoursBars"
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
          <Text style={[styles.statValue, { color: dashboardValueColor }]}>{elapsedPeakLabel}</Text>
          <Text style={[styles.statLabel, { color: dashboard.body }]}>longest span</Text>
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
