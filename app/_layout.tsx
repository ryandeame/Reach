import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CustomDrawerContent } from '@/components/custom-drawer-content';
import { ReachThemeProvider, useReachTheme } from '@/components/reach-theme-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

function RootDrawer() {
  const { theme } = useReachTheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        overlayColor: 'transparent',
        sceneStyle: {
          backgroundColor: theme.drawer.background,
        },
        drawerStyle: {
          backgroundColor: 'transparent',
          width: '72%',
          paddingTop: 36,
        },
        drawerActiveBackgroundColor: theme.drawer.activeBackground,
        drawerInactiveBackgroundColor: 'transparent',
        drawerActiveTintColor: theme.drawer.activeText,
        drawerInactiveTintColor: theme.drawer.inactiveText,
        drawerLabelStyle: {
          marginLeft: -10,
          fontSize: 17,
          fontWeight: '700',
        },
        drawerItemStyle: {
          marginLeft: 0,
          marginRight: 18,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          borderTopRightRadius: 999,
          borderBottomRightRadius: 999,
        },
      }}>
      <Drawer.Screen name="index" />
      <Drawer.Screen
        name="outreach-log"
        options={{
          title: 'Outreach Log',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="send" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="social-post-log"
        options={{
          title: 'Social Post Log',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="share" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="initiative-dashboard"
        options={{
          title: 'Initiative Dashboard',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen name="outreach-log-noir" />
      <Drawer.Screen name="outreach-log-momentum" />
      <Drawer.Screen name="outreach-log-glass" />
      <Drawer.Screen name="new-noir" />
    </Drawer>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ReachThemeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootDrawer />
          <StatusBar style="light" />
        </ThemeProvider>
      </ReachThemeProvider>
    </GestureHandlerRootView>
  );
}
