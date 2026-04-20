import { useState } from 'react';

import { getSupabaseClient } from '@/lib/supabase';
import type { CreatePersonInput, ReachPerson } from '@/types/reach';

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function useCreatePerson() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPerson = async (input: CreatePersonInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const fullName = input.fullName.trim();

      if (!fullName) {
        throw new Error('Full name is required.');
      }

      const client = getSupabaseClient();
      const { data, error: queryError } = await client
        .from('reach_people')
        .insert({
          full_name: fullName,
          title: toNullableString(input.title),
          location: toNullableString(input.location),
          email: toNullableString(input.email),
          phone: toNullableString(input.phone),
          linkedin: toNullableString(input.linkedin),
          company_id: input.companyId || null,
        })
        .select('id, full_name, title, location, email, phone, linkedin, company_id')
        .single();

      if (queryError) {
        throw queryError;
      }

      return data as ReachPerson;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create person.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createPerson,
    isSubmitting,
    error,
  };
}
