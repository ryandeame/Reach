import { useCallback, useEffect, useState } from 'react';

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { ReachCompany } from '@/types/reach';

export function useCompanies() {
  const [companies, setCompanies] = useState<ReachCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCompanies([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = getSupabaseClient();
      const { data, error: queryError } = await client
        .from('reach_companies')
        .select('id, name, location, phone, website')
        .order('name', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      setCompanies((data ?? []) as ReachCompany[]);
    } catch (error) {
      setCompanies([]);
      setError(error instanceof Error ? error.message : 'Unable to load companies.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    companies,
    isLoading,
    error,
    refresh,
  };
}
