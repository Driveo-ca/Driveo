-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — Create booking-photos storage bucket + RLS policies
-- Required for washer before/after photo uploads
-- ═══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('booking-photos', 'booking-photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

-- Washers can upload photos to their bookings
CREATE POLICY "Washers can upload booking photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'booking-photos'
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id::text = (string_to_array(name, '/'))[1]
    AND bookings.washer_id = auth.uid()
  )
);

-- Washers + customers can read photos from their bookings
CREATE POLICY "Washers can read booking photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'booking-photos'
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id::text = (string_to_array(name, '/'))[1]
    AND (bookings.washer_id = auth.uid() OR bookings.customer_id = auth.uid())
  )
);

-- Washers can delete their uploaded photos
CREATE POLICY "Washers can delete booking photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'booking-photos'
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id::text = (string_to_array(name, '/'))[1]
    AND bookings.washer_id = auth.uid()
  )
);
