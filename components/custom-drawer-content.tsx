import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  reachThemeOptions,
  ReachThemeName,
  useReachTheme,
} from '@/components/reach-theme-provider';

const navItems = [
  {
    icon: 'send',
    label: 'Outreach Log',
    route: 'outreach-log',
  },
  {
    icon: 'share',
    label: 'Social Post Log',
    route: 'social-post-log',
  },
  {
    icon: 'work',
    label: 'Apply Log',
    route: 'apply-log',
  },
  {
    icon: 'dashboard',
    label: 'Initiative Dashboard',
    route: 'initiative-dashboard',
  },
] as const;

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { theme, themeName, setThemeName } = useReachTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(true);
  const activeRoute = props.state.routes[props.state.index]?.name;
  const selectedTheme = reachThemeOptions.find((option) => option.name === themeName);

  const navigateTo = (route: string) => {
    props.navigation.navigate(route);
  };

  const selectTheme = (nextTheme: ReachThemeName) => {
    setThemeName(nextTheme);
    setIsThemeOpen(false);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.drawer.background }]}
      edges={['top', 'left', 'bottom']}>
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: theme.drawer.eyebrow }]}>Reach</Text>
        <Text style={[styles.title, { color: theme.drawer.title }]}>Outreach Hub</Text>
        <Text style={[styles.copy, { color: theme.drawer.copy }]}>
          Switch between your core workflow, dashboard, and visual system from one place.
        </Text>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}>
        <View style={styles.navStack}>
          {navItems.map((item) => {
            const isActive = activeRoute === item.route;

            return (
              <Pressable
                key={item.route}
                onPress={() => navigateTo(item.route)}
                style={({ pressed }) => [
                  styles.navItem,
                  {
                    backgroundColor: isActive
                      ? theme.drawer.activeBackground
                      : pressed
                        ? theme.drawer.optionBackground
                        : 'transparent',
                  },
                ]}>
                <MaterialIcons
                  name={item.icon}
                  color={isActive ? theme.drawer.activeText : theme.drawer.inactiveText}
                  size={22}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: isActive ? theme.drawer.activeText : theme.drawer.inactiveText },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.themePanel, { borderColor: theme.drawer.border }]}>
          <Pressable
            onPress={() => setIsThemeOpen((current) => !current)}
            style={({ pressed }) => [
              styles.themeTrigger,
              { backgroundColor: pressed ? theme.drawer.optionBackground : 'transparent' },
            ]}>
            <View style={styles.themeTriggerCopy}>
              <MaterialIcons name="palette" color={theme.drawer.inactiveText} size={21} />
              <View>
                <Text style={[styles.themeLabel, { color: theme.drawer.copy }]}>Theme</Text>
                <Text style={[styles.themeValue, { color: theme.drawer.title }]}>
                  {selectedTheme?.label ?? 'Default'}
                </Text>
              </View>
            </View>
            <MaterialIcons
              name={isThemeOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              color={theme.drawer.inactiveText}
              size={18}
            />
          </Pressable>

          {isThemeOpen ? (
            <View style={styles.themeOptions}>
              {reachThemeOptions.map((option) => {
                const isSelected = option.name === themeName;

                return (
                  <Pressable
                    key={option.name}
                    onPress={() => selectTheme(option.name)}
                    style={({ pressed }) => [
                      styles.themeOption,
                      {
                        backgroundColor: isSelected
                          ? theme.drawer.activeBackground
                          : pressed
                            ? theme.drawer.optionBackground
                            : 'transparent',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.themeOptionText,
                        {
                          color: isSelected ? theme.drawer.activeText : theme.drawer.inactiveText,
                        },
                      ]}>
                      {option.label}
                    </Text>
                    {isSelected ? (
                      <MaterialIcons name="check" color={theme.drawer.activeText} size={18} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingVertical: 20,
  },
  hero: {
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  copy: {
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 236,
  },
  scrollContent: {
    gap: 18,
    paddingTop: 8,
  },
  navStack: {
    gap: 4,
  },
  navItem: {
    alignItems: 'center',
    borderBottomRightRadius: 999,
    borderTopRightRadius: 999,
    flexDirection: 'row',
    gap: 14,
    marginRight: 18,
    minHeight: 54,
    paddingHorizontal: 18,
  },
  navLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  themePanel: {
    borderTopWidth: 1,
    marginRight: 18,
    paddingTop: 14,
  },
  themeTrigger: {
    alignItems: 'center',
    borderBottomRightRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 18,
  },
  themeTriggerCopy: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  themeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  themeValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  themeOptions: {
    gap: 4,
    paddingTop: 8,
  },
  themeOption: {
    alignItems: 'center',
    borderBottomRightRadius: 999,
    borderTopRightRadius: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingLeft: 52,
    paddingRight: 16,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
