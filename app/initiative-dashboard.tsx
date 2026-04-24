import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DailyOutreachSignalCard } from '@/components/daily-outreach-signal-card';
import { DrawerScreenShell } from '@/components/drawer-screen-shell';
import { useReachTheme } from '@/components/reach-theme-provider';
import { useCompanies } from '@/hooks/use-companies';
import { usePeople } from '@/hooks/use-people';
import { RecentOutreachActivityCard } from '../components/recent-outreach-activity-card';

export default function InitiativeDashboardScreen() {
  const { theme } = useReachTheme();
  const dashboard = theme.dashboard;
  const dashboardValueColor = dashboard.value;
  const { companies, isLoading: companiesLoading } = useCompanies();
  const { people, isLoading: peopleLoading } = usePeople();

  return (
    <DrawerScreenShell
      title="Initiative Dashboard"
      subtitle="A quick view of the outreach foundation you already have in place.">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: dashboard.background },
        ]}
        showsVerticalScrollIndicator={false}>
        <RecentOutreachActivityCard />

        <DailyOutreachSignalCard />

        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: dashboard.cardBackground,
                borderColor: dashboard.cardBorder,
                boxShadow: dashboard.cardShadow,
              },
            ]}>
            <Text style={[styles.metricLabel, { color: dashboard.label }]}>People</Text>
            <Text style={[styles.metricValue, { color: dashboardValueColor }]}>
              {peopleLoading ? '...' : people.length}
            </Text>
            <Text style={[styles.metricHint, { color: dashboard.body }]}>
              Contacts ready for outreach logging
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: dashboard.cardBackground,
                borderColor: dashboard.cardBorder,
                boxShadow: dashboard.cardShadow,
              },
            ]}>
            <Text style={[styles.metricLabel, { color: dashboard.label }]}>Companies</Text>
            <Text style={[styles.metricValue, { color: dashboardValueColor }]}>
              {companiesLoading ? '...' : companies.length}
            </Text>
            <Text style={[styles.metricHint, { color: dashboard.body }]}>
              Organizations connected to your network
            </Text>
          </View>
        </View>

      </ScrollView>
    </DrawerScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  metricsRow: {
    gap: 14,
  },
  metricCard: {
    borderWidth: 1,
    borderRadius: 28,
    gap: 8,
    padding: 22,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 40,
    fontWeight: '800',
  },
  metricHint: {
    fontSize: 14,
    lineHeight: 20,
  },
});
