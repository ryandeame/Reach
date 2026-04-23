import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DailyOutreachSignalCard } from '@/components/daily-outreach-signal-card';
import { DrawerScreenShell } from '@/components/drawer-screen-shell';
import { useReachTheme } from '@/components/reach-theme-provider';
import { useCompanies } from '@/hooks/use-companies';
import { usePeople } from '@/hooks/use-people';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function InitiativeDashboardScreen() {
  const { theme } = useReachTheme();
  const dashboard = theme.dashboard;
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
        <View style={[styles.hero, { backgroundColor: dashboard.heroBackground }]}>
          <Text style={[styles.heroEyebrow, { color: dashboard.heroAccent }]}>Overview</Text>
          <Text style={[styles.heroTitle, { color: dashboard.heroText }]}>
            See the core pieces of your initiative at a glance.
          </Text>
          <Text style={[styles.heroCopy, { color: dashboard.heroCopy }]}>
            This stays intentionally lightweight: just the app state you need while the rest of
            Reach is still taking shape.
          </Text>
        </View>

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
            <Text style={[styles.metricValue, { color: dashboard.value }]}>
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
            <Text style={[styles.metricValue, { color: dashboard.value }]}>
              {companiesLoading ? '...' : companies.length}
            </Text>
            <Text style={[styles.metricHint, { color: dashboard.body }]}>
              Organizations connected to your network
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.noteCard,
            {
              backgroundColor: dashboard.noteBackground,
              borderColor: dashboard.noteBorder,
            },
          ]}>
          <Text style={[styles.noteTitle, { color: dashboard.noteTitle }]}>Current setup</Text>
          <Text style={[styles.noteCopy, { color: dashboard.body }]}>
            {isSupabaseConfigured
              ? 'Supabase environment variables are loaded, so this dashboard reflects the live project state.'
              : 'Supabase environment variables are missing, so this dashboard will stay empty until they are added.'}
          </Text>
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
  hero: {
    borderRadius: 32,
    gap: 10,
    padding: 24,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroCopy: {
    fontSize: 14,
    lineHeight: 21,
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
  noteCard: {
    borderRadius: 26,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  noteCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
});
