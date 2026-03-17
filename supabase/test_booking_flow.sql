-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — Booking Flow State Machine Testing
-- Simulate the full lifecycle: booking → assigned → en_route →
-- arrived → washing → completed → paid
--
-- HOW TO USE:
--   1. Run the SETUP section once to get your UUIDs
--   2. Copy your booking UUID into the variable at the top
--   3. Run each STEP one at a time to advance state
--   4. Refresh your app after each step to see the UI update
-- ═══════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════
-- STEP 0 — FIND YOUR UUIDs (run this first)
-- ══════════════════════════════════════════

-- Get your customer ID + latest booking
SELECT
  b.id          AS booking_id,
  b.status,
  b.wash_plan,
  b.washer_id,
  b.payment_status,
  b.service_address,
  b.created_at,
  p.full_name   AS customer_name,
  p.email
FROM public.bookings b
JOIN public.profiles p ON p.id = b.customer_id
ORDER BY b.created_at DESC
LIMIT 10;

-- Get available washers to assign
SELECT
  p.id          AS washer_id,
  p.full_name,
  p.email,
  wp.status,
  wp.is_online,
  wp.jobs_completed
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
WHERE wp.status = 'approved'
ORDER BY wp.jobs_completed DESC;


-- ══════════════════════════════════════════
-- STEP 1 — ASSIGN A WASHER
-- pending → assigned
-- ══════════════════════════════════════════

-- Replace both UUIDs below, then run
UPDATE public.bookings
SET
  status             = 'assigned',
  washer_id          = 'WASHER-UUID-HERE',
  washer_assigned_at = now(),
  updated_at         = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Verify
SELECT id, status, washer_id, washer_assigned_at FROM public.bookings WHERE id = 'BOOKING-UUID-HERE';


-- ══════════════════════════════════════════
-- STEP 2 — WASHER EN ROUTE
-- assigned → en_route
-- ══════════════════════════════════════════

UPDATE public.bookings
SET
  status              = 'en_route',
  washer_en_route_at  = now(),
  updated_at          = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Also move the washer's GPS to somewhere nearby (Toronto)
UPDATE public.washer_profiles
SET
  current_lat          = 43.6520,
  current_lng          = -79.3832,
  location_updated_at  = now(),
  is_online            = true
WHERE id = 'WASHER-UUID-HERE';

-- Verify
SELECT id, status, washer_en_route_at FROM public.bookings WHERE id = 'BOOKING-UUID-HERE';


-- ══════════════════════════════════════════
-- STEP 3 — WASHER ARRIVED
-- en_route → arrived
-- ══════════════════════════════════════════

UPDATE public.bookings
SET
  status             = 'arrived',
  washer_arrived_at  = now(),
  updated_at         = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Move GPS to exact service address coordinates
UPDATE public.washer_profiles
SET
  current_lat         = 43.6532,
  current_lng         = -79.3862,
  location_updated_at = now()
WHERE id = 'WASHER-UUID-HERE';

-- Verify
SELECT id, status, washer_arrived_at FROM public.bookings WHERE id = 'BOOKING-UUID-HERE';


-- ══════════════════════════════════════════
-- STEP 4 — WASHING STARTED
-- arrived → washing
-- ══════════════════════════════════════════

UPDATE public.bookings
SET
  status          = 'washing',
  wash_started_at = now(),
  updated_at      = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Verify
SELECT id, status, wash_started_at FROM public.bookings WHERE id = 'BOOKING-UUID-HERE';


-- ══════════════════════════════════════════
-- STEP 5 — WASH COMPLETED
-- washing → completed
-- ══════════════════════════════════════════

UPDATE public.bookings
SET
  status            = 'completed',
  wash_completed_at = now(),
  updated_at        = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Bump washer job count
UPDATE public.washer_profiles
SET jobs_completed = jobs_completed + 1
WHERE id = 'WASHER-UUID-HERE';

-- Verify
SELECT id, status, wash_completed_at FROM public.bookings WHERE id = 'BOOKING-UUID-HERE';


-- ══════════════════════════════════════════
-- STEP 6 — PAYMENT CAPTURED
-- completed → paid
-- ══════════════════════════════════════════

UPDATE public.bookings
SET
  status               = 'paid',
  payment_status       = 'captured',
  payment_captured_at  = now(),
  updated_at           = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Verify
SELECT id, status, payment_status, payment_captured_at FROM public.bookings WHERE id = 'BOOKING-UUID-HERE';


-- ══════════════════════════════════════════
-- EXTRAS — USEFUL ONE-OFFS
-- ══════════════════════════════════════════

-- Reset a booking back to pending (start over)
UPDATE public.bookings
SET
  status             = 'pending',
  washer_id          = NULL,
  payment_status     = 'pending',
  washer_assigned_at = NULL,
  washer_en_route_at = NULL,
  washer_arrived_at  = NULL,
  wash_started_at    = NULL,
  wash_completed_at  = NULL,
  payment_captured_at= NULL,
  updated_at         = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Cancel a booking
UPDATE public.bookings
SET
  status     = 'cancelled',
  updated_at = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Mark a booking disputed
UPDATE public.bookings
SET
  status     = 'disputed',
  updated_at = now()
WHERE id = 'BOOKING-UUID-HERE';

-- Toggle washer online/offline
UPDATE public.washer_profiles SET is_online = true  WHERE id = 'WASHER-UUID-HERE';
UPDATE public.washer_profiles SET is_online = false WHERE id = 'WASHER-UUID-HERE';

-- Move washer GPS to a custom location
UPDATE public.washer_profiles
SET
  current_lat         = 43.6500,   -- change these
  current_lng         = -79.3800,
  location_updated_at = now()
WHERE id = 'WASHER-UUID-HERE';

-- See full timeline of a booking (all timestamps)
SELECT
  id,
  status,
  payment_status,
  created_at,
  washer_assigned_at,
  washer_en_route_at,
  washer_arrived_at,
  wash_started_at,
  wash_completed_at,
  payment_captured_at
FROM public.bookings
WHERE id = 'BOOKING-UUID-HERE';

-- See all bookings for a customer with full timeline
SELECT
  b.id,
  b.status,
  b.wash_plan,
  b.final_price / 100.0 AS price,
  b.created_at,
  b.wash_completed_at,
  w.full_name AS washer
FROM public.bookings b
LEFT JOIN public.profiles w ON w.id = b.washer_id
WHERE b.customer_id = 'CUSTOMER-UUID-HERE'
ORDER BY b.created_at DESC;
