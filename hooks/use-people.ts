import { useCallback, useEffect, useState } from 'react';

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { ReachPerson } from '@/types/reach';

export function usePeople() {
  const [people, setPeople] = useState<ReachPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setPeople([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = getSupabaseClient();
      const { data, error: queryError } = await client
        .from('reach_people')
        .select(
          `
            id,
            full_name,
            title,
            location,
            email,
            phone,
            linkedin,
            company_id,
            reach_companies (
              id,
              name
            )
          `
        )
        .order('full_name', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setPeople((data ?? []) as unknown as ReachPerson[]);
    } catch (error) {
      setPeople([]);
      setError(error instanceof Error ? error.message : 'Unable to load people.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    people,
    isLoading,
    error,
    refresh,
  };
}
