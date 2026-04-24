import { useCallback, useEffect, useState } from 'react';

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

function getLocalDayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  };
}

export function useDailySocialPostCount(date: Date) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCount(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = getSupabaseClient();
      const { startAt, endAt } = getLocalDayBounds(date);
      const { data, error: queryError } = await client.rpc(
        'get_daily_social_post_count',
        {
          start_at: startAt,
          end_at: endAt,
        }
      );

      if (queryError) {
        throw queryError;
      }

      setCount(typeof data === 'number' ? data : 0);
    } catch (error) {
      setCount(0);
      setError(error instanceof Error ? error.message : 'Unable to load daily social posts.');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    count,
    isLoading,
    error,
    refresh,
  };
}
