-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — Row Level Security Policies
-- Enable RLS on all unprotected tables with role-based access
-- ═══════════════════════════════════════════════════════════════

-- Helper: returns the current user's role from profiles
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ═══════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read profiles (names, avatars needed in booking context)
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════
-- CUSTOMER_PROFILES
-- ═══════════════════════════════════════
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_profiles_select_own" ON public.customer_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "customer_profiles_update_own" ON public.customer_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "customer_profiles_select_admin" ON public.customer_profiles
  FOR SELECT USING (public.user_role() = 'admin');

-- ═══════════════════════════════════════
-- WASHER_PROFILES
-- ═══════════════════════════════════════
ALTER TABLE public.washer_profiles ENABLE ROW LEVEL SECURITY;

-- Washers can read their own profile
CREATE POLICY "washer_profiles_select_own" ON public.washer_profiles
  FOR SELECT USING (auth.uid() = id);

-- Customers can see approved online washers (for assignment context)
CREATE POLICY "washer_profiles_select_online" ON public.washer_profiles
  FOR SELECT USING (is_online = true AND status = 'approved');

-- Washers can update their own profile (location, online status)
CREATE POLICY "washer_profiles_update_own" ON public.washer_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all washer profiles
CREATE POLICY "washer_profiles_select_admin" ON public.washer_profiles
  FOR SELECT USING (public.user_role() = 'admin');

-- ═══════════════════════════════════════
-- VEHICLES
-- ═══════════════════════════════════════
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vehicles_select_own" ON public.vehicles
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "vehicles_insert_own" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "vehicles_update_own" ON public.vehicles
  FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "vehicles_delete_own" ON public.vehicles
  FOR DELETE USING (auth.uid() = customer_id);

-- Washers can see vehicle info for their assigned bookings
CREATE POLICY "vehicles_select_washer_booking" ON public.vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.vehicle_id = vehicles.id
        AND b.washer_id = auth.uid()
        AND b.status NOT IN ('cancelled', 'paid')
    )
  );

-- Admins can read all vehicles
CREATE POLICY "vehicles_select_admin" ON public.vehicles
  FOR SELECT USING (public.user_role() = 'admin');

-- ═══════════════════════════════════════
-- SUBSCRIPTION_PLANS (public read)
-- ═══════════════════════════════════════
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_plans_select_all" ON public.subscription_plans
  FOR SELECT USING (true);

-- Mutations handled by admin client only

-- ═══════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "subscriptions_select_admin" ON public.subscriptions
  FOR SELECT USING (public.user_role() = 'admin');

-- Mutations handled by admin client (webhook, API routes)

-- ═══════════════════════════════════════
-- SUBSCRIPTION_USAGE
-- ═══════════════════════════════════════
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscription_usage_select_own" ON public.subscription_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_usage.subscription_id
        AND s.customer_id = auth.uid()
    )
  );

CREATE POLICY "subscription_usage_select_admin" ON public.subscription_usage
  FOR SELECT USING (public.user_role() = 'admin');

-- ═══════════════════════════════════════
-- BOOKINGS
-- ═══════════════════════════════════════
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Customers see their own bookings
CREATE POLICY "bookings_select_customer" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id);

-- Washers see bookings assigned to them
CREATE POLICY "bookings_select_washer" ON public.bookings
  FOR SELECT USING (auth.uid() = washer_id);

-- Washers can see pending bookings (for job request acceptance)
CREATE POLICY "bookings_select_pending" ON public.bookings
  FOR SELECT USING (
    status = 'pending'
    AND public.user_role() = 'washer'
  );

-- Admins can read all bookings
CREATE POLICY "bookings_select_admin" ON public.bookings
  FOR SELECT USING (public.user_role() = 'admin');

-- Mutations handled by admin client (API routes enforce business logic)

-- ═══════════════════════════════════════
-- BOOKING_PHOTOS
-- ═══════════════════════════════════════
ALTER TABLE public.booking_photos ENABLE ROW LEVEL SECURITY;

-- Washers can see and insert photos for their bookings
CREATE POLICY "booking_photos_select_washer" ON public.booking_photos
  FOR SELECT USING (auth.uid() = washer_id);

CREATE POLICY "booking_photos_insert_washer" ON public.booking_photos
  FOR INSERT WITH CHECK (auth.uid() = washer_id);

-- Customers can see photos for their bookings
CREATE POLICY "booking_photos_select_customer" ON public.booking_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_photos.booking_id
        AND b.customer_id = auth.uid()
    )
  );

-- Admins can read all photos
CREATE POLICY "booking_photos_select_admin" ON public.booking_photos
  FOR SELECT USING (public.user_role() = 'admin');

-- ═══════════════════════════════════════
-- REVIEWS
-- ═══════════════════════════════════════
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are publicly readable
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);

-- Customers can insert a review for their completed booking
CREATE POLICY "reviews_insert_customer" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reviews.booking_id
        AND b.customer_id = auth.uid()
        AND b.status IN ('completed', 'paid')
    )
  );

-- ═══════════════════════════════════════
-- WASHER_AVAILABILITY
-- ═══════════════════════════════════════
ALTER TABLE public.washer_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "washer_availability_select_own" ON public.washer_availability
  FOR SELECT USING (auth.uid() = washer_id);

CREATE POLICY "washer_availability_insert_own" ON public.washer_availability
  FOR INSERT WITH CHECK (auth.uid() = washer_id);

CREATE POLICY "washer_availability_update_own" ON public.washer_availability
  FOR UPDATE USING (auth.uid() = washer_id);

CREATE POLICY "washer_availability_delete_own" ON public.washer_availability
  FOR DELETE USING (auth.uid() = washer_id);

CREATE POLICY "washer_availability_select_admin" ON public.washer_availability
  FOR SELECT USING (public.user_role() = 'admin');

-- ═══════════════════════════════════════
-- WASHER_BLOCKS
-- ═══════════════════════════════════════
ALTER TABLE public.washer_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "washer_blocks_select_own" ON public.washer_blocks
  FOR SELECT USING (auth.uid() = washer_id);

CREATE POLICY "washer_blocks_insert_own" ON public.washer_blocks
  FOR INSERT WITH CHECK (auth.uid() = washer_id);

CREATE POLICY "washer_blocks_update_own" ON public.washer_blocks
  FOR UPDATE USING (auth.uid() = washer_id);

CREATE POLICY "washer_blocks_delete_own" ON public.washer_blocks
  FOR DELETE USING (auth.uid() = washer_id);

-- ═══════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert handled by admin client (API routes, webhooks)

-- ═══════════════════════════════════════
-- SERVICE_ZONES (public read)
-- ═══════════════════════════════════════
ALTER TABLE public.service_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_zones_select_all" ON public.service_zones
  FOR SELECT USING (true);

-- Mutations handled by admin client only
