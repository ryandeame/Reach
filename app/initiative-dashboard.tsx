import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DailyOutreachSignalCard } from '@/components/daily-outreach-signal-card';
import { DrawerScreenShell } from '@/components/drawer-screen-shell';
import { useCompanies } from '@/hooks/use-companies';
import { usePeople } from '@/hooks/use-people';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function InitiativeDashboardScreen() {
  const { companies, isLoading: companiesLoading } = useCompanies();
  const { people, isLoading: peopleLoading } = usePeople();

  return (
    <DrawerScreenShell
      title="Initiative Dashboard"
      subtitle="A quick view of the outreach foundation you already have in place.">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Overview</Text>
          <Text style={styles.heroTitle}>See the core pieces of your initiative at a glance.</Text>
          <Text style={styles.heroCopy}>
            This stays intentionally lightweight: just the app state you need while the rest of
            Reach is still taking shape.
          </Text>
        </View>

        <DailyOutreachSignalCard />

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>People</Text>
            <Text style={styles.metricValue}>{peopleLoading ? '...' : people.length}</Text>
            <Text style={styles.metricHint}>Contacts ready for outreach logging</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Companies</Text>
            <Text style={styles.metricValue}>{companiesLoading ? '...' : companies.length}</Text>
            <Text style={styles.metricHint}>Organizations connected to your network</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Current setup</Text>
          <Text style={styles.noteCopy}>
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
    backgroundColor: '#102A43',
    borderRadius: 32,
    gap: 10,
    padding: 24,
  },
  heroEyebrow: {
    color: '#99F6E4',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroCopy: {
    color: '#D9E2EC',
    fontSize: 14,
    lineHeight: 21,
  },
  metricsRow: {
    gap: 14,
  },
  metricCard: {
    backgroundColor: '#FCFCF9',
    boxShadow: '0px 12px 22px rgba(16, 42, 67, 0.08)',
    borderRadius: 28,
    gap: 8,
    padding: 22,
  },
  metricLabel: {
    color: '#486581',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#0F766E',
    fontSize: 40,
    fontWeight: '800',
  },
  metricHint: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: '#E6FFFA',
    borderColor: '#99F6E4',
    borderRadius: 26,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  noteTitle: {
    color: '#115E59',
    fontSize: 16,
    fontWeight: '800',
  },
  noteCopy: {
    color: '#134E4A',
    fontSize: 14,
    lineHeight: 20,
  },
});
