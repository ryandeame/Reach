import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddCompanyPanel } from '@/components/add-company-panel';
import { AddPersonPanel } from '@/components/add-person-panel';
import { DrawerSceneWrapper } from '@/components/drawer-scene-wrapper';
import { useReachTheme } from '@/components/reach-theme-provider';
import { useCompanies } from '@/hooks/use-companies';
import { useCreateCompany } from '@/hooks/use-create-company';
import { useCreatePerson } from '@/hooks/use-create-person';
import { useCreateOutreachLog } from '@/hooks/use-create-outreach-log';
import { useDailyUniqueOutreachCount } from '@/hooks/use-daily-unique-outreach-count';
import { usePeople } from '@/hooks/use-people';

const DAILY_GOAL = 10;

const communicationProtocols = [
  { display: 'None', value: '' },
  { display: 'Email', value: 'Email' },
  { display: 'LinkedIn DM', value: 'LinkedIn DM' },
  { display: 'Facebook Message', value: 'Facebook Message' },
  { display: 'Twitter/X DM', value: 'Twitter/X DM' },
  { display: 'Discord DM', value: 'Discord DM' },
  { display: 'Reddit Chat', value: 'Reddit Chat' },
];

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

const glassEnhancement =
  Platform.OS === 'web'
    ? ({
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      } as const)
    : null;

const headerEnhancement =
  Platform.OS === 'web'
    ? ({
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      } as const)
    : null;

export function OutreachLogScreen() {
  const navigation = useNavigation();
  const { theme } = useReachTheme();
  const workflow = theme.workflow;
  const themedGlassEnhancement = workflow.glass ? glassEnhancement : null;
  const themedHeaderEnhancement = workflow.glass ? headerEnhancement : null;
  const [now, setNow] = useState(() => new Date());
  const [selectedPersonLabel, setSelectedPersonLabel] = useState('');
  const [peopleSearchTerm, setPeopleSearchTerm] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isPeopleOpen, setIsPeopleOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isAddPersonVisible, setIsAddPersonVisible] = useState(false);
  const [isCompanyStepVisible, setIsCompanyStepVisible] = useState(false);
  const [isCompanyOptionsOpen, setIsCompanyOptionsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [personForm, setPersonForm] = useState(initialPersonForm);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successTranslateY = useRef(new Animated.Value(-12)).current;

  const { people, refresh: refreshPeople } = usePeople();
  const { companies, refresh: refreshCompanies } = useCompanies();
  const { count, isLoading, refresh: refreshDailyCount } = useDailyUniqueOutreachCount(now);
  const { createCompany, isSubmitting: isCreatingCompany } = useCreateCompany();
  const { createPerson, isSubmitting: isCreatingPerson } = useCreatePerson();
  const { createOutreachLog, isSubmitting } = useCreateOutreachLog();

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, [])
  );

  const filteredPeople = useMemo(() => {
    const query = peopleSearchTerm.trim().toLowerCase();

    if (!query) {
      return people;
    }

    return people
      .filter((person) => {
        const companyName = person.reach_companies?.name ?? '';
        return `${person.full_name} ${companyName}`.toLowerCase().includes(query);
      })
      .slice(0, 50);
  }, [people, peopleSearchTerm]);

  const selectedProtocolLabel =
    communicationProtocols.find((protocol) => protocol.value === selectedProtocol)?.display ??
    'Select type';

  const companyOptions = useMemo(
    () => [
      { id: '', name: 'None' },
      ...companies.map((company) => ({
        id: company.id,
        name: company.location ? `${company.name} • ${company.location}` : company.name,
      })),
    ],
    [companies]
  );
  const selectedCompanyLabel =
    personForm.companyId
      ? companyOptions.find((company) => company.id === personForm.companyId)?.name ?? 'Select company'
      : 'Select company';

  const progressWidth = `${Math.min(1, count / DAILY_GOAL) * 100}%` as `${number}%`;
  const themedInputStyle = {
    backgroundColor: workflow.fieldBackground,
    borderColor: workflow.fieldBorder,
    borderRadius: workflow.radius,
    color: workflow.inputText,
  };
  const themedFieldStyle = {
    backgroundColor: workflow.fieldBackground,
    borderColor: workflow.fieldBorder,
    borderRadius: workflow.radius,
    boxShadow: workflow.panelShadow,
  };
  const themedPrimaryButtonStyle = {
    backgroundColor: workflow.primaryBackground,
    borderColor: workflow.primaryBorder,
    borderRadius: workflow.radius,
    boxShadow: `0px 0px 25px ${workflow.accentSoft}`,
  };
  const themedModalStyle = {
    backgroundColor: workflow.modalBackground,
    borderColor: workflow.modalBorder,
    borderRadius: workflow.radius,
  };
  const themedMenuStyle = {
    backgroundColor: workflow.menuBackground,
    borderColor: workflow.menuBorder,
    borderRadius: workflow.radius,
    boxShadow: workflow.panelShadow,
  };

  const handleSelectPerson = (personId: string, label: string) => {
    setSelectedPersonId(personId);
    setSelectedPersonLabel(personId ? label : '');
    setPeopleSearchTerm('');
    setIsPeopleOpen(false);
  };

  const showSuccessToast = useCallback(
    (message: string) => {
      successOpacity.stopAnimation();
      successTranslateY.stopAnimation();
      successOpacity.setValue(0);
      successTranslateY.setValue(-12);
      setSuccessMessage(message);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(successOpacity, {
            duration: 180,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(successTranslateY, {
            duration: 180,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(1200),
        Animated.parallel([
          Animated.timing(successOpacity, {
            duration: 240,
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.timing(successTranslateY, {
            duration: 240,
            toValue: -12,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setSuccessMessage('');
      });
    },
    [successOpacity, successTranslateY]
  );

  const handleSave = async () => {
    const problems: string[] = [];

    if (!selectedPersonId) {
      problems.push('Choose a target entity.');
    }

    if (!selectedProtocol) {
      problems.push('Choose a communication vector.');
    }

    if (!message.trim()) {
      problems.push('Log details of the interaction.');
    }

    if (problems.length > 0) {
      Alert.alert('Unable to record outreach', problems.map((problem) => `• ${problem}`).join('\n'));
      return;
    }

    try {
      await createOutreachLog({
        personId: selectedPersonId,
        commType: selectedProtocol,
        message,
      });
      await refreshDailyCount();

      setSelectedPersonId('');
      setSelectedPersonLabel('');
      setPeopleSearchTerm('');
      setSelectedProtocol('');
      setMessage('');
      setIsProtocolOpen(false);
      showSuccessToast('Outreach recorded');
    } catch (error) {
      Alert.alert(
        'Unable to record outreach',
        error instanceof Error ? error.message : 'Try again.'
      );
    }
  };

  const openPeoplePicker = () => {
    setPeopleSearchTerm('');
    setIsPeopleOpen(true);
  };

  const closePeoplePicker = () => {
    setPeopleSearchTerm('');
    setIsPeopleOpen(false);
  };

  const closeAddPerson = () => {
    setIsAddPersonVisible(false);
    setIsCompanyStepVisible(false);
    setIsCompanyOptionsOpen(false);
    setPersonForm(initialPersonForm);
    setCompanyForm(initialCompanyForm);
  };

  const handleCreatePerson = async () => {
    try {
      const newPerson = await createPerson(personForm);
      await refreshPeople();
      handleSelectPerson(newPerson.id, newPerson.full_name);
      closeAddPerson();
      showSuccessToast('Person added');
    } catch (error) {
      Alert.alert(
        'Unable to add person',
        error instanceof Error ? error.message : 'Try again.'
      );
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
      showSuccessToast('Company added');
    } catch (error) {
      Alert.alert(
        'Unable to add company',
        error instanceof Error ? error.message : 'Try again.'
      );
    }
  };

  const updateCompanyForm = (field: keyof typeof initialCompanyForm, value: string) => {
    setCompanyForm((current) => ({ ...current, [field]: value }));
  };

  const importCompanyForm = (fields: Partial<typeof initialCompanyForm>) => {
    setCompanyForm((current) => ({ ...current, ...fields }));
  };

  const updatePersonForm = (field: keyof typeof initialPersonForm, value: string) => {
    setPersonForm((current) => ({ ...current, [field]: value }));
  };

  const importPersonForm = (fields: Partial<typeof initialPersonForm>) => {
    setPersonForm((current) => ({ ...current, ...fields }));
  };

  return (
    <DrawerSceneWrapper>
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: workflow.background },
        ]}
        edges={['top']}>
        <View style={styles.root}>
          {workflow.backgroundGradient ? (
            <LinearGradient
              pointerEvents="none"
              colors={workflow.backgroundGradient.colors}
              locations={workflow.backgroundGradient.locations}
              start={workflow.backgroundGradient.start}
              end={workflow.backgroundGradient.end}
              style={styles.workflowGradient}
            />
          ) : null}

          {isPeopleOpen ? (
            <Pressable onPress={closePeoplePicker} style={styles.dismissLayer} />
          ) : null}

          <View
            style={[
              styles.header,
              {
                backgroundColor: workflow.headerBackground,
                borderBottomColor: workflow.headerBorder,
                boxShadow: workflow.headerShadow,
              },
              themedHeaderEnhancement as any,
            ]}>
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={styles.headerLeft}>
              <MaterialIcons
                name="terminal"
                size={20}
                color={workflow.accent}
                style={[styles.headerTerminal, { textShadowColor: workflow.accentSoft }]}
              />
              <Text style={[styles.headerTitle, { color: workflow.text }]}>OUTREACH_LOG</Text>
            </Pressable>

            <Pressable style={styles.headerRight}>
              <MaterialIcons name="settings-input-component" size={22} color={workflow.accent} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: workflow.panelBackground,
                  borderLeftColor: workflow.accent,
                  borderRadius: workflow.radius,
                  boxShadow: workflow.panelShadow,
                },
                themedGlassEnhancement as any,
              ]}>
              <View style={styles.heroLabelWrap}>
                <Text style={[styles.heroLabel, { color: workflow.accent }]}>Target_Metrics</Text>
              </View>
              <Text style={[styles.heroValue, { color: workflow.text }]}>
                {isLoading ? '... / 10' : `${count} / 10`}
              </Text>
              <Text style={[styles.heroCaption, { color: workflow.accent }]}>
                Contacts Logged Today
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: workflow.divider }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: workflow.accent,
                      boxShadow: `0px 0px 15px ${workflow.accentSoft}`,
                      width: progressWidth,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.formStack}>
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: workflow.accent }]}>Target Entity</Text>
                <View style={styles.dropdownWrap}>
                  <View style={styles.targetRow}>
                    <Pressable
                      onPress={openPeoplePicker}
                      style={[
                        styles.searchField,
                        styles.targetField,
                        {
                          backgroundColor: workflow.fieldBackground,
                          borderColor: workflow.fieldBorder,
                          borderRadius: workflow.radius,
                          boxShadow: workflow.panelShadow,
                        },
                        themedGlassEnhancement as any,
                      ]}>
                      <MaterialIcons name="search" size={18} color={workflow.accentMuted} />
                      <Text
                        style={[
                          styles.searchInputDisplay,
                          { color: selectedPersonLabel ? workflow.inputText : workflow.placeholder },
                        ]}>
                        {selectedPersonLabel || 'Search contacts'}
                      </Text>
                      <MaterialIcons name="arrow-drop-down" size={22} color={workflow.accent} />
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        setIsProtocolOpen(false);
                        setIsAddPersonVisible(true);
                      }}
                      style={[
                        styles.addPersonButton,
                        {
                          backgroundColor: workflow.primaryBackground,
                          borderColor: workflow.primaryBorder,
                          borderRadius: workflow.radius,
                        },
                      ]}>
                      <MaterialIcons name="person-add-alt-1" size={16} color={workflow.primaryText} />
                      <Text style={[styles.addPersonButtonText, { color: workflow.primaryText }]}>
                        Add person
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: workflow.accent }]}>
                  Communication Vector
                </Text>
                <View style={styles.dropdownWrap}>
                  <Pressable
                    onPress={() => setIsProtocolOpen(true)}
                    style={[
                      styles.vectorField,
                      {
                        backgroundColor: workflow.fieldBackground,
                        borderColor: workflow.fieldBorder,
                        borderRadius: workflow.radius,
                        boxShadow: workflow.panelShadow,
                      },
                      themedGlassEnhancement as any,
                    ]}>
                    <View style={styles.vectorFieldCopy}>
                      <MaterialIcons name="hub" size={18} color={workflow.accent} />
                      <Text
                        style={[
                          styles.vectorFieldText,
                          { color: selectedProtocol ? workflow.inputText : workflow.placeholder },
                        ]}>
                        {selectedProtocol ? selectedProtocolLabel : 'Select type'}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={22}
                      color={workflow.accent}
                      style={styles.vectorChevronOpen}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.telemetryAccent}>
                  <View
                    style={[
                      styles.telemetryLineLong,
                      { backgroundColor: workflow.accent, boxShadow: `0px 0px 8px ${workflow.accentSoft}` },
                    ]}
                  />
                  <View style={[styles.telemetryLineShort, { backgroundColor: workflow.accentMuted }]} />
                </View>
                <Text style={[styles.sectionLabel, { color: workflow.accent }]}>
                  Telemetry &amp; Insights
                </Text>
                <View
                  style={[
                    styles.messageShell,
                    {
                      backgroundColor: workflow.fieldBackground,
                      borderColor: workflow.fieldBorder,
                      borderRadius: workflow.radius,
                      boxShadow: workflow.panelShadow,
                    },
                    themedGlassEnhancement as any,
                  ]}>
                  <TextInput
                    multiline
                    onChangeText={setMessage}
                    placeholder="Log details of the interaction..."
                    placeholderTextColor={workflow.placeholder}
                    style={[styles.messageInput, { color: workflow.inputText }]}
                    textAlignVertical="top"
                    value={message}
                  />
                </View>
              </View>

              <Pressable
                disabled={isSubmitting}
                onPress={handleSave}
                style={({ pressed }) => [
                  styles.recordButton,
                  {
                    backgroundColor: pressed && !isSubmitting
                      ? workflow.primaryPressed
                      : workflow.primaryBackground,
                    borderColor: workflow.primaryBorder,
                    borderRadius: workflow.radius,
                    boxShadow: `0px 0px 25px ${workflow.accentSoft}`,
                  },
                  isSubmitting && styles.recordButtonDisabled,
                ]}>
                <MaterialIcons name="upload" size={18} color={workflow.primaryText} />
                <Text style={[styles.recordButtonText, { color: workflow.primaryText }]}>
                  {isSubmitting ? 'Recording...' : 'Record Outreach'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>

          <View
            style={[
              styles.bottomNav,
              {
                backgroundColor: workflow.headerBackground,
                borderTopColor: workflow.headerBorder,
                boxShadow: workflow.headerShadow,
              },
              themedHeaderEnhancement as any,
            ]}>
            <Pressable onPress={() => router.push('/outreach-log')} style={styles.navItem}>
              <MaterialIcons name="home" size={22} color={workflow.accentMuted} />
              <Text style={[styles.navLabel, { color: workflow.accentMuted }]}>HOME</Text>
            </Pressable>

            <View style={[styles.navItem, { backgroundColor: workflow.selectedBackground }]}>
              <MaterialIcons
                name="dns"
                size={22}
                color={workflow.accent}
                style={[styles.navIconGlow, { textShadowColor: workflow.accentSoft }]}
              />
              <Text style={[styles.navLabel, { color: workflow.accent }]}>LOGS</Text>
            </View>

            <Pressable
              onPress={() => router.push('/initiative-dashboard')}
              style={styles.navItem}>
              <MaterialIcons name="query-stats" size={22} color={workflow.accentMuted} />
              <Text style={[styles.navLabel, { color: workflow.accentMuted }]}>TELEMETRY</Text>
            </Pressable>

            <View style={styles.navItem}>
              <MaterialIcons name="hub" size={22} color={workflow.accentMuted} />
              <Text style={[styles.navLabel, { color: workflow.accentMuted }]}>COMMS</Text>
            </View>

            <View style={styles.navItem}>
              <MaterialIcons name="memory" size={22} color={workflow.accentMuted} />
              <Text style={[styles.navLabel, { color: workflow.accentMuted }]}>SYSTEM</Text>
            </View>
          </View>
        </View>

        <Modal animationType="fade" transparent visible={isAddPersonVisible} onRequestClose={closeAddPerson}>
          <View style={[styles.modalOverlay, { backgroundColor: workflow.modalOverlay }]}>
            <Pressable onPress={closeAddPerson} style={styles.modalDismiss} />
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: workflow.modalBackground,
                  borderColor: workflow.modalBorder,
                  borderRadius: workflow.radius,
                },
                themedGlassEnhancement as any,
              ]}>
              <View style={[styles.modalHeader, { borderBottomColor: workflow.modalHeaderBorder }]}>
                <Text style={[styles.modalTitle, { color: workflow.text }]}>Add Person</Text>
                <Pressable onPress={closeAddPerson} style={styles.modalCloseButton}>
                  <MaterialIcons name="close" size={18} color={workflow.accent} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {isCompanyStepVisible ? (
                  <AddCompanyPanel
                    cancelButtonStyle={[
                      styles.recordButton,
                      {
                        backgroundColor: workflow.menuBackground,
                        borderColor: workflow.menuBorder,
                        borderRadius: workflow.radius,
                        boxShadow: 'none',
                      },
                    ]}
                    cancelTextStyle={[styles.recordButtonText, { color: workflow.accent }]}
                    disabledButtonStyle={styles.recordButtonDisabled}
                    dropOverlayColor={workflow.accent}
                    dropOverlayRadius={workflow.radius}
                    enabled={isAddPersonVisible && isCompanyStepVisible}
                    fieldStackStyle={styles.modalContentFields}
                    inputStyle={[
                      styles.modalInput,
                      {
                        backgroundColor: workflow.fieldBackground,
                        borderColor: workflow.fieldBorder,
                        borderRadius: workflow.radius,
                        color: workflow.inputText,
                      },
                    ]}
                    isSaving={isCreatingCompany}
                    labelColor={workflow.accent}
                    onCancel={() => setIsCompanyStepVisible(false)}
                    onChangeField={updateCompanyForm}
                    onImportFields={importCompanyForm}
                    onSave={handleCreateCompany}
                    placeholderColor={workflow.placeholder}
                    saveButtonStyle={[
                      styles.recordButton,
                      {
                        backgroundColor: workflow.primaryBackground,
                        borderColor: workflow.primaryBorder,
                        borderRadius: workflow.radius,
                        boxShadow: `0px 0px 25px ${workflow.accentSoft}`,
                      },
                    ]}
                    saveTextStyle={[styles.recordButtonText, { color: workflow.primaryText }]}
                    titleColor={workflow.text}
                    value={companyForm}
                  />
                ) : (
                  <AddPersonPanel
                    companyControl={
                      <View style={styles.modalField}>
                        <View style={styles.companyLabelRow}>
                          <Text style={[styles.sectionLabel, { color: workflow.accent }]}>
                            Company
                          </Text>
                          <Pressable onPress={() => setIsCompanyStepVisible(true)}>
                            <Text style={[styles.companyActionText, { color: workflow.accent }]}>
                              Add company
                            </Text>
                          </Pressable>
                        </View>

                        <View style={styles.dropdownWrap}>
                          <Pressable
                            onPress={() => setIsCompanyOptionsOpen(true)}
                            style={[
                              styles.vectorField,
                              themedFieldStyle,
                              themedGlassEnhancement as any,
                            ]}>
                            <View style={styles.vectorFieldCopy}>
                              <MaterialIcons name="apartment" size={18} color={workflow.accent} />
                              <Text style={[styles.vectorFieldText, { color: workflow.inputText }]}>
                                {selectedCompanyLabel}
                              </Text>
                            </View>
                            <MaterialIcons
                              name="chevron-right"
                              size={22}
                              color={workflow.accent}
                              style={styles.vectorChevronOpen}
                            />
                          </Pressable>
                        </View>
                      </View>
                    }
                    disabledButtonStyle={styles.recordButtonDisabled}
                    dropOverlayColor={workflow.accent}
                    dropOverlayRadius={workflow.radius}
                    enabled={isAddPersonVisible && !isCompanyStepVisible}
                    fieldStyle={styles.modalField}
                    inputStyle={[styles.modalInput, themedInputStyle]}
                    isSaving={isCreatingPerson}
                    labelColor={workflow.accent}
                    onChangeField={updatePersonForm}
                    onImportFields={importPersonForm}
                    onSave={handleCreatePerson}
                    placeholderColor={workflow.placeholder}
                    saveButtonStyle={[
                      styles.recordButton,
                      {
                        ...themedPrimaryButtonStyle,
                        backgroundColor: workflow.primaryBackground,
                      },
                    ]}
                    saveIconColor={workflow.primaryText}
                    saveTextStyle={[styles.recordButtonText, { color: workflow.primaryText }]}
                    value={personForm}
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal animationType="none" transparent visible={Boolean(successMessage)}>
          <View pointerEvents="none" style={styles.successToastOverlay}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.successToast,
                {
                  backgroundColor: workflow.toastBackground,
                  borderColor: workflow.toastBorder,
                  borderRadius: workflow.radius,
                  opacity: successOpacity,
                  transform: [{ translateY: successTranslateY }],
                },
              ]}>
              <Text style={styles.successToastText}>{successMessage}</Text>
            </Animated.View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent visible={isPeopleOpen} onRequestClose={closePeoplePicker}>
          <View style={[styles.modalOverlay, { backgroundColor: workflow.modalOverlay }]}>
            <Pressable onPress={closePeoplePicker} style={styles.modalDismiss} />
            <View style={[styles.modalCard, themedModalStyle, themedGlassEnhancement as any]}>
              <View style={[styles.modalHeader, { borderBottomColor: workflow.modalHeaderBorder }]}>
                <Text style={[styles.modalTitle, { color: workflow.text }]}>Target Entity</Text>
                <Pressable onPress={closePeoplePicker} style={styles.modalCloseButton}>
                  <MaterialIcons name="close" size={18} color={workflow.accent} />
                </Pressable>
              </View>

              <View style={styles.peoplePickerContent}>
                <View style={[styles.searchField, themedFieldStyle, themedGlassEnhancement as any]}>
                  <MaterialIcons name="search" size={18} color={workflow.accentMuted} />
                  <TextInput
                    autoFocus
                    onChangeText={setPeopleSearchTerm}
                    placeholder="Search contacts"
                    placeholderTextColor={workflow.placeholder}
                    style={[styles.searchInput, { color: workflow.inputText }]}
                    value={peopleSearchTerm}
                  />
                </View>

                <ScrollView
                  style={[
                    styles.peopleMenu,
                    styles.peopleMenuModal,
                    themedMenuStyle,
                    themedGlassEnhancement as any,
                  ]}
                  contentContainerStyle={styles.peopleMenuContent}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}>
                  {!peopleSearchTerm.trim() ? (
                    <Pressable
                      onPress={() => handleSelectPerson('', '')}
                      style={[
                        styles.peopleItem,
                        styles.peopleItemBorder,
                        { borderBottomColor: workflow.divider },
                      ]}>
                      <Text style={[styles.peopleItemText, { color: workflow.accent }]}>None</Text>
                    </Pressable>
                  ) : null}

                  {filteredPeople.length === 0 ? (
                    <Text style={[styles.emptyState, { color: workflow.accent }]}>
                      No matching contacts found.
                    </Text>
                  ) : (
                    filteredPeople.map((person, index) => {
                      const label = person.reach_companies?.name
                        ? `${person.full_name} • ${person.reach_companies.name}`
                        : person.full_name;

                      return (
                        <Pressable
                          key={person.id}
                          onPress={() => handleSelectPerson(person.id, label)}
                          style={[
                            styles.peopleItem,
                            index < filteredPeople.length - 1 && [
                              styles.peopleItemBorder,
                              { borderBottomColor: workflow.divider },
                            ],
                          ]}>
                          <Text style={[styles.peopleItemText, { color: workflow.accent }]}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent visible={isProtocolOpen} onRequestClose={() => setIsProtocolOpen(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: workflow.modalOverlay }]}>
            <Pressable onPress={() => setIsProtocolOpen(false)} style={styles.modalDismiss} />
            <View style={[styles.modalCard, themedModalStyle, themedGlassEnhancement as any]}>
              <View style={[styles.modalHeader, { borderBottomColor: workflow.modalHeaderBorder }]}>
                <Text style={[styles.modalTitle, { color: workflow.text }]}>Communication Type</Text>
                <Pressable onPress={() => setIsProtocolOpen(false)} style={styles.modalCloseButton}>
                  <MaterialIcons name="close" size={18} color={workflow.accent} />
                </Pressable>
              </View>

              <ScrollView
                style={[
                  styles.peopleMenu,
                  styles.peopleMenuModal,
                  themedMenuStyle,
                  themedGlassEnhancement as any,
                ]}
                contentContainerStyle={styles.peopleMenuContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}>
                {communicationProtocols.map((protocol, index) => {
                  const isSelected = protocol.value === selectedProtocol;

                  return (
                    <Pressable
                      key={protocol.display}
                      onPress={() => {
                        setSelectedProtocol(protocol.value);
                        setIsProtocolOpen(false);
                      }}
                      style={[
                        styles.protocolItem,
                        index < communicationProtocols.length - 1 && [
                          styles.peopleItemBorder,
                          { borderBottomColor: workflow.divider },
                        ],
                        isSelected && { backgroundColor: workflow.selectedBackground },
                      ]}>
                      <Text
                        style={[
                          styles.protocolItemText,
                          { color: isSelected ? workflow.text : workflow.accent },
                        ]}>
                        {protocol.display}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent
          visible={isCompanyOptionsOpen}
          onRequestClose={() => setIsCompanyOptionsOpen(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: workflow.modalOverlay }]}>
            <Pressable onPress={() => setIsCompanyOptionsOpen(false)} style={styles.modalDismiss} />
            <View style={[styles.modalCard, themedModalStyle, themedGlassEnhancement as any]}>
              <View style={[styles.modalHeader, { borderBottomColor: workflow.modalHeaderBorder }]}>
                <Text style={[styles.modalTitle, { color: workflow.text }]}>Company</Text>
                <Pressable
                  onPress={() => setIsCompanyOptionsOpen(false)}
                  style={styles.modalCloseButton}>
                  <MaterialIcons name="close" size={18} color={workflow.accent} />
                </Pressable>
              </View>

              <ScrollView
                style={[
                  styles.peopleMenu,
                  styles.peopleMenuModal,
                  themedMenuStyle,
                  themedGlassEnhancement as any,
                ]}
                contentContainerStyle={styles.peopleMenuContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}>
                {companyOptions.map((company, index) => {
                  const isSelected = company.id === personForm.companyId;

                  return (
                    <Pressable
                      key={company.id || company.name}
                      onPress={() => {
                        setPersonForm((current) => ({
                          ...current,
                          companyId: company.id,
                        }));
                        setIsCompanyOptionsOpen(false);
                      }}
                      style={[
                        styles.companyMenuItem,
                        index < companyOptions.length - 1 && [
                          styles.peopleItemBorder,
                          { borderBottomColor: workflow.divider },
                        ],
                        isSelected && { backgroundColor: workflow.selectedBackground },
                      ]}>
                      <Text
                        style={[
                          styles.companyMenuItemText,
                          { color: isSelected ? workflow.text : workflow.accent },
                        ]}>
                        {company.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </DrawerSceneWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#131314',
    flex: 1,
  },
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  workflowGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  successToastOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successToast: {
    backgroundColor: 'rgba(93, 0, 23, 0.72)',
    borderColor: 'rgba(229, 115, 115, 0.4)',
    borderRadius: 18,
    borderWidth: 1,
    boxShadow: '0px 10px 28px rgba(0, 0, 0, 0.35)',
    elevation: 12,
    maxWidth: 280,
    paddingHorizontal: 18,
    paddingVertical: 12,
    position: 'absolute',
    zIndex: 80,
  },
  successToastText: {
    color: '#FFFFFF',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  dismissLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderBottomColor: 'rgba(163, 0, 41, 0.3)',
    borderBottomWidth: 1,
    boxShadow: '0px 4px 20px rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerTerminal: {
    textShadowColor: 'rgba(163,0,41,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2.1,
    textTransform: 'uppercase',
  },
  headerRight: {
    padding: 8,
  },
  content: {
    alignSelf: 'center',
    gap: 32,
    maxWidth: 780,
    padding: 24,
    paddingBottom: 120,
    width: '100%',
  },
  heroCard: {
    backgroundColor: 'rgba(10, 10, 12, 0.4)',
    borderLeftColor: '#A30029',
    borderLeftWidth: 2,
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
    padding: 24,
    position: 'relative',
  },
  heroLabelWrap: {
    opacity: 0.6,
    position: 'absolute',
    right: 8,
    top: 0,
  },
  heroLabel: {
    color: '#E57373',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 10,
    letterSpacing: 2,
    padding: 8,
    textTransform: 'uppercase',
  },
  heroValue: {
    color: '#FFFFFF',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroCaption: {
    color: '#E57373',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  progressTrack: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#A30029',
    boxShadow: '0px 0px 15px rgba(163,0,41,0.8)',
    height: '100%',
  },
  formStack: {
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: '#E57373',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  dropdownWrap: {
    position: 'relative',
  },
  targetRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 12,
  },
  targetField: {
    flex: 1,
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 12, 0.4)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchInput: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchInputDisplay: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 14,
  },
  searchPlaceholder: {
    color: '#FFFFFF',
  },
  addPersonButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(93,0,23,0.9)',
    borderColor: 'rgba(163,0,41,0.6)',
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minWidth: 132,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  addPersonButtonText: {
    color: '#FFFFFF',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  peopleMenu: {
    backgroundColor: 'rgba(10, 10, 12, 0.92)',
    borderColor: 'rgba(163,0,41,0.3)',
    borderWidth: 1,
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
    maxHeight: 260,
  },
  peopleMenuModal: {
    maxHeight: 360,
  },
  peopleMenuContent: {
    paddingVertical: 2,
  },
  peopleItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  peopleItemBorder: {
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
  },
  peopleItemText: {
    color: '#E57373',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  emptyState: {
    color: '#E57373',
    fontSize: 13,
    opacity: 0.7,
    padding: 16,
  },
  vectorField: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 12, 0.4)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  vectorFieldCopy: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  vectorFieldText: {
    color: '#FFFFFF',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  vectorChevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  protocolMenu: {
    backgroundColor: 'rgba(10, 10, 12, 0.92)',
    borderColor: 'rgba(163,0,41,0.3)',
    borderWidth: 1,
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
    left: 0,
    marginTop: 8,
    position: 'absolute',
    right: 0,
    top: '100%',
    zIndex: 50,
  },
  protocolItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  protocolItemText: {
    color: '#E57373',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  telemetryAccent: {
    alignItems: 'flex-end',
    gap: 4,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  telemetryLineLong: {
    backgroundColor: '#A30029',
    boxShadow: '0px 0px 8px rgba(163,0,41,0.6)',
    height: 2,
    width: 24,
  },
  telemetryLineShort: {
    backgroundColor: '#E57373',
    height: 2,
    width: 12,
  },
  messageShell: {
    backgroundColor: 'rgba(10, 10, 12, 0.4)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
  },
  messageInput: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
    minHeight: 140,
    padding: 20,
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: '#5D0017',
    borderColor: 'rgba(163,0,41,0.6)',
    borderWidth: 1,
    boxShadow: '0px 0px 25px rgba(163,0,41,0.4)',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingVertical: 20,
  },
  recordButtonPressed: {
    backgroundColor: '#74001D',
  },
  recordButtonDisabled: {
    opacity: 0.6,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  bottomNav: {
    alignItems: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopColor: 'rgba(163,0,41,0.4)',
    borderTopWidth: 1,
    boxShadow: '0px -5px 25px rgba(0,0,0,0.6)',
    flexDirection: 'row',
    height: 64,
    left: 0,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  navItemActive: {
    backgroundColor: 'rgba(163,0,41,0.1)',
  },
  navIconGlow: {
    textShadowColor: 'rgba(163,0,41,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  navLabel: {
    color: 'rgba(229,115,115,0.7)',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  navLabelActive: {
    color: '#E57373',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    alignSelf: 'center',
    backgroundColor: 'rgba(10, 10, 12, 0.92)',
    borderColor: 'rgba(163,0,41,0.35)',
    borderWidth: 1,
    boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.4)',
    maxHeight: '82%',
    maxWidth: 560,
    width: '100%',
    zIndex: 5,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: 'rgba(163,0,41,0.25)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  modalCloseButton: {
    padding: 6,
  },
  modalContent: {
    gap: 18,
    padding: 20,
  },
  modalContentFields: {
    gap: 18,
  },
  peoplePickerContent: {
    gap: 16,
    padding: 20,
  },
  modalField: {
    gap: 10,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  backButtonText: {
    color: '#E57373',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: 'rgba(10, 10, 12, 0.7)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  companyLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyActionText: {
    color: '#E57373',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  companyMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  companyMenuItemSelected: {
    backgroundColor: 'rgba(163,0,41,0.18)',
  },
  companyMenuItemText: {
    color: '#E57373',
    fontFamily: Platform.select({ web: 'Space Grotesk', default: undefined }),
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  companyMenuItemTextSelected: {
    color: '#FFFFFF',
  },
});
