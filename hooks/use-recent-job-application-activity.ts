import { useCallback, useEffect, useMemo, useState } from 'react';

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export type RecentJobApplicationActivityPoint = {
  date: Date;
  key: string;
  label: string;
  shortLabel: string;
  value: number;
};

type RecentJobApplicationActivityRpcRow = {
  activity_date: string;
  application_count: number | null;
};

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getStartOfLocalDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildRecentDays() {
  const today = getStartOfLocalDay(new Date());

  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (9 - index));

    return {
      date,
      key: getLocalDateKey(date),
      label: new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
      }).format(date),
      shortLabel: new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
      }).format(date),
      value: 0,
    };
  });
}

function getClientTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function useRecentJobApplicationActivity() {
  const [activity, setActivity] = useState<RecentJobApplicationActivityPoint[]>(() =>
    buildRecentDays()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const days = buildRecentDays();

    if (!isSupabaseConfigured) {
      setActivity(days);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = getSupabaseClient();
      const { data, error: queryError } = await client.rpc(
        'get_recent_daily_job_application_activity',
        {
          day_count: days.length,
          start_on: days[0].key,
          timezone_name: getClientTimezone(),
        }
      );

      if (queryError) {
        throw queryError;
      }

      const countsByDay = new Map(
        ((data ?? []) as RecentJobApplicationActivityRpcRow[]).map((row) => [
          row.activity_date,
          row.application_count ?? 0,
        ])
      );

      setActivity(
        days.map((day) => ({
          ...day,
          value: countsByDay.get(day.key) ?? 0,
        }))
      );
    } catch (error) {
      setActivity(days);
      setError(error instanceof Error ? error.message : 'Unable to load application activity.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    const total = activity.reduce((sum, day) => sum + day.value, 0);
    const peak = Math.max(0, ...activity.map((day) => day.value));
    const average = total / activity.length;

    return {
      average,
      peak,
      total,
    };
  }, [activity]);

  return {
    activity,
    error,
    isLoading,
    refresh,
    stats,
  };
}
