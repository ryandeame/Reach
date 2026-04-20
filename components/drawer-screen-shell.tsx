import { ReactNode } from 'react';
import { DrawerActions } from '@react-navigation/native';
import { Link, useNavigation, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { DrawerSceneWrapper } from '@/components/drawer-scene-wrapper';

type DrawerScreenShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function DrawerScreenShell({ title, subtitle, children }: DrawerScreenShellProps) {
  const navigation = useNavigation();
  const pathname = usePathname();
  const isWeb = Platform.OS === 'web';

  return (
    <DrawerSceneWrapper>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {isWeb ? (
          <View style={styles.webHeader}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>

            <View style={styles.webNavRow}>
              <Link href="/" asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.webNavButton,
                    pathname === '/' && styles.webNavButtonActive,
                    pressed && styles.webNavButtonPressed,
                  ]}>
                  <Text
                    style={[
                      styles.webNavButtonText,
                      pathname === '/' && styles.webNavButtonTextActive,
                    ]}>
                    Outreach Log
                  </Text>
                </Pressable>
              </Link>

              <Link href="/initiative-dashboard" asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.webNavButton,
                    pathname === '/initiative-dashboard' && styles.webNavButtonActive,
                    pressed && styles.webNavButtonPressed,
                  ]}>
                  <Text
                    style={[
                      styles.webNavButtonText,
                      pathname === '/initiative-dashboard' && styles.webNavButtonTextActive,
                    ]}>
                    Initiative Dashboard
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Open navigation drawer"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}>
              <Ionicons name="menu" size={24} color="#102A43" />
            </Pressable>

            <View style={styles.headerCopy}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
          </View>
        )}

        <View style={styles.body}>{children}</View>
      </SafeAreaView>
    </DrawerSceneWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  menuButton: {
    alignItems: 'center',
    backgroundColor: '#FCFCF9',
    borderColor: '#D9E2EC',
    borderRadius: 18,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  menuButtonPressed: {
    backgroundColor: '#EEF5FB',
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#102A43',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#52606D',
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    flex: 1,
  },
  webHeader: {
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  webNavRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  webNavButton: {
    backgroundColor: 'rgba(252, 252, 249, 0.78)',
    borderColor: '#D9E2EC',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  webNavButtonActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  webNavButtonPressed: {
    backgroundColor: '#EEF5FB',
  },
  webNavButtonText: {
    color: '#102A43',
    fontSize: 14,
    fontWeight: '700',
  },
  webNavButtonTextActive: {
    color: '#F8FFFD',
  },
});
