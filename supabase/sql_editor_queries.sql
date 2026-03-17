-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — SQL Editor Testing Queries
-- Paste any section into Supabase SQL Editor to test/debug
-- ═══════════════════════════════════════════════════════════════


-- ══════════════════════════════════════════
-- 1. OVERVIEW — ROW COUNTS PER TABLE
-- ══════════════════════════════════════════

SELECT
  'profiles'            AS table_name, COUNT(*) AS rows FROM public.profiles
UNION ALL SELECT 'customer_profiles',  COUNT(*) FROM public.customer_profiles
UNION ALL SELECT 'washer_profiles',    COUNT(*) FROM public.washer_profiles
UNION ALL SELECT 'vehicles',           COUNT(*) FROM public.vehicles
UNION ALL SELECT 'bookings',           COUNT(*) FROM public.bookings
UNION ALL SELECT 'reviews',            COUNT(*) FROM public.reviews
UNION ALL SELECT 'subscriptions',      COUNT(*) FROM public.subscriptions
UNION ALL SELECT 'subscription_plans', COUNT(*) FROM public.subscription_plans
UNION ALL SELECT 'notifications',      COUNT(*) FROM public.notifications
ORDER BY table_name;


-- ══════════════════════════════════════════
-- 2. PROFILES
-- ══════════════════════════════════════════

-- All profiles
SELECT id, role, full_name, email, phone, created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Profiles by role
SELECT id, full_name, email, created_at
FROM public.profiles
WHERE role = 'customer'   -- change to 'washer' or 'admin'
ORDER BY created_at DESC;

-- Specific user by email
SELECT p.*, cp.referral_code, cp.stripe_customer_id
FROM public.profiles p
LEFT JOIN public.customer_profiles cp ON cp.id = p.id
WHERE p.email = 'test@example.com';


-- ══════════════════════════════════════════
-- 3. VEHICLES
-- ══════════════════════════════════════════

-- All vehicles with owner name
SELECT
  v.id,
  v.year, v.make, v.model, v.type, v.color, v.plate,
  v.is_primary,
  p.full_name AS owner,
  p.email     AS owner_email,
  v.created_at
FROM public.vehicles v
JOIN public.profiles p ON p.id = v.customer_id
ORDER BY v.created_at DESC;

-- Vehicles for a specific customer (replace UUID)
SELECT * FROM public.vehicles
WHERE customer_id = 'YOUR-CUSTOMER-UUID-HERE'
ORDER BY is_primary DESC;


-- ══════════════════════════════════════════
-- 4. BOOKINGS
-- ══════════════════════════════════════════

-- All bookings with customer + washer names
SELECT
  b.id,
  b.status,
  b.wash_plan,
  b.dirt_level,
  b.is_instant,
  b.service_address,
  b.final_price,
  b.total_price,
  b.hst_amount,
  b.washer_payout,
  b.payment_status,
  b.scheduled_at,
  b.created_at,
  cust.full_name  AS customer_name,
  cust.email      AS customer_email,
  wash.full_name  AS washer_name,
  v.make || ' ' || v.model || ' ' || v.year::text AS vehicle
FROM public.bookings b
JOIN public.profiles cust ON cust.id = b.customer_id
LEFT JOIN public.profiles wash ON wash.id = b.washer_id
LEFT JOIN public.vehicles v ON v.id = b.vehicle_id
ORDER BY b.created_at DESC
LIMIT 50;

-- Active bookings only (not completed/cancelled)
SELECT
  b.id, b.status, b.wash_plan, b.service_address,
  cust.full_name AS customer, cust.email,
  wash.full_name AS washer,
  b.created_at
FROM public.bookings b
JOIN public.profiles cust ON cust.id = b.customer_id
LEFT JOIN public.profiles wash ON wash.id = b.washer_id
WHERE b.status NOT IN ('completed', 'paid', 'cancelled')
ORDER BY b.created_at DESC;

-- Booking counts by status
SELECT status, COUNT(*) AS count
FROM public.bookings
GROUP BY status
ORDER BY count DESC;

-- Booking counts by wash plan
SELECT wash_plan, COUNT(*) AS count,
  ROUND(AVG(final_price) / 100.0, 2) AS avg_price_dollars
FROM public.bookings
GROUP BY wash_plan
ORDER BY count DESC;

-- Revenue summary
SELECT
  SUM(total_price) / 100.0                    AS total_revenue_dollars,
  SUM(washer_payout) / 100.0                  AS total_washer_payouts_dollars,
  SUM(total_price - washer_payout) / 100.0    AS gross_profit_dollars,
  COUNT(*)                                     AS total_bookings,
  COUNT(*) FILTER (WHERE status = 'paid')      AS paid_bookings,
  COUNT(*) FILTER (WHERE is_instant = true)    AS instant_bookings,
  COUNT(*) FILTER (WHERE is_instant = false)   AS scheduled_bookings
FROM public.bookings
WHERE status IN ('completed', 'paid');


-- ══════════════════════════════════════════
-- 5. WASHERS
-- ══════════════════════════════════════════

-- All washers with status
SELECT
  p.id, p.full_name, p.email, p.phone,
  wp.status,
  wp.is_online,
  wp.rating_avg,
  wp.jobs_completed,
  wp.insurance_verified,
  wp.background_check_done,
  wp.stripe_account_id,
  wp.current_lat, wp.current_lng,
  wp.created_at
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
ORDER BY wp.created_at DESC;

-- Online washers
SELECT
  p.full_name, p.email,
  wp.current_lat, wp.current_lng,
  wp.location_updated_at,
  wp.jobs_completed, wp.rating_avg
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
WHERE wp.is_online = true;

-- Washer earnings (completed jobs)
SELECT
  p.full_name AS washer,
  COUNT(*) AS jobs_done,
  SUM(b.washer_payout) / 100.0 AS total_earned_dollars,
  ROUND(AVG(b.washer_payout) / 100.0, 2) AS avg_per_job
FROM public.bookings b
JOIN public.profiles p ON p.id = b.washer_id
WHERE b.status IN ('completed', 'paid')
GROUP BY p.id, p.full_name
ORDER BY total_earned_dollars DESC;

-- Approve a washer (run carefully)
-- UPDATE public.washer_profiles SET status = 'approved' WHERE id = 'WASHER-UUID-HERE';

-- Set washer online/offline
-- UPDATE public.washer_profiles SET is_online = true WHERE id = 'WASHER-UUID-HERE';


-- ══════════════════════════════════════════
-- 6. REVIEWS
-- ══════════════════════════════════════════

-- All reviews with names
SELECT
  r.id,
  r.rating,
  r.comment,
  r.created_at,
  cust.full_name AS customer,
  wash.full_name AS washer,
  b.wash_plan
FROM public.reviews r
JOIN public.profiles cust ON cust.id = r.customer_id
JOIN public.profiles wash ON wash.id = r.washer_id
JOIN public.bookings b ON b.id = r.booking_id
ORDER BY r.created_at DESC;

-- Average washer rating
SELECT
  p.full_name AS washer,
  ROUND(AVG(r.rating), 2) AS avg_rating,
  COUNT(*) AS review_count
FROM public.reviews r
JOIN public.profiles p ON p.id = r.washer_id
GROUP BY p.id, p.full_name
ORDER BY avg_rating DESC;


-- ══════════════════════════════════════════
-- 7. SUBSCRIPTIONS
-- ══════════════════════════════════════════

-- All active subscriptions
SELECT
  s.id,
  s.status,
  s.washes_remaining,
  s.current_period_start,
  s.current_period_end,
  p.full_name AS customer,
  p.email,
  sp.name AS plan_name,
  sp.monthly_price / 100.0 AS monthly_price_dollars
FROM public.subscriptions s
JOIN public.profiles p ON p.id = s.customer_id
JOIN public.subscription_plans sp ON sp.id = s.plan_id
WHERE s.status = 'active'
ORDER BY s.created_at DESC;

-- Subscription counts by plan
SELECT
  sp.name AS plan,
  COUNT(*) FILTER (WHERE s.status = 'active') AS active,
  COUNT(*) FILTER (WHERE s.status = 'cancelled') AS cancelled
FROM public.subscriptions s
JOIN public.subscription_plans sp ON sp.id = s.plan_id
GROUP BY sp.name;


-- ══════════════════════════════════════════
-- 8. NOTIFICATIONS
-- ══════════════════════════════════════════

-- Recent notifications
SELECT
  n.id, n.type, n.title, n.body, n.is_read,
  n.created_at,
  p.full_name AS recipient
FROM public.notifications n
JOIN public.profiles p ON p.id = n.user_id
ORDER BY n.created_at DESC
LIMIT 50;

-- Unread count per user
SELECT
  p.full_name, p.email,
  COUNT(*) AS unread_count
FROM public.notifications n
JOIN public.profiles p ON p.id = n.user_id
WHERE n.is_read = false
GROUP BY p.id, p.full_name, p.email
ORDER BY unread_count DESC;


-- ══════════════════════════════════════════
-- 9. AUTH — USERS (admin only)
-- ══════════════════════════════════════════

-- All auth users with profile role
SELECT
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.raw_user_meta_data->>'role' AS meta_role,
  p.role AS profile_role,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- Users who signed in via Google OAuth
SELECT
  u.id, u.email, u.created_at,
  p.full_name, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.raw_app_meta_data->>'provider' = 'google'
ORDER BY u.created_at DESC;

-- Users with NO profile (orphaned auth users)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;


-- ══════════════════════════════════════════
-- 10. QUICK DEBUG — SPECIFIC BOOKING
-- ══════════════════════════════════════════

-- Full details for one booking (replace UUID)
SELECT
  b.*,
  cust.full_name  AS customer_name,
  cust.email      AS customer_email,
  wash.full_name  AS washer_name,
  v.make, v.model, v.year, v.type
FROM public.bookings b
JOIN public.profiles cust ON cust.id = b.customer_id
LEFT JOIN public.profiles wash ON wash.id = b.washer_id
LEFT JOIN public.vehicles v ON v.id = b.vehicle_id
WHERE b.id = 'YOUR-BOOKING-UUID-HERE';

-- Force-cancel a stuck booking (use with care)
-- UPDATE public.bookings SET status = 'cancelled' WHERE id = 'YOUR-BOOKING-UUID-HERE';

-- Force-complete a booking (use with care)
-- UPDATE public.bookings
-- SET status = 'completed', completed_at = now()
-- WHERE id = 'YOUR-BOOKING-UUID-HERE';


-- ══════════════════════════════════════════
-- 11. RLS POLICY CHECK
-- ══════════════════════════════════════════

-- List all RLS policies on Driveo tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if RLS is enabled on each table
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
ORDER BY relname;
