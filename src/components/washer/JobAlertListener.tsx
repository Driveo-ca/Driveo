'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { JobAlertPopup, type JobAlertData } from './JobAlertPopup';

/**
 * Listens for new 'new_job_alert' notifications via Supabase Realtime.
 * Shows a popup when a new job is available for the washer to claim.
 * Rendered once in the washer layout — wraps no children.
 */
export function JobAlertListener() {
  const [currentAlert, setCurrentAlert] = useState<JobAlertData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const processedIds = useRef<Set<string>>(new Set());

  // Get current user on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === 'washer') {
        setUserId(user.id);
      }
    });
  }, []);

  // Subscribe to realtime inserts on notifications table
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel('washer-job-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            type: string;
            data: JobAlertData | null;
          };

          // Only handle new job alerts
          if (row.type !== 'new_job_alert' || !row.data) return;

          // Deduplicate
          if (processedIds.current.has(row.id)) return;
          processedIds.current.add(row.id);

          // Don't interrupt if already showing an alert
          if (!currentAlert) {
            setCurrentAlert(row.data);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentAlert]);

  // Also poll for unprocessed alerts on mount (catch any missed while offline)
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    async function checkPending() {
      const { data } = await supabase
        .from('notifications')
        .select('id, data')
        .eq('user_id', userId!)
        .eq('type', 'new_job_alert')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && !processedIds.current.has(data[0].id)) {
        processedIds.current.add(data[0].id);
        const alertData = data[0].data as JobAlertData | null;
        if (alertData && !currentAlert) {
          setCurrentAlert(alertData);
        }
      }
    }

    checkPending();
  }, [userId, currentAlert]);

  if (!currentAlert) return null;

  return (
    <JobAlertPopup
      alert={currentAlert}
      onDismiss={() => setCurrentAlert(null)}
    />
  );
}
