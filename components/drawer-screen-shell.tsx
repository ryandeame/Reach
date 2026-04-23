import { ReactNode } from 'react';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { DrawerSceneWrapper } from '@/components/drawer-scene-wrapper';
import { useReachTheme } from '@/components/reach-theme-provider';

type DrawerScreenShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function DrawerScreenShell({ title, subtitle, children }: DrawerScreenShellProps) {
  const navigation = useNavigation();
  const { theme } = useReachTheme();

  return (
    <DrawerSceneWrapper>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.shell.background }]}
        edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Open navigation drawer"
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={({ pressed }) => [
              styles.menuButton,
              {
                backgroundColor: pressed ? theme.shell.menuPressed : theme.shell.menuBackground,
                borderColor: theme.shell.menuBorder,
              },
            ]}>
            <MaterialIcons name="menu" size={24} color={theme.shell.menuIcon} />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.shell.title }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: theme.shell.subtitle }]}>{subtitle}</Text>
            ) : null}
          </View>
        </View>

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
    borderRadius: 18,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  body: {
    flex: 1,
  },
});
