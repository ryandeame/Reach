import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { DrawerScreenShell } from '@/components/drawer-screen-shell';
import { SelectField } from '@/components/select-field';
import { useCompanies } from '@/hooks/use-companies';
import { useCreateCompany } from '@/hooks/use-create-company';
import { useCreateOutreachLog } from '@/hooks/use-create-outreach-log';
import { useCreatePerson } from '@/hooks/use-create-person';
import { usePeople } from '@/hooks/use-people';
import { isSupabaseConfigured } from '@/lib/supabase';

const initialPersonForm = {
  fullName: '',
  title: '',
  location: '',
  email: '',
  phone: '',
  linkedin: '',
  companyId: '',
};

const initialCompanyForm = {
  name: '',
  location: '',
  phone: '',
  website: '',
};

const communicationTypeOptions = [
  { label: 'Choose a communication type', value: '' },
  { label: 'Email', value: 'Email' },
  { label: 'LinkedIn DM', value: 'LinkedIn DM' },
  { label: 'Facebook Message', value: 'Facebook Message' },
  { label: 'Twitter/X DM', value: 'Twitter/X DM' },
  { label: 'Discord DM', value: 'Discord DM' },
  { label: 'Reddit Chat', value: 'Reddit Chat' },
];

export type OutreachLogVariant = 'default' | 'noir' | 'momentum' | 'glass' | 'precision';

type ThemeConfig = {
  shellTitle: string;
  shellSubtitle: string;
  heroEyebrow: string;
  heroTitle: string;
  heroCopy: string;
  heroBadgePrimary: string;
  heroBadgeSecondary: string;
  modeLabel: string;
  screenBackground: string;
  heroBackground: string;
  heroBorderColor: string;
  heroEyebrowColor: string;
  heroTitleColor: string;
  heroCopyColor: string;
  heroBadgeBackground: string;
  heroBadgeText: string;
  heroBadgeSecondaryBackground: string;
  heroBadgeSecondaryText: string;
  heroOrbOne: string;
  heroOrbTwo: string;
  heroGlow: string;
  noticeBackground: string;
  noticeBorder: string;
  noticeTitle: string;
  noticeCopy: string;
  warningBackground: string;
  warningBorder: string;
  warningText: string;
  statCardBackground: string;
  statCardBorder: string;
  statLabelColor: string;
  statValueColor: string;
  statHintColor: string;
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;
  cardTitle: string;
  cardCopy: string;
  fieldLabel: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  primaryBackground: string;
  primaryPressed: string;
  primaryText: string;
  secondaryBackground: string;
  secondaryBorder: string;
  secondaryPressed: string;
  secondaryText: string;
  inlineLink: string;
  modalOverlay: string;
  modalBackground: string;
  modalBorder: string;
  modalHeaderBorder: string;
  modalTitle: string;
  modalCopy: string;
  closeChipBackground: string;
  closeChipText: string;
  heroRadius: number;
  panelRadius: number;
  controlRadius: number;
  chipRadius: number;
  showHeroOrbs: boolean;
  showHeroSeams: boolean;
  seamColor: string;
  seamGlow: string;
};

const themes: Record<OutreachLogVariant, ThemeConfig> = {
  default: {
    shellTitle: 'Outreach Log',
    shellSubtitle: 'Capture the next touchpoint, add new contacts, and create companies inline.',
    heroEyebrow: 'Reach Flow',
    heroTitle: 'Log client outreach without leaving the first screen.',
    heroCopy:
      'Pick an existing person, add a new one inline, and create missing companies from the same modal flow.',
    heroBadgePrimary: 'Fast logging',
    heroBadgeSecondary: 'Inline contact capture',
    modeLabel: 'Core',
    screenBackground: '#F4F7FB',
    heroBackground: '#102A43',
    heroBorderColor: '#274C66',
    heroEyebrowColor: '#9AE6B4',
    heroTitleColor: '#FDFDFB',
    heroCopyColor: '#D9E2EC',
    heroBadgeBackground: 'rgba(154, 230, 180, 0.16)',
    heroBadgeText: '#C6F6D5',
    heroBadgeSecondaryBackground: 'rgba(125, 211, 252, 0.18)',
    heroBadgeSecondaryText: '#BAE6FD',
    heroOrbOne: 'rgba(20, 184, 166, 0.22)',
    heroOrbTwo: 'rgba(125, 211, 252, 0.18)',
    heroGlow: 'rgba(15, 118, 110, 0.35)',
    noticeBackground: '#FFF7ED',
    noticeBorder: '#FDBA74',
    noticeTitle: '#9A3412',
    noticeCopy: '#7C2D12',
    warningBackground: '#FEF2F2',
    warningBorder: '#FCA5A5',
    warningText: '#991B1B',
    statCardBackground: '#FFFFFF',
    statCardBorder: '#DBE7F1',
    statLabelColor: '#52606D',
    statValueColor: '#0F766E',
    statHintColor: '#7B8794',
    cardBackground: '#FCFCF9',
    cardBorder: '#E6EDF5',
    cardShadow: '0px 14px 28px rgba(16, 42, 67, 0.08)',
    cardTitle: '#102A43',
    cardCopy: '#52606D',
    fieldLabel: '#213547',
    inputBackground: '#FFFFFF',
    inputBorder: '#C9D7E3',
    inputText: '#102A43',
    inputPlaceholder: '#7B8794',
    primaryBackground: '#0F766E',
    primaryPressed: '#115E59',
    primaryText: '#F8FFFD',
    secondaryBackground: '#E0F2FE',
    secondaryBorder: '#7DD3FC',
    secondaryPressed: '#D0EAFD',
    secondaryText: '#0C4A6E',
    inlineLink: '#0F766E',
    modalOverlay: 'rgba(15, 23, 42, 0.4)',
    modalBackground: '#FCFCF9',
    modalBorder: '#E6EDF5',
    modalHeaderBorder: '#E3ECF3',
    modalTitle: '#102A43',
    modalCopy: '#52606D',
    closeChipBackground: '#E6FFFA',
    closeChipText: '#0F766E',
    heroRadius: 32,
    panelRadius: 32,
    controlRadius: 18,
    chipRadius: 999,
    showHeroOrbs: true,
    showHeroSeams: false,
    seamColor: 'rgba(125, 211, 252, 0.24)',
    seamGlow: 'rgba(15, 118, 110, 0.22)',
  },
  noir: {
    shellTitle: 'Outreach Log Noir',
    shellSubtitle: 'An editorial control room for deliberate, high-signal outreach.',
    heroEyebrow: 'Reach Noir',
    heroTitle: 'A cinematic workspace for the moments when every message matters.',
    heroCopy:
      'Dark surfaces, soft bloom, and focused contrast make this version feel more like a premium studio than a spreadsheet.',
    heroBadgePrimary: 'Editorial dark mode',
    heroBadgeSecondary: 'Quiet focus',
    modeLabel: 'Noir',
    screenBackground: '#08070E',
    heroBackground: '#16111F',
    heroBorderColor: '#392B49',
    heroEyebrowColor: '#F9C8D9',
    heroTitleColor: '#FFF6F8',
    heroCopyColor: '#D7CBDF',
    heroBadgeBackground: 'rgba(249, 200, 217, 0.14)',
    heroBadgeText: '#FFD7E5',
    heroBadgeSecondaryBackground: 'rgba(245, 158, 11, 0.14)',
    heroBadgeSecondaryText: '#FCD9A5',
    heroOrbOne: 'rgba(244, 114, 182, 0.18)',
    heroOrbTwo: 'rgba(251, 191, 36, 0.14)',
    heroGlow: 'rgba(244, 114, 182, 0.28)',
    noticeBackground: '#2A171B',
    noticeBorder: '#8B3A53',
    noticeTitle: '#FFD0DA',
    noticeCopy: '#F7B7C7',
    warningBackground: '#2D1515',
    warningBorder: '#7F1D1D',
    warningText: '#FECACA',
    statCardBackground: '#16111F',
    statCardBorder: '#392B49',
    statLabelColor: '#C7B8D5',
    statValueColor: '#FFD4DF',
    statHintColor: '#A999B8',
    cardBackground: '#120E19',
    cardBorder: '#34283F',
    cardShadow: '0px 18px 42px rgba(0, 0, 0, 0.42)',
    cardTitle: '#FFF6F8',
    cardCopy: '#C9BED4',
    fieldLabel: '#E7DDEA',
    inputBackground: '#1A1423',
    inputBorder: '#473553',
    inputText: '#FFF8FB',
    inputPlaceholder: '#9F90AE',
    primaryBackground: '#F472B6',
    primaryPressed: '#EC4899',
    primaryText: '#2A1320',
    secondaryBackground: '#221A2E',
    secondaryBorder: '#5B476D',
    secondaryPressed: '#2B213A',
    secondaryText: '#FFD4DF',
    inlineLink: '#F9A8D4',
    modalOverlay: 'rgba(4, 3, 8, 0.72)',
    modalBackground: '#120E19',
    modalBorder: '#34283F',
    modalHeaderBorder: '#34283F',
    modalTitle: '#FFF6F8',
    modalCopy: '#C9BED4',
    closeChipBackground: '#221A2E',
    closeChipText: '#FFD4DF',
    heroRadius: 32,
    panelRadius: 32,
    controlRadius: 18,
    chipRadius: 999,
    showHeroOrbs: true,
    showHeroSeams: false,
    seamColor: 'rgba(244, 114, 182, 0.24)',
    seamGlow: 'rgba(244, 114, 182, 0.2)',
  },
  momentum: {
    shellTitle: 'Outreach Log Momentum',
    shellSubtitle: 'Bright, energetic, and built to keep your outreach streak moving.',
    heroEyebrow: 'Momentum',
    heroTitle: 'Make every outreach session feel like the first five minutes of a great sprint.',
    heroCopy:
      'Warm highlights, confident contrast, and high-clarity actions turn the logging flow into something that feels alive instead of administrative.',
    heroBadgePrimary: 'High-energy workflow',
    heroBadgeSecondary: 'Action-first layout',
    modeLabel: 'Momentum',
    screenBackground: '#FFF4EC',
    heroBackground: '#FFF1D8',
    heroBorderColor: '#F9A03F',
    heroEyebrowColor: '#9A3412',
    heroTitleColor: '#7C2D12',
    heroCopyColor: '#9A3412',
    heroBadgeBackground: '#FFE3B3',
    heroBadgeText: '#9A3412',
    heroBadgeSecondaryBackground: '#DCFCE7',
    heroBadgeSecondaryText: '#166534',
    heroOrbOne: 'rgba(249, 115, 22, 0.18)',
    heroOrbTwo: 'rgba(34, 197, 94, 0.18)',
    heroGlow: 'rgba(249, 115, 22, 0.18)',
    noticeBackground: '#FFF7ED',
    noticeBorder: '#FDBA74',
    noticeTitle: '#9A3412',
    noticeCopy: '#7C2D12',
    warningBackground: '#FFF1F2',
    warningBorder: '#FDA4AF',
    warningText: '#9F1239',
    statCardBackground: '#FFFFFF',
    statCardBorder: '#F9D4B5',
    statLabelColor: '#9A3412',
    statValueColor: '#EA580C',
    statHintColor: '#7C2D12',
    cardBackground: '#FFFDF8',
    cardBorder: '#F6D2AE',
    cardShadow: '0px 16px 34px rgba(249, 115, 22, 0.12)',
    cardTitle: '#7C2D12',
    cardCopy: '#9A3412',
    fieldLabel: '#7C2D12',
    inputBackground: '#FFFFFF',
    inputBorder: '#F3C89A',
    inputText: '#7C2D12',
    inputPlaceholder: '#C08457',
    primaryBackground: '#F97316',
    primaryPressed: '#EA580C',
    primaryText: '#FFF7ED',
    secondaryBackground: '#ECFCCB',
    secondaryBorder: '#84CC16',
    secondaryPressed: '#D9F99D',
    secondaryText: '#3F6212',
    inlineLink: '#EA580C',
    modalOverlay: 'rgba(124, 45, 18, 0.28)',
    modalBackground: '#FFFDF8',
    modalBorder: '#F6D2AE',
    modalHeaderBorder: '#F4DFC9',
    modalTitle: '#7C2D12',
    modalCopy: '#9A3412',
    closeChipBackground: '#FFEDD5',
    closeChipText: '#C2410C',
    heroRadius: 32,
    panelRadius: 32,
    controlRadius: 18,
    chipRadius: 999,
    showHeroOrbs: true,
    showHeroSeams: false,
    seamColor: 'rgba(249, 115, 22, 0.22)',
    seamGlow: 'rgba(249, 115, 22, 0.18)',
  },
  glass: {
    shellTitle: 'Outreach Log Glass',
    shellSubtitle: 'An ambient glassmorphism take on the same working outreach flow.',
    heroEyebrow: 'Aetheris',
    heroTitle: 'A cool, luminous surface that makes the workflow feel calmer and more premium.',
    heroCopy:
      'Layered transparency, subtle glow, and spacious cards create a softer interface without losing any of the actual logging functionality.',
    heroBadgePrimary: 'Ambient glass',
    heroBadgeSecondary: 'Soft glow depth',
    modeLabel: 'Glass',
    screenBackground: '#E7F7FB',
    heroBackground: 'rgba(16, 42, 67, 0.78)',
    heroBorderColor: 'rgba(125, 211, 252, 0.36)',
    heroEyebrowColor: '#B6F3FF',
    heroTitleColor: '#F1FCFF',
    heroCopyColor: '#D6F6FF',
    heroBadgeBackground: 'rgba(125, 211, 252, 0.16)',
    heroBadgeText: '#D8F8FF',
    heroBadgeSecondaryBackground: 'rgba(196, 181, 253, 0.18)',
    heroBadgeSecondaryText: '#ECE7FF',
    heroOrbOne: 'rgba(34, 211, 238, 0.2)',
    heroOrbTwo: 'rgba(129, 140, 248, 0.16)',
    heroGlow: 'rgba(34, 211, 238, 0.24)',
    noticeBackground: 'rgba(255, 247, 237, 0.9)',
    noticeBorder: '#FDBA74',
    noticeTitle: '#9A3412',
    noticeCopy: '#7C2D12',
    warningBackground: 'rgba(254, 242, 242, 0.92)',
    warningBorder: '#FCA5A5',
    warningText: '#991B1B',
    statCardBackground: 'rgba(255, 255, 255, 0.72)',
    statCardBorder: 'rgba(125, 211, 252, 0.48)',
    statLabelColor: '#155E75',
    statValueColor: '#0F766E',
    statHintColor: '#0F4C5C',
    cardBackground: 'rgba(255, 255, 255, 0.76)',
    cardBorder: 'rgba(125, 211, 252, 0.44)',
    cardShadow: '0px 18px 36px rgba(15, 118, 110, 0.14)',
    cardTitle: '#12314A',
    cardCopy: '#365B71',
    fieldLabel: '#12314A',
    inputBackground: 'rgba(255, 255, 255, 0.9)',
    inputBorder: 'rgba(125, 211, 252, 0.52)',
    inputText: '#12314A',
    inputPlaceholder: '#6B93A9',
    primaryBackground: '#0891B2',
    primaryPressed: '#0E7490',
    primaryText: '#ECFEFF',
    secondaryBackground: 'rgba(236, 254, 255, 0.85)',
    secondaryBorder: '#67E8F9',
    secondaryPressed: 'rgba(207, 250, 254, 0.92)',
    secondaryText: '#155E75',
    inlineLink: '#0891B2',
    modalOverlay: 'rgba(15, 23, 42, 0.42)',
    modalBackground: 'rgba(255, 255, 255, 0.88)',
    modalBorder: 'rgba(125, 211, 252, 0.44)',
    modalHeaderBorder: 'rgba(125, 211, 252, 0.28)',
    modalTitle: '#12314A',
    modalCopy: '#365B71',
    closeChipBackground: 'rgba(236, 254, 255, 0.92)',
    closeChipText: '#0E7490',
    heroRadius: 32,
    panelRadius: 32,
    controlRadius: 18,
    chipRadius: 999,
    showHeroOrbs: true,
    showHeroSeams: false,
    seamColor: 'rgba(125, 211, 252, 0.34)',
    seamGlow: 'rgba(34, 211, 238, 0.2)',
  },
  precision: {
    shellTitle: 'Outreach Log Precision',
    shellSubtitle: 'Smoked-glass noir with sharper sci-fi control surfaces.',
    heroEyebrow: 'Precision Shadow',
    heroTitle: 'A smoked-glass control panel for deliberate, high-signal outreach.',
    heroCopy:
      'Sharper borders, controlled cyan edge glow, and cold layered panels push this version into a more premium sci-fi lane without getting noisy.',
    heroBadgePrimary: 'Smoked-glass noir',
    heroBadgeSecondary: 'Cyan edge light',
    modeLabel: 'Precision',
    screenBackground: '#0B0D10',
    heroBackground: 'rgba(19, 19, 20, 0.94)',
    heroBorderColor: 'rgba(0, 216, 255, 0.24)',
    heroEyebrowColor: '#AEEBFF',
    heroTitleColor: '#EEF8FF',
    heroCopyColor: '#B8C7D4',
    heroBadgeBackground: 'rgba(14, 20, 24, 0.9)',
    heroBadgeText: '#AEEBFF',
    heroBadgeSecondaryBackground: 'rgba(44, 49, 79, 0.88)',
    heroBadgeSecondaryText: '#DFE2FF',
    heroOrbOne: 'transparent',
    heroOrbTwo: 'transparent',
    heroGlow: 'transparent',
    noticeBackground: 'rgba(40, 21, 17, 0.82)',
    noticeBorder: 'rgba(254, 186, 41, 0.36)',
    noticeTitle: '#FFDCA7',
    noticeCopy: '#F8C56C',
    warningBackground: 'rgba(42, 16, 18, 0.84)',
    warningBorder: 'rgba(252, 165, 165, 0.26)',
    warningText: '#FFD0D0',
    statCardBackground: 'rgba(28, 27, 28, 0.82)',
    statCardBorder: 'rgba(60, 73, 77, 0.9)',
    statLabelColor: '#8FA2AF',
    statValueColor: '#AEEBFF',
    statHintColor: '#A3B1BB',
    cardBackground: 'rgba(28, 27, 28, 0.78)',
    cardBorder: 'rgba(0, 216, 255, 0.22)',
    cardShadow: '0px 24px 44px rgba(0, 0, 0, 0.44)',
    cardTitle: '#EEF8FF',
    cardCopy: '#A3B1BB',
    fieldLabel: '#DDE7EE',
    inputBackground: 'rgba(14, 14, 15, 0.92)',
    inputBorder: 'rgba(60, 73, 77, 0.95)',
    inputText: '#EEF8FF',
    inputPlaceholder: '#738592',
    primaryBackground: '#00D8FF',
    primaryPressed: '#14C5E8',
    primaryText: '#032A33',
    secondaryBackground: 'rgba(19, 19, 20, 0.8)',
    secondaryBorder: 'rgba(133, 147, 152, 0.34)',
    secondaryPressed: 'rgba(32, 31, 32, 0.92)',
    secondaryText: '#AEEBFF',
    inlineLink: '#AEEBFF',
    modalOverlay: 'rgba(5, 7, 10, 0.78)',
    modalBackground: 'rgba(26, 26, 27, 0.92)',
    modalBorder: 'rgba(0, 216, 255, 0.18)',
    modalHeaderBorder: 'rgba(60, 73, 77, 0.85)',
    modalTitle: '#EEF8FF',
    modalCopy: '#A3B1BB',
    closeChipBackground: 'rgba(19, 19, 20, 0.96)',
    closeChipText: '#AEEBFF',
    heroRadius: 12,
    panelRadius: 12,
    controlRadius: 10,
    chipRadius: 8,
    showHeroOrbs: false,
    showHeroSeams: true,
    seamColor: 'rgba(0, 216, 255, 0.72)',
    seamGlow: 'rgba(155, 168, 255, 0.22)',
  },
};

type OutreachLogScreenProps = {
  variant?: OutreachLogVariant;
};

export function OutreachLogScreen({ variant = 'default' }: OutreachLogScreenProps) {
  const theme = themes[variant];
  const isCoreVariant = variant === 'default';
  const isPrecisionVariant = variant === 'precision';
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [commType, setCommType] = useState('');
  const [message, setMessage] = useState('');
  const [isPersonModalVisible, setIsPersonModalVisible] = useState(false);
  const [isCompanyStepVisible, setIsCompanyStepVisible] = useState(false);
  const [personForm, setPersonForm] = useState(initialPersonForm);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);

  const {
    companies,
    isLoading: companiesLoading,
    error: companiesError,
    refresh: refreshCompanies,
  } = useCompanies();
  const {
    people,
    isLoading: peopleLoading,
    error: peopleError,
    refresh: refreshPeople,
  } = usePeople();
  const { createCompany, isSubmitting: isCreatingCompany } = useCreateCompany();
  const { createPerson, isSubmitting: isCreatingPerson } = useCreatePerson();
  const { createOutreachLog, isSubmitting: isCreatingLog } = useCreateOutreachLog();
  const { width, height } = useWindowDimensions();
  const slider = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slider, {
      damping: 20,
      mass: 0.9,
      stiffness: 220,
      toValue: isCompanyStepVisible ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [isCompanyStepVisible, slider]);

  const modalInset = Math.max(12, Math.min(24, width * 0.05));
  const pageWidth = Math.min(width - modalInset * 2, 560);
  const availableModalHeight = height - modalInset * 2;
  const modalHeight = availableModalHeight * 0.8;
  const translateX = slider.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -pageWidth],
  });

  const personOptions = [
    {
      label: 'Choose a person',
      value: '',
    },
    ...people.map((person) => ({
      label: person.reach_companies?.name
        ? `${person.full_name} • ${person.reach_companies.name}`
        : person.full_name,
      value: person.id,
    })),
  ];

  const companyOptions = [
    {
      label: 'No company yet',
      value: '',
    },
    ...companies.map((company) => ({
      label: company.name,
      value: company.id,
      description: company.location ?? undefined,
    })),
  ];

  const closePersonModal = () => {
    setIsPersonModalVisible(false);
    setIsCompanyStepVisible(false);
    setPersonForm(initialPersonForm);
    setCompanyForm(initialCompanyForm);
  };

  const handleCreateLog = async () => {
    const problems: string[] = [];

    if (!selectedPersonId) {
      problems.push('Choose a person.');
    }

    if (!commType) {
      problems.push('Choose a communication type.');
    }

    if (!message.trim()) {
      problems.push('Enter the message that was sent.');
    }

    if (problems.length > 0) {
      Alert.alert('Unable to save outreach log', problems.map((problem) => `• ${problem}`).join('\n'));
      return;
    }

    try {
      await createOutreachLog({
        personId: selectedPersonId,
        commType,
        message,
      });

      const personName =
        people.find((person) => person.id === selectedPersonId)?.full_name ?? 'Contact';
      const loggedType = commType.trim();
      setSelectedPersonId('');
      setCommType('');
      setMessage('');
      Alert.alert('Outreach logged', `Saved a ${loggedType} entry for ${personName}.`);
    } catch (error) {
      Alert.alert('Unable to save log', error instanceof Error ? error.message : 'Try again.');
    }
  };

  const handleCreatePerson = async () => {
    try {
      const newPerson = await createPerson(personForm);
      await refreshPeople();
      setSelectedPersonId(newPerson.id);
      closePersonModal();
      Alert.alert('Person added', `${newPerson.full_name} is ready for logging.`);
    } catch (error) {
      Alert.alert('Unable to add person', error instanceof Error ? error.message : 'Try again.');
    }
  };

  const handleCreateCompany = async () => {
    try {
      const newCompany = await createCompany(companyForm);
      await refreshCompanies();
      setPersonForm((current) => ({
        ...current,
        companyId: newCompany.id,
      }));
      setCompanyForm(initialCompanyForm);
      setIsCompanyStepVisible(false);
      Alert.alert('Company added', `${newCompany.name} is now available in the company dropdown.`);
    } catch (error) {
      Alert.alert('Unable to add company', error instanceof Error ? error.message : 'Try again.');
    }
  };

  const dataMessage = [peopleError, companiesError].filter(Boolean).join('\n');
  const stats = [
    {
      label: 'People ready',
      value: peopleLoading ? '...' : String(people.length),
      hint: 'Contacts available to log now',
    },
    {
      label: 'Companies',
      value: companiesLoading ? '...' : String(companies.length),
      hint: 'Organizations attached to your network',
    },
    {
      label: 'Mode',
      value: theme.modeLabel,
      hint: 'Style concept generated from Stitch exploration',
    },
  ];
  const formNotices =
    isCoreVariant && !isSupabaseConfigured
      ? [
          {
            title: 'Supabase setup needed',
            body:
              'Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to your Expo environment before saving logs.',
            kind: 'notice' as const,
          },
        ]
      : [];
  const formWarnings =
    isCoreVariant && dataMessage
      ? [
          {
            body: dataMessage,
            kind: 'warning' as const,
          },
        ]
      : [];

  return (
    <DrawerScreenShell title={theme.shellTitle} subtitle={theme.shellSubtitle}>
      <View style={[styles.flex, styles.screenRoot, { backgroundColor: theme.screenBackground }]}>
        {isPrecisionVariant && Platform.OS === 'web' ? (
          <View pointerEvents="none" style={styles.precisionGradientLayer as any} />
        ) : null}
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {!isCoreVariant ? (
            <>
              <View
                style={[
                  styles.hero,
                  {
                    backgroundColor: theme.heroBackground,
                    borderColor: theme.heroBorderColor,
                    borderRadius: theme.heroRadius,
                  },
                ]}>
                {theme.showHeroOrbs ? (
                  <>
                    <View
                      style={[
                        styles.heroOrb,
                        styles.heroOrbLarge,
                        { backgroundColor: theme.heroOrbOne },
                      ]}
                    />
                    <View
                      style={[
                        styles.heroOrb,
                        styles.heroOrbSmall,
                        { backgroundColor: theme.heroOrbTwo },
                      ]}
                    />
                    <View style={[styles.heroGlow, { backgroundColor: theme.heroGlow }]} />
                  </>
                ) : null}
                {theme.showHeroSeams ? (
                  <>
                    <View style={[styles.heroSeamTop, { backgroundColor: theme.seamColor }]} />
                    <View style={[styles.heroSeamSide, { backgroundColor: theme.seamGlow }]} />
                    <View style={[styles.heroSeamBottom, { backgroundColor: theme.seamColor }]} />
                  </>
                ) : null}

                <Text style={[styles.eyebrow, { color: theme.heroEyebrowColor }]}>
                  {theme.heroEyebrow}
                </Text>
                <Text style={[styles.title, { color: theme.heroTitleColor }]}>{theme.heroTitle}</Text>
                <Text style={[styles.subtitle, { color: theme.heroCopyColor }]}>{theme.heroCopy}</Text>

                <View style={styles.heroBadgeRow}>
                  <View
                    style={[
                      styles.heroBadge,
                      {
                        backgroundColor: theme.heroBadgeBackground,
                        borderColor: theme.heroBorderColor,
                        borderRadius: theme.chipRadius,
                      },
                    ]}>
                    <Text style={[styles.heroBadgeText, { color: theme.heroBadgeText }]}>
                      {theme.heroBadgePrimary}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.heroBadge,
                      {
                        backgroundColor: theme.heroBadgeSecondaryBackground,
                        borderColor: theme.heroBorderColor,
                        borderRadius: theme.chipRadius,
                      },
                    ]}>
                    <Text style={[styles.heroBadgeText, { color: theme.heroBadgeSecondaryText }]}>
                      {theme.heroBadgeSecondary}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statGrid}>
                {stats.map((stat) => (
                  <View
                    key={stat.label}
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: theme.statCardBackground,
                        borderColor: theme.statCardBorder,
                        borderRadius: theme.panelRadius,
                        boxShadow: theme.cardShadow,
                      },
                    ]}>
                    <Text style={[styles.statLabel, { color: theme.statLabelColor }]}>
                      {stat.label}
                    </Text>
                    <Text style={[styles.statValue, { color: theme.statValueColor }]}>
                      {stat.value}
                    </Text>
                    <Text style={[styles.statHint, { color: theme.statHintColor }]}>
                      {stat.hint}
                    </Text>
                  </View>
                ))}
              </View>

              {!isSupabaseConfigured ? (
                <View
                  style={[
                    styles.noticeCard,
                    {
                      backgroundColor: theme.noticeBackground,
                      borderColor: theme.noticeBorder,
                      borderRadius: theme.panelRadius,
                    },
                  ]}>
                  <Text style={[styles.noticeTitle, { color: theme.noticeTitle }]}>
                    Supabase setup needed
                  </Text>
                  <Text style={[styles.noticeCopy, { color: theme.noticeCopy }]}>
                    Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to your Expo
                    environment before saving logs.
                  </Text>
                </View>
              ) : null}

              {dataMessage ? (
                <View
                  style={[
                    styles.inlineWarning,
                    {
                      backgroundColor: theme.warningBackground,
                      borderColor: theme.warningBorder,
                      borderRadius: theme.panelRadius,
                    },
                  ]}>
                  <Text style={[styles.inlineWarningText, { color: theme.warningText }]}>
                    {dataMessage}
                  </Text>
                </View>
              ) : null}
            </>
          ) : null}

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.cardBorder,
                borderRadius: theme.panelRadius,
                boxShadow: theme.cardShadow,
              },
            ]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: theme.cardTitle }]}>New outreach log</Text>
                <Text style={[styles.cardCopy, { color: theme.cardCopy }]}>
                  Entries are saved with the current timestamp.
                </Text>
              </View>
              {(peopleLoading || companiesLoading) && isSupabaseConfigured ? (
                <ActivityIndicator color={theme.primaryBackground} />
              ) : null}
            </View>

            <View style={styles.fieldStack}>
              {formNotices.map((notice) => (
                <View
                  key={notice.title}
                  style={[
                    styles.noticeCard,
                    styles.embeddedMessage,
                    {
                      backgroundColor: theme.noticeBackground,
                      borderColor: theme.noticeBorder,
                      borderRadius: theme.panelRadius,
                    },
                  ]}>
                  <Text style={[styles.noticeTitle, { color: theme.noticeTitle }]}>
                    {notice.title}
                  </Text>
                  <Text style={[styles.noticeCopy, { color: theme.noticeCopy }]}>{notice.body}</Text>
                </View>
              ))}

              {formWarnings.map((warning) => (
                <View
                  key={warning.body}
                  style={[
                    styles.inlineWarning,
                    styles.embeddedMessage,
                    {
                      backgroundColor: theme.warningBackground,
                      borderColor: theme.warningBorder,
                      borderRadius: theme.panelRadius,
                    },
                  ]}>
                  <Text style={[styles.inlineWarningText, { color: theme.warningText }]}>
                    {warning.body}
                  </Text>
                </View>
              ))}

              <View style={styles.personRow}>
                <View style={styles.personSelect}>
                  <SelectField
                    label="Person"
                    options={personOptions}
                    placeholder={
                      peopleLoading ? 'Loading people...' : 'Choose a person from your list'
                    }
                    selectedValue={selectedPersonId}
                    onValueChange={setSelectedPersonId}
                    disabled={!isSupabaseConfigured || peopleLoading}
                    emptyMessage="Create your first person to start logging outreach."
                    variant={variant}
                  />
                </View>

                <Pressable
                  disabled={!isSupabaseConfigured}
                  onPress={() => setIsPersonModalVisible(true)}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    {
                      backgroundColor: theme.secondaryBackground,
                      borderColor: theme.secondaryBorder,
                      borderRadius: theme.controlRadius,
                    },
                    !isSupabaseConfigured && styles.disabledButton,
                    pressed && isSupabaseConfigured && { backgroundColor: theme.secondaryPressed },
                  ]}>
                  <Text style={[styles.secondaryActionText, { color: theme.secondaryText }]}>
                    Add person
                  </Text>
                </Pressable>
              </View>

              <View style={styles.field}>
                <SelectField
                  label="Communication type"
                  options={communicationTypeOptions}
                  placeholder="Choose a communication type"
                  selectedValue={commType}
                  onValueChange={setCommType}
                  disabled={!isSupabaseConfigured}
                  emptyMessage="Add communication types to this list to choose one here."
                  variant={variant}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.fieldLabel }]}>Message sent</Text>
                <TextInput
                  multiline
                  onChangeText={setMessage}
                  placeholder="Paste or write the message you sent..."
                  placeholderTextColor={theme.inputPlaceholder}
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.inputBorder,
                      borderRadius: theme.controlRadius,
                      color: theme.inputText,
                    },
                  ]}
                  textAlignVertical="top"
                  value={message}
                />
              </View>

              <Pressable
                disabled={!isSupabaseConfigured || isCreatingLog}
                onPress={handleCreateLog}
                style={({ pressed }) => [
                  styles.primaryAction,
                  {
                    backgroundColor: theme.primaryBackground,
                    borderRadius: theme.controlRadius,
                  },
                  (!isSupabaseConfigured || isCreatingLog) && styles.disabledButton,
                  pressed &&
                    isSupabaseConfigured &&
                    !isCreatingLog && { backgroundColor: theme.primaryPressed },
                ]}>
                <Text style={[styles.primaryActionText, { color: theme.primaryText }]}>
                  {isCreatingLog ? 'Saving...' : 'Save outreach log'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isPersonModalVisible}
        onRequestClose={closePersonModal}>
        <View
          style={[
            styles.modalOverlay,
            {
                    backgroundColor: theme.modalOverlay,
              paddingHorizontal: modalInset,
              paddingTop: modalInset,
              paddingBottom: modalInset,
            },
          ]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closePersonModal} />
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', default: undefined })}
            style={styles.modalWrap}>
            <ScrollView
              style={styles.modalScroller}
              contentContainerStyle={styles.modalScrollShell}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View
                style={[
                  styles.modalCard,
                  {
                    width: pageWidth,
                    height: modalHeight,
                    backgroundColor: theme.modalBackground,
                    borderColor: theme.modalBorder,
                    borderRadius: theme.panelRadius,
                  },
                ]}>
                <View
                  style={[
                    styles.modalHeader,
                    {
                      borderBottomColor: theme.modalHeaderBorder,
                    },
                  ]}>
                  <View style={styles.modalHeaderCopy}>
                    <Text style={[styles.modalTitle, { color: theme.modalTitle }]}>
                      {isCompanyStepVisible ? 'Add company' : 'Add person'}
                    </Text>
                    <Text style={[styles.modalCopy, { color: theme.modalCopy }]}>
                      {isCompanyStepVisible
                        ? 'Create a company, then drop right back into the person form.'
                        : 'Capture a contact and attach them to a company if you have one.'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={closePersonModal}
                    style={[
                      styles.closeChip,
                      { backgroundColor: theme.closeChipBackground },
                      { borderRadius: theme.chipRadius },
                    ]}>
                    <Text style={[styles.closeChipText, { color: theme.closeChipText }]}>
                      Close
                    </Text>
                  </Pressable>
                </View>

                <View style={[styles.sliderViewport, { width: pageWidth }]}>
                  <Animated.View
                    style={[
                      styles.sliderTrack,
                      {
                        transform: [{ translateX }],
                        width: pageWidth * 2,
                      },
                    ]}>
                    <View style={[styles.modalPage, { width: pageWidth }]}>
                      <ScrollView
                        style={styles.modalScroll}
                        contentContainerStyle={styles.modalScrollContent}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.fieldStack}>
                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>Full name</Text>
                            <TextInput
                              autoCapitalize="words"
                              onChangeText={(value) =>
                                setPersonForm((current) => ({ ...current, fullName: value }))
                              }
                              placeholder="Jane Smith"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={personForm.fullName}
                            />
                          </View>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>Title</Text>
                            <TextInput
                              autoCapitalize="words"
                              onChangeText={(value) =>
                                setPersonForm((current) => ({ ...current, title: value }))
                              }
                              placeholder="Head of Growth"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={personForm.title}
                            />
                          </View>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>Location</Text>
                            <TextInput
                              autoCapitalize="words"
                              onChangeText={(value) =>
                                setPersonForm((current) => ({ ...current, location: value }))
                              }
                              placeholder="Bogota, Colombia"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={personForm.location}
                            />
                          </View>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>Email</Text>
                            <TextInput
                              autoCapitalize="none"
                              keyboardType="email-address"
                              onChangeText={(value) =>
                                setPersonForm((current) => ({ ...current, email: value }))
                              }
                              placeholder="jane@client.com"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={personForm.email}
                            />
                          </View>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>Phone</Text>
                            <TextInput
                              keyboardType="phone-pad"
                              onChangeText={(value) =>
                                setPersonForm((current) => ({ ...current, phone: value }))
                              }
                              placeholder="+1 555 123 4567"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={personForm.phone}
                            />
                          </View>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>LinkedIn</Text>
                            <TextInput
                              autoCapitalize="none"
                              onChangeText={(value) =>
                                setPersonForm((current) => ({ ...current, linkedin: value }))
                              }
                              placeholder="linkedin.com/in/jane-smith"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={personForm.linkedin}
                            />
                          </View>

                          <View style={styles.field}>
                            <View style={styles.inlineLabelRow}>
                              <Text style={[styles.label, { color: theme.fieldLabel }]}>Company</Text>
                              <Pressable onPress={() => setIsCompanyStepVisible(true)}>
                                <Text style={[styles.inlineLink, { color: theme.inlineLink }]}>
                                  Add company
                                </Text>
                              </Pressable>
                            </View>
                            <SelectField
                              label="Select company"
                              options={companyOptions}
                              placeholder={
                                companiesLoading ? 'Loading companies...' : 'Choose a company'
                              }
                              selectedValue={personForm.companyId}
                              onValueChange={(value) =>
                                setPersonForm((current) => ({ ...current, companyId: value }))
                              }
                              disabled={companiesLoading}
                              emptyMessage="Create a company from this modal if you need a new one."
                              variant={variant}
                            />
                          </View>
                        </View>
                      </ScrollView>

                      <View
                        style={[
                          styles.modalFooter,
                          {
                            backgroundColor: theme.modalBackground,
                            borderTopColor: theme.modalHeaderBorder,
                          },
                        ]}>
                        <Pressable
                          disabled={isCreatingPerson}
                          onPress={handleCreatePerson}
                          style={({ pressed }) => [
                            styles.primaryAction,
                            {
                              backgroundColor: theme.primaryBackground,
                              borderRadius: theme.controlRadius,
                            },
                            isCreatingPerson && styles.disabledButton,
                            pressed && !isCreatingPerson && { backgroundColor: theme.primaryPressed },
                          ]}>
                          <Text style={[styles.primaryActionText, { color: theme.primaryText }]}>
                            {isCreatingPerson ? 'Saving...' : 'Save person'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={[styles.modalPage, { width: pageWidth }]}>
                      <ScrollView
                        style={styles.modalScroll}
                        contentContainerStyle={styles.modalScrollContent}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.fieldStack}>
                          <Pressable
                            onPress={() => setIsCompanyStepVisible(false)}
                            style={styles.backLinkButton}>
                            <Text style={[styles.backLinkText, { color: theme.inlineLink }]}>
                              Back to person
                            </Text>
                          </Pressable>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>
                              Company name
                            </Text>
                            <TextInput
                              autoCapitalize="words"
                              onChangeText={(value) =>
                                setCompanyForm((current) => ({ ...current, name: value }))
                              }
                              placeholder="Northwind Creative"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={companyForm.name}
                            />
                          </View>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>Location</Text>
                            <TextInput
                              autoCapitalize="words"
                              onChangeText={(value) =>
                                setCompanyForm((current) => ({ ...current, location: value }))
                              }
                              placeholder="Austin, Texas"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={companyForm.location}
                            />
                          </View>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>Phone</Text>
                            <TextInput
                              keyboardType="phone-pad"
                              onChangeText={(value) =>
                                setCompanyForm((current) => ({ ...current, phone: value }))
                              }
                              placeholder="+1 555 555 0199"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={companyForm.phone}
                            />
                          </View>

                          <View style={styles.field}>
                            <Text style={[styles.label, { color: theme.fieldLabel }]}>Website</Text>
                            <TextInput
                              autoCapitalize="none"
                              onChangeText={(value) =>
                                setCompanyForm((current) => ({ ...current, website: value }))
                              }
                              placeholder="https://northwindcreative.com"
                              placeholderTextColor={theme.inputPlaceholder}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.inputBackground,
                                  borderColor: theme.inputBorder,
                                  borderRadius: theme.controlRadius,
                                  color: theme.inputText,
                                },
                              ]}
                              value={companyForm.website}
                            />
                          </View>
                        </View>
                      </ScrollView>

                      <View
                        style={[
                          styles.modalFooter,
                          {
                            backgroundColor: theme.modalBackground,
                            borderTopColor: theme.modalHeaderBorder,
                          },
                        ]}>
                        <Pressable
                          disabled={isCreatingCompany}
                          onPress={handleCreateCompany}
                          style={({ pressed }) => [
                            styles.primaryAction,
                            {
                              backgroundColor: theme.primaryBackground,
                              borderRadius: theme.controlRadius,
                            },
                            isCreatingCompany && styles.disabledButton,
                            pressed && !isCreatingCompany && { backgroundColor: theme.primaryPressed },
                          ]}>
                          <Text style={[styles.primaryActionText, { color: theme.primaryText }]}>
                            {isCreatingCompany ? 'Saving...' : 'Save company'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </DrawerScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screenRoot: {
    position: 'relative',
  },
  content: {
    gap: 20,
    padding: 20,
    paddingBottom: 36,
  },
  precisionGradientLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B0D10',
    backgroundImage: 'linear-gradient(180deg, #1A2430 0%, #0D1117 42%, #0E1821 78%, #13202A 100%)',
  },
  hero: {
    borderRadius: 32,
    borderWidth: 1,
    gap: 10,
    overflow: 'hidden',
    padding: 24,
    position: 'relative',
  },
  heroOrb: {
    borderRadius: 999,
    position: 'absolute',
  },
  heroOrbLarge: {
    height: 220,
    right: -48,
    top: -52,
    width: 220,
  },
  heroOrbSmall: {
    bottom: -28,
    height: 140,
    left: -20,
    width: 140,
  },
  heroGlow: {
    borderRadius: 999,
    height: 150,
    left: '28%',
    opacity: 0.7,
    position: 'absolute',
    top: 56,
    width: 150,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 36,
    maxWidth: 620,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 700,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  heroBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  heroSeamTop: {
    height: 1,
    left: 18,
    opacity: 0.9,
    position: 'absolute',
    right: 18,
    top: 14,
  },
  heroSeamSide: {
    bottom: 22,
    opacity: 0.65,
    position: 'absolute',
    right: 14,
    top: 22,
    width: 1,
  },
  heroSeamBottom: {
    bottom: 14,
    height: 1,
    left: 36,
    opacity: 0.9,
    position: 'absolute',
    right: 36,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    borderRadius: 24,
    borderWidth: 1,
    flexGrow: 1,
    gap: 8,
    minWidth: 180,
    padding: 18,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  statHint: {
    fontSize: 13,
    lineHeight: 19,
  },
  noticeCard: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  noticeCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  inlineWarning: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  embeddedMessage: {
    marginBottom: 2,
  },
  inlineWarningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 32,
    borderWidth: 1,
    gap: 24,
    padding: 22,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  cardCopy: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  fieldStack: {
    gap: 18,
  },
  personRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  personSelect: {
    flex: 1,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inlineLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inlineLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 136,
    paddingTop: 16,
  },
  primaryAction: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryAction: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.55,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalWrap: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  modalScroller: {
    flex: 1,
    width: '100%',
  },
  modalScrollShell: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalCard: {
    alignSelf: 'center',
    borderRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalHeaderCopy: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalCopy: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 280,
  },
  closeChip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexShrink: 0,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
  },
  closeChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sliderViewport: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  sliderTrack: {
    flex: 1,
    flexDirection: 'row',
  },
  modalPage: {
    flex: 1,
    minHeight: 0,
  },
  modalScroll: {
    flex: 1,
    minHeight: 0,
  },
  modalScrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 20,
  },
  modalFooter: {
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backLinkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
