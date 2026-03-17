# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

**Driveo** — a two-sided marketplace platform ("Uber for car washing") targeting the GTA market. Next.js 15 monorepo containing marketing site, customer PWA, washer PWA, and admin dashboard.

### Key Documents

| File | Purpose |
|---|---|
| `DRIVEO_ARCHITECTURE.md` | **Primary source of truth.** System architecture, pricing model, Driveo Slide spec, database schema, API routes, development roadmap |
| `DRIVEO_DESIGN_SYSTEM.md` | Brand identity, color system, typography, components, animation, responsive breakpoints |
| `LANDING_PAGE_COPY.md` | Marketing copy for the landing page |
| `GTA_Car_Detailing_Dossier.md` | Market research: TAM/SAM/SOM, competitor landscape |

> `GLEAM_Business_Plan.md` and `GLEAM_Experience_Build.md` are **legacy/outdated** — do NOT use as reference.

## Dev Commands

```bash
npm install              # install dependencies
npm run dev              # dev server (Turbopack) on localhost:3000
npm run build            # production build
npm run lint             # next lint
```

Database migrations are run manually in the Supabase SQL Editor, in order:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_add_query_status.sql
supabase/seed.sql                            # subscription plans + service zones
```

SQL-based testing guide: `supabase/TESTING.md`

## Architecture

### Route Groups (App Router)

```
src/app/
├── page.tsx                → Marketing landing page (SSR)
├── auth/                   → Login, signup, OAuth callback
├── apply/                  → Washer application flow
├── app/                    → Customer PWA (/app/*)
│   └── layout.tsx          → CustomerNav, auth-gated
├── washer/                 → Washer PWA (/washer/*)
│   └── layout.tsx          → WasherNav, auth-gated
├── admin/                  → Admin dashboard (/admin/*)
│   └── layout.tsx          → AdminNav, auth-gated
└── api/                    → Route Handlers (see below)
```

### API Routes

- `api/auth/signup` — User registration with role assignment
- `api/bookings/` — List, `create/`, `assign/`, `capture/`
- `api/vehicles/` — Vehicle CRUD
- `api/subscriptions/` — `create/`, `cancel/`, `usage/`
- `api/washer/` — `connect/`, `location/`, `payout/`, `status/`
- `api/stripe/webhook` — Stripe event handler
- `api/notifications/` — List, `read/`
- `api/apply/` — Washer application submission
- `api/admin/washers/` — Admin washer management

### Supabase Client Pattern

Two server-side clients in `src/lib/supabase/server.ts`:
- `createClient()` — uses anon key, respects RLS (for user-scoped queries)
- `createAdminClient()` — uses service role key, bypasses RLS (for admin/system operations)

Browser client in `src/lib/supabase/client.ts` — used in client components.

Session refresh handled by middleware (`middleware.ts` → `src/lib/supabase/middleware.ts`).

### Key Lib Modules

| Module | Purpose |
|---|---|
| `src/lib/pricing.ts` | Price formula: `Base × Vehicle Multiplier × Dirt Multiplier` |
| `src/lib/assignment.ts` | Nearest-available-washer auto-assignment |
| `src/lib/stripe.ts` | Stripe client initialization |
| `src/lib/notifications.ts` | Notification helpers |
| `src/lib/vehicle-data.ts` | Vehicle makes/models/types data |
| `src/lib/vehicle-image.ts` | Vehicle image API integration |
| `src/lib/providers.tsx` | TanStack Query + Sonner toast provider (wraps app in root layout) |

### UI Layer

- **shadcn/ui** — style: `base-nova`, base color: `neutral`, CSS variables enabled, icons: `lucide`
- Components at `src/components/ui/` (standard shadcn), custom components at `src/components/`
- **Driveo Slide** — `src/components/driveo-slide/` (DirtCanvas + DriveoSlide): dirt level slider with HTML Canvas overlay
- Path aliases: `@/components`, `@/lib`, `@/hooks`

## Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase (Postgres + RLS + Auth + Realtime + Storage) · Stripe + Stripe Connect · TanStack Query · React Hook Form + Zod · Framer Motion · Google Maps API · Twilio · Resend · Sentry · Vercel

## Key Business Rules

- **Pricing**: Plan base price × vehicle type multiplier × dirt level multiplier
- **Three plans**: Regular ($18), Interior & Exterior ($25), Detailing ($189)
- **Washer payouts**: Regular/I&E = $11/wash, Detailing = $22/wash (Stripe Connect)
- **Payment flow**: Pre-authorize on booking, capture after wash completion
- **Booking lifecycle**: `pending → assigned → en_route → arrived → washing → completed → paid`
- **Washer assignment**: Automated nearest-available
- **Before/after photos**: Mandatory on every job
- **Membership**: 8 washes/month on selected plan
- **Booking types**: Instant (ASAP) or Scheduled

## Design Tokens

Dark theme (`#050505` bg), accent red (`#E23232`). Fonts: Anton (display via `font-display`), Inter (body via `font-sans`), JetBrains Mono (mono), Playfair Display (serif). See `DRIVEO_DESIGN_SYSTEM.md` for full spec.

## Environment Variables

See `.env.example` and `README.md` for the full list. Required services: Supabase, Stripe, Twilio, Resend, Google Maps, Sentry.
