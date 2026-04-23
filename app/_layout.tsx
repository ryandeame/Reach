import Ionicons from '@expo/vector-icons/Ionicons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CustomDrawerContent } from '@/components/custom-drawer-content';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Drawer
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerShown: false,
            overlayColor: 'transparent',
            sceneStyle: {
              backgroundColor: '#0F766E',
            },
            drawerStyle: {
              backgroundColor: 'transparent',
              width: '72%',
              paddingTop: 36,
            },
            drawerActiveBackgroundColor: '#14B8A6',
            drawerInactiveBackgroundColor: 'transparent',
            drawerActiveTintColor: '#FFFFFF',
            drawerInactiveTintColor: '#D9E2EC',
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
          <Drawer.Screen
            name="index"
            options={{
              href: null,
            }}
          />
          <Drawer.Screen
            name="outreach-log"
            options={{
              title: 'Outreach Log',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="paper-plane-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="outreach-log-noir"
            options={{
              title: 'Outreach Log Noir',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="moon-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="outreach-log-momentum"
            options={{
              title: 'Outreach Log Momentum',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="flash-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="outreach-log-glass"
            options={{
              title: 'Outreach Log Glass',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="sparkles-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="new-noir"
            options={{
              title: 'New Noir',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="scan-outline" color={color} size={size} />
              ),
            }}
          />
          <Drawer.Screen
            name="initiative-dashboard"
            options={{
              title: 'Initiative Dashboard',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="grid-outline" color={color} size={size} />
              ),
            }}
          />
        </Drawer>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
