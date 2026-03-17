-- ═══════════════════════════════════════════════════════════════
-- DRIVEO — Initial Database Schema
-- Full migration based on DRIVEO_ARCHITECTURE.md Section 7.2
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════
-- PROFILES (extends Supabase auth.users)
-- ═══════════════════════════════════════

CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('customer', 'washer', 'admin')),
  full_name   text NOT NULL,
  phone       text,
  email       text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE public.customer_profiles (
  id                uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  default_address   text,
  default_lat       numeric(10,7),
  default_lng       numeric(10,7),
  default_postal    text,
  referral_code     text UNIQUE,
  referred_by       uuid REFERENCES public.profiles(id),
  subscription_id   uuid,
  stripe_customer_id text,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE public.washer_profiles (
  id                    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                text NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','approved','suspended','rejected')),
  bio                   text,
  service_zones         text[],           -- postal code prefixes: {"L4Z","L5B","M9C"}
  vehicle_make          text,
  vehicle_model         text,
  vehicle_year          int,
  vehicle_plate         text,
  tools_owned           text[],
  insurance_verified    boolean DEFAULT false,
  background_check_done boolean DEFAULT false,
  stripe_account_id     text,             -- Stripe Connect Express
  rating_avg            numeric(3,2) DEFAULT 0,
  jobs_completed        int DEFAULT 0,
  is_online             boolean DEFAULT false,
  current_lat           numeric(10,7),
  current_lng           numeric(10,7),
  location_updated_at   timestamptz,
  created_at            timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- VEHICLES
-- ═══════════════════════════════════════

CREATE TABLE public.vehicles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make         text NOT NULL,
  model        text NOT NULL,
  year         int NOT NULL,
  color        text,
  plate        text,
  type         text NOT NULL CHECK (type IN (
                 'sedan','coupe','suv','crossover',
                 'minivan','pickup','large_suv','convertible'
               )),
  image_url    text,                      -- cached car image from CarAPI
  is_primary   boolean DEFAULT false,
  nickname     text,
  created_at   timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- SUBSCRIPTIONS (created before bookings so bookings can reference)
-- ═══════════════════════════════════════

CREATE TABLE public.subscription_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  wash_plan         text NOT NULL CHECK (wash_plan IN (
                      'regular', 'interior_exterior', 'detailing'
                    )),
  monthly_price     int NOT NULL,          -- in cents
  washes_per_month  int NOT NULL DEFAULT 8,
  stripe_price_id   text,
  description       text,
  is_active         boolean DEFAULT true,
  display_order     int DEFAULT 0
);

CREATE TABLE public.subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id              uuid NOT NULL REFERENCES public.profiles(id),
  plan_id                  uuid NOT NULL REFERENCES public.subscription_plans(id),
  vehicle_id               uuid NOT NULL REFERENCES public.vehicles(id),
  stripe_subscription_id   text NOT NULL UNIQUE,
  status                   text NOT NULL DEFAULT 'active' CHECK (status IN (
                              'active','paused','past_due','cancelled'
                            )),
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean DEFAULT false,
  created_at               timestamptz DEFAULT now(),
  cancelled_at             timestamptz
);

CREATE TABLE public.subscription_usage (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id),
  period_start    timestamptz NOT NULL,
  period_end      timestamptz NOT NULL,
  allocated       int NOT NULL DEFAULT 8,
  used            int DEFAULT 0,
  UNIQUE (subscription_id, period_start)
);

-- ═══════════════════════════════════════
-- BOOKINGS
-- ═══════════════════════════════════════

CREATE TABLE public.bookings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id             uuid NOT NULL REFERENCES public.profiles(id),
  washer_id               uuid REFERENCES public.profiles(id),
  vehicle_id              uuid NOT NULL REFERENCES public.vehicles(id),

  wash_plan               text NOT NULL CHECK (wash_plan IN (
                            'regular', 'interior_exterior', 'detailing'
                          )),
  dirt_level              int NOT NULL CHECK (dirt_level BETWEEN 0 AND 10),

  status                  text NOT NULL DEFAULT 'pending' CHECK (status IN (
                            'pending',       -- just created, searching for washer
                            'assigned',      -- washer found, awaiting acceptance
                            'en_route',      -- washer driving to customer
                            'arrived',       -- washer at location
                            'washing',       -- wash in progress
                            'completed',     -- wash done, photos uploaded
                            'paid',          -- payment captured
                            'cancelled',     -- cancelled
                            'disputed'       -- issue raised
                          )),

  -- Location
  service_address         text NOT NULL,
  service_lat             numeric(10,7) NOT NULL,
  service_lng             numeric(10,7) NOT NULL,
  location_notes          text,

  -- Scheduling
  is_instant              boolean DEFAULT true,
  scheduled_at            timestamptz,
  estimated_duration_min  int,

  -- Pricing (all in cents)
  base_price              int NOT NULL,     -- plan base price
  vehicle_multiplier      numeric(4,2) NOT NULL DEFAULT 1.00,
  dirt_multiplier         numeric(4,2) NOT NULL DEFAULT 1.00,
  final_price             int NOT NULL,     -- base × vehicle × dirt
  hst_amount              int NOT NULL,     -- 13% HST
  total_price             int NOT NULL,     -- final + HST
  washer_payout           int NOT NULL,     -- 1100 or 2200 (cents)

  -- Payment
  payment_status          text DEFAULT 'pending' CHECK (payment_status IN (
                            'pending','authorized','captured','refunded','failed'
                          )),
  stripe_payment_intent_id text,

  -- Subscription (if booking from membership)
  subscription_id         uuid REFERENCES public.subscriptions(id),

  -- Timestamps
  washer_assigned_at      timestamptz,
  washer_en_route_at      timestamptz,
  washer_arrived_at       timestamptz,
  wash_started_at         timestamptz,
  wash_completed_at       timestamptz,
  payment_captured_at     timestamptz,

  customer_notes          text,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- PHOTOS
-- ═══════════════════════════════════════

CREATE TABLE public.booking_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  washer_id    uuid NOT NULL REFERENCES public.profiles(id),
  photo_type   text NOT NULL CHECK (photo_type IN ('before','after')),
  storage_path text NOT NULL,
  angle_label  text CHECK (angle_label IN (
                 'front','rear','driver_side','passenger_side','interior'
               )),
  created_at   timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- REVIEWS
-- ═══════════════════════════════════════

CREATE TABLE public.reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL UNIQUE REFERENCES public.bookings(id),
  customer_id   uuid NOT NULL REFERENCES public.profiles(id),
  washer_id     uuid NOT NULL REFERENCES public.profiles(id),
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  created_at    timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- WASHER AVAILABILITY
-- ═══════════════════════════════════════

CREATE TABLE public.washer_availability (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  washer_id    uuid NOT NULL REFERENCES public.profiles(id),
  day_of_week  int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   time NOT NULL,
  end_time     time NOT NULL,
  is_available boolean DEFAULT true
);

CREATE TABLE public.washer_blocks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  washer_id    uuid NOT NULL REFERENCES public.profiles(id),
  blocked_from timestamptz NOT NULL,
  blocked_to   timestamptz NOT NULL,
  reason       text
);

-- ═══════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════

CREATE TABLE public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id),
  type       text NOT NULL,
  title      text NOT NULL,
  body       text NOT NULL,
  data       jsonb,
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- SERVICE ZONES
-- ═══════════════════════════════════════

CREATE TABLE public.service_zones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  postal_prefixes text[] NOT NULL,
  is_active       boolean DEFAULT true,
  launch_date     date
);

-- ═══════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_washer ON bookings(washer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX idx_booking_photos_booking ON booking_photos(booking_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_washer_availability_washer ON washer_availability(washer_id);
CREATE INDEX idx_washer_profiles_online ON washer_profiles(is_online) WHERE is_online = true;
CREATE INDEX idx_washer_profiles_location ON washer_profiles(current_lat, current_lng) WHERE is_online = true;
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
