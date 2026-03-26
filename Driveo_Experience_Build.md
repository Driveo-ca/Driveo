# GLEAM — PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Proprietary Platform: "Uber for Car Detailing"
### Next.js + Supabase + Stripe | PWA | 3–4 Month MVP
**Version 2.0 | February 2026**

---

## 1. PRODUCT VISION

GLEAM is a two-sided marketplace platform for on-demand and scheduled car detailing and washing in the GTA. Customers book services through a clean, Uber-quality web app. Certified GLEAM providers accept jobs, navigate to the customer, upload before/after photo proof, and get paid automatically. The platform handles pricing (based on vehicle type), scheduling, real-time status, photo documentation, subscriptions, and fleet accounts.

**This document is the complete specification for the MVP build.**

---

## 2. USER ROLES & PERMISSIONS

| Role | Description | Access |
|---|---|---|
| **Customer** | End consumer booking services | Customer web app (`/app/*`) |
| **Provider** | Certified detailing partner delivering services | Provider web app (`/provider/*`) |
| **Admin** | GLEAM operations team | Admin dashboard (`/admin/*`) |
| **Fleet Manager** | B2B account manager (Phase 2) | Fleet portal (`/fleet/*`) |

**Auth implementation:** Supabase Auth with `user_metadata.role` set on signup. Row Level Security (RLS) policies on all tables enforce role separation at the database level.

---

## 3. DATABASE SCHEMA

### 3.1 Core Tables

```sql
-- ─────────────────────────────────────────────────
-- USERS & PROFILES
-- ─────────────────────────────────────────────────

-- Extends Supabase auth.users
CREATE TABLE public.profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role              text NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  full_name         text NOT NULL,
  phone             text,
  avatar_url        text,
  stripe_customer_id text,               -- set when first payment is made
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TABLE public.customer_profiles (
  id                uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  default_address   text,
  default_lat       numeric(10,7),
  default_lng       numeric(10,7),
  default_postal    text,
  referral_code     text UNIQUE,         -- e.g., "MOHIT42" — generated on signup
  referred_by       uuid REFERENCES public.profiles(id),
  subscription_id   uuid                 -- FK to subscriptions (set when active plan exists)
);

CREATE TABLE public.provider_profiles (
  id                    uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                text NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','approved','suspended','rejected')),
  bio                   text,
  service_zones         text[],          -- array of postal code prefixes, e.g. {"L4Z","L5B","M9C"}
  vehicle_make          text,
  vehicle_model         text,
  vehicle_year          int,
  vehicle_plate         text,
  tools_owned           text[],          -- ["vacuum","polisher","steamer"]
  insurance_verified    boolean DEFAULT false,
  background_check_done boolean DEFAULT false,
  stripe_account_id     text,            -- Stripe Connect Express account ID
  rating_avg            numeric(3,2) DEFAULT 0,
  jobs_completed        int DEFAULT 0,
  is_online             boolean DEFAULT false,  -- Phase 2: availability toggle
  current_lat           numeric(10,7),   -- Phase 2: live location
  current_lng           numeric(10,7),
  location_updated_at   timestamptz,
  application_notes     text,
  admin_notes           text,
  created_at            timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- VEHICLES
-- ─────────────────────────────────────────────────

CREATE TABLE public.vehicles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  make         text NOT NULL,            -- "Toyota"
  model        text NOT NULL,            -- "RAV4"
  year         int NOT NULL,
  color        text,
  plate        text,
  type         text NOT NULL CHECK (type IN (
                 'sedan','coupe','suv','crossover',
                 'minivan','pickup','large_suv','convertible','other'
               )),
  is_primary   boolean DEFAULT false,
  nickname     text,                     -- "My Blue RAV4"
  notes        text,                     -- "Has dog hair in back seat"
  created_at   timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- SERVICES & PRICING
-- ─────────────────────────────────────────────────

CREATE TABLE public.service_types (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,   -- "Full Detail"
  slug                  text UNIQUE NOT NULL, -- "full-detail"
  description           text,
  duration_sedan_min    int NOT NULL,    -- estimated minutes for sedan
  duration_suv_min      int NOT NULL,
  duration_pickup_min   int NOT NULL,
  duration_minivan_min  int NOT NULL,
  duration_large_suv_min int NOT NULL,
  -- Pricing by vehicle type (in cents CAD to avoid float errors)
  price_sedan           int NOT NULL,
  price_coupe           int NOT NULL,
  price_suv             int NOT NULL,
  price_crossover       int NOT NULL,
  price_minivan         int NOT NULL,
  price_pickup          int NOT NULL,
  price_large_suv       int NOT NULL,
  price_convertible     int NOT NULL,
  is_addon              boolean DEFAULT false,
  is_subscription_eligible boolean DEFAULT true,
  is_active             boolean DEFAULT true,
  display_order         int DEFAULT 0,
  image_url             text,
  created_at            timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- BOOKINGS (core transaction entity)
-- ─────────────────────────────────────────────────

CREATE TABLE public.bookings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id          uuid NOT NULL REFERENCES public.profiles(id),
  provider_id          uuid REFERENCES public.profiles(id),  -- null until assigned
  vehicle_id           uuid NOT NULL REFERENCES public.vehicles(id),
  service_type_id      uuid NOT NULL REFERENCES public.service_types(id),

  status               text NOT NULL DEFAULT 'pending' CHECK (status IN (
                         'pending',     -- created, awaiting provider assignment
                         'assigned',    -- admin/system assigned provider
                         'accepted',    -- provider confirmed
                         'en_route',    -- provider is driving to customer
                         'arrived',     -- provider at location
                         'in_progress', -- service has started
                         'completed',   -- service done, photos uploaded
                         'cancelled',   -- cancelled by customer or system
                         'disputed'     -- complaint raised
                       )),

  -- Location
  service_address      text NOT NULL,
  service_lat          numeric(10,7),
  service_lng          numeric(10,7),
  location_type        text CHECK (location_type IN (
                         'home','condo_underground','condo_surface',
                         'office','parking_lot','other'
                       )),
  location_notes       text,            -- "Visitor spot P2, Unit 405, gate code 1234"

  -- Scheduling
  scheduled_at         timestamptz NOT NULL,
  is_asap              boolean DEFAULT false,   -- Phase 2
  estimated_duration   int,             -- minutes (calculated from service + vehicle type)

  -- Pricing
  base_price           int NOT NULL,    -- in cents
  addons_total         int DEFAULT 0,   -- in cents
  discount_amount      int DEFAULT 0,   -- in cents (coupon/referral)
  total_price          int NOT NULL,    -- in cents

  -- Payment
  payment_status       text DEFAULT 'pending' CHECK (payment_status IN (
                         'pending','authorized','captured','refunded','failed'
                       )),
  stripe_payment_intent_id text,
  stripe_subscription_id   text,        -- if from subscription allocation

  -- Provider tracking (Phase 2)
  provider_en_route_at  timestamptz,
  provider_arrived_at   timestamptz,
  service_started_at    timestamptz,
  service_completed_at  timestamptz,

  -- Customer notes
  customer_notes       text,
  internal_notes       text,            -- admin only

  -- Timestamps
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE public.booking_addons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_type_id uuid NOT NULL REFERENCES public.service_types(id),
  price           int NOT NULL   -- in cents, price at time of booking
);

-- ─────────────────────────────────────────────────
-- PHOTOS
-- ─────────────────────────────────────────────────

CREATE TABLE public.booking_photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider_id  uuid NOT NULL REFERENCES public.profiles(id),
  photo_type   text NOT NULL CHECK (photo_type IN ('before','after')),
  storage_path text NOT NULL,    -- Supabase Storage path: "photos/{booking_id}/{before|after}/{filename}"
  storage_url  text,             -- signed URL (regenerated on access)
  angle_label  text,             -- "front","rear","driver_side","passenger_side","interior_front","interior_rear","wheels","other"
  created_at   timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- REVIEWS & RATINGS
-- ─────────────────────────────────────────────────

CREATE TABLE public.reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL UNIQUE REFERENCES public.bookings(id),
  customer_id   uuid NOT NULL REFERENCES public.profiles(id),
  provider_id   uuid NOT NULL REFERENCES public.profiles(id),
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  is_public     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────────

CREATE TABLE public.subscription_plans (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,    -- "GLEAM Go"
  slug                 text UNIQUE NOT NULL, -- "go"
  monthly_price        int NOT NULL,     -- in cents
  stripe_price_id      text,             -- Stripe Price ID
  description          text,
  is_active            boolean DEFAULT true,
  display_order        int DEFAULT 0
);

CREATE TABLE public.subscription_plan_services (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          uuid NOT NULL REFERENCES public.subscription_plans(id),
  service_type_id  uuid NOT NULL REFERENCES public.service_types(id),
  quantity          int NOT NULL DEFAULT 1   -- services included per month
);

CREATE TABLE public.subscriptions (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id              uuid NOT NULL REFERENCES public.profiles(id),
  plan_id                  uuid NOT NULL REFERENCES public.subscription_plans(id),
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
  service_type_id uuid NOT NULL REFERENCES public.service_types(id),
  period_start    timestamptz NOT NULL,
  period_end      timestamptz NOT NULL,
  allocated       int NOT NULL,    -- how many included this period
  used            int DEFAULT 0,   -- how many have been booked
  UNIQUE (subscription_id, service_type_id, period_start)
);

-- ─────────────────────────────────────────────────
-- PROVIDER AVAILABILITY
-- ─────────────────────────────────────────────────

CREATE TABLE public.provider_availability (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id  uuid NOT NULL REFERENCES public.profiles(id),
  day_of_week  int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
  start_time   time NOT NULL,
  end_time     time NOT NULL,
  is_available boolean DEFAULT true
);

CREATE TABLE public.provider_blocks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id  uuid NOT NULL REFERENCES public.profiles(id),
  blocked_from timestamptz NOT NULL,
  blocked_to   timestamptz NOT NULL,
  reason       text
);

-- ─────────────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────────────

CREATE TABLE public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id),
  type       text NOT NULL,    -- "booking_confirmed","provider_en_route","job_complete","review_reminder","subscription_renewed", etc.
  title      text NOT NULL,
  body       text NOT NULL,
  data       jsonb,            -- arbitrary payload (e.g., {booking_id: "..."})
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- SERVICE ZONES
-- ─────────────────────────────────────────────────

CREATE TABLE public.service_zones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,     -- "Etobicoke", "Mississauga Central"
  postal_prefixes text[] NOT NULL,  -- {"M8","M9","M8W"}
  is_active      boolean DEFAULT true,
  launch_date    date
);
```

### 3.2 RLS Policy Summary

```sql
-- profiles: users can read/update their own row only
-- vehicles: customers can CRUD their own; providers can read assigned booking vehicle
-- bookings: customers see their own; providers see assigned; admin sees all
-- booking_photos: providers can INSERT for their jobs; customers can SELECT their booking photos
-- reviews: customers can INSERT once per booking; public can SELECT
-- subscriptions: customers see their own; admin sees all
-- notifications: users see their own only
```

---

## 4. AUTHENTICATION FLOWS

### 4.1 Customer Sign-Up

```
1. /app/signup
   → Full name, email or phone, password
   → Supabase createUser() → profile row created with role='customer'
   → customer_profiles row created with generated referral_code
   → Redirect to /app/onboarding/vehicle

2. /app/onboarding/vehicle
   → Vehicle type (visual card selector: Sedan/SUV/Pickup/Minivan/Large SUV/Other)
   → Make, model, year, color (optional), plate (optional)
   → Vehicle saved → redirect to /app/onboarding/location

3. /app/onboarding/location
   → "Where do we usually serve you?"
   → Address with Google Places autocomplete
   → Location type: Home / Condo / Office / Other
   → If condo: additional fields (unit #, parking spot, gate code, building notes)
   → Saved → redirect to /app/home
   → SMS verification if phone provided (Twilio OTP)
```

### 4.2 Provider Sign-Up

```
1. /provider/signup (or /apply)
   → Full name, email, phone
   → Supabase createUser() with role='provider', status='pending'

2. /provider/onboarding (multi-step form)
   Step 1: Personal info + bio
   Step 2: Service zones (checkboxes: Etobicoke, Mississauga Central, etc.)
   Step 3: Vehicle info (type, make, model, year, plate)
   Step 4: Tools owned (checkboxes: vacuum, polisher, steamer, etc.)
   Step 5: Availability (day/time grid)
   Step 6: Upload docs (insurance certificate, gov ID) → Supabase Storage
   Step 7: Agreement to Service Partner Agreement (checkbox + timestamp)
   → Submit → status stays 'pending' → admin notified

3. Admin reviews application → approves or rejects
   → Status updated to 'approved' / 'rejected'
   → Email sent via Resend with Stripe Connect onboarding link (if approved)

4. Provider completes Stripe Connect Express onboarding
   → stripe_account_id saved to provider_profiles
   → Provider can now accept jobs and receive payouts
```

---

## 5. CUSTOMER WEB APP — SCREEN SPECIFICATIONS

### App URL structure: `gleam.ca/app/*`

### 5.1 Home Screen (`/app/home`)

```
┌─────────────────────────────────────┐
│  GLEAM                    [Profile] │
├─────────────────────────────────────┤
│  Hi, [Name] 👋                      │
│  Your [Make Model] is ready         │
│  for a clean.                       │
│                                     │
│  ┌──────────── BOOK NOW ──────────┐ │
│  │  📍 [Default address]    [✎]  │ │
│  │  🚗 [Primary vehicle]    [✎]  │ │
│  │                                │ │
│  │  What service do you need?     │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐     │ │
│  │  │ 💧  │ │ 🪣  │ │ ✨  │     │ │
│  │  │Quick│ │ Int │ │Full │     │ │
│  │  │$69  │ │$119 │ │$229 │     │ │
│  │  └─────┘ └─────┘ └─────┘     │ │
│  │  [See all services →]          │ │
│  └────────────────────────────────┘ │
│                                     │
│  ── ACTIVE BOOKING ──               │
│  [If active booking: status card]   │
│                                     │
│  ── UPCOMING ──                     │
│  [Next scheduled booking card]      │
│                                     │
│  ── YOUR PLAN ──                    │
│  [Subscription status card or       │
│   "Join a plan and save" CTA]       │
└─────────────────────────────────────┘
```

**Service cards:** Tapping any service → go to service detail / booking flow.

### 5.2 Booking Flow

**Step 1: Service Selection (`/app/book`)**
```
Full list of services as cards:
- Service name
- Short description
- Duration estimate (based on selected vehicle type)
- Price (based on selected vehicle type)
- "Popular" / "Recommended" badge where applicable

Add-ons section below main services:
- Salt Flush +$59
- Pet Hair Removal +$89
- Odor Treatment +$109
- etc.

[Continue →] button sticky at bottom
```

**Step 2: Vehicle Selection (`/app/book/vehicle`)**
```
If customer has multiple vehicles:
→ Card list of their vehicles with type icon, make/model/year, estimated price updated live

"Add a new vehicle" option at bottom

[Continue →]
```

**Step 3: Location (`/app/book/location`)**
```
Default address pre-filled from profile.
[Change address] → Google Places autocomplete input

Location type selector (tabs):
  [🏠 Home] [🏢 Condo] [💼 Office] [🅿️ Parking Lot]

If Condo selected → show extra fields:
  - Unit / Suite #
  - Parking spot #
  - Gate code
  - Building access notes
  - "Is there drainage in the parking area?" (Yes/No/Don't know)
    → If Yes or unknown → provider will use waterless method

[Continue →]
```

**Step 4: Date & Time (`/app/book/schedule`)**
```
Calendar (next 14 days, greyed out days with no provider availability)
Time slot grid for selected day:
  8:00 AM  ●  9:00 AM  ●  10:00 AM  ●  ...
  (Available slots based on provider availability in that zone)

"Estimated completion: [time] based on [duration] for your [vehicle]"

[Continue →]
```

**Step 5: Order Summary & Payment (`/app/book/confirm`)**
```
Order summary card:
  ✓ [Service name]                     $XXX
  ✓ [Add-on if any]                   +$XX
  ✓ Vehicle: [Make Model Year]
  ✓ Date: [Day, Month Date] at [Time]
  ✓ Location: [Address]
  ─────────────────────────────────────
  Subtotal                             $XXX
  HST (13%)                           +$XX
  Discount (if any)                   -$XX
  ─────────────────────────────────────
  Total                                $XXX

Payment method:
  [Stripe Elements card input]
  or [Saved card ending in XXXX]
  [ ] Save this card for future bookings

Promo code: [__________] [Apply]

[Confirm & Pay →]
```

On confirmation:
→ Stripe PaymentIntent created + captured
→ Booking row created with status='pending'
→ Admin notified (email + in-app) to assign provider
→ Customer sees confirmation screen → redirect to booking status page

### 5.3 Booking Status Screen (`/app/bookings/[id]`)

**This is the Uber-equivalent real-time status screen.**

```
┌─────────────────────────────────────┐
│  ← Back          Booking #1042      │
├─────────────────────────────────────┤
│                                     │
│  ● PROVIDER EN ROUTE                │
│  Alex K. is on the way              │
│  ★ 4.9 · 147 jobs                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      [MAP PLACEHOLDER]      │   │
│  │  Phase 2: Live provider dot │   │
│  │  Phase 1: Static address    │   │
│  │  with Google Maps embed     │   │
│  └─────────────────────────────┘   │
│                                     │
│  STATUS TIMELINE:                   │
│  ✅ Booking confirmed   10:23 AM    │
│  ✅ Provider assigned   10:31 AM    │
│  ✅ Provider en route   11:02 AM    │
│  ⏳ Provider arrived    —           │
│  ○  Service in progress —           │
│  ○  Complete            —           │
│                                     │
│  📍 Service location:               │
│  123 Erin Mills Pkwy, P2 Spot 14   │
│  🚗 2022 Toyota RAV4 (Silver)      │
│  🧹 Full Detail + Salt Flush        │
│  ⏱️  Est. 3.5 hours                 │
│                                     │
│  [📞 Contact Provider]              │
└─────────────────────────────────────┘
```

**Phase 1 (MVP):** Status updates are text-based (provider manually taps status in their app → customer's screen refreshes). Map shows static Google Maps embed of the service address.

**Phase 2:** Supabase Realtime subscription on `provider_profiles.current_lat/lng` → live dot moves on customer's map.

**Status flow and customer messaging:**

| Status Change | Customer Screen Update | SMS Sent |
|---|---|---|
| `pending` → `assigned` | "Provider assigned" | "Your GLEAM provider [Name] has been assigned. See details: [link]" |
| `assigned` → `accepted` | "Provider confirmed" | None (covered by assigned) |
| `accepted` → `en_route` | "Provider is on the way" + ETA | "Alex is on the way! ETA ~20 min." |
| `en_route` → `arrived` | "Provider has arrived" | "Your provider is here 🚗" |
| `arrived` → `in_progress` | "Service in progress" | None |
| `in_progress` → `completed` | "Your GLEAM is done!" + photo link | "Done! See your before & after: [link]. Rate Alex: [link]" |

### 5.4 Service Complete Screen (`/app/bookings/[id]/complete`)

```
┌─────────────────────────────────────┐
│  ✅ Your GLEAM is complete!          │
├─────────────────────────────────────┤
│                                     │
│  BEFORE & AFTER                     │
│  ┌──────────┬──────────┐           │
│  │  BEFORE  │  AFTER   │           │
│  │ [photo]  │ [photo]  │           │
│  └──────────┴──────────┘           │
│  ← Swipe to see all 8 photos →     │
│                                     │
│  [Share your photos] (social share) │
│                                     │
│  ─────────────────────────────────  │
│  How was Alex K.?                   │
│  ★ ★ ★ ★ ★  (tap to rate)          │
│  [Leave a comment (optional)]       │
│  [Submit Review]                    │
│                                     │
│  ─────────────────────────────────  │
│  Want this every month?             │
│  Join GLEAM Plus — $109/month       │
│  [See plans →]                      │
└─────────────────────────────────────┘
```

### 5.5 Subscription Management (`/app/subscription`)

```
┌─────────────────────────────────────┐
│  Your GLEAM Plan                    │
├─────────────────────────────────────┤
│                                     │
│  GLEAM PLUS            $109/month  │
│  Next billing: March 15, 2026      │
│                                     │
│  THIS MONTH'S SERVICES:             │
│  ✅ Interior Refresh    (booked)    │
│  ⏳ Express Shine       (1 of 1     │
│                          remaining) │
│  [Book Express Shine →]             │
│                                     │
│  ─────────────────────────────────  │
│  [Skip this month]                  │
│  [Change plan]                      │
│  [Cancel subscription]              │
│                                     │
│  BILLING HISTORY:                   │
│  Feb 15  GLEAM Plus  $109  ✓ Paid  │
│  Jan 15  GLEAM Plus  $109  ✓ Paid  │
└─────────────────────────────────────┘
```

### 5.6 Other Customer Screens

| Screen | Path | Key Content |
|---|---|---|
| Profile | `/app/profile` | Name, email, phone, edit; referral code + referral count; notification preferences |
| My Vehicles | `/app/vehicles` | List of vehicles + add new; edit/delete; set primary |
| Booking History | `/app/bookings` | Chronological list; status badges; tap to see detail + photos |
| Plans & Pricing | `/app/plans` | Subscription tier comparison; Join / Upgrade / Downgrade |
| Notifications | `/app/notifications` | In-app notification feed |
| Settings | `/app/settings` | Change password; payment methods; address; notifications |

---

## 6. PROVIDER WEB APP — SCREEN SPECIFICATIONS

### App URL structure: `gleam.ca/provider/*`

### 6.1 Provider Dashboard (`/provider/dashboard`)

```
┌─────────────────────────────────────┐
│  GLEAM Provider        [Alex K.] ▼  │
├─────────────────────────────────────┤
│                                     │
│  TODAY                              │
│  ┌────────────────────────────────┐ │
│  │  3 jobs scheduled              │ │
│  │  Est. earnings today: $312     │ │
│  │  [View today's jobs →]         │ │
│  └────────────────────────────────┘ │
│                                     │
│  ─── NEXT JOB ───                   │
│  ┌────────────────────────────────┐ │
│  │  Full Detail                   │ │
│  │  Today at 10:00 AM             │ │
│  │  📍 123 Erin Mills Pkwy P2-14  │ │
│  │  🚗 2022 Toyota RAV4 (Silver)  │ │
│  │  ⏱️ Est. 3.5 hrs · $229         │ │
│  │  [View details →]              │ │
│  └────────────────────────────────┘ │
│                                     │
│  ─── THIS WEEK ───                  │
│  Mon ●●○  Tue ●○○  Wed ○○○         │
│  (dots = jobs scheduled)            │
│                                     │
│  ─── STATS ───                      │
│  ★ 4.9    Jobs: 147    MTD: $2,140 │
└─────────────────────────────────────┘
```

### 6.2 Job Queue (`/provider/jobs`)

```
Tabs: [Upcoming] [In Progress] [Completed] [Available]

UPCOMING tab:
  Card per job:
  - Service name + date/time
  - Vehicle make/model/type
  - Address (partial — e.g., "Erin Mills, L5N")
  - Estimated duration + earnings
  - Status badge

AVAILABLE tab (Phase 2 — for instant dispatch):
  - Jobs in your zone needing a provider
  - [Accept Job] button with countdown timer (30 sec to accept)
```

### 6.3 Active Job Screen (`/provider/jobs/[id]`)

**This is the provider's Uber driver equivalent.**

```
┌─────────────────────────────────────┐
│  ← Back     Full Detail    #1042   │
├─────────────────────────────────────┤
│                                     │
│  CUSTOMER: Sarah M.                 │
│  📞 [Call] [SMS]                    │
│                                     │
│  🚗 2022 Toyota RAV4 (Silver)       │
│     Plate: ABCD 123                 │
│     Notes: "Dog hair in back seat"  │
│                                     │
│  📍 123 Erin Mills Pkwy             │
│     P2, Spot 14, Unit 512           │
│     Gate code: 4521                 │
│     "Condo underground — use        │
│      waterless method"              │
│                                     │
│  [Open in Google Maps]              │
│                                     │
│  ─── CHECKLIST ───                  │
│  Before photos: 0/5 ❌              │
│  After photos:  0/5 ❌              │
│                                     │
│  ─── STATUS ───                     │
│  ○ Accepted  ✅                     │
│  ○ En Route  → [I'm on my way]      │
│  ○ Arrived   → [I've arrived]       │
│  ○ In Progress → [Start service]    │
│  ○ Complete  → [Mark complete]      │
│    (disabled until 5+ after photos) │
└─────────────────────────────────────┘
```

**Status tap logic:**
- Each button is only enabled when the previous status is set
- "Mark complete" is **disabled** until `after_photos.count >= 5`
- This enforces the photo documentation requirement at the data layer

### 6.4 Photo Upload (`/provider/jobs/[id]/photos`)

```
┌─────────────────────────────────────┐
│  ← Job #1042      PHOTOS           │
├─────────────────────────────────────┤
│                                     │
│  BEFORE PHOTOS (5 required)         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │Front│ │Rear │ │Left │ │Right│  │
│  │ ✅  │ │ ✅  │ │ ✅  │ │ ✅  │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│  ┌─────┐                            │
│  │ Int.│ + [Add photo]              │
│  │ ✅  │                            │
│  └─────┘                            │
│                                     │
│  AFTER PHOTOS (5 required)          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │Front│ │Rear │ │Left │ │Right│  │
│  │ ✅  │ │ ✅  │ │  +  │ │  +  │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                     │
│  Upload: [📷 Take Photo]            │
│          [🖼 Choose from gallery]   │
│                                     │
│  [Mark job complete] (greyed        │
│  until 5 before + 5 after)          │
└─────────────────────────────────────┘
```

**Technical implementation:**
- `<input type="file" accept="image/*" capture="environment">` → triggers camera on mobile
- On select: compress to max 2MB (browser-side with `browser-image-compression` npm package)
- Upload to Supabase Storage bucket: `booking-photos/{booking_id}/{before|after}/{uuid}.jpg`
- Insert row into `booking_photos`
- Presigned URL generated → photo shown as thumbnail immediately

### 6.5 Provider Earnings (`/provider/earnings`)

```
Tabs: [Summary] [History] [Payouts]

SUMMARY:
  This month:         $1,840
  Pending payout:     $420
  Last payout:        $1,420 (Feb 1)
  Total all-time:     $18,240

  Jobs this month: 18
  Avg per job: $102
  Avg rating: 4.92 ★

HISTORY (per job):
  Feb 24  Full Detail          $110  ✓ Paid
  Feb 23  Interior Refresh     $58   ✓ Paid
  Feb 22  Express × 2          $64   ✓ Paid
  ...

PAYOUTS:
  Feb 1   $1,420  → RBC ****4512  ✓ Transferred
  Jan 1   $1,680  → RBC ****4512  ✓ Transferred
```

Payouts triggered weekly or biweekly by admin via Stripe Connect Transfer API.

### 6.6 Provider Availability (`/provider/availability`)

```
Weekly grid (Mon–Sun × time slots):
  Toggle each day on/off.
  Set start and end time per day.
  "Block dates" for vacations/unavailability.

Zones served:
  ☑ Etobicoke (M8, M9)
  ☑ Mississauga Central (L4Z, L5B)
  ☐ Mississauga East (L5G, L5J)
  ☐ Brampton (add when expanded)
```

---

## 7. ADMIN DASHBOARD — SCREEN SPECIFICATIONS

### URL: `gleam.ca/admin/*` (protected by admin role check)

### 7.1 Overview Dashboard (`/admin`)

```
KPI Cards (today / this month / all time):
  Total Revenue  |  Active Bookings  |  Providers Online  |  New Customers
  $3,240         |  7                |  3                  |  14

Charts:
  - Revenue over time (line chart)
  - Bookings by status (donut)
  - Jobs by zone (bar chart)

Alerts:
  ⚠️  2 providers have no payout method set
  ⚠️  Booking #1038 has been 'pending' for 4+ hours
  ✅  3 new provider applications need review
```

### 7.2 Bookings Management (`/admin/bookings`)

```
Table: all bookings with filters:
  Status | Zone | Provider | Date Range | Service Type

Columns:
  ID | Customer | Provider | Service | Vehicle | Address | Date | Status | Total | Actions

Per-row actions:
  [Assign Provider ▼]  (dropdown of available providers in zone)
  [View Details]
  [Cancel]
  [Flag / Dispute]

Booking detail page:
  - All booking info + vehicle info
  - Customer contact
  - Provider assigned
  - Before/after photos (admin can view all)
  - Status timeline with timestamps
  - Payment details (Stripe payment intent link)
  - Internal notes field
```

### 7.3 Provider Management (`/admin/providers`)

```
Table with filters: status (pending/approved/suspended)

Per-row actions:
  [Approve]  [Suspend]  [View Application]  [View Performance]

Provider detail page:
  - Profile info + contact
  - Application documents (insurance cert, ID)
  - Jobs history + avg rating
  - Earnings + payout history
  - Zones served
  - [Approve] / [Suspend] / [Add admin note]
  - [Trigger Stripe Connect onboarding link]

Provider application review:
  - All submitted fields visible
  - Document viewer for insurance cert and ID
  - Checklist: ☐ Insurance verified ☐ Background check ☐ Test detail passed
  - [Approve] → status = 'approved' + send welcome email with Stripe Connect link
  - [Reject] → status = 'rejected' + send rejection email with reason
```

### 7.4 Customer Management (`/admin/customers`)

```
Table: ID | Name | Email | Phone | Bookings | Subscription | Joined

Customer detail:
  - Profile + vehicles
  - Booking history
  - Subscription status + billing
  - Reviews written
  - Referral activity
  - Notes field
```

### 7.5 Pricing Management (`/admin/pricing`)

```
Table of service_types with inline editing:
  Service | Sedan | Coupe | SUV | Crossover | Minivan | Pickup | Large SUV
  Full Detail | $229 | $229 | $279 | $269 | $279 | $269 | $299
  [Edit] per row

Subscription plans:
  List of plans with monthly price, included services, Stripe Price ID
  [Edit plan] | [Activate/Deactivate]
```

### 7.6 Payouts (`/admin/payouts`)

```
Table of completed, unpaid jobs by provider:
  Provider | Jobs completed | Earnings pending | Last payout

[Trigger Payout] → calls Stripe Connect Transfers API for selected provider
  → Creates transfer from GLEAM Stripe account to provider connected account
  → Updates payout records in DB

Payout history:
  Date | Provider | Amount | Status | Stripe Transfer ID
```

---

## 8. API ARCHITECTURE

### 8.1 Next.js Route Handlers (`/app/api/*`)

```
POST   /api/auth/signup                → create profile + customer_profile rows
POST   /api/auth/provider-signup       → create profile + provider_profile rows (status=pending)

GET    /api/services                   → list active service_types
GET    /api/services/[id]              → single service + pricing by vehicle type

GET    /api/availability               → available time slots for given date + zone
POST   /api/bookings                   → create booking + Stripe PaymentIntent
GET    /api/bookings/[id]              → booking detail (RLS enforced)
PATCH  /api/bookings/[id]/status       → update booking status (provider or admin)

POST   /api/bookings/[id]/photos       → upload before/after photo to Supabase Storage
GET    /api/bookings/[id]/photos       → get signed URLs for photos

GET    /api/subscriptions/plans        → list active subscription plans
POST   /api/subscriptions              → create Stripe Subscription + insert into DB
DELETE /api/subscriptions/[id]         → cancel subscription (Stripe + DB)
POST   /api/subscriptions/[id]/pause   → pause billing via Stripe

GET    /api/provider/jobs              → provider's upcoming/active jobs (RLS)
PATCH  /api/provider/jobs/[id]/status  → update job status + trigger notifications
GET    /api/provider/earnings          → earnings summary for provider

POST   /api/admin/providers/[id]/approve  → approve provider application
POST   /api/admin/bookings/[id]/assign    → assign provider to booking
POST   /api/admin/payouts/trigger         → trigger Stripe Connect payout

POST   /api/webhooks/stripe            → handle Stripe events (sub created/cancelled, payment succeeded/failed)
```

### 8.2 Key Business Logic Functions (server-side)

```typescript
// pricing.ts
function calculatePrice(serviceTypeId: string, vehicleType: VehicleType): number
// Returns base price in cents from service_types table for given vehicle type

// availability.ts
function getAvailableSlots(date: Date, postalCode: string): TimeSlot[]
// Queries provider_availability - provider_blocks for providers in matching zone
// Returns array of available {time, providerId, estimatedDuration} objects

// dispatch.ts (MVP: manual; Phase 2: auto)
async function assignProviderToBooking(bookingId: string, providerId: string): void
// Updates booking.provider_id + status='assigned'
// Sends notification to provider + customer

// notifications.ts
async function sendBookingNotification(bookingId: string, event: NotificationEvent): void
// Writes to notifications table + triggers Twilio SMS + Resend email

// photos.ts
async function uploadBookingPhoto(
  bookingId: string, providerId: string, photoType: 'before'|'after',
  file: File, angleLabel: string
): Promise<string>
// Uploads to Supabase Storage, inserts booking_photos row, returns signed URL

// subscriptions.ts
async function checkSubscriptionAllocation(
  customerId: string, serviceTypeId: string
): Promise<{hasAllocation: boolean, remainingThisPeriod: number}>
// Checks subscription_usage for current period to see if service is included

// payouts.ts
async function triggerProviderPayout(providerId: string): Promise<void>
// Gets unpaid completed jobs for provider
// Creates Stripe Connect Transfer to provider's connected account
// Updates booking payment records
```

### 8.3 Stripe Webhook Events to Handle

```typescript
// /api/webhooks/stripe
switch (event.type) {
  case 'payment_intent.succeeded':
    // Update booking.payment_status = 'captured'
    // Send confirmation SMS + email to customer

  case 'payment_intent.payment_failed':
    // Update booking.payment_status = 'failed'
    // Notify customer + cancel booking if not resolved in 1hr

  case 'customer.subscription.created':
    // Insert subscriptions row + subscription_usage rows for current period
    // Send welcome email

  case 'customer.subscription.updated':
    // Update status, period dates

  case 'customer.subscription.deleted':
    // Update subscription status = 'cancelled'
    // Send cancellation confirmation

  case 'invoice.payment_failed':
    // Update subscription status = 'past_due'
    // Send "payment failed" SMS + email
    // Retry logic handled by Stripe (3 attempts over 8 days)
}
```

---

## 9. SUPABASE STORAGE STRUCTURE

```
Buckets:
  booking-photos     (private — access via signed URLs)
    /{booking_id}/before/{uuid}.jpg
    /{booking_id}/after/{uuid}.jpg

  provider-documents (private — admin access only)
    /{provider_id}/insurance-cert.pdf
    /{provider_id}/government-id.jpg

  profile-avatars    (public)
    /{user_id}/avatar.jpg

Signed URL policy: booking-photos URLs expire in 24 hours.
On access, generate fresh signed URL from storage_path stored in booking_photos table.
```

---

## 10. NOTIFICATION SYSTEM

### 10.1 Trigger Matrix

| Trigger | In-App | SMS (Twilio) | Email (Resend) |
|---|---|---|---|
| Booking created | Customer ✅ | Customer ✅ | Customer ✅ |
| Provider assigned | Customer ✅ | Customer ✅ | — |
| Provider en route | Customer ✅ | Customer ✅ | — |
| Provider arrived | Customer ✅ | Customer ✅ | — |
| Job in progress | Customer ✅ | — | — |
| Job complete | Customer ✅ | Customer ✅ (with photo link) | Customer ✅ (with photos) |
| Review reminder | Customer ✅ | Customer ✅ (24hr after) | — |
| Subscription billed | Customer ✅ | — | Customer ✅ (Stripe) |
| Subscription payment failed | Customer ✅ | Customer ✅ | Customer ✅ |
| New job assigned | Provider ✅ | Provider ✅ | — |
| New application | Admin ✅ | — | Admin ✅ |
| Booking pending 4hr+ | Admin ✅ | — | Admin ✅ |

### 10.2 SMS Templates (Twilio)

```typescript
const templates = {
  booking_confirmed: (name: string, service: string, date: string, link: string) =>
    `Hi ${name}! Your GLEAM ${service} is confirmed for ${date}. Track here: ${link}`,

  provider_en_route: (name: string, providerName: string, eta: string, link: string) =>
    `${providerName} is on their way to you, ${name}! ETA ~${eta} min. Track: ${link}`,

  job_complete: (name: string, link: string, reviewLink: string) =>
    `Your GLEAM is done, ${name}! 🚗✨ See before & after photos: ${link}\nRate your service: ${reviewLink}`,

  review_24hr: (name: string, providerName: string, reviewLink: string) =>
    `Hi ${name}, how was your GLEAM with ${providerName}? 30 seconds to rate: ${reviewLink}`,

  subscription_payment_failed: (name: string, updateLink: string) =>
    `Hi ${name}, your GLEAM subscription payment failed. Update your card to keep your plan: ${updateLink}`,
}
```

---

## 11. REAL-TIME TRACKING — PHASE 2 IMPLEMENTATION

When ready to build live tracking:

### Provider Side
```typescript
// Provider app: every 10 seconds while job status is 'en_route' or 'arrived'
navigator.geolocation.watchPosition(async (pos) => {
  await supabase
    .from('provider_profiles')
    .update({
      current_lat: pos.coords.latitude,
      current_lng: pos.coords.longitude,
      location_updated_at: new Date().toISOString()
    })
    .eq('id', providerId)
}, null, { enableHighAccuracy: true, maximumAge: 5000 })
```

### Customer Side
```typescript
// Customer booking status page: subscribe to provider location changes
const channel = supabase
  .channel('provider-location')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'provider_profiles',
    filter: `id=eq.${booking.provider_id}`
  }, (payload) => {
    // Update Google Maps marker with new lat/lng
    providerMarker.setPosition({
      lat: payload.new.current_lat,
      lng: payload.new.current_lng
    })
  })
  .subscribe()
```

---

## 12. PRICING LOGIC

### Vehicle Type Price Multipliers

| Vehicle Type | Multiplier vs. Sedan | Rationale |
|---|---|---|
| Sedan | 1.0× (base) | Standard |
| Coupe | 1.0× | Same size as sedan |
| Crossover | 1.15× | Slightly larger |
| SUV | 1.25× | More surface area + interior |
| Minivan | 1.25× | Large interior |
| Pickup Truck | 1.20× | Bed adds exterior work |
| Large SUV | 1.40× | Largest vehicle class |
| Convertible | 1.0× | Same as sedan (soft top care adds time but not price) |

### Example Pricing Matrix (in CAD)

| Service | Sedan | Crossover | SUV | Minivan | Pickup | Large SUV |
|---|---|---|---|---|---|---|
| Express Shine | $69 | $79 | $89 | $89 | $85 | $99 |
| Interior Refresh | $119 | $139 | $149 | $149 | $139 | $169 |
| Full Detail | $229 | $259 | $289 | $289 | $279 | $319 |
| Deep Restoration | $369 | $419 | $459 | $459 | $449 | $519 |
| Protection Package | $429 | $489 | $539 | $539 | $519 | $599 |

---

## 13. BUILD TIMELINE (3–4 Month MVP)

### Month 1 — Foundation + Auth + Data Layer

| Week | Deliverables |
|---|---|
| Week 1 | Project setup: Next.js 14 + Supabase + Vercel. Domain, email. Core DB schema created. Supabase RLS policies written. Auth (signup/login) working for all 3 roles. |
| Week 2 | Customer onboarding flow: signup → vehicle add → address. Vehicle type selector UI. Google Places autocomplete on address fields. |
| Week 3 | Service catalog + pricing engine. Service list page. Price calculator (service × vehicle type). Admin pricing management. |
| Week 4 | Provider onboarding form (multi-step). Admin approval flow. Provider availability setup. Email notifications via Resend. |

### Month 2 — Core Booking Flow + Payments

| Week | Deliverables |
|---|---|
| Week 5 | Booking flow: service → vehicle → location → schedule → summary. Availability engine (query provider availability by date + zone). |
| Week 6 | Stripe integration: PaymentIntent on booking confirm. Webhook handler (payment succeeded/failed). Booking created + status flow. |
| Week 7 | Provider job view: dashboard, job list, active job detail, status tap buttons. SMS notifications via Twilio (all trigger events). |
| Week 8 | Admin dashboard: overview, booking management, provider management, assign provider to booking. |

### Month 3 — Photos + Subscriptions + Polish

| Week | Deliverables |
|---|---|
| Week 9 | Before/after photo upload (provider-side): camera input, compression, Supabase Storage upload, thumbnail display. Photo viewer (customer-side): gallery with before/after comparison. |
| Week 10 | Subscription plans: Stripe Billing products + prices. Subscribe flow. subscription_usage tracking. Subscription management screen (skip/cancel). |
| Week 11 | Reviews + ratings. Booking complete screen. Rating prompt. Provider profile with public rating. Admin earnings + payout trigger (Stripe Connect). |
| Week 12 | Polish: loading states, error handling, empty states, mobile responsive fine-tuning. End-to-end test of full booking flow. Sentry error monitoring live. |

### Month 4 — Launch Prep + Go-Live

| Week | Deliverables |
|---|---|
| Week 13 | Marketing site (Next.js SSR): Home, Plans, How it Works, Condo landing, Driver landing, Fleet landing, Service area pages. SEO meta tags. |
| Week 14 | Beta test: 5–10 real bookings with 2 real providers. Fix critical bugs. Google Business Profile live. |
| Week 15 | SMS + email flows end-to-end verified. Security audit (RLS, exposed keys, input validation). Performance audit (Lighthouse). |
| Week 16 | Public launch. First Google Ads campaign. First Instagram content post. |

---

## 14. FILE/FOLDER STRUCTURE

```
gleam/
├── app/                              # Next.js App Router
│   ├── (marketing)/                  # Marketing site (SSR, public)
│   │   ├── page.tsx                  # Home
│   │   ├── plans/page.tsx
│   │   ├── how-it-works/page.tsx
│   │   ├── condo/page.tsx
│   │   ├── driver-plan/page.tsx
│   │   ├── fleet/page.tsx
│   │   ├── etobicoke/page.tsx        # Local SEO
│   │   ├── mississauga/page.tsx
│   │   └── apply/page.tsx            # Provider application
│   ├── app/                          # Customer web app (auth-protected)
│   │   ├── layout.tsx
│   │   ├── home/page.tsx
│   │   ├── book/
│   │   │   ├── page.tsx              # Service selection
│   │   │   ├── vehicle/page.tsx
│   │   │   ├── location/page.tsx
│   │   │   ├── schedule/page.tsx
│   │   │   └── confirm/page.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx              # History
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Status / tracking
│   │   │       └── complete/page.tsx
│   │   ├── subscription/page.tsx
│   │   ├── vehicles/page.tsx
│   │   ├── profile/page.tsx
│   │   └── notifications/page.tsx
│   ├── provider/                     # Provider web app (auth-protected)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Active job
│   │   │       └── photos/page.tsx
│   │   ├── earnings/page.tsx
│   │   ├── availability/page.tsx
│   │   └── profile/page.tsx
│   ├── admin/                        # Admin dashboard (admin role only)
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Overview
│   │   ├── bookings/page.tsx
│   │   ├── providers/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── payouts/page.tsx
│   ├── auth/
│   │   ├── signup/page.tsx
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx         # Supabase OAuth callback
│   └── api/
│       ├── webhooks/
│       │   └── stripe/route.ts
│       ├── bookings/
│       │   ├── route.ts              # POST create booking
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── status/route.ts
│       │       └── photos/route.ts
│       ├── services/route.ts
│       ├── availability/route.ts
│       ├── subscriptions/route.ts
│       ├── provider/
│       │   ├── jobs/route.ts
│       │   └── earnings/route.ts
│       └── admin/
│           ├── providers/[id]/approve/route.ts
│           ├── bookings/[id]/assign/route.ts
│           └── payouts/trigger/route.ts
├── components/
│   ├── ui/                           # Shadcn/ui components
│   ├── booking/                      # Booking flow components
│   ├── maps/                         # Google Maps components
│   ├── photos/                       # Photo upload/viewer components
│   ├── provider/                     # Provider-specific components
│   └── admin/                        # Admin dashboard components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server-side Supabase client
│   │   └── middleware.ts             # Auth middleware
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   ├── twilio/
│   │   └── sms.ts
│   ├── resend/
│   │   └── email.ts
│   └── utils/
│       ├── pricing.ts                # Price calculation logic
│       ├── availability.ts           # Slot calculation logic
│       ├── notifications.ts
│       └── photos.ts
├── supabase/
│   ├── migrations/                   # All DB migrations
│   │   └── 001_initial_schema.sql
│   └── seed.sql                      # Seed data (service types, plans, zones)
└── types/
    ├── database.ts                   # Auto-generated Supabase types
    └── index.ts                      # App-level types
```

---

## 15. LAUNCH CHECKLIST

### Security
```
□ All Supabase RLS policies tested for each role
□ API routes verify auth session on every request
□ Stripe webhook signature verification enabled
□ No API keys in client-side code (env variables only)
□ CORS configured correctly on Supabase
□ Input validation on all form submissions
□ Photo upload: file type + size limits enforced server-side
□ Admin routes protected by role check middleware
```

### Performance
```
□ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
□ Images: next/image with size optimization
□ Fonts: next/font (no layout shift)
□ API routes: response < 500ms on cold start
□ Supabase: indexes on bookings(customer_id), bookings(provider_id),
            bookings(status), bookings(scheduled_at),
            booking_photos(booking_id)
```

### Pre-Launch
```
□ End-to-end test: customer signup → book → pay → provider accepts →
  photos uploaded → complete → review → payout
□ Stripe test mode → live mode switch
□ Twilio: real phone numbers verified
□ Resend: domain verified (hello@gleam.ca)
□ Google Maps API key: domain restriction set to gleam.ca
□ Error monitoring (Sentry) live
□ Vercel: production environment variables set
□ Custom domain gleam.ca pointing to Vercel
□ SSL certificate active
□ Google Analytics + Meta Pixel installed on marketing pages
```

---

*PRD v2.0 | February 2026 | GLEAM Auto Care Inc.*
*Tech lead: Founder. Stack: Next.js 14 + Supabase + Stripe + Vercel.*
*This document is the source of truth for MVP scope. Update as decisions change.*
