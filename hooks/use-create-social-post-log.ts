import { useState } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { CreateSocialPostLogInput, ReachSocialPostLog } from '@/types/reach';

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function useCreateSocialPostLog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSocialPostLog = async (input: CreateSocialPostLogInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const targetEntity = input.targetEntity.trim();
      const vector = input.vector.trim();
      const details = input.details.trim();

      if (!targetEntity) {
        throw new Error('Target entity is required.');
      }

      if (!vector) {
        throw new Error('Vector is required.');
      }

      if (!details) {
        throw new Error('Details are required.');
      }

      const client = getSupabaseClient();
      const payload: {
        target_entity: string;
        vector: string;
        details: string | null;
        timestamp?: string;
      } = {
        target_entity: targetEntity,
        vector,
        details: toNullableString(details),
      };

      if (input.timestamp) {
        payload.timestamp = input.timestamp;
      }

      const { data, error: queryError } = await client
        .from('reach_social_post_log')
        .insert(payload)
        .select('id, target_entity, vector, details, timestamp')
        .single();

      if (queryError) {
        throw queryError;
      }

      return data as ReachSocialPostLog;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create social post log.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createSocialPostLog,
    isSubmitting,
    error,
  };
}
