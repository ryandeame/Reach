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
  { label: 'Email', value: 'Email' },
  { label: 'LinkedIn DM', value: 'LinkedIn DM' },
  { label: 'Facebook Message', value: 'Facebook Message' },
  { label: 'Twitter/X DM', value: 'Twitter/X DM' },
  { label: 'Discord DM', value: 'Discord DM' },
  { label: 'Reddit Chat', value: 'Reddit Chat' },
];

export default function OutreachLoggerScreen() {
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
      useNativeDriver: true,
    }).start();
  }, [isCompanyStepVisible, slider]);

  const pageWidth = Math.min(width - 40, 520);
  const modalMaxHeight = Math.min(height - 32, 760);
  const translateX = slider.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -pageWidth],
  });

  const personOptions = people.map((person) => ({
    label: person.reach_companies?.name
      ? `${person.full_name} • ${person.reach_companies.name}`
      : person.full_name,
    value: person.id,
  }));

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
    try {
      await createOutreachLog({
        personId: selectedPersonId,
        commType,
        message,
      });

      const personName =
        people.find((person) => person.id === selectedPersonId)?.full_name ?? 'Contact';
      const loggedType = commType.trim();
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

  return (
    <DrawerScreenShell
      title="Outreach Log"
      subtitle="Capture the next touchpoint, add new contacts, and create companies inline.">
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Reach</Text>
            <Text style={styles.title}>Log client outreach without leaving the first screen.</Text>
            <Text style={styles.subtitle}>
              Pick an existing person, add a new one inline, and create missing companies from the
              same modal flow.
            </Text>
          </View>

          {!isSupabaseConfigured ? (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>Supabase setup needed</Text>
              <Text style={styles.noticeCopy}>
                Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to your Expo
                environment before saving logs.
              </Text>
            </View>
          ) : null}

          {dataMessage ? (
            <View style={styles.inlineWarning}>
              <Text style={styles.inlineWarningText}>{dataMessage}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>New outreach log</Text>
                <Text style={styles.cardCopy}>Entries are saved with the current timestamp.</Text>
              </View>
              {(peopleLoading || companiesLoading) && isSupabaseConfigured ? (
                <ActivityIndicator color="#0F766E" />
              ) : null}
            </View>

            <View style={styles.fieldStack}>
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
                  />
                </View>

                <Pressable
                  disabled={!isSupabaseConfigured}
                  onPress={() => setIsPersonModalVisible(true)}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    !isSupabaseConfigured && styles.disabledButton,
                    pressed && isSupabaseConfigured && styles.secondaryActionPressed,
                  ]}>
                  <Text style={styles.secondaryActionText}>Add person</Text>
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
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Message sent</Text>
                <TextInput
                  multiline
                  onChangeText={setMessage}
                  placeholder="Paste or write the message you sent..."
                  placeholderTextColor="#7B8794"
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={message}
                />
              </View>

              <Pressable
                disabled={!isSupabaseConfigured || isCreatingLog}
                onPress={handleCreateLog}
                style={({ pressed }) => [
                  styles.primaryAction,
                  (!isSupabaseConfigured || isCreatingLog) && styles.disabledButton,
                  pressed && isSupabaseConfigured && !isCreatingLog && styles.primaryActionPressed,
                ]}>
                <Text style={styles.primaryActionText}>
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
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closePersonModal} />
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', default: undefined })}
            style={styles.modalWrap}>
            <View style={[styles.modalCard, { width: pageWidth, maxHeight: modalMaxHeight }]}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {isCompanyStepVisible ? 'Add company' : 'Add person'}
                  </Text>
                  <Text style={styles.modalCopy}>
                    {isCompanyStepVisible
                      ? 'Create a company, then drop right back into the person form.'
                      : 'Capture a contact and attach them to a company if you have one.'}
                  </Text>
                </View>
                <Pressable onPress={closePersonModal} style={styles.closeChip}>
                  <Text style={styles.closeChipText}>Close</Text>
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
                      showsVerticalScrollIndicator={false}>
                      <View style={styles.fieldStack}>
                        <View style={styles.field}>
                          <Text style={styles.label}>Full name</Text>
                          <TextInput
                            autoCapitalize="words"
                            onChangeText={(value) =>
                              setPersonForm((current) => ({ ...current, fullName: value }))
                            }
                            placeholder="Jane Smith"
                            placeholderTextColor="#7B8794"
                            style={styles.input}
                            value={personForm.fullName}
                          />
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>Title</Text>
                          <TextInput
                            autoCapitalize="words"
                            onChangeText={(value) =>
                              setPersonForm((current) => ({ ...current, title: value }))
                            }
                            placeholder="Head of Growth"
                            placeholderTextColor="#7B8794"
                            style={styles.input}
                            value={personForm.title}
                          />
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>Location</Text>
                          <TextInput
                            autoCapitalize="words"
                            onChangeText={(value) =>
                              setPersonForm((current) => ({ ...current, location: value }))
                            }
                            placeholder="Bogota, Colombia"
                            placeholderTextColor="#7B8794"
                            style={styles.input}
                            value={personForm.location}
                          />
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>Email</Text>
                          <TextInput
                            autoCapitalize="none"
                            keyboardType="email-address"
                            onChangeText={(value) =>
                              setPersonForm((current) => ({ ...current, email: value }))
                            }
                            placeholder="jane@client.com"
                            placeholderTextColor="#7B8794"
                            style={styles.input}
                            value={personForm.email}
                          />
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>Phone</Text>
                          <TextInput
                            keyboardType="phone-pad"
                            onChangeText={(value) =>
                              setPersonForm((current) => ({ ...current, phone: value }))
                            }
                            placeholder="+1 555 123 4567"
                            placeholderTextColor="#7B8794"
                            style={styles.input}
                            value={personForm.phone}
                          />
                        </View>

                        <View style={styles.field}>
                          <Text style={styles.label}>LinkedIn</Text>
                          <TextInput
                            autoCapitalize="none"
                            onChangeText={(value) =>
                              setPersonForm((current) => ({ ...current, linkedin: value }))
                            }
                            placeholder="linkedin.com/in/jane-smith"
                            placeholderTextColor="#7B8794"
                            style={styles.input}
                            value={personForm.linkedin}
                          />
                        </View>

                        <View style={styles.field}>
                          <View style={styles.inlineLabelRow}>
                            <Text style={styles.label}>Company</Text>
                            <Pressable onPress={() => setIsCompanyStepVisible(true)}>
                              <Text style={styles.inlineLink}>Add company</Text>
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
                          />
                        </View>
                      </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                      <Pressable
                        disabled={isCreatingPerson}
                        onPress={handleCreatePerson}
                        style={({ pressed }) => [
                          styles.primaryAction,
                          isCreatingPerson && styles.disabledButton,
                          pressed && !isCreatingPerson && styles.primaryActionPressed,
                        ]}>
                        <Text style={styles.primaryActionText}>
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
                      showsVerticalScrollIndicator={false}>
                      <View style={styles.fieldStack}>
                        <Pressable
                          onPress={() => setIsCompanyStepVisible(false)}
                          style={styles.backLinkButton}>
                          <Text style={styles.backLinkText}>Back to person</Text>
                        </Pressable>

                      <View style={styles.field}>
                        <Text style={styles.label}>Company name</Text>
                        <TextInput
                          autoCapitalize="words"
                          onChangeText={(value) =>
                            setCompanyForm((current) => ({ ...current, name: value }))
                          }
                          placeholder="Northwind Creative"
                          placeholderTextColor="#7B8794"
                          style={styles.input}
                          value={companyForm.name}
                        />
                      </View>

                      <View style={styles.field}>
                        <Text style={styles.label}>Location</Text>
                        <TextInput
                          autoCapitalize="words"
                          onChangeText={(value) =>
                            setCompanyForm((current) => ({ ...current, location: value }))
                          }
                          placeholder="Austin, Texas"
                          placeholderTextColor="#7B8794"
                          style={styles.input}
                          value={companyForm.location}
                        />
                      </View>

                      <View style={styles.field}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                          keyboardType="phone-pad"
                          onChangeText={(value) =>
                            setCompanyForm((current) => ({ ...current, phone: value }))
                          }
                          placeholder="+1 555 555 0199"
                          placeholderTextColor="#7B8794"
                          style={styles.input}
                          value={companyForm.phone}
                        />
                      </View>

                      <View style={styles.field}>
                        <Text style={styles.label}>Website</Text>
                        <TextInput
                          autoCapitalize="none"
                          onChangeText={(value) =>
                            setCompanyForm((current) => ({ ...current, website: value }))
                          }
                          placeholder="https://northwindcreative.com"
                          placeholderTextColor="#7B8794"
                          style={styles.input}
                          value={companyForm.website}
                        />
                      </View>
                    </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                      <Pressable
                        disabled={isCreatingCompany}
                        onPress={handleCreateCompany}
                        style={({ pressed }) => [
                          styles.primaryAction,
                          isCreatingCompany && styles.disabledButton,
                          pressed && !isCreatingCompany && styles.primaryActionPressed,
                        ]}>
                        <Text style={styles.primaryActionText}>
                          {isCreatingCompany ? 'Saving...' : 'Save company'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              </View>
            </View>
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
  content: {
    gap: 20,
    padding: 20,
    paddingBottom: 36,
  },
  hero: {
    backgroundColor: '#102A43',
    borderRadius: 32,
    gap: 10,
    overflow: 'hidden',
    padding: 24,
  },
  eyebrow: {
    color: '#9AE6B4',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FDFDFB',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subtitle: {
    color: '#D9E2EC',
    fontSize: 15,
    lineHeight: 23,
  },
  noticeCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
    padding: 18,
  },
  noticeTitle: {
    color: '#9A3412',
    fontSize: 16,
    fontWeight: '700',
  },
  noticeCopy: {
    color: '#7C2D12',
    fontSize: 14,
    lineHeight: 20,
  },
  inlineWarning: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  inlineWarningText: {
    color: '#991B1B',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FCFCF9',
    borderRadius: 32,
    gap: 24,
    padding: 22,
    shadowColor: '#102A43',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#102A43',
    fontSize: 22,
    fontWeight: '800',
  },
  cardCopy: {
    color: '#52606D',
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
    color: '#213547',
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
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C9D7E3',
    borderRadius: 18,
    borderWidth: 1,
    color: '#102A43',
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
    backgroundColor: '#0F766E',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryActionPressed: {
    backgroundColor: '#115E59',
  },
  primaryActionText: {
    color: '#F8FFFD',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderColor: '#7DD3FC',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  secondaryActionPressed: {
    backgroundColor: '#D0EAFD',
  },
  secondaryActionText: {
    color: '#0C4A6E',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.55,
  },
  modalOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#FCFCF9',
    borderRadius: 30,
    flexShrink: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'flex-start',
    borderBottomColor: '#E3ECF3',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  modalTitle: {
    color: '#102A43',
    fontSize: 22,
    fontWeight: '800',
  },
  modalCopy: {
    color: '#52606D',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 280,
  },
  closeChip: {
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
  },
  closeChipText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
  },
  sliderViewport: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  sliderTrack: {
    flexDirection: 'row',
    flex: 1,
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
    padding: 20,
    paddingBottom: 12,
  },
  modalFooter: {
    backgroundColor: '#FCFCF9',
    borderTopColor: '#E3ECF3',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backLinkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  backLinkText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
  },
});
