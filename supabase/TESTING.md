# Driveo — SQL Testing Guide

> Run all queries in **Supabase SQL Editor** → `rdhfvltzmaactvxwcaxz`
> Replace placeholder UUIDs before running mutating queries.

---

## Test Accounts

| Role | Email | Password | UUID |
|------|-------|----------|------|
| Washer | `testwasher@driveo.ca` | `testWasher123!` | `d2ad6042-f2b9-49d2-99de-7040b81992be` |

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [Find Your UUIDs](#2-find-your-uuids)
3. [Customer Flow](#3-customer-flow)
4. [Washer Onboarding](#4-washer-onboarding)
5. [Booking Creation & Pricing](#5-booking-creation--pricing)
6. [Booking Lifecycle (State Machine)](#6-booking-lifecycle-state-machine)
7. [Payment Transitions](#7-payment-transitions)
8. [Photos](#8-photos)
9. [Reviews & Ratings](#9-reviews--ratings)
10. [Subscriptions](#10-subscriptions)
11. [Notifications](#11-notifications)
12. [GPS Tracking](#12-gps-tracking)
13. [Analytics & Revenue](#13-analytics--revenue)
14. [Data Integrity Checks](#14-data-integrity-checks)
15. [Cleanup / Reset](#15-cleanup--reset)

---

## 1. Health Check

Row counts across all tables — run this first.

```sql
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
UNION ALL SELECT 'service_zones', COUNT(*) FROM public.service_zones
ORDER BY tbl;
```

---

## 2. Find Your UUIDs

Run these first and copy the UUIDs for use in later queries.

**All users with roles:**
```sql
SELECT p.id, p.full_name, p.email, p.role, p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;
```

**All washers:**
```sql
SELECT p.id, p.full_name, p.email, wp.status, wp.is_online
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
ORDER BY wp.created_at DESC;
```

**All customers:**
```sql
SELECT p.id, p.full_name, p.email, cp.referral_code
FROM public.customer_profiles cp
JOIN public.profiles p ON p.id = cp.id
ORDER BY p.created_at DESC;
```

**All vehicles:**
```sql
SELECT v.id, v.make, v.model, v.year, v.type, v.is_primary, p.full_name AS owner
FROM public.vehicles v
JOIN public.profiles p ON p.id = v.customer_id
ORDER BY v.created_at DESC;
```

**All bookings:**
```sql
SELECT
  b.id, b.status, b.wash_plan, b.dirt_level,
  b.total_price / 100.0 AS total,
  c.full_name AS customer,
  w.full_name AS washer,
  b.created_at
FROM public.bookings b
JOIN public.profiles c ON c.id = b.customer_id
LEFT JOIN public.profiles w ON w.id = b.washer_id
ORDER BY b.created_at DESC;
```

**Subscription plans:**
```sql
SELECT id, name, slug, wash_plan, monthly_price / 100.0 AS price
FROM public.subscription_plans ORDER BY display_order;
```

---

## 3. Customer Flow

### 3A — Verify profile created after sign-up
```sql
SELECT
  u.id, u.email,
  u.raw_app_meta_data->>'provider' AS provider,
  p.full_name, p.role,
  cp.referral_code, cp.default_address
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.customer_profiles cp ON cp.id = u.id
ORDER BY u.created_at DESC
LIMIT 5;
```

### 3B — Check for orphaned users (missing profile = broken trigger)
```sql
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

### 3C — Update customer address
```sql
UPDATE public.customer_profiles
SET
  default_address = '123 King St W, Toronto, ON M5V 1J2',
  default_lat = 43.6472116,
  default_lng = -79.3832747,
  default_postal = 'M5V'
WHERE id = 'CUSTOMER-UUID';
```

### 3D — Add a vehicle
```sql
INSERT INTO public.vehicles (customer_id, make, model, year, color, plate, type, is_primary, nickname)
VALUES (
  'CUSTOMER-UUID',
  'Toyota', 'Camry', 2024, 'Silver', 'ABCD 123', 'sedan',
  true, 'Daily Driver'
)
RETURNING *;
```

### 3E — Add a second vehicle (SUV)
```sql
INSERT INTO public.vehicles (customer_id, make, model, year, color, plate, type, is_primary, nickname)
VALUES (
  'CUSTOMER-UUID',
  'BMW', 'X5', 2025, 'Black', 'LUXE 999', 'suv',
  false, 'Weekend Ride'
)
RETURNING *;
```

### 3F — Set primary vehicle
```sql
UPDATE public.vehicles SET is_primary = false WHERE customer_id = 'CUSTOMER-UUID';
UPDATE public.vehicles SET is_primary = true WHERE id = 'VEHICLE-UUID';
```

---

## 4. Washer Onboarding

### 4A — Approve the test washer
```sql
UPDATE public.washer_profiles
SET
  status = 'approved',
  insurance_verified = true,
  background_check_done = true
WHERE id = 'WASHER-UUID';
```

### 4B — Go online with GPS
```sql
UPDATE public.washer_profiles
SET
  is_online = true,
  current_lat = 43.6472,
  current_lng = -79.3833,
  location_updated_at = now()
WHERE id = 'WASHER-UUID';
```

### 4C — Go offline
```sql
UPDATE public.washer_profiles
SET is_online = false
WHERE id = 'WASHER-UUID';
```

### 4D — Suspend washer
```sql
UPDATE public.washer_profiles
SET status = 'suspended', is_online = false
WHERE id = 'WASHER-UUID';
```

### 4E — Set weekly availability (Mon–Fri 9am–5pm)
```sql
INSERT INTO public.washer_availability (washer_id, day_of_week, start_time, end_time, is_available)
VALUES
  ('WASHER-UUID', 1, '09:00', '17:00', true),
  ('WASHER-UUID', 2, '09:00', '17:00', true),
  ('WASHER-UUID', 3, '09:00', '17:00', true),
  ('WASHER-UUID', 4, '09:00', '17:00', true),
  ('WASHER-UUID', 5, '09:00', '17:00', true);
```

### 4F — View all washers + status
```sql
SELECT
  p.full_name, p.email,
  wp.status, wp.is_online,
  wp.rating_avg, wp.jobs_completed,
  wp.insurance_verified, wp.background_check_done,
  wp.service_zones
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
ORDER BY wp.created_at DESC;
```

---

## 5. Booking Creation & Pricing

> **Price formula:** `base × vehicle_multiplier × dirt_multiplier + 13% HST`

| Plan | Base | Payout |
|------|------|--------|
| Regular | $18 (1800¢) | $11 |
| Interior & Exterior | $25 (2500¢) | $11 |
| Detailing | $189 (18900¢) | $22 |

| Vehicle | Multiplier |
|---------|-----------|
| Sedan/Coupe | 1.00 |
| Crossover | 1.15 |
| SUV | 1.25 |
| Minivan | 1.25 |
| Pickup | 1.20 |
| Large SUV/Truck | 1.40 |

| Dirt Level | Multiplier |
|------------|-----------|
| 0–5 | 1.00 |
| 6 | 1.15 |
| 7 | 1.30 |
| 8 | 1.50 |
| 9 | 1.75 |
| 10 | 2.00 |

### 5A — Regular wash, Sedan, Dirt=3 → $20.34 total
```sql
INSERT INTO public.bookings (
  customer_id, vehicle_id, wash_plan, dirt_level,
  status, service_address, service_lat, service_lng,
  is_instant,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price, hst_amount, total_price, washer_payout,
  payment_status
) VALUES (
  'CUSTOMER-UUID', 'VEHICLE-UUID',
  'regular', 3, 'pending',
  '123 King St W, Toronto, ON M5V 1J2', 43.6472116, -79.3832747,
  true,
  1800, 1.00, 1.00,
  1800, 234, 2034, 1100,
  'pending'
)
RETURNING id, status, final_price, hst_amount, total_price;
```

### 5B — I&E wash, SUV, Dirt=7 → $45.91 total
```sql
INSERT INTO public.bookings (
  customer_id, vehicle_id, wash_plan, dirt_level,
  status, service_address, service_lat, service_lng,
  is_instant,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price, hst_amount, total_price, washer_payout,
  payment_status
) VALUES (
  'CUSTOMER-UUID', 'VEHICLE-UUID',
  'interior_exterior', 7, 'pending',
  '100 City Centre Dr, Mississauga, ON L5B 2C9', 43.5890, -79.6441,
  true,
  2500, 1.25, 1.30,
  4063, 528, 4591, 1100,
  'pending'
)
RETURNING id, status, final_price, total_price;
```

### 5C — Detailing, Pickup, Dirt=10 → $512.57 total
```sql
INSERT INTO public.bookings (
  customer_id, vehicle_id, wash_plan, dirt_level,
  status, service_address, service_lat, service_lng,
  is_instant, scheduled_at, estimated_duration_min,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price, hst_amount, total_price, washer_payout,
  payment_status, customer_notes
) VALUES (
  'CUSTOMER-UUID', 'VEHICLE-UUID',
  'detailing', 10, 'pending',
  '3300 Hwy 7, Vaughan, ON L4K 4M3', 43.8361, -79.5181,
  false, '2026-03-25 10:00:00+00', 180,
  18900, 1.20, 2.00,
  45360, 5897, 51257, 2200,
  'pending', 'Deep mud on wheel wells, dog hair in back seat'
)
RETURNING id, final_price, total_price, washer_payout;
```

### 5D — Verify pricing math on all bookings
```sql
SELECT
  id, wash_plan, dirt_level,
  base_price, vehicle_multiplier, dirt_multiplier,
  final_price,
  ROUND(base_price * vehicle_multiplier * dirt_multiplier)::int AS expected_final,
  final_price = ROUND(base_price * vehicle_multiplier * dirt_multiplier)::int AS price_ok,
  ABS(hst_amount - ROUND(final_price * 0.13)::int) <= 1 AS hst_ok,
  total_price = (final_price + hst_amount) AS total_ok
FROM public.bookings
ORDER BY created_at DESC LIMIT 10;
```

---

## 6. Booking Lifecycle (State Machine)

> Replace `BOOKING-UUID` and `WASHER-UUID` throughout.

```
pending → assigned → en_route → arrived → washing → completed → paid
```

### Step 1 — Assign washer
```sql
UPDATE public.bookings
SET
  status = 'assigned',
  washer_id = 'WASHER-UUID',
  washer_assigned_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID' AND status = 'pending';
```

### Step 2 — En route (On the way)
```sql
UPDATE public.bookings
SET
  status = 'en_route',
  washer_en_route_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID' AND status = 'assigned';

-- Move washer GPS
UPDATE public.washer_profiles
SET current_lat = 43.6300, current_lng = -79.4100, location_updated_at = now()
WHERE id = 'WASHER-UUID';
```

### Step 3 — Washer arrived
```sql
UPDATE public.bookings
SET
  status = 'arrived',
  washer_arrived_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID' AND status = 'en_route';

-- GPS at customer location
UPDATE public.washer_profiles
SET current_lat = 43.6472, current_lng = -79.3833, location_updated_at = now()
WHERE id = 'WASHER-UUID';
```

### Step 4 — Wash in progress
```sql
UPDATE public.bookings
SET
  status = 'washing',
  wash_started_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID' AND status = 'arrived';
```

### Step 5 — Wash complete
```sql
UPDATE public.bookings
SET
  status = 'completed',
  wash_completed_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID' AND status = 'washing';

-- Bump washer job count
UPDATE public.washer_profiles
SET jobs_completed = jobs_completed + 1
WHERE id = 'WASHER-UUID';
```

### Step 6 — Payment captured
```sql
UPDATE public.bookings
SET
  status = 'paid',
  payment_status = 'captured',
  payment_captured_at = now(),
  updated_at = now()
WHERE id = 'BOOKING-UUID' AND status = 'completed';
```

### View full booking timeline
```sql
SELECT
  id, status, payment_status,
  created_at,
  washer_assigned_at,
  washer_en_route_at,
  washer_arrived_at,
  wash_started_at,
  wash_completed_at,
  payment_captured_at,
  EXTRACT(EPOCH FROM washer_arrived_at - washer_en_route_at) / 60 AS mins_en_route,
  EXTRACT(EPOCH FROM wash_completed_at - wash_started_at) / 60 AS mins_washing
FROM public.bookings
WHERE id = 'BOOKING-UUID';
```

### Reset booking to pending (re-test)
```sql
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
```

---

## 7. Payment Transitions

### Authorize (on booking creation)
```sql
UPDATE public.bookings
SET payment_status = 'authorized',
    stripe_payment_intent_id = 'pi_test_' || gen_random_uuid()::text
WHERE id = 'BOOKING-UUID';
```

### Capture (after wash complete)
```sql
UPDATE public.bookings
SET payment_status = 'captured', payment_captured_at = now()
WHERE id = 'BOOKING-UUID';
```

### Refund
```sql
UPDATE public.bookings SET payment_status = 'refunded' WHERE id = 'BOOKING-UUID';
```

### Failed
```sql
UPDATE public.bookings SET payment_status = 'failed' WHERE id = 'BOOKING-UUID';
```

### Payment overview
```sql
SELECT payment_status, COUNT(*), SUM(total_price) / 100.0 AS total
FROM public.bookings GROUP BY payment_status;
```

---

## 8. Photos

### Upload before photos (5 angles)
```sql
INSERT INTO public.booking_photos (booking_id, washer_id, photo_type, storage_path, angle_label)
VALUES
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/front.jpg', 'front'),
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/rear.jpg', 'rear'),
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/driver.jpg', 'driver_side'),
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/passenger.jpg', 'passenger_side'),
  ('BOOKING-UUID', 'WASHER-UUID', 'before', 'bookings/BOOKING-UUID/before/interior.jpg', 'interior');
```

### Upload after photos
```sql
INSERT INTO public.booking_photos (booking_id, washer_id, photo_type, storage_path, angle_label)
VALUES
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/front.jpg', 'front'),
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/rear.jpg', 'rear'),
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/driver.jpg', 'driver_side'),
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/passenger.jpg', 'passenger_side'),
  ('BOOKING-UUID', 'WASHER-UUID', 'after', 'bookings/BOOKING-UUID/after/interior.jpg', 'interior');
```

### View photos for a booking
```sql
SELECT photo_type, angle_label, storage_path, created_at
FROM public.booking_photos
WHERE booking_id = 'BOOKING-UUID'
ORDER BY photo_type, angle_label;
```

### Completed bookings missing photos
```sql
SELECT
  b.id, b.status,
  COUNT(bp.id) FILTER (WHERE bp.photo_type = 'before') AS before_count,
  COUNT(bp.id) FILTER (WHERE bp.photo_type = 'after') AS after_count
FROM public.bookings b
LEFT JOIN public.booking_photos bp ON bp.booking_id = b.id
WHERE b.status IN ('completed', 'paid')
GROUP BY b.id
HAVING COUNT(bp.id) FILTER (WHERE bp.photo_type = 'before') = 0
    OR COUNT(bp.id) FILTER (WHERE bp.photo_type = 'after') = 0;
```

---

## 9. Reviews & Ratings

### Leave a review
```sql
INSERT INTO public.reviews (booking_id, customer_id, washer_id, rating, comment)
VALUES (
  'BOOKING-UUID', 'CUSTOMER-UUID', 'WASHER-UUID',
  5,
  'Incredible job! My car looks brand new. Will definitely book again.'
)
RETURNING *;
```

### Sync washer rating_avg
```sql
UPDATE public.washer_profiles
SET rating_avg = (
  SELECT ROUND(AVG(rating)::numeric, 2)
  FROM public.reviews WHERE washer_id = 'WASHER-UUID'
)
WHERE id = 'WASHER-UUID';
```

### All reviews
```sql
SELECT
  r.rating, r.comment, r.created_at,
  cust.full_name AS customer,
  wash.full_name AS washer,
  b.wash_plan
FROM public.reviews r
JOIN public.profiles cust ON cust.id = r.customer_id
JOIN public.profiles wash ON wash.id = r.washer_id
JOIN public.bookings b ON b.id = r.booking_id
ORDER BY r.created_at DESC;
```

### Washer leaderboard
```sql
SELECT
  p.full_name,
  wp.rating_avg,
  wp.jobs_completed,
  COUNT(r.id) AS total_reviews
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
LEFT JOIN public.reviews r ON r.washer_id = wp.id
GROUP BY p.id, p.full_name, wp.rating_avg, wp.jobs_completed
ORDER BY wp.rating_avg DESC NULLS LAST;
```

---

## 10. Subscriptions

### Create a subscription
```sql
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
```

### Create usage tracker for this period
```sql
INSERT INTO public.subscription_usage (subscription_id, period_start, period_end, allocated, used)
VALUES ('SUBSCRIPTION-UUID', now(), now() + interval '1 month', 8, 0);
```

### Use a wash from subscription
```sql
UPDATE public.subscription_usage
SET used = used + 1
WHERE subscription_id = 'SUBSCRIPTION-UUID'
  AND period_start <= now() AND period_end >= now();
```

### Check remaining washes
```sql
SELECT allocated, used, allocated - used AS remaining, period_end
FROM public.subscription_usage
WHERE subscription_id = 'SUBSCRIPTION-UUID'
ORDER BY period_start DESC LIMIT 1;
```

### Cancel subscription
```sql
UPDATE public.subscriptions
SET status = 'cancelled', cancel_at_period_end = true, cancelled_at = now()
WHERE id = 'SUBSCRIPTION-UUID';
```

---

## 11. Notifications

### Booking confirmed (customer)
```sql
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (
  'CUSTOMER-UUID', 'booking_confirmed',
  'Wash Booked!',
  'Your Regular wash has been scheduled. Finding you a washer.',
  '{"booking_id": "BOOKING-UUID"}'::jsonb
);
```

### Washer assigned (customer)
```sql
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (
  'CUSTOMER-UUID', 'washer_assigned',
  'Washer Assigned',
  'Your washer is on the way. Track live on the map.',
  '{"booking_id": "BOOKING-UUID"}'::jsonb
);
```

### New job (washer)
```sql
INSERT INTO public.notifications (user_id, type, title, body, data)
VALUES (
  'WASHER-UUID', 'new_job',
  'New Wash Job',
  'Regular wash at 123 King St W. Accept within 60 seconds.',
  '{"booking_id": "BOOKING-UUID", "payout": 1100}'::jsonb
);
```

### Mark all read for a user
```sql
UPDATE public.notifications SET is_read = true
WHERE user_id = 'USER-UUID' AND is_read = false;
```

### Unread counts
```sql
SELECT p.full_name, p.role, COUNT(*) AS unread
FROM public.notifications n
JOIN public.profiles p ON p.id = n.user_id
WHERE n.is_read = false
GROUP BY p.id, p.full_name, p.role
ORDER BY unread DESC;
```

---

## 12. GPS Tracking

### Simulate washer moving to customer
```sql
-- Position 1: Starting point
UPDATE public.washer_profiles
SET current_lat = 43.5890, current_lng = -79.6441, location_updated_at = now()
WHERE id = 'WASHER-UUID';

-- Position 2: Midway
UPDATE public.washer_profiles
SET current_lat = 43.6100, current_lng = -79.5200, location_updated_at = now()
WHERE id = 'WASHER-UUID';

-- Position 3: Near customer
UPDATE public.washer_profiles
SET current_lat = 43.6400, current_lng = -79.4000, location_updated_at = now()
WHERE id = 'WASHER-UUID';

-- Position 4: At customer
UPDATE public.washer_profiles
SET current_lat = 43.6472, current_lng = -79.3833, location_updated_at = now()
WHERE id = 'WASHER-UUID';
```

### Find nearest washer to a location
```sql
SELECT
  p.full_name,
  wp.current_lat, wp.current_lng,
  wp.rating_avg, wp.jobs_completed,
  ROUND(
    111.045 * SQRT(
      POWER(wp.current_lat - 43.6472, 2) +
      POWER((wp.current_lng - (-79.3833)) * COS(RADIANS(43.6472)), 2)
    )::numeric, 2
  ) AS approx_km
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
WHERE wp.is_online = true AND wp.status = 'approved' AND wp.current_lat IS NOT NULL
ORDER BY approx_km ASC
LIMIT 5;
```

---

## 13. Analytics & Revenue

### Revenue summary
```sql
SELECT
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE status = 'paid') AS paid,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
  SUM(total_price) FILTER (WHERE status IN ('completed','paid')) / 100.0 AS revenue,
  SUM(washer_payout) FILTER (WHERE status IN ('completed','paid')) / 100.0 AS payouts,
  SUM(total_price - washer_payout) FILTER (WHERE status IN ('completed','paid')) / 100.0 AS gross_profit
FROM public.bookings;
```

### Revenue by wash plan
```sql
SELECT
  wash_plan,
  COUNT(*) AS bookings,
  SUM(total_price) / 100.0 AS revenue,
  ROUND(AVG(total_price) / 100.0, 2) AS avg_order
FROM public.bookings
WHERE status IN ('completed', 'paid')
GROUP BY wash_plan ORDER BY revenue DESC;
```

### Washer earnings leaderboard
```sql
SELECT
  p.full_name,
  wp.jobs_completed, wp.rating_avg,
  SUM(b.washer_payout) / 100.0 AS total_earned
FROM public.bookings b
JOIN public.profiles p ON p.id = b.washer_id
JOIN public.washer_profiles wp ON wp.id = b.washer_id
WHERE b.status IN ('completed', 'paid')
GROUP BY p.id, p.full_name, wp.jobs_completed, wp.rating_avg
ORDER BY total_earned DESC;
```

### Customer lifetime value
```sql
SELECT
  p.full_name, p.email,
  COUNT(*) AS bookings,
  SUM(b.total_price) / 100.0 AS lifetime_value,
  MAX(b.created_at) AS last_booking
FROM public.bookings b
JOIN public.profiles p ON p.id = b.customer_id
WHERE b.status IN ('completed', 'paid')
GROUP BY p.id, p.full_name, p.email
ORDER BY lifetime_value DESC;
```

### Bookings per day (last 30 days)
```sql
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS bookings,
  SUM(total_price) / 100.0 AS revenue
FROM public.bookings
WHERE created_at >= now() - interval '30 days'
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

---

## 14. Data Integrity Checks

### Vehicle not owned by booking customer
```sql
SELECT b.id, b.customer_id, v.customer_id AS vehicle_owner
FROM public.bookings b
JOIN public.vehicles v ON v.id = b.vehicle_id
WHERE b.customer_id != v.customer_id;
```

### Paid bookings with non-captured payment
```sql
SELECT id, status, payment_status
FROM public.bookings
WHERE status = 'paid' AND payment_status != 'captured';
```

### Completed bookings with no washer
```sql
SELECT id, status, washer_id
FROM public.bookings
WHERE status IN ('completed', 'paid') AND washer_id IS NULL;
```

### Duplicate primary vehicles per customer
```sql
SELECT customer_id, COUNT(*) AS primary_count
FROM public.vehicles WHERE is_primary = true
GROUP BY customer_id HAVING COUNT(*) > 1;
```

### Washer rating drift (stored vs calculated)
```sql
SELECT
  p.full_name,
  wp.rating_avg AS stored,
  ROUND(AVG(r.rating)::numeric, 2) AS actual
FROM public.washer_profiles wp
JOIN public.profiles p ON p.id = wp.id
JOIN public.reviews r ON r.washer_id = wp.id
GROUP BY p.id, p.full_name, wp.rating_avg
HAVING ABS(wp.rating_avg - ROUND(AVG(r.rating)::numeric, 2)) > 0.01;
```

### Subscription usage over limit
```sql
SELECT subscription_id, allocated, used, used - allocated AS over
FROM public.subscription_usage WHERE used > allocated;
```

### Tables missing RLS
```sql
SELECT relname AS table_name
FROM pg_class
WHERE relnamespace = 'public'::regnamespace
  AND relkind = 'r'
  AND relrowsecurity = false
ORDER BY relname;
```

---

## 15. Cleanup / Reset

> ⚠️ Only run in dev/staging — these delete data permanently.

### Delete a specific booking
```sql
DELETE FROM public.booking_photos WHERE booking_id = 'BOOKING-UUID';
DELETE FROM public.reviews WHERE booking_id = 'BOOKING-UUID';
DELETE FROM public.bookings WHERE id = 'BOOKING-UUID';
```

### Delete all bookings for a customer
```sql
DELETE FROM public.booking_photos WHERE booking_id IN (
  SELECT id FROM public.bookings WHERE customer_id = 'CUSTOMER-UUID'
);
DELETE FROM public.reviews WHERE booking_id IN (
  SELECT id FROM public.bookings WHERE customer_id = 'CUSTOMER-UUID'
);
DELETE FROM public.bookings WHERE customer_id = 'CUSTOMER-UUID';
```

### Reset washer stats
```sql
UPDATE public.washer_profiles
SET jobs_completed = 0, rating_avg = 0, is_online = false,
    current_lat = NULL, current_lng = NULL, location_updated_at = NULL
WHERE id = 'WASHER-UUID';
```

### Nuclear reset — wipe all transactional data
```sql
-- ⚠️ DO NOT RUN IN PRODUCTION
TRUNCATE public.booking_photos CASCADE;
TRUNCATE public.reviews CASCADE;
TRUNCATE public.notifications CASCADE;
TRUNCATE public.subscription_usage CASCADE;
TRUNCATE public.bookings CASCADE;
TRUNCATE public.subscriptions CASCADE;
TRUNCATE public.washer_availability CASCADE;
TRUNCATE public.washer_blocks CASCADE;
```
