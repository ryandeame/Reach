import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DrawerScreenShell } from '@/components/drawer-screen-shell';
import { useReachTheme } from '@/components/reach-theme-provider';
import { SelectField } from '@/components/select-field';
import { useCreateSocialPostLog } from '@/hooks/use-create-social-post-log';
import { useDailySocialPostCount } from '@/hooks/use-daily-social-post-count';
import { isSupabaseConfigured } from '@/lib/supabase';

const DAILY_SOCIAL_POST_GOAL = 3;

const targetEntityOptions = [
  { label: 'Choose a platform', value: '' },
  { label: 'LinkedIn', value: 'LinkedIn' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'Facebook', value: 'Facebook' },
  { label: 'Twitter/X', value: 'Twitter/X' },
];

const vectorOptions = [
  { label: 'Choose a vector', value: '' },
  { label: 'Post', value: 'Post' },
  { label: 'Reel', value: 'Reel' },
  { label: 'Story', value: 'Story' },
];

export default function SocialPostLogScreen() {
  const { theme, themeName } = useReachTheme();
  const dashboard = theme.dashboard;
  const workflow = theme.workflow;
  const dashboardValueColor = dashboard.value;
  const [now, setNow] = useState(() => new Date());
  const [targetEntity, setTargetEntity] = useState('');
  const [vector, setVector] = useState('');
  const [details, setDetails] = useState('');
  const {
    count,
    error: dailyCountError,
    isLoading: isDailyCountLoading,
  } = useDailySocialPostCount(now);
  const { createSocialPostLog, isSubmitting: isCreatingLog } = useCreateSocialPostLog();
  const progress = Math.min(1, count / DAILY_SOCIAL_POST_GOAL);
  const progressWidth = `${progress * 100}%` as `${number}%`;
  const goalLabel = isDailyCountLoading
    ? 'Loading today...'
    : `${count} / ${DAILY_SOCIAL_POST_GOAL} social posts logged today`;

  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, [])
  );

  const handleCreateLog = async () => {
    const problems: string[] = [];

    if (!targetEntity) {
      problems.push('Choose a target entity.');
    }

    if (!vector) {
      problems.push('Choose a vector.');
    }

    if (!details.trim()) {
      problems.push('Enter the post details.');
    }

    if (problems.length > 0) {
      Alert.alert('Unable to save social post log', problems.map((problem) => `• ${problem}`).join('\n'));
      return;
    }

    try {
      await createSocialPostLog({
        targetEntity,
        vector,
        details,
      });

      setTargetEntity('');
      setVector('');
      setDetails('');
      setNow(new Date());
      Alert.alert('Social post logged', `Saved a ${vector} entry for ${targetEntity}.`);
    } catch (error) {
      Alert.alert('Unable to save log', error instanceof Error ? error.message : 'Try again.');
    }
  };

  return (
    <DrawerScreenShell
      title="Social Post Log"
      subtitle="Track daily social publishing momentum without the outreach overhead.">
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
              <Text style={[styles.goalTitle, { color: dashboardValueColor }]}>
                {goalLabel}
              </Text>
              <Text style={[styles.goalHint, { color: dashboard.body }]}>
                Goal: publish or log 3 social posts today.
              </Text>
            </View>
            {isDailyCountLoading ? <ActivityIndicator color={dashboardValueColor} /> : null}
          </View>

          <View style={[styles.progressTrack, { backgroundColor: dashboard.noteBackground }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: dashboardValueColor,
                  width: progressWidth,
                },
              ]}
            />
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
            <Text style={[styles.formTitle, { color: dashboardValueColor }]}>New social post log</Text>
            <Text style={[styles.formCopy, { color: dashboard.body }]}>
              Entries are saved with the current timestamp.
            </Text>
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
                Add Supabase environment variables before saving social post logs.
              </Text>
            </View>
          ) : null}

          <View style={styles.fieldStack}>
            <SelectField
              label="Target entity"
              options={targetEntityOptions}
              placeholder="Choose a platform"
              selectedValue={targetEntity}
              onValueChange={setTargetEntity}
              disabled={!isSupabaseConfigured}
              variant={themeName}
            />

            <SelectField
              label="Vector"
              options={vectorOptions}
              placeholder="Choose a vector"
              selectedValue={vector}
              onValueChange={setVector}
              disabled={!isSupabaseConfigured}
              variant={themeName}
            />

            <View style={styles.field}>
              <Text style={[styles.label, { color: workflow.text }]}>Details</Text>
              <TextInput
                multiline
                onChangeText={setDetails}
                placeholder="Paste the copy, note the topic, or capture what went live..."
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
                value={details}
              />
            </View>

            <Pressable
              disabled={!isSupabaseConfigured || isCreatingLog}
              onPress={handleCreateLog}
              style={({ pressed }) => [
                styles.primaryAction,
                {
                  backgroundColor: workflow.primaryBackground,
                  borderRadius: workflow.radius,
                },
                (!isSupabaseConfigured || isCreatingLog) && styles.disabledButton,
                pressed &&
                  isSupabaseConfigured &&
                  !isCreatingLog && { backgroundColor: workflow.primaryPressed },
              ]}>
              <Text style={[styles.primaryActionText, { color: workflow.primaryText }]}>
                {isCreatingLog ? 'Saving...' : 'Save social post log'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  progressTrack: {
    borderRadius: 999,
    height: 12,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  formCard: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    padding: 22,
  },
  formHeader: {
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
  input: {
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 150,
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
  disabledButton: {
    opacity: 0.58,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
