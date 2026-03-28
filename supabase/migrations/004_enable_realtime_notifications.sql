-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — Enable Realtime on notifications table
-- Required for washer job alert popups (30s accept/reject flow)
-- ═══════════════════════════════════════════════════════════════

-- Enable Realtime so JobAlertListener receives INSERT events
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Also enable Realtime on bookings for live status tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
