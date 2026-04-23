import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type ReachThemeName = 'default' | 'noir' | 'momentum' | 'glass';

type DrawerTheme = {
  background: string;
  eyebrow: string;
  title: string;
  copy: string;
  activeBackground: string;
  activeText: string;
  inactiveText: string;
  border: string;
  optionBackground: string;
};

type ShellTheme = {
  background: string;
  menuBackground: string;
  menuBorder: string;
  menuIcon: string;
  menuPressed: string;
  title: string;
  subtitle: string;
};

type WorkflowTheme = {
  background: string;
  backgroundGradient?: {
    colors: [string, string, ...string[]];
    locations?: [number, number, ...number[]];
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  glass: boolean;
  headerBackground: string;
  headerBorder: string;
  headerShadow: string;
  accent: string;
  accentMuted: string;
  accentSoft: string;
  text: string;
  mutedText: string;
  panelBackground: string;
  panelBorder: string;
  panelShadow: string;
  fieldBackground: string;
  fieldBorder: string;
  inputText: string;
  placeholder: string;
  primaryBackground: string;
  primaryPressed: string;
  primaryBorder: string;
  primaryText: string;
  selectedBackground: string;
  divider: string;
  modalOverlay: string;
  modalBackground: string;
  modalBorder: string;
  modalHeaderBorder: string;
  menuBackground: string;
  menuBorder: string;
  toastBackground: string;
  toastBorder: string;
  radius: number;
};

type DashboardTheme = {
  background: string;
  heroBackground: string;
  heroText: string;
  heroAccent: string;
  heroCopy: string;
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;
  label: string;
  value: string;
  body: string;
  noteBackground: string;
  noteBorder: string;
  noteTitle: string;
  signalPanel: string;
  signalBarActive: string;
  signalBarInactive: string;
};

export type ReachTheme = {
  name: ReachThemeName;
  label: string;
  drawer: DrawerTheme;
  shell: ShellTheme;
  workflow: WorkflowTheme;
  dashboard: DashboardTheme;
};

export const reachThemeOptions: { name: ReachThemeName; label: string }[] = [
  { name: 'default', label: 'Default' },
  { name: 'noir', label: 'Noir' },
  { name: 'momentum', label: 'Momentum' },
  { name: 'glass', label: 'Glass' },
];

const themes: Record<ReachThemeName, ReachTheme> = {
  default: {
    name: 'default',
    label: 'Default',
    drawer: {
      background: '#0F766E',
      eyebrow: '#99F6E4',
      title: '#FFFFFF',
      copy: '#D9E2EC',
      activeBackground: '#14B8A6',
      activeText: '#FFFFFF',
      inactiveText: '#D9E2EC',
      border: 'rgba(153, 246, 228, 0.24)',
      optionBackground: 'rgba(255, 255, 255, 0.08)',
    },
    shell: {
      background: '#F4F1E8',
      menuBackground: '#FCFCF9',
      menuBorder: '#DED8CA',
      menuIcon: '#102A43',
      menuPressed: '#EEE8DA',
      title: '#102A43',
      subtitle: '#52606D',
    },
    workflow: {
      background: '#F4F1E8',
      glass: false,
      headerBackground: '#FCFCF9',
      headerBorder: '#DED8CA',
      headerShadow: '0px 8px 24px rgba(16, 42, 67, 0.08)',
      accent: '#0F766E',
      accentMuted: 'rgba(15, 118, 110, 0.68)',
      accentSoft: '#E6FFFA',
      text: '#102A43',
      mutedText: '#52606D',
      panelBackground: '#FCFCF9',
      panelBorder: '#DED8CA',
      panelShadow: '0px 14px 28px rgba(16, 42, 67, 0.08)',
      fieldBackground: '#FFFFFF',
      fieldBorder: '#D6D0C3',
      inputText: '#102A43',
      placeholder: '#7B8794',
      primaryBackground: '#0F766E',
      primaryPressed: '#115E59',
      primaryBorder: '#0D9488',
      primaryText: '#FFFFFF',
      selectedBackground: '#E6FFFA',
      divider: '#E7E0D2',
      modalOverlay: 'rgba(15, 23, 42, 0.38)',
      modalBackground: '#FCFCF9',
      modalBorder: '#DED8CA',
      modalHeaderBorder: '#E7E0D2',
      menuBackground: '#FFFFFF',
      menuBorder: '#DED8CA',
      toastBackground: 'rgba(15, 118, 110, 0.92)',
      toastBorder: 'rgba(20, 184, 166, 0.45)',
      radius: 18,
    },
    dashboard: {
      background: '#F4F1E8',
      heroBackground: '#102A43',
      heroText: '#FFFFFF',
      heroAccent: '#99F6E4',
      heroCopy: '#D9E2EC',
      cardBackground: '#FCFCF9',
      cardBorder: '#DED8CA',
      cardShadow: '0px 12px 22px rgba(16, 42, 67, 0.08)',
      label: '#486581',
      value: '#0F766E',
      body: '#52606D',
      noteBackground: '#E6FFFA',
      noteBorder: '#99F6E4',
      noteTitle: '#115E59',
      signalPanel: '#102A43',
      signalBarActive: '#99F6E4',
      signalBarInactive: '#E6FFFA',
    },
  },
  noir: {
    name: 'noir',
    label: 'Noir',
    drawer: {
      background: '#111111',
      eyebrow: '#E57373',
      title: '#FFFFFF',
      copy: '#CFC5C8',
      activeBackground: 'rgba(93, 0, 23, 0.9)',
      activeText: '#FFFFFF',
      inactiveText: '#E8B8C0',
      border: 'rgba(163, 0, 41, 0.35)',
      optionBackground: 'rgba(10, 10, 12, 0.56)',
    },
    shell: {
      background: '#131314',
      menuBackground: 'rgba(10, 10, 12, 0.88)',
      menuBorder: 'rgba(163, 0, 41, 0.35)',
      menuIcon: '#E57373',
      menuPressed: 'rgba(93, 0, 23, 0.5)',
      title: '#FFFFFF',
      subtitle: '#CFC5C8',
    },
    workflow: {
      background: '#131314',
      backgroundGradient: {
        colors: ['#9CA3AF', '#121212', '#000000'],
        locations: [0, 0.42, 1],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      glass: true,
      headerBackground: 'rgba(0, 0, 0, 0.6)',
      headerBorder: 'rgba(163, 0, 41, 0.3)',
      headerShadow: '0px 4px 20px rgba(0,0,0,0.5)',
      accent: '#E57373',
      accentMuted: 'rgba(229,115,115,0.7)',
      accentSoft: 'rgba(163,0,41,0.18)',
      text: '#FFFFFF',
      mutedText: '#E8B8C0',
      panelBackground: 'rgba(10, 10, 12, 0.4)',
      panelBorder: 'rgba(255,255,255,0.05)',
      panelShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
      fieldBackground: 'rgba(10, 10, 12, 0.4)',
      fieldBorder: 'rgba(255,255,255,0.05)',
      inputText: '#FFFFFF',
      placeholder: 'rgba(229,115,115,0.4)',
      primaryBackground: '#5D0017',
      primaryPressed: '#74001D',
      primaryBorder: 'rgba(163,0,41,0.6)',
      primaryText: '#FFFFFF',
      selectedBackground: 'rgba(163,0,41,0.18)',
      divider: 'rgba(255,255,255,0.05)',
      modalOverlay: 'rgba(0,0,0,0.72)',
      modalBackground: 'rgba(10, 10, 12, 0.92)',
      modalBorder: 'rgba(163,0,41,0.35)',
      modalHeaderBorder: 'rgba(163,0,41,0.25)',
      menuBackground: 'rgba(10, 10, 12, 0.92)',
      menuBorder: 'rgba(163,0,41,0.3)',
      toastBackground: 'rgba(93, 0, 23, 0.72)',
      toastBorder: 'rgba(229, 115, 115, 0.4)',
      radius: 0,
    },
    dashboard: {
      background: '#131314',
      heroBackground: 'rgba(10, 10, 12, 0.88)',
      heroText: '#FFFFFF',
      heroAccent: '#E57373',
      heroCopy: '#CFC5C8',
      cardBackground: 'rgba(10, 10, 12, 0.76)',
      cardBorder: 'rgba(163,0,41,0.28)',
      cardShadow: '0px 8px 32px rgba(0, 0, 0, 0.35)',
      label: '#E57373',
      value: '#FFFFFF',
      body: '#CFC5C8',
      noteBackground: 'rgba(93,0,23,0.38)',
      noteBorder: 'rgba(163,0,41,0.45)',
      noteTitle: '#FFFFFF',
      signalPanel: '#08080A',
      signalBarActive: '#E57373',
      signalBarInactive: 'rgba(229,115,115,0.26)',
    },
  },
  momentum: {
    name: 'momentum',
    label: 'Momentum',
    drawer: {
      background: '#7C2D12',
      eyebrow: '#FED7AA',
      title: '#FFF7ED',
      copy: '#FFEDD5',
      activeBackground: '#F97316',
      activeText: '#FFFFFF',
      inactiveText: '#FFEDD5',
      border: 'rgba(254, 215, 170, 0.28)',
      optionBackground: 'rgba(255, 247, 237, 0.1)',
    },
    shell: {
      background: '#FFF4EC',
      menuBackground: '#FFFFFF',
      menuBorder: '#F3C89A',
      menuIcon: '#C2410C',
      menuPressed: '#FFF1D8',
      title: '#7C2D12',
      subtitle: '#9A3412',
    },
    workflow: {
      background: '#FFF4EC',
      glass: false,
      headerBackground: '#FFFDF8',
      headerBorder: '#F3C89A',
      headerShadow: '0px 10px 24px rgba(249, 115, 22, 0.12)',
      accent: '#EA580C',
      accentMuted: 'rgba(194, 65, 12, 0.72)',
      accentSoft: '#FFF1D8',
      text: '#7C2D12',
      mutedText: '#9A3412',
      panelBackground: '#FFFDF8',
      panelBorder: '#F6D2AE',
      panelShadow: '0px 16px 34px rgba(249, 115, 22, 0.12)',
      fieldBackground: '#FFFFFF',
      fieldBorder: '#F3C89A',
      inputText: '#7C2D12',
      placeholder: '#C08457',
      primaryBackground: '#F97316',
      primaryPressed: '#EA580C',
      primaryBorder: '#FB923C',
      primaryText: '#FFF7ED',
      selectedBackground: '#FFF1D8',
      divider: '#F4DFC9',
      modalOverlay: 'rgba(124, 45, 18, 0.28)',
      modalBackground: '#FFFDF8',
      modalBorder: '#F6D2AE',
      modalHeaderBorder: '#F4DFC9',
      menuBackground: '#FFFFFF',
      menuBorder: '#F3C89A',
      toastBackground: 'rgba(234, 88, 12, 0.92)',
      toastBorder: 'rgba(249, 115, 22, 0.48)',
      radius: 18,
    },
    dashboard: {
      background: '#FFF4EC',
      heroBackground: '#FFF1D8',
      heroText: '#7C2D12',
      heroAccent: '#EA580C',
      heroCopy: '#9A3412',
      cardBackground: '#FFFDF8',
      cardBorder: '#F6D2AE',
      cardShadow: '0px 16px 34px rgba(249, 115, 22, 0.12)',
      label: '#9A3412',
      value: '#EA580C',
      body: '#7C2D12',
      noteBackground: '#FFEDD5',
      noteBorder: '#FDBA74',
      noteTitle: '#9A3412',
      signalPanel: '#7C2D12',
      signalBarActive: '#FDBA74',
      signalBarInactive: '#FFF1D8',
    },
  },
  glass: {
    name: 'glass',
    label: 'Glass',
    drawer: {
      background: '#0E7490',
      eyebrow: '#CFFAFE',
      title: '#FFFFFF',
      copy: '#E0F7FF',
      activeBackground: 'rgba(34, 211, 238, 0.34)',
      activeText: '#FFFFFF',
      inactiveText: '#D6F6FF',
      border: 'rgba(207, 250, 254, 0.32)',
      optionBackground: 'rgba(255, 255, 255, 0.14)',
    },
    shell: {
      background: '#E7F7FB',
      menuBackground: 'rgba(255, 255, 255, 0.82)',
      menuBorder: 'rgba(125, 211, 252, 0.48)',
      menuIcon: '#155E75',
      menuPressed: 'rgba(207, 250, 254, 0.92)',
      title: '#12314A',
      subtitle: '#365B71',
    },
    workflow: {
      background: '#E7F7FB',
      backgroundGradient: {
        colors: ['#E7F7FB', '#DFFBFF', '#F7FBFF'],
        locations: [0, 0.46, 1],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      },
      glass: true,
      headerBackground: 'rgba(255, 255, 255, 0.72)',
      headerBorder: 'rgba(125, 211, 252, 0.4)',
      headerShadow: '0px 12px 28px rgba(15, 118, 110, 0.12)',
      accent: '#0891B2',
      accentMuted: 'rgba(21, 94, 117, 0.72)',
      accentSoft: 'rgba(236, 254, 255, 0.88)',
      text: '#12314A',
      mutedText: '#365B71',
      panelBackground: 'rgba(255, 255, 255, 0.72)',
      panelBorder: 'rgba(125, 211, 252, 0.44)',
      panelShadow: '0px 18px 36px rgba(15, 118, 110, 0.14)',
      fieldBackground: 'rgba(255, 255, 255, 0.82)',
      fieldBorder: 'rgba(125, 211, 252, 0.52)',
      inputText: '#12314A',
      placeholder: '#6B93A9',
      primaryBackground: '#0891B2',
      primaryPressed: '#0E7490',
      primaryBorder: '#22D3EE',
      primaryText: '#ECFEFF',
      selectedBackground: 'rgba(236, 254, 255, 0.95)',
      divider: 'rgba(125, 211, 252, 0.28)',
      modalOverlay: 'rgba(15, 23, 42, 0.42)',
      modalBackground: 'rgba(255, 255, 255, 0.88)',
      modalBorder: 'rgba(125, 211, 252, 0.44)',
      modalHeaderBorder: 'rgba(125, 211, 252, 0.28)',
      menuBackground: 'rgba(255, 255, 255, 0.9)',
      menuBorder: 'rgba(125, 211, 252, 0.44)',
      toastBackground: 'rgba(8, 145, 178, 0.88)',
      toastBorder: 'rgba(34, 211, 238, 0.48)',
      radius: 22,
    },
    dashboard: {
      background: '#E7F7FB',
      heroBackground: 'rgba(16, 42, 67, 0.78)',
      heroText: '#F1FCFF',
      heroAccent: '#B6F3FF',
      heroCopy: '#D6F6FF',
      cardBackground: 'rgba(255, 255, 255, 0.72)',
      cardBorder: 'rgba(125, 211, 252, 0.48)',
      cardShadow: '0px 18px 36px rgba(15, 118, 110, 0.14)',
      label: '#155E75',
      value: '#0F766E',
      body: '#0F4C5C',
      noteBackground: 'rgba(236, 254, 255, 0.85)',
      noteBorder: '#67E8F9',
      noteTitle: '#155E75',
      signalPanel: 'rgba(16, 42, 67, 0.88)',
      signalBarActive: '#67E8F9',
      signalBarInactive: 'rgba(207, 250, 254, 0.42)',
    },
  },
};

type ReachThemeContextValue = {
  theme: ReachTheme;
  themeName: ReachThemeName;
  setThemeName: (themeName: ReachThemeName) => void;
};

const ReachThemeContext = createContext<ReachThemeContextValue | null>(null);

export function ReachThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ReachThemeName>('default');

  const value = useMemo(
    () => ({
      theme: themes[themeName],
      themeName,
      setThemeName,
    }),
    [themeName]
  );

  return <ReachThemeContext.Provider value={value}>{children}</ReachThemeContext.Provider>;
}

export function useReachTheme() {
  const value = useContext(ReachThemeContext);

  if (!value) {
    throw new Error('useReachTheme must be used within ReachThemeProvider');
  }

  return value;
}
