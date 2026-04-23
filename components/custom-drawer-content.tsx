import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const visibleRoutes = props.state.routes.filter((route) => route.name !== 'index');
  const visibleRouteNames = props.state.routeNames.filter((routeName) => routeName !== 'index');
  const activeRouteKey = props.state.routes[props.state.index]?.key;
  const visibleIndex = Math.max(
    0,
    visibleRoutes.findIndex((route) => route.key === activeRouteKey)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'bottom']}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Reach</Text>
        <Text style={styles.title}>Outreach Hub</Text>
        <Text style={styles.copy}>
          Move between the live outreach flow, four demo directions, and the initiative dashboard
          from one place.
        </Text>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}>
        <DrawerItemList
          {...props}
          state={{
            ...props.state,
            index: visibleIndex,
            routeNames: visibleRouteNames,
            routes: visibleRoutes,
          }}
        />
      </DrawerContentScrollView>
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
});
