'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { JobAlertPopup, type JobAlertData } from './JobAlertPopup';

const ALERT_TYPES = ['new_job_alert', 'job_request'] as const;

/**
 * Listens for new 'new_job_alert' and 'job_request' notifications via Supabase Realtime.
 * Shows a popup when a new job is available for the washer to claim/accept.
 * Rendered once in the washer layout — wraps no children.
 *
 * Uses both Realtime subscription AND interval polling as fallback
 * (in case Realtime is delayed or not yet enabled on the table).
 */
export function JobAlertListener() {
  const [currentAlert, setCurrentAlert] = useState<JobAlertData | null>(null);
  const [isAdminRequest, setIsAdminRequest] = useState(false);
  const [notificationId, setNotificationId] = useState<string | null>(null);
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

  // Poll for unread job alerts & job requests
  const checkPending = useCallback(async () => {
    if (!userId || currentAlert) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('notifications')
      .select('id, type, data')
      .eq('user_id', userId)
      .in('type', ALERT_TYPES as unknown as string[])
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0 && !processedIds.current.has(data[0].id)) {
      processedIds.current.add(data[0].id);
      const alertData = data[0].data as JobAlertData | null;
      if (alertData) {
        // Check if booking is still pending before showing popup
        const { data: booking } = await supabase
          .from('bookings')
          .select('status')
          .eq('id', alertData.booking_id)
          .single();

        if (booking?.status === 'pending') {
          setNotificationId(data[0].id);
          setIsAdminRequest(data[0].type === 'job_request');
          setCurrentAlert(alertData);
        } else {
          // Booking already taken — mark notification as read silently
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', data[0].id);
        }
      }
    }
  }, [userId, currentAlert]);

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
        async (payload) => {
          const row = payload.new as {
            id: string;
            type: string;
            data: JobAlertData | null;
          };

          // Only handle job alerts and job requests
          if (!ALERT_TYPES.includes(row.type as typeof ALERT_TYPES[number]) || !row.data) return;

          // Deduplicate
          if (processedIds.current.has(row.id)) return;
          processedIds.current.add(row.id);

          // Don't interrupt if already showing an alert
          if (!currentAlert) {
            // Verify booking is still pending before showing
            const supabaseCheck = createClient();
            const { data: booking } = await supabaseCheck
              .from('bookings')
              .select('status')
              .eq('id', row.data.booking_id)
              .single();

            if (booking?.status === 'pending') {
              setNotificationId(row.id);
              setIsAdminRequest(row.type === 'job_request');
              setCurrentAlert(row.data);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentAlert]);

  // Fallback polling every 5 seconds (catches missed Realtime events)
  useEffect(() => {
    if (!userId) return;

    // Initial check
    checkPending();

    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, [userId, checkPending]);

  const handleDismiss = useCallback(async () => {
    // For admin requests, mark notification as read on dismiss (decline)
    if (isAdminRequest && notificationId) {
      const supabase = createClient();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    }
    setCurrentAlert(null);
    setNotificationId(null);
    setIsAdminRequest(false);
  }, [isAdminRequest, notificationId]);

  if (!currentAlert) return null;

  return (
    <JobAlertPopup
      alert={currentAlert}
      onDismiss={handleDismiss}
      isAdminRequest={isAdminRequest}
    />
  );
}
