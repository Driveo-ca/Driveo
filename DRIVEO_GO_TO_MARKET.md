# Driveo — Go-To-Market Playbook

**Last updated:** March 29, 2026
**Status:** Pre-launch (zero washes completed)
**Launch zones:** Etobicoke (M8/M9), Mississauga Central (L4Z/L5B), Mississauga East (L5G/L5J)
**Budget:** $500–$2,000 (lean paid)
**Team:** Solo founder (full-time job on the side, ~5–7 hrs/week available)

---

## What Driveo Is

Two-sided marketplace for on-demand mobile car washing in the GTA. Customers book via app, a vetted washer comes to them — driveway, condo parking, office lot. Everything digital: booking, payment, real-time tracking, before/after photo proof.

**URL:** driveo.ca
**Customer app:** driveo.ca/app
**Washer app:** driveo.ca/washer
**Washer recruitment page:** driveo.ca/apply
**Admin dashboard:** driveo.ca/admin

---

## Pricing

### One-Time Washes

| Plan | Base Price | Duration |
|------|-----------|----------|
| Regular (exterior only) | $18 | 30–45 min |
| Interior & Exterior | $25 | 60–90 min |
| Detailing | $189 | 3–5 hrs |

Dynamic pricing: `Base × Vehicle Multiplier (1.0x–1.4x) × Dirt Multiplier (1.0x–2.0x) + 13% HST`

### Monthly Subscriptions

| Plan | Price/mo | Inclusions |
|------|---------|------------|
| DRIVEO Go | $49 | 2x Express (built for Uber/Lyft drivers) |
| DRIVEO Plus | $79 | 1x Full + 1x Express |
| DRIVEO Full | $129 | 2x Full + 1x Interior + 1x Express |

### Washer Payouts

- Regular / I&E: **$11/wash** (flat)
- Detailing: **$22/wash** (flat)
- Paid weekly via Stripe Connect

---

## The Cold Start Strategy: Supply First

### Why Supply First

1. **Empty supply = broken product.** If a customer books and nobody shows up, you lose them forever. If you have washers and no customers, you just haven't turned on the tap yet.
2. **Supply acquisition is free right now.** Kijiji, Facebook Marketplace, and Instagram are full of independent detailers already advertising their services. The pitch: "Stop hustling for leads. We send you jobs."
3. **You only need 5–10 washers to launch** in Etobicoke + Mississauga.
4. **Demand costs money** (ads, content). Lock in supply before spending a dollar on demand.

---

## Phase 0: Fix the Foundation (Week 1)

### Already Done ✅

- [x] **Landing page copy revised** — all fake social proof replaced with honest pre-launch messaging
  - "4.9 on Google / 2,400+ Cars Washed" → "Now Booking in the GTA / Vetted Pros Only"
  - Fake customer reviews → "Our Promise" section (photo proof, insurance, 30-sec booking, satisfaction guarantee)
  - "500+ condo washes" → "100% Waterless. Zero Violations."
  - Fake JSON-LD ratings and reviews removed
- [x] **Images optimized** — 111MB → 3.4MB (97% reduction). Landing page now loads on mobile.
- [x] **GA4 conversion events** — tracking signup, login, booking, subscription, washer application, CTA clicks
- [x] **UTM parameter tracking** — captures source/medium/campaign from URLs, stores in DB on signup, fires with all GA4 events

### Still To Do

- [ ] **Set up Google Business Profile** for "DRIVEO Auto Care" in Mississauga (free, critical for local SEO)
- [ ] **Wire SMS notifications** (Twilio configured but not connected) — customers need booking confirmation texts
- [ ] **Wire email notifications** (Resend configured but not connected) — booking receipts, washer assignment updates
- [ ] **Do 10–20 free/discounted test washes** to validate the full flow and collect real reviews (see Phase 2)

---

## Phase 1: Recruit 5–8 Washers (Weeks 1–3) — $0

### Target Profile

**Small detailing businesses** (not solo independents) — they already have:
- Van/vehicle
- Professional products and equipment
- Insurance
- Experience

### Where to Find Them

| Platform | Search Terms | Action |
|----------|-------------|--------|
| **Kijiji** | "car detailing", "mobile car wash" in GTA | DM the posters |
| **Facebook Marketplace** | Same search terms | DM the businesses |
| **Instagram** | `#torontodetailing` `#gtadetailing` `#mobilecarwash` | DM accounts with 500–5K followers |
| **Google Maps** | "mobile car detailing Mississauga/Etobicoke" | Call/text the businesses |

### Outreach Message (Copy-Paste, Personalize Name)

> Hey [Name], saw your detailing work — looks great. I'm launching DRIVEO, a car wash booking app in the GTA. We send you customers, you do the wash, we handle booking + payment. You'd earn $11–22/wash with zero marketing on your end. Interested in a 5-min call?

### Tracking

Use a simple Google Sheet:

| Name | Platform | Phone/IG | Status | Notes |
|------|----------|----------|--------|-------|
| Example Detailing Co. | Kijiji | 416-xxx | Contacted 3/29 | Has van, 3 years exp |

### Time: 30 min/day for 2 weeks = 15–20 conversations → 5–8 signups

### Onboarding a Washer

1. Send them to **driveo.ca/apply**
2. They fill out the 5-step onboarding form (basic info, location, experience, documents)
3. You approve them in **driveo.ca/admin** → Washers section
4. They set up Stripe Connect for payouts
5. They're live and can receive jobs

---

## Phase 2: Validation Washes (Weeks 3–5) — ~$200–400

**This is non-negotiable.** You need real washes before spending on ads.

### How

- Offer friends, family, coworkers free or $10 washes
- Post on personal social media: "Testing my new car wash app — free wash for the first 15 people in Etobicoke/Mississauga"
- Each wash = 1 Google review ask + 1 before/after photo set

### What You Get After 15 Washes

- [ ] Real Google reviews (aim for 10–15 five-star reviews)
- [ ] Real before/after photos for the website (replace the stock ones)
- [ ] Proof the full booking → wash → payment flow works end-to-end
- [ ] Bug fixes from real usage
- [ ] Confidence to spend ad money

### After Collecting Real Reviews

Update the landing page:
- Add real Google rating to hero section
- Add real testimonials to the reviews section
- Update JSON-LD structured data with real aggregate rating
- Replace "Now Booking in the GTA" with "4.9★ on Google" (once earned)

---

## Phase 3: Turn On Demand (Weeks 5–8) — $300–1,500

### Tier 1: Free / Organic ($0)

- [ ] Post before/after content on **Instagram/TikTok** (@driveo.ca) 3x/week
- [ ] Post in local **Facebook groups** (Mississauga Community, Etobicoke Neighbours, condo resident groups)
- [ ] **Kijiji ad**: "Mobile Car Wash — We Come to You — Book Online" (free to post in Services)
- [ ] Share washer recruitment page in detailing Facebook groups

### Tier 2: Lean Paid ($300–800)

- [ ] **Google Ads** (highest intent buyers):
  - Keywords: "mobile car wash Mississauga", "car detailing near me", "car wash Etobicoke"
  - Budget: $10–15/day
  - Target: 3km radius around launch zones
  - Landing page: driveo.ca (with real reviews by now)

- [ ] **UTM links for every ad:**
  ```
  driveo.ca?utm_source=google&utm_medium=cpc&utm_campaign=gta_car_wash
  driveo.ca?utm_source=instagram&utm_medium=paid&utm_campaign=spring_launch
  driveo.ca?utm_source=kijiji&utm_medium=organic&utm_campaign=services_listing
  ```

### Tier 3: Scale ($800–1,500)

- [ ] **Instagram/Facebook Ads:**
  - Format: Before/after carousel + "Book in 30 seconds" CTA
  - Audience: 25–45 year olds, Etobicoke + Mississauga
  - Interests: Cars, condos, Uber driving, car enthusiasts
  - Budget: $15–25/day

- [ ] **Condo partnerships** (highest leverage, lowest cost):
  - Email property managers at M City, Absolute World, Erin Square, Sherway Gate
  - Offer: "20% off first wash for all residents"
  - One email to a building manager = 200–500 potential customers
  - Template below

### Condo Partnership Email Template

> Subject: Free car wash service for [Building Name] residents
>
> Hi [Property Manager],
>
> I'm [Your Name] from DRIVEO — we're a mobile car wash service launching in [Mississauga/Etobicoke]. We use 100% waterless products (zero runoff, zero building violations) and wash cars in underground parking.
>
> We'd love to offer [Building Name] residents 20% off their first wash as an exclusive perk. We handle everything digitally — booking, payment, before/after photos — so there's no admin work on your end.
>
> Would you be open to us including a flyer in the next resident newsletter or posting on the building's bulletin board?
>
> Happy to do a free demo wash for you or your team.
>
> Best,
> [Your Name]
> DRIVEO — driveo.ca

---

## Weekly Time Budget

| Activity | Hours/Week | Phase |
|----------|-----------|-------|
| Washer outreach DMs | 3.5 hrs (30 min/day) | Phase 1 only (weeks 1–3) |
| Monitor bookings + customer comms | 1.75 hrs (15 min/day) | Ongoing |
| Social media posts (batch on Sunday) | 2 hrs | Phase 3+ |
| Ad management + UTM tracking | 30 min | Phase 3+ |
| **Total** | **~5–7 hrs/week** | |

---

## Key Marketing URLs

| Purpose | URL |
|---------|-----|
| Customer landing page | `driveo.ca` |
| Customer signup | `driveo.ca/auth/signup` |
| Washer recruitment | `driveo.ca/apply` |
| Google Ads landing | `driveo.ca?utm_source=google&utm_medium=cpc&utm_campaign=[campaign_name]` |
| Instagram Ads landing | `driveo.ca?utm_source=instagram&utm_medium=paid&utm_campaign=[campaign_name]` |
| Kijiji listing | `driveo.ca?utm_source=kijiji&utm_medium=organic&utm_campaign=services_listing` |
| Facebook group post | `driveo.ca?utm_source=facebook&utm_medium=organic&utm_campaign=community_post` |
| Condo partnership | `driveo.ca?utm_source=condo&utm_medium=partnership&utm_campaign=[building_name]` |
| TikTok bio | `driveo.ca?utm_source=tiktok&utm_medium=organic&utm_campaign=bio_link` |

**Always use UTM parameters.** This is how you'll know which channel is working.

---

## Measuring Success

### GA4 Events Being Tracked

| Event | What It Means |
|-------|--------------|
| `cta_click` | Someone clicked "Book Now" or "Book My Wash" on the landing page |
| `sign_up` | Someone created an account (includes method + role) |
| `login` | Returning user logged in |
| `purchase` | Booking was created and payment authorized (includes plan + dollar value) |
| `subscribe` | Subscription purchased (includes plan + monthly price) |
| `washer_application_submitted` | A washer applied through /apply |

### To Mark as Conversions in GA4

Go to **GA4 Admin → Events** → toggle "Mark as conversion" next to:
- `sign_up`
- `purchase`
- `subscribe`
- `washer_application_submitted`

### UTM Attribution

Every signup stores UTM params in the database (`customer_profiles.utm_data`). You can query:
```sql
SELECT utm_data->>'utm_source' as source,
       utm_data->>'utm_campaign' as campaign,
       COUNT(*) as signups
FROM customer_profiles
WHERE utm_data IS NOT NULL
GROUP BY 1, 2
ORDER BY signups DESC;
```

---

## Key Metrics to Track Weekly

| Metric | Target (Month 1) | Target (Month 2) |
|--------|------------------|------------------|
| Washers recruited | 5–8 | 10–15 |
| Washes completed | 15–20 (validation) | 50–100 |
| Customer signups | 20–30 | 100+ |
| Google reviews | 10–15 | 25+ |
| Cost per acquisition | $0 (organic) | <$15 (paid) |
| Washer applications | 10–15 | 20+ |

---

## Database Migration Required

Run this in the Supabase SQL Editor before going live:

```sql
-- File: supabase/migrations/006_add_utm_data.sql
ALTER TABLE public.customer_profiles
  ADD COLUMN IF NOT EXISTS utm_data jsonb;
```

---

## Tech Changes Made (For Developer Reference)

### Images Compressed (commit: `3565f98`)
- 2 PNGs converted to WebP (33MB + 29MB → 148KB + 97KB)
- 17 JPEGs compressed (resized to 1920px/1200px, quality 80)
- Originals backed up in `public/originals/` (gitignored)
- `BeforeAfterSlider.tsx` updated to reference `.webp` files

### GA4 Conversion Events (commit: `6174cda`)
- Created `src/lib/analytics.ts` — lightweight helper for all event tracking
- Wired into: signup, login, booking, subscription, washer application, CTA clicks
- Events include UTM campaign data when available

### UTM Tracking (commit: `9d6748d`)
- UTM params captured on landing page load → `sessionStorage`
- Sent with signup API → stored in `customer_profiles.utm_data` (jsonb)
- Included in all GA4 events as `campaign_source`, `campaign_medium`, `campaign_name`
- DB migration: `supabase/migrations/006_add_utm_data.sql`

### Landing Page Honesty Pass (commit: `5b8badb`)
- Hero: fake stats → "Now Booking in the GTA / Vetted Pros Only"
- GoogleReviews: fake testimonials → "Our Promise" guarantee cards
- CondoSection: "500+ washes / 0 complaints" → "100% Waterless. Zero Violations."
- JSON-LD: removed fake aggregateRating + 3 fake reviews
- FAQ: removed "washed hundreds" claim
- data.ts: removed fake reviews array

### Branch
All changes on: `claude/analyze-driveo-startup-32OvU`
