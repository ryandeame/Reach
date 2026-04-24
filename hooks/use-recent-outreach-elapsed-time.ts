import { useCallback, useEffect, useMemo, useState } from 'react';

import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export type RecentOutreachElapsedTimePoint = {
  date: Date;
  key: string;
  label: string;
  shortLabel: string;
  value: number;
};

type RecentOutreachElapsedTimeRpcRow = {
  activity_date: string;
  elapsed_hours: number | string | null;
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

function normalizeElapsedHours(value: number | string | null) {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);

  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

export function useRecentOutreachElapsedTime() {
  const [elapsedTime, setElapsedTime] = useState<RecentOutreachElapsedTimePoint[]>(() =>
    buildRecentDays()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const days = buildRecentDays();

    if (!isSupabaseConfigured) {
      setElapsedTime(days);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = getSupabaseClient();
      const { data, error: queryError } = await client.rpc(
        'get_recent_daily_outreach_elapsed_hours',
        {
          day_count: days.length,
          start_on: days[0].key,
          timezone_name: getClientTimezone(),
        }
      );

      if (queryError) {
        throw queryError;
      }

      const elapsedHoursByDay = new Map(
        ((data ?? []) as RecentOutreachElapsedTimeRpcRow[]).map((row) => [
          row.activity_date,
          normalizeElapsedHours(row.elapsed_hours),
        ])
      );

      setElapsedTime(
        days.map((day) => ({
          ...day,
          value: elapsedHoursByDay.get(day.key) ?? 0,
        }))
      );
    } catch (error) {
      setElapsedTime(days);
      setError(error instanceof Error ? error.message : 'Unable to load outreach elapsed time.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats = useMemo(() => {
    const total = elapsedTime.reduce((sum, day) => sum + day.value, 0);
    const peak = Math.max(0, ...elapsedTime.map((day) => day.value));
    const average = total / elapsedTime.length;

    return {
      average,
      peak,
      total,
    };
  }, [elapsedTime]);

  return {
    elapsedTime,
    error,
    isLoading,
    refresh,
    stats,
  };
}
