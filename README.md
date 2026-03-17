# Driveo — On-Demand Car Washing Platform

> The Uber for car washing. Serving the Greater Toronto Area.

A two-sided marketplace connecting customers with professional washers — instant or scheduled, tracked in real-time, with before/after photos on every job.

**Production:** [driveo.ca](https://driveo.ca) · **Staging:** [dev.driveo.ca](https://dev.driveo.ca)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Email OTP + Google OAuth) |
| Payments | Stripe (pre-auth) + Stripe Connect (washer payouts) |
| Real-time | Supabase Realtime (live GPS tracking) |
| Maps | Google Maps API |
| SMS | Twilio |
| Email | Resend + React Email |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query |
| Deployment | Vercel |
| Monitoring | Sentry |

---

## Platform Structure

```
driveo.ca/           → Marketing site
driveo.ca/app/*      → Customer PWA
driveo.ca/washer/*   → Washer PWA
driveo.ca/admin/*    → Admin dashboard
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Stripe account (with Connect enabled)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Resend
RESEND_API_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
```

### 3. Run database migrations

In the Supabase SQL Editor, run in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_add_query_status.sql
supabase/seed.sql
```

### 4. Start the dev server

```bash
npm run dev        # http://localhost:3000
```

---

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Type-check (tsc --noEmit)
npm run clean      # Remove dist/
```

---

## Pricing Model

**Formula:** `Base Price × Vehicle Multiplier × Dirt Multiplier + 13% HST`

### Wash Plans

| Plan | Base Price | Washer Payout |
|------|-----------|---------------|
| Regular | $18.00 | $11.00 |
| Interior & Exterior | $25.00 | $11.00 |
| Detailing | $189.00 | $22.00 |

### Vehicle Multipliers

| Type | Multiplier |
|------|-----------|
| Sedan / Coupe | 1.00x |
| Crossover | 1.15x |
| SUV / Minivan | 1.25x |
| Pickup | 1.20x |
| Large SUV / Truck | 1.40x |

### Dirt Level Multipliers (Driveo Slide)

| Level | Multiplier | Label |
|-------|-----------|-------|
| 0–5 | 1.00x | Light to normal |
| 6 | 1.15x | Moderately dirty |
| 7 | 1.30x | Dirty |
| 8 | 1.50x | Very dirty |
| 9 | 1.75x | Heavily soiled |
| 10 | 2.00x | Extreme |

---

## User Roles

| Role | Access |
|------|--------|
| `customer` | Book washes, manage vehicles, subscriptions, live tracking |
| `washer` | Job queue, accept/decline jobs, upload photos, view earnings |
| `admin` | Full platform management — washers, customers, bookings, payouts |

---

## Booking Lifecycle

```
pending → assigned → en_route → arrived → washing → completed → paid
                                                              ↘ cancelled
                                                              ↘ disputed
```

| Status | Description |
|--------|-------------|
| `pending` | Created, searching for washer |
| `assigned` | Washer found and accepted |
| `en_route` | Washer driving to customer |
| `arrived` | Washer at service location |
| `washing` | Wash in progress |
| `completed` | Wash done, photos uploaded |
| `paid` | Payment captured |

---

## Monthly Memberships

- 8 washes/month based on selected plan
- Subscription plans: Regular ($119/mo), I&E ($159/mo), Detailing ($999/mo)
- Subscription washes are $0 charge to customer; washer still receives flat payout

---

## Key Directories

```
src/
├── app/
│   ├── page.tsx              ← Marketing landing page
│   ├── app/                  ← Customer PWA (/app/*)
│   │   ├── home/             ← Customer dashboard
│   │   ├── book/             ← Booking flow
│   │   ├── track/[id]/       ← Live booking tracker
│   │   └── vehicles/         ← Vehicle management
│   ├── washer/               ← Washer PWA (/washer/*)
│   │   ├── home/             ← Washer dashboard
│   │   └── jobs/             ← Job queue
│   ├── admin/                ← Admin dashboard (/admin/*)
│   └── auth/                 ← Auth pages + OAuth callback
├── components/
│   ├── nav/                  ← CustomerNav, WasherNav
│   └── ui/                   ← shadcn/ui components
├── lib/
│   ├── supabase/             ← Supabase client (browser + server)
│   └── pricing.ts            ← Pricing constants + calculatePrice()
supabase/
├── migrations/               ← Database schema migrations
├── seed.sql                  ← Subscription plans + service zones
├── TESTING.md                ← Full SQL testing guide
├── e2e_testing.sql           ← E2E test queries
├── test_booking_flow.sql     ← Booking state machine test queries
└── sql_editor_queries.sql    ← General debug queries
```

---

## Testing

See [`supabase/TESTING.md`](supabase/TESTING.md) for the full SQL testing guide covering:

- Customer registration & profile flow
- Vehicle CRUD
- Washer onboarding & approval
- Booking creation with pricing math
- Full booking lifecycle (state machine)
- Payment transitions
- Before/after photos
- Reviews & ratings
- Subscriptions
- Notifications
- GPS tracking simulation
- Data integrity checks
- Cleanup / reset queries

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Washer | `testwasher@driveo.ca` | `testWasher123!` |

---

## Design Tokens

| Token | Value |
|-------|-------|
| Background | `#050505` |
| Card | `#0c0c0c` / `#0e0e0e` |
| Accent Red | `#E23232` |
| Font Display | Anton |
| Font Body | Inter |
| Font Mono | JetBrains Mono |

---

## GTA Launch Zones

| Zone | Postal Prefixes | Launch Date |
|------|----------------|-------------|
| Etobicoke | M8, M9 | April 1, 2026 |
| Mississauga Central | L4Z, L5B | April 1, 2026 |
| Mississauga East | L5G, L5J | April 1, 2026 |
