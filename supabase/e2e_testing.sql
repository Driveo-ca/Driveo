-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — End-to-End Testing SQL Queries
-- Comprehensive test suite covering ALL platform flows
--
-- HOW TO USE:
--   1. Run sections in order (they build on each other)
--   2. Copy UUIDs from output into subsequent queries
--   3. Each section can also be run independently for targeted testing
--   4. CLEANUP section at bottom to reset everything
-- ═══════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════════════════════════
-- 1. CUSTOMER REGISTRATION & PROFILE FLOW
-- ══════════════════════════════════════════════════════════════

-- 1A. Verify profile was auto-created after sign-up (Google OAuth or email)
SELECT
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' AS meta_name,
  u.raw_app_meta_data->>'provider' AS provider,
  u.created_at AS auth_created,
  p.full_name,
  p.role,
  p.phone,
  p.avatar_url,
  p.created_at AS profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC
LIMIT 5;

-- 1B. Check for orphaned auth users (no profile = broken trigger)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 1C. Verify customer_profile was also created
SELECT
  p.id, p.full_name, p.email, p.role,
  cp.referral_code,
  cp.stripe_customer_id,
  cp.default_address,
  cp.default_lat, cp.default_lng
FROM public.profiles p
LEFT JOIN public.customer_profiles cp ON cp.id = p.id
WHERE p.role = 'customer'
ORDER BY p.created_at DESC
LIMIT 5;

-- 1D. Update a customer profile (simulate profile edit)
-- Replace CUSTOMER-UUID with actual UUID
/*
UPDATE public.profiles
SET
  full_name = 'Test Customer Updated',
  phone = '+16475551234',
  updated_at = now()
WHERE id = 'CUSTOMER-UUID';

UPDATE public.customer_profiles
SET
  default_address = '123 King St W, Toronto, ON M5V 1J2',
  default_lat = 43.6472116,
  default_lng = -79.3832747,
  default_postal = 'M5V'
WHERE id = 'CUSTOMER-UUID';
*/

-- 1E. Verify referral code uniqueness
SELECT referral_code, COUNT(*) AS duplicates
FROM public.customer_profiles
WHERE referral_code IS NOT NULL
GROUP BY referral_code
HAVING COUNT(*) > 1;


-- ══════════════════════════════════════════════════════════════
-- 2. VEHICLE CRUD FLOW
-- ══════════════════════════════════════════════════════════════

-- 2A. List all vehicles for a customer
-- Replace CUSTOMER-UUID
/*
SELECT * FROM public.vehicles
WHERE customer_id = 'CUSTOMER-UUID'
ORDER BY is_primary DESC, created_at DESC;
*/

-- 2B. Add a vehicle
-- Replace CUSTOMER-UUID
/*
INSERT INTO public.vehicles (customer_id, make, model, year, color, plate, type, is_primary, nickname)
VALUES (
  'CUSTOMER-UUID',
  'Toyota', 'Camry', 2024, 'Silver', 'ABCD 123', 'sedan',
  true, 'Daily Driver'
)
RETURNING *;
*/

-- 2C. Add a second vehicle (SUV with higher multiplier)
/*
INSERT INTO public.vehicles (customer_id, make, model, year, color, plate, type, is_primary, nickname)
VALUES (
  'CUSTOMER-UUID',
  'BMW', 'X5', 2025, 'Black', 'LUXE 999', 'suv',
  false, 'Weekend Ride'
)
RETURNING *;
*/

-- 2D. Set a vehicle as primary (unset others first)
/*
UPDATE public.vehicles SET is_primary = false WHERE customer_id = 'CUSTOMER-UUID';
UPDATE public.vehicles SET is_primary = true WHERE id = 'VEHICLE-UUID';
*/

-- 2E. Update vehicle details
/*
UPDATE public.vehicles
SET color = 'Midnight Blue', plate = 'NEW 456'
WHERE id = 'VEHICLE-UUID'
RETURNING *;
*/

-- 2F. Delete a vehicle
/*
DELETE FROM public.vehicles WHERE id = 'VEHICLE-UUID' RETURNING *;
*/

-- 2G. Verify vehicle type constraint (should fail for invalid types)
-- This should error: CHECK constraint violation
/*
INSERT INTO public.vehicles (customer_id, make, model, year, type)
VALUES ('CUSTOMER-UUID', 'Tesla', 'Semi', 2025, 'truck');
*/

-- 2H. Validate all vehicle types in use
SELECT type, COUNT(*) FROM public.vehicles GROUP BY type ORDER BY count DESC;


-- ══════════════════════════════════════════════════════════════
-- 3. WASHER ONBOARDING & APPROVAL FLOW
-- ══════════════════════════════════════════════════════════════

-- 3A. See all washers and their onboarding status
SELECT
  p.id, p.full_name, p.email, p.phone,
  wp.status,
  wp.bio,
  wp.service_zones,
  wp.vehicle_make, wp.vehicle_model, wp.vehicle_year, wp.vehicle_plate,
  wp.tools_owned,
  wp.insurance_verified,
  wp.background_check_done,
  wp.stripe_account_id,
  wp.is_online,
  wp.rating_avg,
  wp.jobs_completed,
  wp.created_at
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
ORDER BY wp.created_at DESC;

-- 3B. Simulate washer application (update profile details)
/*
UPDATE public.washer_profiles
SET
  bio = 'Professional car detailer with 5 years experience',
  service_zones = ARRAY['L4Z', 'L5B', 'M9C'],
  vehicle_make = 'Honda',
  vehicle_model = 'Civic',
  vehicle_year = 2022,
  vehicle_plate = 'WASH 001',
  tools_owned = ARRAY['pressure_washer', 'vacuum', 'microfiber_towels', 'foam_cannon']
WHERE id = 'WASHER-UUID';
*/

-- 3C. Admin: Verify insurance
/*
UPDATE public.washer_profiles
SET insurance_verified = true
WHERE id = 'WASHER-UUID';
*/

-- 3D. Admin: Mark background check done
/*
UPDATE public.washer_profiles
SET background_check_done = true
WHERE id = 'WASHER-UUID';
*/

-- 3E. Admin: Approve washer (pending → approved)
/*
UPDATE public.washer_profiles
SET status = 'approved'
WHERE id = 'WASHER-UUID';
*/

-- 3F. Admin: Suspend washer
/*
UPDATE public.washer_profiles
SET status = 'suspended', is_online = false
WHERE id = 'WASHER-UUID';
*/

-- 3G. Admin: Reject washer
/*
UPDATE public.washer_profiles
SET status = 'rejected'
WHERE id = 'WASHER-UUID';
*/

-- 3H. Washer: Set Stripe Connect account
/*
UPDATE public.washer_profiles
SET stripe_account_id = 'acct_test_1234567890'
WHERE id = 'WASHER-UUID';
*/

-- 3I. Washer: Go online with GPS
/*
UPDATE public.washer_profiles
SET
  is_online = true,
  current_lat = 43.6532,
  current_lng = -79.3832,
  location_updated_at = now()
WHERE id = 'WASHER-UUID';
*/

-- 3J. Washer: Go offline
/*
UPDATE public.washer_profiles
SET is_online = false
WHERE id = 'WASHER-UUID';
*/

-- 3K. Washer status distribution
SELECT status, COUNT(*) FROM public.washer_profiles GROUP BY status;


-- ══════════════════════════════════════════════════════════════
-- 4. WASHER AVAILABILITY & SCHEDULING
-- ══════════════════════════════════════════════════════════════

-- 4A. Set weekly availability (Mon-Fri 9am-5pm)
/*
INSERT INTO public.washer_availability (washer_id, day_of_week, start_time, end_time, is_available)
VALUES
  ('WASHER-UUID', 1, '09:00', '17:00', true),  -- Monday
  ('WASHER-UUID', 2, '09:00', '17:00', true),  -- Tuesday
  ('WASHER-UUID', 3, '09:00', '17:00', true),  -- Wednesday
  ('WASHER-UUID', 4, '09:00', '17:00', true),  -- Thursday
  ('WASHER-UUID', 5, '09:00', '17:00', true);  -- Friday
*/

-- 4B. View washer availability schedule
/*
SELECT
  CASE day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END AS day,
  start_time, end_time, is_available
FROM public.washer_availability
WHERE washer_id = 'WASHER-UUID'
ORDER BY day_of_week;
*/

-- 4C. Block a time range (vacation, personal time)
/*
INSERT INTO public.washer_blocks (washer_id, blocked_from, blocked_to, reason)
VALUES (
  'WASHER-UUID',
  '2026-03-20 00:00:00+00',
  '2026-03-22 23:59:59+00',
  'Personal day off'
)
RETURNING *;
*/

-- 4D. View all blocks for a washer
/*
SELECT * FROM public.washer_blocks
WHERE washer_id = 'WASHER-UUID'
ORDER BY blocked_from DESC;
*/

-- 4E. Find available washers for a given time (e.g. Monday 10am)
SELECT
  p.full_name,
  wp.is_online,
  wp.current_lat, wp.current_lng,
  wa.start_time, wa.end_time
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
JOIN public.washer_availability wa ON wa.washer_id = wp.id
WHERE wp.status = 'approved'
  AND wa.day_of_week = EXTRACT(DOW FROM now())::int
  AND wa.is_available = true
  AND wa.start_time <= now()::time
  AND wa.end_time >= now()::time
  AND NOT EXISTS (
    SELECT 1 FROM public.washer_blocks wb
    WHERE wb.washer_id = wp.id
      AND now() BETWEEN wb.blocked_from AND wb.blocked_to
  );


-- ══════════════════════════════════════════════════════════════
-- 5. BOOKING CREATION WITH PRICING MATH
-- ══════════════════════════════════════════════════════════════

-- 5A. Create an instant booking — Regular wash, Sedan, Dirt=3 (base price)
-- Price: $18.00 × 1.00 × 1.00 = $18.00 → +13% HST = $20.34
/*
INSERT INTO public.bookings (
  customer_id, vehicle_id, wash_plan, dirt_level,
  status, service_address, service_lat, service_lng,
  is_instant, scheduled_at,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price, hst_amount, total_price, washer_payout,
  payment_status
) VALUES (
  'CUSTOMER-UUID',
  'VEHICLE-UUID',
  'regular', 3,
  'pending',
  '123 King St W, Toronto, ON M5V 1J2',
  43.6472116, -79.3832747,
  true, NULL,
  1800, 1.00, 1.00,      -- base=$18, sedan=1x, dirt3=1x
  1800,                    -- final = 1800 × 1.00 × 1.00
  234,                     -- HST = 1800 × 0.13
  2034,                    -- total = 1800 + 234
  1100,                    -- washer payout = $11 flat
  'pending'
)
RETURNING id, status, final_price, hst_amount, total_price;
*/

-- 5B. Create booking — I&E wash, SUV, Dirt=7 (dirty surcharge)
-- Price: $25.00 × 1.25 × 1.30 = $40.63 → +13% HST = $45.91
/*
INSERT INTO public.bookings (
  customer_id, vehicle_id, wash_plan, dirt_level,
  status, service_address, service_lat, service_lng,
  is_instant, scheduled_at,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price, hst_amount, total_price, washer_payout,
  payment_status
) VALUES (
  'CUSTOMER-UUID',
  'VEHICLE-UUID',
  'interior_exterior', 7,
  'pending',
  '100 City Centre Dr, Mississauga, ON L5B 2C9',
  43.5890, -79.6441,
  true, NULL,
  2500, 1.25, 1.30,       -- base=$25, SUV=1.25x, dirt7=1.30x
  4063,                     -- final = 2500 × 1.25 × 1.30 = 4062.5 → 4063
  528,                      -- HST = 4063 × 0.13 = 528.19 → 528
  4591,                     -- total = 4063 + 528
  1100,                     -- washer payout = $11 flat
  'pending'
)
RETURNING id, status, final_price, hst_amount, total_price;
*/

-- 5C. Create booking — Detailing, Pickup, Dirt=10 (max surcharge)
-- Price: $189.00 × 1.20 × 2.00 = $453.60 → +13% HST = $512.57
/*
INSERT INTO public.bookings (
  customer_id, vehicle_id, wash_plan, dirt_level,
  status, service_address, service_lat, service_lng,
  is_instant, scheduled_at, estimated_duration_min,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price, hst_amount, total_price, washer_payout,
  payment_status, customer_notes
) VALUES (
  'CUSTOMER-UUID',
  'VEHICLE-UUID',
  'detailing', 10,
  'pending',
  '3300 Hwy 7, Vaughan, ON L4K 4M3',
  43.8361, -79.5181,
  false, '2026-03-20 10:00:00+00', 180,
  18900, 1.20, 2.00,        -- base=$189, pickup=1.20x, dirt10=2.0x
  45360,                      -- final = 18900 × 1.20 × 2.00 = 45360
  5897,                       -- HST = 45360 × 0.13 = 5896.8 → 5897
  51257,                      -- total = 45360 + 5897
  2200,                       -- washer payout = $22 flat for detailing
  'pending',
  'Deep mud on wheel wells, dog hair in back seat'
)
RETURNING id, status, final_price, hst_amount, total_price, washer_payout;
*/

-- 5D. Verify pricing math on existing bookings
SELECT
  id,
  wash_plan,
  dirt_level,
  base_price,
  vehicle_multiplier,
  dirt_multiplier,
  final_price,
  ROUND(base_price * vehicle_multiplier * dirt_multiplier)::int AS expected_final,
  final_price = ROUND(base_price * vehicle_multiplier * dirt_multiplier)::int AS final_correct,
  hst_amount,
  ROUND(final_price * 0.13)::int AS expected_hst,
  ABS(hst_amount - ROUND(final_price * 0.13)::int) <= 1 AS hst_correct,
  total_price,
  (final_price + hst_amount) AS expected_total,
  total_price = (final_price + hst_amount) AS total_correct
FROM public.bookings
ORDER BY created_at DESC
LIMIT 10;

-- 5E. Verify washer payout rules
SELECT
  id,
  wash_plan,
  washer_payout,
  CASE
    WHEN wash_plan IN ('regular', 'interior_exterior') AND washer_payout = 1100 THEN 'CORRECT ($11)'
    WHEN wash_plan = 'detailing' AND washer_payout = 2200 THEN 'CORRECT ($22)'
    ELSE 'WRONG — expected ' ||
      CASE WHEN wash_plan = 'detailing' THEN '$22' ELSE '$11' END
  END AS payout_check
FROM public.bookings
ORDER BY created_at DESC
LIMIT 10;


-- ══════════════════════════════════════════════════════════════
-- 6. FULL BOOKING LIFECYCLE STATE MACHINE
-- ══════════════════════════════════════════════════════════════

-- Replace BOOKING-UUID and WASHER-UUID throughout this section

-- 6A. STEP 1 — Assign washer (pending → assigned)
/*
UPDATE public.bookings
SET
  status = 'assigned',
  washer_id = 'WASHER-UUID',
  washer_assigned_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status = 'pending';
*/

-- 6B. STEP 2 — Washer en route (assigned → en_route)
/*
UPDATE public.bookings
SET
  status = 'en_route',
  washer_en_route_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status = 'assigned';

-- Update washer GPS (moving toward customer)
UPDATE public.washer_profiles
SET
  current_lat = 43.6520,
  current_lng = -79.3832,
  location_updated_at = now(),
  is_online = true
WHERE id = 'WASHER-UUID';
*/

-- 6C. STEP 3 — Washer arrived (en_route → arrived)
/*
UPDATE public.bookings
SET
  status = 'arrived',
  washer_arrived_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status = 'en_route';

-- Washer GPS at service location
UPDATE public.washer_profiles
SET
  current_lat = 43.6472,
  current_lng = -79.3833,
  location_updated_at = now()
WHERE id = 'WASHER-UUID';
*/

-- 6D. STEP 4 — Start washing (arrived → washing)
/*
UPDATE public.bookings
SET
  status = 'washing',
  wash_started_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status = 'arrived';
*/

-- 6E. STEP 5 — Complete wash (washing → completed)
/*
UPDATE public.bookings
SET
  status = 'completed',
  wash_completed_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status = 'washing';

-- Bump washer stats
UPDATE public.washer_profiles
SET jobs_completed = jobs_completed + 1
WHERE id = 'WASHER-UUID';
*/

-- 6F. STEP 6 — Capture payment (completed → paid)
/*
UPDATE public.bookings
SET
  status = 'paid',
  payment_status = 'captured',
  payment_captured_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status = 'completed';
*/

-- 6G. Verify full booking timeline
/*
SELECT
  id, status, payment_status,
  created_at,
  washer_assigned_at,
  washer_en_route_at,
  washer_arrived_at,
  wash_started_at,
  wash_completed_at,
  payment_captured_at,
  -- Duration calculations
  EXTRACT(EPOCH FROM washer_assigned_at - created_at) / 60 AS mins_to_assign,
  EXTRACT(EPOCH FROM washer_arrived_at - washer_en_route_at) / 60 AS mins_en_route,
  EXTRACT(EPOCH FROM wash_completed_at - wash_started_at) / 60 AS mins_washing
FROM public.bookings
WHERE id = 'BOOKING-UUID';
*/


-- ══════════════════════════════════════════════════════════════
-- 7. PAYMENT STATUS TRANSITIONS
-- ══════════════════════════════════════════════════════════════

-- 7A. Pre-authorize payment (happens at booking creation)
/*
UPDATE public.bookings
SET
  payment_status = 'authorized',
  stripe_payment_intent_id = 'pi_test_' || gen_random_uuid()::text,
  updated_at = now()
WHERE id = 'BOOKING-UUID';
*/

-- 7B. Capture payment (after wash complete)
/*
UPDATE public.bookings
SET
  payment_status = 'captured',
  payment_captured_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID';
*/

-- 7C. Refund a payment
/*
UPDATE public.bookings
SET
  payment_status = 'refunded',
  updated_at = now()
WHERE id = 'BOOKING-UUID';
*/

-- 7D. Mark payment failed
/*
UPDATE public.bookings
SET
  payment_status = 'failed',
  updated_at = now()
WHERE id = 'BOOKING-UUID';
*/

-- 7E. Payment status overview
SELECT
  payment_status,
  COUNT(*) AS count,
  SUM(total_price) / 100.0 AS total_dollars
FROM public.bookings
GROUP BY payment_status
ORDER BY count DESC;


-- ══════════════════════════════════════════════════════════════
-- 8. BEFORE/AFTER PHOTOS FLOW
-- ══════════════════════════════════════════════════════════════

-- 8A. Upload before photos (5 angles)
/*
INSERT INTO public.booking_photos (booking_id, washer_id, photo_type, storage_path, angle_label)
VALUES
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/front.jpg', 'front'),
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/rear.jpg', 'rear'),
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/driver.jpg', 'driver_side'),
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/passenger.jpg', 'passenger_side'),
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/interior.jpg', 'interior');
*/

-- 8B. Upload after photos
/*
INSERT INTO public.booking_photos (booking_id, washer_id, photo_type, storage_path, angle_label)
VALUES
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/front.jpg', 'front'),
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/rear.jpg', 'rear'),
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/driver.jpg', 'driver_side'),
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/passenger.jpg', 'passenger_side'),
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/interior.jpg', 'interior');
*/

-- 8C. Verify photos for a booking
/*
SELECT
  photo_type,
  angle_label,
  storage_path,
  created_at
FROM public.booking_photos
WHERE booking_id = 'BOOKING-UUID'
ORDER BY photo_type, angle_label;
*/

-- 8D. Check bookings missing photos (completed but no photos = problem)
SELECT
  b.id, b.status, b.wash_completed_at,
  COUNT(bp.id) FILTER (WHERE bp.photo_type = 'before') AS before_count,
  COUNT(bp.id) FILTER (WHERE bp.photo_type = 'after') AS after_count
FROM public.bookings b
LEFT JOIN public.booking_photos bp ON bp.booking_id = b.id
WHERE b.status IN ('completed', 'paid')
GROUP BY b.id
HAVING COUNT(bp.id) FILTER (WHERE bp.photo_type = 'before') = 0
    OR COUNT(bp.id) FILTER (WHERE bp.photo_type = 'after') = 0;


-- ══════════════════════════════════════════════════════════════
-- 9. REVIEW & RATING FLOW
-- ══════════════════════════════════════════════════════════════

-- 9A. Customer leaves a review (only for completed/paid bookings)
/*
INSERT INTO public.reviews (booking_id, customer_id, washer_id, rating, comment)
VALUES (
  'BOOKING-UUID',
  'CUSTOMER-UUID',
  'WASHER-UUID',
  5,
  'Incredible job! My SUV looks brand new. Will definitely book again.'
)
RETURNING *;
*/

-- 9B. Update washer's average rating (run after inserting review)
/*
UPDATE public.washer_profiles
SET rating_avg = (
  SELECT ROUND(AVG(rating)::numeric, 2)
  FROM public.reviews
  WHERE washer_id = 'WASHER-UUID'
)
WHERE id = 'WASHER-UUID';
*/

-- 9C. Verify review-to-booking uniqueness (one review per booking)
SELECT booking_id, COUNT(*) AS review_count
FROM public.reviews
GROUP BY booking_id
HAVING COUNT(*) > 1;

-- 9D. All reviews with booking details
SELECT
  r.id,
  r.rating,
  r.comment,
  r.created_at,
  cust.full_name AS customer,
  wash.full_name AS washer,
  b.wash_plan,
  b.status AS booking_status
FROM public.reviews r
JOIN public.profiles cust ON cust.id = r.customer_id
JOIN public.profiles wash ON wash.id = r.washer_id
JOIN public.bookings b ON b.id = r.booking_id
ORDER BY r.created_at DESC;

-- 9E. Washer leaderboard
SELECT
  p.full_name,
  wp.rating_avg,
  wp.jobs_completed,
  COUNT(r.id) AS total_reviews,
  ROUND(AVG(r.rating)::numeric, 2) AS calc_avg_rating
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
LEFT JOIN public.reviews r ON r.washer_id = wp.id
GROUP BY p.id, p.full_name, wp.rating_avg, wp.jobs_completed
ORDER BY wp.rating_avg DESC NULLS LAST;


-- ══════════════════════════════════════════════════════════════
-- 10. SUBSCRIPTION LIFECYCLE
-- ══════════════════════════════════════════════════════════════

-- 10A. View available plans
SELECT
  id, name, slug, wash_plan,
  monthly_price / 100.0 AS price_dollars,
  washes_per_month,
  description,
  is_active,
  display_order
FROM public.subscription_plans
ORDER BY display_order;

-- 10B. Create a subscription
/*
INSERT INTO public.subscriptions (
  customer_id, plan_id, vehicle_id,
  stripe_subscription_id, status,
  current_period_start, current_period_end
) VALUES (
  'CUSTOMER-UUID',
  (SELECT id FROM public.subscription_plans WHERE slug = 'regular-monthly'),
  'VEHICLE-UUID',
  'sub_test_' || gen_random_uuid()::text,
  'active',
  now(),
  now() + interval '1 month'
)
RETURNING *;
*/

-- 10C. Create subscription usage for current period
/*
INSERT INTO public.subscription_usage (subscription_id, period_start, period_end, allocated, used)
VALUES (
  'SUBSCRIPTION-UUID',
  now(),
  now() + interval '1 month',
  8,
  0
)
RETURNING *;
*/

-- 10D. Use a wash from subscription
/*
UPDATE public.subscription_usage
SET used = used + 1
WHERE subscription_id = 'SUBSCRIPTION-UUID'
  AND period_start <= now()
  AND period_end >= now();
*/

-- 10E. Check remaining washes
/*
SELECT
  su.allocated,
  su.used,
  su.allocated - su.used AS remaining,
  su.period_start,
  su.period_end,
  sp.name AS plan,
  sp.wash_plan
FROM public.subscription_usage su
JOIN public.subscriptions s ON s.id = su.subscription_id
JOIN public.subscription_plans sp ON sp.id = s.plan_id
WHERE su.subscription_id = 'SUBSCRIPTION-UUID'
ORDER BY su.period_start DESC
LIMIT 1;
*/

-- 10F. Pause a subscription
/*
UPDATE public.subscriptions
SET status = 'paused', cancel_at_period_end = false
WHERE id = 'SUBSCRIPTION-UUID';
*/

-- 10G. Cancel a subscription (at period end)
/*
UPDATE public.subscriptions
SET
  cancel_at_period_end = true,
  cancelled_at = now()
WHERE id = 'SUBSCRIPTION-UUID';
*/

-- 10H. Force cancel immediately
/*
UPDATE public.subscriptions
SET
  status = 'cancelled',
  cancelled_at = now()
WHERE id = 'SUBSCRIPTION-UUID';
*/

-- 10I. Mark past due (failed payment)
/*
UPDATE public.subscriptions
SET status = 'past_due'
WHERE id = 'SUBSCRIPTION-UUID';
*/

-- 10J. Subscription overview
SELECT
  sp.name AS plan,
  s.status,
  COUNT(*) AS count
FROM public.subscriptions s
JOIN public.subscription_plans sp ON sp.id = s.plan_id
GROUP BY sp.name, s.status
ORDER BY sp.name, s.status;

-- 10K. Create booking linked to subscription
/*
INSERT INTO public.bookings (
  customer_id, vehicle_id, wash_plan, dirt_level,
  status, service_address, service_lat, service_lng,
  is_instant,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price, hst_amount, total_price, washer_payout,
  payment_status, subscription_id
) VALUES (
  'CUSTOMER-UUID',
  'VEHICLE-UUID',
  'regular', 2,
  'pending',
  '123 King St W, Toronto, ON M5V 1J2',
  43.6472116, -79.3832747,
  true,
  0, 1.00, 1.00,         -- $0 base for subscription washes
  0, 0, 0,                -- no charge
  1100,                    -- washer still gets paid
  'captured',              -- pre-paid via subscription
  'SUBSCRIPTION-UUID'
)
RETURNING id, subscription_id, total_price;
*/


-- ══════════════════════════════════════════════════════════════
-- 11. NOTIFICATION SYSTEM
-- ══════════════════════════════════════════════════════════════

-- 11A. Create booking confirmation notification
/*
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (
  'CUSTOMER-UUID',
  'booking_confirmed',
  'Wash Booked!',
  'Your Regular wash has been scheduled. We''re finding you a washer.',
  '{"booking_id": "BOOKING-UUID", "wash_plan": "regular"}'::jsonb
)
RETURNING *;
*/

-- 11B. Create washer assigned notification
/*
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (
  'CUSTOMER-UUID',
  'washer_assigned',
  'Washer Assigned',
  'Mike is on his way to your location. Track live on the map.',
  '{"booking_id": "BOOKING-UUID", "washer_name": "Mike"}'::jsonb
);
*/

-- 11C. Create washer en_route notification
/*
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (
  'CUSTOMER-UUID',
  'washer_en_route',
  'Washer En Route',
  'Mike is heading to you. ETA: ~12 minutes.',
  '{"booking_id": "BOOKING-UUID", "eta_minutes": 12}'::jsonb
);
*/

-- 11D. Create wash complete notification
/*
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (
  'CUSTOMER-UUID',
  'wash_completed',
  'Wash Complete!',
  'Your vehicle is spotless. Check out the before/after photos!',
  '{"booking_id": "BOOKING-UUID"}'::jsonb
);
*/

-- 11E. Create notification for washer (new job)
/*
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (
  'WASHER-UUID',
  'new_job',
  'New Wash Job',
  'Regular wash at 123 King St W. Accept within 60 seconds.',
  '{"booking_id": "BOOKING-UUID", "wash_plan": "regular", "payout": 1100}'::jsonb
);
*/

-- 11F. Mark notification as read
/*
UPDATE public.notifications SET is_read = true WHERE id = 'NOTIFICATION-UUID';
*/

-- 11G. Mark all as read for a user
/*
UPDATE public.notifications SET is_read = true WHERE user_id = 'USER-UUID' AND is_read = false;
*/

-- 11H. Unread counts per user
SELECT
  p.full_name, p.role, p.email,
  COUNT(*) AS unread
FROM public.notifications n
JOIN public.profiles p ON p.id = n.user_id
WHERE n.is_read = false
GROUP BY p.id, p.full_name, p.role, p.email
ORDER BY unread DESC;


-- ══════════════════════════════════════════════════════════════
-- 12. BOOKING EDGE CASES & ALTERNATIVE FLOWS
-- ══════════════════════════════════════════════════════════════

-- 12A. Cancel a pending booking
/*
UPDATE public.bookings
SET
  status = 'cancelled',
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status = 'pending';
*/

-- 12B. Cancel an assigned booking (washer already assigned)
/*
UPDATE public.bookings
SET
  status = 'cancelled',
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status = 'assigned';
*/

-- 12C. Dispute a completed booking
/*
UPDATE public.bookings
SET
  status = 'disputed',
  updated_at = now()
WHERE id = 'BOOKING-UUID'
  AND status IN ('completed', 'paid');
*/

-- 12D. Reset booking to pending (for re-testing)
/*
UPDATE public.bookings
SET
  status = 'pending',
  washer_id = NULL,
  payment_status = 'pending',
  washer_assigned_at = NULL,
  washer_en_route_at = NULL,
  washer_arrived_at = NULL,
  wash_started_at = NULL,
  wash_completed_at = NULL,
  payment_captured_at = NULL,
  stripe_payment_intent_id = NULL,
  updated_at = now()
WHERE id = 'BOOKING-UUID';
*/

-- 12E. Scheduled booking (future date)
/*
INSERT INTO public.bookings (
  customer_id, vehicle_id, wash_plan, dirt_level,
  status, service_address, service_lat, service_lng,
  is_instant, scheduled_at, estimated_duration_min,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price, hst_amount, total_price, washer_payout,
  payment_status
) VALUES (
  'CUSTOMER-UUID', 'VEHICLE-UUID',
  'interior_exterior', 4,
  'pending',
  '200 Bay St, Toronto, ON M5J 2J2',
  43.6488, -79.3812,
  false, '2026-03-25 14:00:00+00', 45,
  2500, 1.00, 1.00,
  2500, 325, 2825, 1100,
  'pending'
)
RETURNING id, is_instant, scheduled_at;
*/


-- ══════════════════════════════════════════════════════════════
-- 13. SERVICE ZONE MANAGEMENT
-- ══════════════════════════════════════════════════════════════

-- 13A. View all service zones
SELECT id, name, postal_prefixes, is_active, launch_date
FROM public.service_zones
ORDER BY name;

-- 13B. Add a new zone
/*
INSERT INTO public.service_zones (name, postal_prefixes, is_active, launch_date)
VALUES ('North York', ARRAY['M2', 'M3'], false, '2026-06-01')
RETURNING *;
*/

-- 13C. Activate a zone
/*
UPDATE public.service_zones SET is_active = true WHERE name = 'North York';
*/

-- 13D. Check if a postal code is in an active zone
/*
SELECT name, postal_prefixes
FROM public.service_zones
WHERE is_active = true
  AND 'M5V' = ANY(postal_prefixes);
*/

-- 13E. Check washer service zone overlap
SELECT
  p.full_name,
  wp.service_zones AS washer_zones,
  sz.name AS zone_name,
  sz.postal_prefixes AS zone_prefixes
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
CROSS JOIN public.service_zones sz
WHERE sz.is_active = true
  AND wp.service_zones && sz.postal_prefixes;  -- array overlap


-- ══════════════════════════════════════════════════════════════
-- 14. GPS TRACKING SIMULATION
-- ══════════════════════════════════════════════════════════════

-- 14A. Simulate washer driving to customer (multiple GPS updates)
-- Run these one at a time to simulate movement
/*
-- Starting point (Mississauga)
UPDATE public.washer_profiles
SET current_lat = 43.5890, current_lng = -79.6441, location_updated_at = now()
WHERE id = 'WASHER-UUID';

-- Midway point
UPDATE public.washer_profiles
SET current_lat = 43.6100, current_lng = -79.5500, location_updated_at = now()
WHERE id = 'WASHER-UUID';

-- Near customer
UPDATE public.washer_profiles
SET current_lat = 43.6400, current_lng = -79.4000, location_updated_at = now()
WHERE id = 'WASHER-UUID';

-- At customer location
UPDATE public.washer_profiles
SET current_lat = 43.6472, current_lng = -79.3833, location_updated_at = now()
WHERE id = 'WASHER-UUID';
*/

-- 14B. Find nearest washer to a booking location
SELECT
  p.full_name,
  wp.current_lat, wp.current_lng,
  wp.location_updated_at,
  wp.jobs_completed,
  wp.rating_avg,
  -- Approximate distance in km using Haversine shortcut
  ROUND(
    111.045 * SQRT(
      POWER(wp.current_lat - 43.6472, 2) +
      POWER((wp.current_lng - (-79.3833)) * COS(RADIANS(43.6472)), 2)
    )::numeric,
  2) AS approx_km
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
WHERE wp.is_online = true
  AND wp.status = 'approved'
  AND wp.current_lat IS NOT NULL
ORDER BY approx_km ASC
LIMIT 5;


-- ══════════════════════════════════════════════════════════════
-- 15. DATA INTEGRITY CHECKS
-- ══════════════════════════════════════════════════════════════

-- 15A. Bookings with mismatched customer/vehicle ownership
SELECT b.id, b.customer_id, v.customer_id AS vehicle_owner
FROM public.bookings b
JOIN public.vehicles v ON v.id = b.vehicle_id
WHERE b.customer_id != v.customer_id;

-- 15B. Completed bookings with no washer assigned
SELECT id, status, washer_id
FROM public.bookings
WHERE status IN ('completed', 'paid')
  AND washer_id IS NULL;

-- 15C. Paid bookings with non-captured payment
SELECT id, status, payment_status
FROM public.bookings
WHERE status = 'paid'
  AND payment_status != 'captured';

-- 15D. Reviews for non-completed bookings
SELECT r.id, r.booking_id, b.status
FROM public.reviews r
JOIN public.bookings b ON b.id = r.booking_id
WHERE b.status NOT IN ('completed', 'paid');

-- 15E. Orphaned customer_profiles (no matching profile)
SELECT cp.id FROM public.customer_profiles cp
LEFT JOIN public.profiles p ON p.id = cp.id
WHERE p.id IS NULL;

-- 15F. Orphaned washer_profiles
SELECT wp.id FROM public.washer_profiles wp
LEFT JOIN public.profiles p ON p.id = wp.id
WHERE p.id IS NULL;

-- 15G. Bookings with incorrect status timestamps
-- e.g. washer_arrived_at set but status is still 'pending'
SELECT id, status,
  washer_assigned_at IS NOT NULL AS has_assigned_ts,
  washer_en_route_at IS NOT NULL AS has_en_route_ts,
  washer_arrived_at IS NOT NULL AS has_arrived_ts,
  wash_started_at IS NOT NULL AS has_started_ts,
  wash_completed_at IS NOT NULL AS has_completed_ts
FROM public.bookings
WHERE
  (status = 'pending' AND washer_assigned_at IS NOT NULL)
  OR (status = 'assigned' AND washer_en_route_at IS NOT NULL)
  OR (status = 'completed' AND wash_completed_at IS NULL)
  OR (status = 'paid' AND payment_captured_at IS NULL);

-- 15H. Subscription usage exceeding allocation
SELECT
  su.subscription_id, su.allocated, su.used,
  su.used - su.allocated AS over_limit
FROM public.subscription_usage su
WHERE su.used > su.allocated;

-- 15I. Duplicate primary vehicles per customer
SELECT customer_id, COUNT(*) AS primary_count
FROM public.vehicles
WHERE is_primary = true
GROUP BY customer_id
HAVING COUNT(*) > 1;

-- 15J. Washer rating_avg drift (stored vs calculated)
SELECT
  p.full_name,
  wp.rating_avg AS stored_rating,
  ROUND(AVG(r.rating)::numeric, 2) AS actual_avg,
  ABS(wp.rating_avg - ROUND(AVG(r.rating)::numeric, 2)) AS drift
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
JOIN public.reviews r ON r.washer_id = wp.id
GROUP BY p.id, p.full_name, wp.rating_avg
HAVING ABS(wp.rating_avg - ROUND(AVG(r.rating)::numeric, 2)) > 0.01;


-- ══════════════════════════════════════════════════════════════
-- 16. RLS POLICY VERIFICATION
-- ══════════════════════════════════════════════════════════════

-- 16A. List all RLS policies
SELECT
  schemaname, tablename, policyname,
  permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 16B. Check RLS enabled status per table
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
ORDER BY relname;

-- 16C. Tables WITHOUT RLS (potential security issue)
SELECT relname AS table_name
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relrowsecurity = false
ORDER BY relname;


-- ══════════════════════════════════════════════════════════════
-- 17. REVENUE & ANALYTICS QUERIES
-- ══════════════════════════════════════════════════════════════

-- 17A. Revenue summary
SELECT
  SUM(total_price) / 100.0 AS total_revenue,
  SUM(washer_payout) / 100.0 AS total_payouts,
  SUM(total_price - washer_payout) / 100.0 AS gross_profit,
  SUM(hst_amount) / 100.0 AS total_hst_collected,
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE status = 'paid') AS paid_bookings,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_bookings
FROM public.bookings
WHERE status IN ('completed', 'paid');

-- 17B. Revenue by wash plan
SELECT
  wash_plan,
  COUNT(*) AS bookings,
  SUM(total_price) / 100.0 AS revenue,
  ROUND(AVG(total_price) / 100.0, 2) AS avg_order_value
FROM public.bookings
WHERE status IN ('completed', 'paid')
GROUP BY wash_plan
ORDER BY revenue DESC;

-- 17C. Bookings by day (last 30 days)
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS bookings,
  SUM(total_price) / 100.0 AS revenue
FROM public.bookings
WHERE created_at >= now() - interval '30 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- 17D. Washer earnings leaderboard
SELECT
  p.full_name,
  wp.jobs_completed,
  wp.rating_avg,
  SUM(b.washer_payout) / 100.0 AS total_earned
FROM public.bookings b
JOIN public.profiles p ON p.id = b.washer_id
JOIN public.washer_profiles wp ON wp.id = b.washer_id
WHERE b.status IN ('completed', 'paid')
GROUP BY p.id, p.full_name, wp.jobs_completed, wp.rating_avg
ORDER BY total_earned DESC;

-- 17E. Customer lifetime value
SELECT
  p.full_name, p.email,
  COUNT(*) AS total_bookings,
  SUM(b.total_price) / 100.0 AS lifetime_value,
  MIN(b.created_at) AS first_booking,
  MAX(b.created_at) AS last_booking
FROM public.bookings b
JOIN public.profiles p ON p.id = b.customer_id
WHERE b.status IN ('completed', 'paid')
GROUP BY p.id, p.full_name, p.email
ORDER BY lifetime_value DESC;


-- ══════════════════════════════════════════════════════════════
-- 18. TABLE ROW COUNTS (QUICK HEALTH CHECK)
-- ══════════════════════════════════════════════════════════════

SELECT 'profiles' AS tbl, COUNT(*) FROM public.profiles
UNION ALL SELECT 'customer_profiles', COUNT(*) FROM public.customer_profiles
UNION ALL SELECT 'washer_profiles', COUNT(*) FROM public.washer_profiles
UNION ALL SELECT 'vehicles', COUNT(*) FROM public.vehicles
UNION ALL SELECT 'bookings', COUNT(*) FROM public.bookings
UNION ALL SELECT 'booking_photos', COUNT(*) FROM public.booking_photos
UNION ALL SELECT 'reviews', COUNT(*) FROM public.reviews
UNION ALL SELECT 'subscriptions', COUNT(*) FROM public.subscriptions
UNION ALL SELECT 'subscription_plans', COUNT(*) FROM public.subscription_plans
UNION ALL SELECT 'subscription_usage', COUNT(*) FROM public.subscription_usage
UNION ALL SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL SELECT 'washer_availability', COUNT(*) FROM public.washer_availability
UNION ALL SELECT 'washer_blocks', COUNT(*) FROM public.washer_blocks
UNION ALL SELECT 'service_zones', COUNT(*) FROM public.service_zones
ORDER BY tbl;


-- ══════════════════════════════════════════════════════════════
-- 19. CLEANUP — RESET TEST DATA
-- ══════════════════════════════════════════════════════════════

-- WARNING: These delete data. Run only in dev/staging.

-- 19A. Delete a specific booking and its related data
/*
DELETE FROM public.booking_photos WHERE booking_id = 'BOOKING-UUID';
DELETE FROM public.reviews WHERE booking_id = 'BOOKING-UUID';
DELETE FROM public.bookings WHERE id = 'BOOKING-UUID';
*/

-- 19B. Delete all bookings for a customer
/*
DELETE FROM public.booking_photos WHERE booking_id IN (
  SELECT id FROM public.bookings WHERE customer_id = 'CUSTOMER-UUID'
);
DELETE FROM public.reviews WHERE booking_id IN (
  SELECT id FROM public.bookings WHERE customer_id = 'CUSTOMER-UUID'
);
DELETE FROM public.bookings WHERE customer_id = 'CUSTOMER-UUID';
*/

-- 19C. Delete all test notifications
/*
DELETE FROM public.notifications WHERE user_id = 'USER-UUID';
*/

-- 19D. Delete a vehicle (cascade will handle booking FK)
/*
DELETE FROM public.vehicles WHERE id = 'VEHICLE-UUID';
*/

-- 19E. Reset washer stats
/*
UPDATE public.washer_profiles
SET
  jobs_completed = 0,
  rating_avg = 0,
  is_online = false,
  current_lat = NULL,
  current_lng = NULL,
  location_updated_at = NULL
WHERE id = 'WASHER-UUID';
*/

-- 19F. Nuclear reset — delete ALL transactional data (keep profiles & plans)
-- DO NOT RUN IN PRODUCTION
/*
TRUNCATE public.booking_photos CASCADE;
TRUNCATE public.reviews CASCADE;
TRUNCATE public.notifications CASCADE;
TRUNCATE public.subscription_usage CASCADE;
TRUNCATE public.bookings CASCADE;
TRUNCATE public.subscriptions CASCADE;
TRUNCATE public.washer_availability CASCADE;
TRUNCATE public.washer_blocks CASCADE;
*/
