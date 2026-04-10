import Ionicons from '@expo/vector-icons/Ionicons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'bottom']}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Reach</Text>
        <Text style={styles.title}>Outreach Hub</Text>
        <Text style={styles.copy}>
          Move between your logging flow and the initiative dashboard from one place.
        </Text>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.footerCard}>
          <Ionicons name="sparkles-outline" size={18} color="#99F6E4" />
          <Text style={styles.footerText}>Keep the drawer lean while the app takes shape.</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
    flex: 1,
    paddingVertical: 20,
  },
  hero: {
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  eyebrow: {
    color: '#99F6E4',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  copy: {
    color: '#D9E2EC',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 220,
  },
  scrollContent: {
    paddingTop: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 18,
  },
  footerCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  footerText: {
    color: '#E6FFFA',
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
