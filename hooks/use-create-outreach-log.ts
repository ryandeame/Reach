import { useState } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { CreateOutreachLogInput, ReachOutreachLog } from '@/types/reach';

export function useCreateOutreachLog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOutreachLog = async (input: CreateOutreachLogInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const commType = input.commType.trim();

      if (!input.personId) {
        throw new Error('Select a person before saving a log.');
      }

      if (!commType) {
        throw new Error('Communication type is required.');
      }

      const client = getSupabaseClient();
      const payload: {
        person_id: string;
        comm_type: string;
        timestamp?: string;
      } = {
        person_id: input.personId,
        comm_type: commType,
      };

      if (input.timestamp) {
        payload.timestamp = input.timestamp;
      }

      const { data, error: queryError } = await client
        .from('reach_outreach_log')
        .insert(payload)
        .select('id, person_id, comm_type, timestamp')
        .single();

      if (queryError) {
        throw queryError;
      }

      return data as ReachOutreachLog;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create outreach log.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createOutreachLog,
    isSubmitting,
    error,
  };
}
