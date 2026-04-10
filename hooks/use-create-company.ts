import { useState } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { CreateCompanyInput, ReachCompany } from '@/types/reach';

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function useCreateCompany() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCompany = async (input: CreateCompanyInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const name = input.name.trim();

      if (!name) {
        throw new Error('Company name is required.');
      }

      const client = getSupabaseClient();
      const { data, error: queryError } = await client
        .from('reach_companies')
        .insert({
          name,
          location: toNullableString(input.location),
          phone: toNullableString(input.phone),
          website: toNullableString(input.website),
        })
        .select('id, name, location, phone, website')
        .single();

      if (queryError) {
        throw queryError;
      }

      return data as ReachCompany;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create company.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createCompany,
    isSubmitting,
    error,
  };
}
