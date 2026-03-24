-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — Booking Messages (in-app chat between customer & washer)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.booking_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL REFERENCES public.profiles(id),
  content     text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 1000),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_booking_messages_booking_id ON public.booking_messages(booking_id);
CREATE INDEX idx_booking_messages_created_at  ON public.booking_messages(booking_id, created_at);

ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;

-- Only the customer or assigned washer on the booking can read messages
CREATE POLICY "Booking participants can read messages"
  ON public.booking_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (b.customer_id = auth.uid() OR b.washer_id = auth.uid())
    )
  );

-- Only participants can send messages
CREATE POLICY "Booking participants can send messages"
  ON public.booking_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (b.customer_id = auth.uid() OR b.washer_id = auth.uid())
    )
  );

-- Enable Realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_messages;
