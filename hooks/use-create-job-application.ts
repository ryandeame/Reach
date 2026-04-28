import { useState } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { CreateJobApplicationInput, ReachJobApplication } from '@/types/reach';

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function useCreateJobApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJobApplication = async (input: CreateJobApplicationInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const title = input.title.trim();

      if (!input.companyId) {
        throw new Error('Choose a company before saving an application.');
      }

      if (!title) {
        throw new Error('Job title is required.');
      }

      const client = getSupabaseClient();
      const payload: {
        company_id: string;
        title: string;
        location: string | null;
        submitted_resume: string | null;
        job_post_url: string | null;
        notes: string | null;
        timestamp?: string;
      } = {
        company_id: input.companyId,
        title,
        location: toNullableString(input.location),
        submitted_resume: toNullableString(input.submittedResume),
        job_post_url: toNullableString(input.jobPostUrl),
        notes: toNullableString(input.notes),
      };

      if (input.timestamp) {
        payload.timestamp = input.timestamp;
      }

      const { data, error: queryError } = await client
        .from('reach_job_application_log')
        .insert(payload)
        .select('id, company_id, title, location, submitted_resume, job_post_url, notes, timestamp')
        .single();

      if (queryError) {
        throw queryError;
      }

      return data as ReachJobApplication;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create job application.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createJobApplication,
    isSubmitting,
    error,
  };
}
