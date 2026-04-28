import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CompanyFormFields } from '@/components/company-form-fields';
import { DrawerScreenShell } from '@/components/drawer-screen-shell';
import { useReachTheme } from '@/components/reach-theme-provider';
import { SelectField } from '@/components/select-field';
import { useCompanies } from '@/hooks/use-companies';
import { useCreateCompany } from '@/hooks/use-create-company';
import { useCreateJobApplication } from '@/hooks/use-create-job-application';
import { useCompanyJsonDropImport } from '@/hooks/use-company-json-drop-import';
import { useDailyJobApplicationCount } from '@/hooks/use-daily-job-application-count';
import { isSupabaseConfigured } from '@/lib/supabase';

const DAILY_APPLICATION_GOAL = 10;
const BAR_HEIGHTS = [14, 22, 30, 38, 46];

const initialCompanyForm = {
  name: '',
  location: '',
  phone: '',
  website: '',
};

const initialApplicationForm = {
  companyId: '',
  title: '',
  location: '',
  submittedResume: '',
  jobPostUrl: '',
  notes: '',
};

function getFilledBarCount(count: number) {
  if (count <= 0) {
    return 0;
  }

  return Math.min(BAR_HEIGHTS.length, Math.floor(count / 2));
}

export default function ApplyLogScreen() {
  const { theme, themeName } = useReachTheme();
  const dashboard = theme.dashboard;
  const workflow = theme.workflow;
  const dashboardValueColor = dashboard.value;
  const [now, setNow] = useState(() => new Date());
  const [applicationForm, setApplicationForm] = useState(initialApplicationForm);
  const [companyForm, setCompanyForm] = useState(initialCompanyForm);
  const [isCompanyModalVisible, setIsCompanyModalVisible] = useState(false);
  const {
    companies,
    error: companiesError,
    isLoading: companiesLoading,
    refresh: refreshCompanies,
  } = useCompanies();
  const {
    count,
    error: dailyCountError,
    isLoading: isDailyCountLoading,
  } = useDailyJobApplicationCount(now);
  const { createCompany, isSubmitting: isCreatingCompany } = useCreateCompany();
  const { createJobApplication, isSubmitting: isCreatingApplication } =
    useCreateJobApplication();
  const filledBars = getFilledBarCount(count);
  const goalLabel = isDailyCountLoading
    ? 'Loading today...'
    : `${count} / ${DAILY_APPLICATION_GOAL} jobs applied today`;
  const supportingCopy =
    count >= DAILY_APPLICATION_GOAL
      ? 'Application goal is fully charged for today.'
      : 'Every full 2 applications lights up one more bar.';

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
      void refreshCompanies();
    }, [refreshCompanies])
  );

  const companyOptions = [
    {
      label: companiesLoading ? 'Loading companies...' : 'Choose a company',
      value: '',
    },
    ...companies.map((company) => ({
      label: company.name,
      value: company.id,
      description: company.location ?? undefined,
    })),
  ];

  const updateApplicationForm = (field: keyof typeof initialApplicationForm, value: string) => {
    setApplicationForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateCompanyForm = (field: keyof typeof initialCompanyForm, value: string) => {
    setCompanyForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const importCompanyForm = (fields: Partial<typeof initialCompanyForm>) => {
    setCompanyForm((current) => ({
      ...current,
      ...fields,
    }));
  };

  const isCompanyJsonDragging = useCompanyJsonDropImport(isCompanyModalVisible, importCompanyForm);

  const closeCompanyModal = () => {
    setIsCompanyModalVisible(false);
    setCompanyForm(initialCompanyForm);
  };

  const handleCreateCompany = async () => {
    try {
      const newCompany = await createCompany(companyForm);
      await refreshCompanies();
      updateApplicationForm('companyId', newCompany.id);
      closeCompanyModal();
      Alert.alert('Company added', `${newCompany.name} is selected for this application.`);
    } catch (error) {
      Alert.alert('Unable to add company', error instanceof Error ? error.message : 'Try again.');
    }
  };

  const handleCreateApplication = async () => {
    const problems: string[] = [];

    if (!applicationForm.companyId) {
      problems.push('Choose a company.');
    }

    if (!applicationForm.title.trim()) {
      problems.push('Enter the job title.');
    }

    if (!applicationForm.submittedResume.trim()) {
      problems.push('Enter the submitted resume.');
    }

    if (!applicationForm.jobPostUrl.trim()) {
      problems.push('Enter the job post URL.');
    }

    if (problems.length > 0) {
      Alert.alert('Unable to save application', problems.map((problem) => `• ${problem}`).join('\n'));
      return;
    }

    try {
      await createJobApplication(applicationForm);
      const companyName =
        companies.find((company) => company.id === applicationForm.companyId)?.name ?? 'Company';
      setApplicationForm(initialApplicationForm);
      setNow(new Date());
      Alert.alert('Application logged', `Saved ${applicationForm.title.trim()} at ${companyName}.`);
    } catch (error) {
      Alert.alert('Unable to save application', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <DrawerScreenShell
      title="Apply Log"
      subtitle="Track job applications and keep the daily pipeline moving.">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { backgroundColor: dashboard.background },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.goalCard,
            {
              backgroundColor: dashboard.cardBackground,
              borderColor: dashboard.cardBorder,
              boxShadow: dashboard.cardShadow,
            },
          ]}>
          <View style={styles.goalHeader}>
            <View style={styles.goalCopy}>
              <Text style={[styles.eyebrow, { color: dashboard.label }]}>Today&apos;s Target</Text>
              <Text style={[styles.goalTitle, { color: dashboardValueColor }]}>{goalLabel}</Text>
              <Text style={[styles.goalHint, { color: dashboard.body }]}>
                Minimum goal: submit 10 job applications today.
              </Text>
            </View>
            {isDailyCountLoading ? <ActivityIndicator color={dashboardValueColor} /> : null}
          </View>

          <View style={styles.goalBody}>
            <View style={[styles.signalWrap, { backgroundColor: dashboard.signalPanel }]}>
              {BAR_HEIGHTS.map((height, index) => {
                const active = index < filledBars;

                return (
                  <View
                    key={height}
                    style={[
                      styles.bar,
                      { height, opacity: active ? 1 : 0.2 },
                      {
                        backgroundColor: active
                          ? dashboard.signalBarActive
                          : dashboard.signalBarInactive,
                      },
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.goalMeta}>
              <Text style={[styles.goalCount, { color: dashboardValueColor }]}>
                {isDailyCountLoading ? '...' : count}
              </Text>
              <Text style={[styles.goalCountLabel, { color: dashboard.label }]}>
                applications logged today
              </Text>
              <Text style={[styles.goalHint, { color: dashboard.body }]}>{supportingCopy}</Text>
            </View>
          </View>

          {dailyCountError ? (
            <Text style={[styles.errorText, { color: dashboard.body }]}>{dailyCountError}</Text>
          ) : null}
        </View>

        <View
          style={[
            styles.formCard,
            {
              backgroundColor: dashboard.cardBackground,
              borderColor: dashboard.cardBorder,
              boxShadow: dashboard.cardShadow,
            },
          ]}>
          <View style={styles.formHeader}>
            <View style={styles.formHeaderCopy}>
              <Text style={[styles.formTitle, { color: dashboardValueColor }]}>New application</Text>
              <Text style={[styles.formCopy, { color: dashboard.body }]}>
                Applications are saved with the current timestamp.
              </Text>
            </View>
            {(companiesLoading || isCreatingApplication) && isSupabaseConfigured ? (
              <ActivityIndicator color={dashboardValueColor} />
            ) : null}
          </View>

          {!isSupabaseConfigured ? (
            <View
              style={[
                styles.noticeCard,
                {
                  backgroundColor: dashboard.noteBackground,
                  borderColor: dashboard.noteBorder,
                },
              ]}>
              <Text style={[styles.noticeText, { color: dashboard.body }]}>
                Add Supabase environment variables before saving job applications.
              </Text>
            </View>
          ) : null}

          {companiesError ? (
            <View
              style={[
                styles.noticeCard,
                {
                  backgroundColor: dashboard.noteBackground,
                  borderColor: dashboard.noteBorder,
                },
              ]}>
              <Text style={[styles.noticeText, { color: dashboard.body }]}>{companiesError}</Text>
            </View>
          ) : null}

          <View style={styles.fieldStack}>
            <View style={styles.companyRow}>
              <View style={styles.companySelect}>
                <SelectField
                  label="Company"
                  options={companyOptions}
                  placeholder={companiesLoading ? 'Loading companies...' : 'Choose a company'}
                  selectedValue={applicationForm.companyId}
                  onValueChange={(value) => updateApplicationForm('companyId', value)}
                  disabled={!isSupabaseConfigured || companiesLoading}
                  emptyMessage="Add your first company to start logging applications."
                  variant={themeName}
                />
              </View>

              <Pressable
                disabled={!isSupabaseConfigured}
                onPress={() => setIsCompanyModalVisible(true)}
                style={({ pressed }) => [
                  styles.secondaryAction,
                  {
                    backgroundColor: workflow.menuBackground,
                    borderColor: workflow.menuBorder,
                    borderRadius: workflow.radius,
                  },
                  !isSupabaseConfigured && styles.disabledButton,
                  pressed && isSupabaseConfigured && { borderColor: workflow.accent },
                ]}>
                <Text style={[styles.secondaryActionText, { color: workflow.accent }]}>
                  Add company
                </Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: workflow.text }]}>Title</Text>
              <TextInput
                onChangeText={(value) => updateApplicationForm('title', value)}
                placeholder="Senior Full Stack Developer"
                placeholderTextColor={workflow.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: workflow.fieldBackground,
                    borderColor: workflow.fieldBorder,
                    borderRadius: workflow.radius,
                    color: workflow.inputText,
                  },
                ]}
                value={applicationForm.title}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: workflow.text }]}>Location</Text>
              <TextInput
                onChangeText={(value) => updateApplicationForm('location', value)}
                placeholder="Remote, Austin, TX, or Hybrid"
                placeholderTextColor={workflow.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: workflow.fieldBackground,
                    borderColor: workflow.fieldBorder,
                    borderRadius: workflow.radius,
                    color: workflow.inputText,
                  },
                ]}
                value={applicationForm.location}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: workflow.text }]}>Submitted resume</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateApplicationForm('submittedResume', value)}
                placeholder="Resume version, short notes, or pasted resume details..."
                placeholderTextColor={workflow.placeholder}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: workflow.fieldBackground,
                    borderColor: workflow.fieldBorder,
                    borderRadius: workflow.radius,
                    color: workflow.inputText,
                  },
                ]}
                textAlignVertical="top"
                value={applicationForm.submittedResume}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: workflow.text }]}>Job post URL</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="url"
                onChangeText={(value) => updateApplicationForm('jobPostUrl', value)}
                placeholder="https://..."
                placeholderTextColor={workflow.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: workflow.fieldBackground,
                    borderColor: workflow.fieldBorder,
                    borderRadius: workflow.radius,
                    color: workflow.inputText,
                  },
                ]}
                value={applicationForm.jobPostUrl}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: workflow.text }]}>Notes</Text>
              <TextInput
                multiline
                onChangeText={(value) => updateApplicationForm('notes', value)}
                placeholder="Follow-up plan, source, recruiter, salary range, or anything useful..."
                placeholderTextColor={workflow.placeholder}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: workflow.fieldBackground,
                    borderColor: workflow.fieldBorder,
                    borderRadius: workflow.radius,
                    color: workflow.inputText,
                  },
                ]}
                textAlignVertical="top"
                value={applicationForm.notes}
              />
            </View>

            <Pressable
              disabled={!isSupabaseConfigured || isCreatingApplication}
              onPress={handleCreateApplication}
              style={({ pressed }) => [
                styles.primaryAction,
                {
                  backgroundColor: workflow.primaryBackground,
                  borderRadius: workflow.radius,
                },
                (!isSupabaseConfigured || isCreatingApplication) && styles.disabledButton,
                pressed &&
                  isSupabaseConfigured &&
                  !isCreatingApplication && { backgroundColor: workflow.primaryPressed },
              ]}>
              <Text style={[styles.primaryActionText, { color: workflow.primaryText }]}>
                {isCreatingApplication ? 'Saving...' : 'Save application'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isCompanyModalVisible}
        onRequestClose={closeCompanyModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeCompanyModal} />
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: dashboard.cardBackground,
                borderColor: dashboard.cardBorder,
              },
            ]}>
            {isCompanyJsonDragging ? (
              <View
                pointerEvents="none"
                style={[
                  styles.dropOverlay,
                  {
                    backgroundColor: `${workflow.accent}33`,
                    borderColor: workflow.accent,
                  },
                ]}>
                <Text style={[styles.dropOverlayText, { color: workflow.accent }]}>
                  Drop file here
                </Text>
              </View>
            ) : null}

            <View style={styles.formHeader}>
              <Text style={[styles.formTitle, { color: dashboardValueColor }]}>Add company</Text>
              <Text style={[styles.formCopy, { color: dashboard.body }]}>
                Create a company and select it for this application.
              </Text>
            </View>

            <View style={styles.fieldStack}>
              <CompanyFormFields
                inputStyle={[
                  styles.input,
                  {
                    backgroundColor: workflow.fieldBackground,
                    borderColor: workflow.fieldBorder,
                    borderRadius: workflow.radius,
                    color: workflow.inputText,
                  },
                ]}
                labelColor={workflow.text}
                onChangeField={updateCompanyForm}
                placeholderColor={workflow.placeholder}
                value={companyForm}
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={closeCompanyModal}
                  style={[
                    styles.modalAction,
                    styles.secondaryAction,
                    {
                      backgroundColor: workflow.menuBackground,
                      borderColor: workflow.menuBorder,
                      borderRadius: workflow.radius,
                    },
                  ]}>
                  <Text style={[styles.secondaryActionText, { color: workflow.accent }]}>Cancel</Text>
                </Pressable>

                <Pressable
                  disabled={isCreatingCompany}
                  onPress={handleCreateCompany}
                  style={[
                    styles.modalAction,
                    styles.primaryAction,
                    {
                      backgroundColor: workflow.primaryBackground,
                      borderRadius: workflow.radius,
                    },
                    isCreatingCompany && styles.disabledButton,
                  ]}>
                  <Text style={[styles.primaryActionText, { color: workflow.primaryText }]}>
                    {isCreatingCompany ? 'Saving...' : 'Save company'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </DrawerScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  goalCard: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    padding: 22,
  },
  goalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  goalCopy: {
    flex: 1,
    gap: 5,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  goalTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  goalHint: {
    fontSize: 13,
    lineHeight: 19,
  },
  goalBody: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
  },
  signalWrap: {
    alignItems: 'flex-end',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  bar: {
    borderRadius: 999,
    width: 10,
  },
  goalMeta: {
    flex: 1,
    gap: 4,
  },
  goalCount: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 42,
  },
  goalCountLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  formCard: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    padding: 22,
  },
  formHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  formHeaderCopy: {
    flex: 1,
    gap: 5,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  formCopy: {
    fontSize: 13,
    lineHeight: 19,
  },
  noticeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
  },
  fieldStack: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  companyRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  companySelect: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 130,
  },
  primaryAction: {
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryAction: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.58,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  modalCard: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    maxHeight: '86%',
    padding: 22,
    position: 'relative',
  },
  dropOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    borderRadius: 28,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    zIndex: 20,
  },
  dropOverlayText: {
    fontSize: 22,
    fontWeight: '900',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalAction: {
    flex: 1,
  },
});
