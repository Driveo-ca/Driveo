# GLEAM — BUSINESS PLAN
## Model 4: Proprietary Technology Platform — "Uber for Car Care"
### Mobile Car Detailing + Wash Subscription, Etobicoke/Mississauga → GTA
**Version 2.0 | February 2026 | Confidential**

---

## EXECUTIVE SUMMARY

**Company:** GLEAM Auto Care Inc. (operating as GLEAM)
**Model:** Technology-owned managed service network — digital booking, subscription billing, and brand ownership combined with a certified partner network for service delivery
**Geography:** Launch in Etobicoke/Mississauga (West GTA); expand to North York, Scarborough, Downtown, and East GTA in Year 2
**Stage:** Pre-revenue; ready to launch

**The Problem**
Toronto's 2.9M registered vehicles are served by a fragmented, phone-based, trust-deficit car detailing market. No operator offers: digital-first booking, guaranteed quality with photo proof, recurring subscriptions with self-serve management, or a service designed for the city's 30%+ condo-dwelling, no-driveway population.

**The Solution**
GLEAM is a proprietary two-sided marketplace platform — the "Uber for car care." Customers open the GLEAM web app, add their vehicle(s), pin their location, select a service, and are matched to a nearby certified GLEAM provider. The provider accepts the job, drives to the customer, uploads before photos, completes the service, uploads after photos, and the customer sees everything in real time. Recurring subscribers pay monthly; providers are independent certified operators dispatched through the GLEAM platform.

**Why Proprietary Platform (not third-party tools)**
- GLEAM owns 100% of the technology, data, and customer relationships — no dependency on Jobber, third-party CRMs, or aggregator platforms
- The platform is the moat: proprietary booking, dispatch, photo proof, tracking, and billing create switching costs for both customers and providers
- Investors value technology platforms at 5–10× revenue multiples vs. 1–2× for service businesses
- Competitor replication requires months of engineering — brand + code + data together = defensible
- Long-term: the platform can expand to other service categories (home cleaning, pet grooming, etc.) using the same two-sided marketplace architecture

**The Opportunity**
- GTA car wash + detailing TAM: CAD $700M–$1.1B annually
- Addressable subscription market (tech-forward 20%): $140M–$220M/year
- Zero Toronto competitors have a purpose-built platform with real-time tracking, vehicle-type pricing, and photo proof — this is a genuine technology gap
- 80,429 licensed Uber/Lyft drivers in Toronto (Dec 2024) — a high-frequency segment already comfortable with app-based services

**Financial Summary**

| Year | Revenue | Gross Contribution | Net Income | Subscribers (EoY) | Notes |
|---|---|---|---|---|---|
| Year 1 | $120K–$160K | $55K–$78K | $25K–$48K | 80–110 | Platform builds Months 1–4; revenue starts Month 5 |
| Year 2 | $420K–$580K | $205K–$285K | $155K–$215K | 320–440 | Full GTA expansion + fleet |
| Year 3 | $950K–$1.4M | $465K–$690K | $355K–$540K | 750–1,100 | Platform scale; possible seed raise |

**Funding Requirement**
Self-funded MVP: $8,000–$15,000 (insurance, infrastructure, marketing, supplies). Development cost = founder's time (no outsourcing in Phase 1). Optional seed round in Year 2 ($500K–$1M) to hire engineering, accelerate geo expansion, and build native mobile apps.

---

## SECTION 1: BUSINESS MODEL ARCHITECTURE

### 1.1 The Model 4 Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         GLEAM BRAND                             │
│                    (Customer-Facing Layer)                       │
│                                                                  │
│  gleam.ca ─── Online booking ─── Subscription plans             │
│  Before/after photos ─── Customer portal ─── SMS/Email comms    │
│  Google reviews ─── Referral program ─── Gift cards             │
└────────────────────────┬────────────────────────────────────────┘
                         │
              GLEAM TECHNOLOGY LAYER
         (Proprietary Platform: Next.js + Supabase + Stripe)
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    Partner A       Partner B       Partner C
  (Etobicoke)     (Mississauga)   (future zones)
  Independent     Independent     Independent
  Certified        Certified       Certified
  Uses GLEAM       Uses GLEAM      Uses GLEAM
  standards        standards       standards
```

### 1.2 Three Distinct Roles

**GLEAM (You) — The Platform Owner**
- Owns the brand, domain, all customer data, subscription contracts
- Runs all marketing, acquisition, and digital communications
- Sets pricing, quality standards, and service menu
- Manages all customer-facing technology
- Handles billing, disputes, refunds, and satisfaction guarantee
- Does NOT manage day-to-day schedules (partners self-manage availability through the GLEAM Provider App)

**Certified GLEAM Partners — The Service Operators**
- Independent businesses with their own tools, vehicle, and schedule
- Onboarded through GLEAM's Partner Program (training + certification)
- Deliver services under GLEAM brand standards (checklist, photos, branded apron)
- Paid per completed job via Stripe (within 48 hours of completion)
- Cannot solicit GLEAM customers directly (covered in Service Partner Agreement)
- Can work for other clients outside GLEAM network

**Customers — The Subscribers**
- Book through GLEAM website or recurring subscription
- Pay GLEAM directly (via Stripe)
- Have a GLEAM account with service history, photos, vehicle profile
- Brand loyalty is to GLEAM, not to a specific partner

### 1.3 Revenue Flows

```
Customer pays GLEAM ──► GLEAM keeps margin ──► GLEAM pays Partner

Example (Full Detail at $240):
  Customer pays: $240 (to Stripe → GLEAM account)
  GLEAM pays Partner: $108 (45%)
  GLEAM keeps: $132 (55%)
  Less: supplies provided ($15), payment fees ($7)
  GLEAM net contribution: $110 / 46%
```

---

## SECTION 2: MARKET OPPORTUNITY

### 2.1 Etobicoke / Mississauga — Launch Market

**Why West GTA first:**
- Less competitive than Downtown Toronto (fewer premium mobile detailers)
- High population density: Mississauga (720K+) + Etobicoke (370K+) = 1.1M people
- Strong car ownership (suburban = car-dependent)
- High ride-share driver concentration in Peel Region (Uber/Lyft driver communities are active in Brampton/Mississauga)
- Major condo growth corridors: Hurontario LRT, Port Credit, Erin Mills, Renforth corridor
- Adjacent to Pearson Airport (flight crew, logistics workers = clean vehicle demand)
- Less rainfall and easier parking for mobile servicing vs. dense downtown

**Target households in West GTA:**
- Total vehicles in Mississauga + Etobicoke: ~550,000–620,000
- Target tech-forward households (online bookers): 15–20% = 82,000–124,000 potential addressable customers
- Subscription-ready segment (professionals, condo dwellers, fleet): 8–10% = 44,000–62,000

**Competitive density (West GTA):**
- No subscription mobile detailing service with digital-first UX operates in this zone
- Primary competitors: Elixir Auto (basic mobile), generic local detailers, Petro-Canada/Shell automated washes
- Premium gap: no ceramic/subscription combo in this geography

### 2.2 Total Opportunity

| Market | Est. Size | Notes |
|---|---|---|
| West GTA (launch) | $85M–$130M/yr TAM | Mississauga + Etobicoke vehicles × avg spend |
| Full GTA (Year 2–3) | $700M–$1.1B/yr | 2.9M GTA vehicles |
| Ontario (Year 3+) | $540M–$610M/yr | Additional opportunity |

### 2.3 Key Demand Drivers (West GTA-Specific)

| Driver | Data | Impact |
|---|---|---|
| Suburban car dependency | 85%+ household car ownership in Mississauga | High baseline demand |
| Road salt | 130K–150K tonnes/year Toronto; Peel Region comparable | Winter wash frequency 1–2×/week |
| Condo corridor growth | Hurontario corridor adding 50,000+ condo units by 2030 | Growing mobile-first demand |
| Ride-share density | Peel Region has second-highest Uber/Lyft driver concentration in GTA after Toronto proper | High-frequency, subscription-friendly segment |
| Fleet businesses | Mississauga Business Park, Airport Corporate Centre, Heartland | Fleet subscription opportunity |
| Time-poor professionals | Mississauga's financial/pharma/tech employment corridor | High WTP for convenience |

---

## SECTION 3: SERVICE OFFERING

### 3.1 Service Menu

| Package | Includes | Time | Price (CAD) |
|---|---|---|---|
| **Express Shine** | Exterior rinseless wash, glass, tires, interior vacuum | 45 min | $69 |
| **Interior Refresh** | Full interior vacuum, dashboard wipe, console, door pockets, glass | 75 min | $119 |
| **Full Detail** | Express Shine + Interior Refresh + wheel faces + trim dressing | 3.5 hrs | $229 |
| **Deep Restoration** | Full Detail + shampoo seats/carpet + odor treatment + clay bar | 5 hrs | $369 |
| **Protection Package** | Full Detail + paint sealant/wax + glass treatment + tire coating | 4.5 hrs | $429 |

**Premium Add-Ons (à la carte):**
- Ceramic coating: $749–$1,299
- Paint correction (1-stage): $449–$699
- Ozone odor elimination: $109
- Pet hair removal: $89–$139
- Salt underbody flush: $59
- Headlight restoration: $89
- Engine bay clean: $119

### 3.2 GLEAM Subscription Plans

| Plan | Price/Month | Services Included | Utilization Model | Target Segment |
|---|---|---|---|---|
| **GLEAM Go** | $59/month | 2× Express Shine | Commuters wanting clean exterior regularly | Ride-share drivers, commuters |
| **GLEAM Plus** | $109/month | 1× Interior Refresh + 1× Express Shine | Professionals wanting clean inside and out | Condo dwellers, busy professionals |
| **GLEAM Full** | $189/month | 1× Full Detail + 1× Interior Refresh + 1× Express Shine | Families, lease holders, car enthusiasts | Suburban families, lease holders |
| **GLEAM Prime** | $299/month | Full Care + quarterly Protection Package + priority scheduling + 15% off add-ons | Luxury/performance car owners | Luxury segment, new car protection |

**Fair Use Rules:**
- Services do not roll over (use it or lose it each month)
- Skip/pause: 1 billing skip per plan tier per quarter (prevents churn vs. cancel)
- Cancel: 30-day notice, no fees, no questions
- Additional vehicle in same household: 20% off second vehicle plan
- Gift subscriptions: available, 3-month or 12-month prepay

### 3.3 Fleet Plans

| Plan | Min. Vehicles | Price/Vehicle/Month | Includes |
|---|---|---|---|
| **GLEAM Fleet Basic** | 3+ | $89 | 2× Express Shine/month |
| **GLEAM Fleet Plus** | 5+ | $139 | 2× Express Shine + 1× Interior Refresh/month |
| **GLEAM Fleet Pro** | 10+ | $189 | 3× Express + 1× Full Detail/month |

Fleet terms: Monthly invoice (net 15), fixed weekly schedule, dedicated account contact, per-vehicle service report.

---

## SECTION 4: TECHNOLOGY ARCHITECTURE

### 4.1 The GLEAM Platform — Proprietary Two-Sided Marketplace

GLEAM is built as a **proprietary web application** (PWA, Next.js + Supabase) — not assembled from third-party SaaS tools. This is the single most important strategic decision.

```
┌──────────────────────────────────────────────────────────────────┐
│                      GLEAM PLATFORM (gleam.ca)                   │
├──────────────────┬───────────────────────┬───────────────────────┤
│  MARKETING SITE  │   CUSTOMER WEB APP    │   PROVIDER WEB APP    │
│  gleam.ca/       │   gleam.ca/app        │   gleam.ca/provider   │
│  (Next.js, SSR)  │   (Next.js, PWA)      │   (Next.js, PWA)      │
│                  │                       │                        │
│  SEO landing pgs │ • Onboarding+vehicles │ • Onboarding + KYC    │
│  Plans overview  │ • Service booking     │ • Job queue           │
│  How it works    │ • Location + schedule │ • Before/after photos │
│  Local SEO pages │ • Job status tracking │ • Earnings dashboard  │
│  Partner apply   │ • Before/after viewer │ • Availability mgmt   │
│                  │ • Subscriptions       │ • Payout history      │
│                  │ • History + ratings   │ • Profile + docs      │
├──────────────────┴───────────────────────┴───────────────────────┤
│                       ADMIN DASHBOARD (gleam.ca/admin)           │
│         Providers | Customers | Bookings | Pricing | Payouts     │
├──────────────────────────────────────────────────────────────────┤
│              BACKEND: Next.js API Routes + Supabase              │
│      Auth │ PostgreSQL │ Storage (photos) │ Realtime │ Edge Fns  │
├──────────────────────────────────────────────────────────────────┤
│  Stripe (payments + Connect) │ Twilio (SMS) │ Resend (email)     │
│  Google Maps API (addresses + Phase 2 tracking)                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend + API** | Next.js 14+ (App Router) | SSR for SEO, server components, API routes in one repo |
| **Database** | Supabase (PostgreSQL) | Row Level Security for multi-role access; real-time for Phase 2 tracking |
| **Auth** | Supabase Auth | Phone/email OTP; JWT; role-based (customer / provider / admin) |
| **File storage** | Supabase Storage | Before/after photos in private buckets; signed URLs |
| **Real-time** | Supabase Realtime | Phase 2: live provider GPS → customer map |
| **Payments** | Stripe + Stripe Connect | One-time + subscriptions; provider payouts |
| **SMS** | Twilio | Booking confirmations, status updates, win-back |
| **Email** | Resend + React Email | Transactional emails with branded templates |
| **Maps** | Google Maps API | Address autocomplete (MVP); live tracking (Phase 2) |
| **Deployment** | Vercel | Seamless Next.js; edge functions; branch deploys |
| **Monitoring** | Sentry (free) | Error tracking from day 1 |

**Monthly infrastructure cost:** ~$65–$115/month (vs. $300–$400/month for Jobber + Webflow SaaS tools — and this builds equity value).

### 4.3 Why Build vs. Buy

| Dimension | SaaS Tools (Jobber etc.) | Proprietary Platform |
|---|---|---|
| Monthly cost | $300–$400/month | $65–$115/month |
| Data ownership | Locked in third-party | 100% owned |
| Feature control | Limited to vendor roadmap | Build exactly what you need |
| Competitor replication | Sign up for same tools = done | 6+ months engineering |
| Valuation at $1M ARR | 1–2× (~$1.5M) | 5–8× (~$6M) |
| Build time | Days | 3–4 months |

The 3–4 month build cost (founder's time) is the moat investment.

### 4.4 MVP vs. Phase 2 Feature Scope

| Feature | MVP (Months 1–4) | Phase 2 (Months 5–9) |
|---|---|---|
| Customer sign-up / login | ✅ Email + phone OTP | ✅ + Google OAuth |
| Vehicle profiles (type, make, model, year) | ✅ | ✅ + VIN lookup |
| Address entry + Google autocomplete | ✅ | ✅ + GPS "use my location" |
| Vehicle-type-based pricing | ✅ Sedan/SUV/pickup/minivan matrix | ✅ + dynamic promos |
| Service catalog + add-ons | ✅ | ✅ |
| Scheduled booking (date + time picker) | ✅ | ✅ + ASAP / instant dispatch |
| Provider matching | ✅ Admin assigns manually | ✅ Auto-match by zone + availability |
| Job status updates | ✅ Text status (accepted/en route/done) | ✅ + Real-time map tracking |
| Before/after photo upload (by provider) | ✅ | ✅ + AI blur/quality check |
| Customer photo viewer | ✅ | ✅ + shareable gallery link |
| Stripe one-time payment | ✅ | ✅ |
| Stripe subscription billing | ✅ | ✅ + self-serve pause/skip portal |
| Provider onboarding + admin approval | ✅ | ✅ + document upload + KYC |
| Provider job accept/decline | ✅ | ✅ + push notifications |
| Provider earnings dashboard | ✅ Basic | ✅ + weekly auto-payout |
| Admin dashboard | ✅ Basic | ✅ Full analytics |
| Real-time provider map (customer) | ❌ | ✅ Supabase Realtime + Google Maps |
| Fleet / B2B portal | ❌ | ✅ |
| Referral program | ❌ Manual | ✅ Built into platform |
| Native iOS/Android app | ❌ | ✅ Year 2 |

### 4.5 Data Ownership

Every byte of data lives in GLEAM's Supabase PostgreSQL — not in any third-party tool.

| Data | Lives In | Cannot Be Taken By |
|---|---|---|
| Customer profiles, vehicles, history | Supabase (GLEAM) | Any provider who leaves |
| All booking + photo records | Supabase Storage (GLEAM) | Anyone |
| Subscription billing data | Stripe + Supabase | Any third party |
| Provider performance history | Supabase (GLEAM) | Provider themselves |
| All communication logs | Supabase (GLEAM) | Any external platform |

---

## SECTION 5: PARTNER NETWORK STRATEGY

### 5.1 Partner Profile (Ideal GLEAM Partner)

| Criteria | Requirement |
|---|---|
| **Experience** | 2+ years mobile detailing; can demonstrate on a test vehicle |
| **Own vehicle** | Yes — van or SUV with cargo space for supplies |
| **Own tools** | Yes — vacuum, polisher, steamer (or we supply at cost, deducted from first month) |
| **Own insurance** | General liability minimum $1M (or added as additional insured under GLEAM policy) |
| **Availability** | Minimum 3 days/week (can be any days) |
| **Smartphone** | Yes — for GLEAM Provider App (before/after photos, job status, navigation) |
| **English proficiency** | Functional (for customer-facing interactions) |
| **Other clients** | Yes allowed — they are independent operators |

### 5.2 The Partner Value Proposition

What GLEAM offers partners that makes them want to join:

```
What partners hate about running solo:    What GLEAM solves:
─────────────────────────────────────     ──────────────────────────────
Chasing customers / cold calling          Pre-scheduled, pre-paid jobs
Arguing about pricing                     GLEAM sets pricing; no negotiation
No-shows and flaky customers              Stripe pre-auth; no-show policy enforced
Social media / marketing work             GLEAM handles 100% of marketing
Collecting payment (e-transfers, cash)    Stripe auto-captures; 48-hr payout
Inconsistent income                       Subscription = predictable weekly jobs
Working alone (no brand)                  Work under GLEAM brand = trust premium
```

**Partner economics example (2 jobs/day, 5 days/week):**
- 10 jobs/week × avg $90 partner rate = $900/week = $3,600/month
- If mix includes Full Details: 5 express ($32) + 5 full detail ($108) = $700/week = $2,800/month

**GLEAM's positioning to partners:** *"We're your sales team, marketing department, and billing system. You focus on the craft."*

### 5.3 Partner Onboarding Process

```
Step 1: Application
  → Partner fills form on gleam.ca/partners
  → Screening call (30 min): experience, tools, availability, zones
  → Reference check (1 past client or employer)

Step 2: Test Detail
  → Partner details GLEAM founder's car (or fleet partner's vehicle)
  → Evaluate: thoroughness, time management, product knowledge, photo quality
  → Grade against GLEAM quality rubric (scored 1–10 per category)
  → Score ≥ 7.5/10 → proceed

Step 3: Training & Certification
  → GLEAM Partner Standards document (provided as PDF/Notion)
  → GLEAM Provider App walkthrough (30 min screen share — job queue, status buttons, photo upload)
  → GLEAM photo protocol training (5 before + 5 after, specific angles)
  → GLEAM quality checklist walkthrough

Step 4: Agreement
  → Service Partner Agreement signed (DocuSign)
  → Key clauses:
    - Non-solicitation: cannot directly market to or contact GLEAM customers
    - Brand standards: must use GLEAM checklist, photo protocol
    - Pricing compliance: cannot accept payment other than through GLEAM
    - Data: all customer data belongs to GLEAM
    - Termination: 14-day notice from either party
    - Damage liability: partner responsible for damages caused by negligence

Step 5: First Jobs (Supervised)
  → Partner does first 3 jobs with founder present (or founder reviews photos same day)
  → Debrief after each → iterate on quality
  → After 3 successful jobs → partner is certified and can run independently
```

### 5.4 Quality Assurance System

| Mechanism | Frequency | Who Reviews |
|---|---|---|
| Before/after photos | Every job | Auto-reviewed by customer; founder spot-checks 20% |
| Customer satisfaction score | Post-job SMS | Tracked in GLEAM platform (reviews table) |
| Google review themes | Weekly | Founder |
| Partner performance score | Monthly | Founder — jobs completed, avg satisfaction, re-do rate |
| Quality audit (mystery detail) | Quarterly | Founder books job as anonymous customer |

**Performance thresholds:**
- Average satisfaction < 4.0/5.0 → immediate coaching conversation
- Two consecutive complaints → supervised jobs required before resuming
- Three verified damage incidents → contract termination

---

## SECTION 6: GO-TO-MARKET STRATEGY

### 6.1 Phase 1 Launch: Etobicoke / Mississauga (Months 1–3)

**Week-by-Week Activation Calendar:**

| Week | Activity | Goal |
|---|---|---|
| 1 | Insurance, registration, supplies, domain + email setup; begin GLEAM platform build | Infrastructure live |
| 2 | Google Business Profile submitted; Instagram + TikTok live; first 3 posts | Digital presence established |
| 3 | First 10 jobs (founder self-operates to understand service); collect 5 reviews | Reviews + learnings |
| 4 | Soft-launch: tell 200+ people via WhatsApp/text/LinkedIn/email | 20–30 bookings from network |
| 5 | Post in West GTA condo Facebook groups (Port Credit, Erin Mills, Etobicoke Centre) | 10–15 condo leads |
| 6 | Post in Peel/Mississauga Uber/Lyft Facebook groups; launch GLEAM Go Driver Plan | 10–20 driver sign-ups |
| 7 | Email 15 property managers (buildings on Hurontario, Burnhamthorpe, Kipling corridors) | 2–4 building partnerships |
| 8 | First Google Ads campaign live ($300/month budget) | 15–25 incremental leads |

**Month 1–3 targets:**
- 60–80 total bookings
- 20–35 subscribers
- 10+ Google reviews (minimum for GBP credibility)
- 1–2 certified GLEAM partners onboarded

### 6.2 Three Wedge Activation

**Wedge 1 — Condo-First (gleam.ca/condo)**

Landing page headline: *"Mobile detailing built for condo residents. No hose. No building rules violated."*
- Waterless methods used for all underground/condo jobs
- Call-to-action: Book an intro service or join GLEAM Plus
- Acquisition: condo building Facebook groups, property manager email outreach, lobby flyers (with PM permission)
- Unique angle: explicitly state "We handle the condo logistics for you"

Target buildings for outreach in West GTA:
- Absolute World (Mississauga City Centre)
- M City towers (Hurontario corridor)
- Erin Square (Erin Mills)
- Sherway Gate area (Etobicoke)
- Any building with 100+ units within partner's service radius

**Wedge 2 — Ride-Share Driver Plan (gleam.ca/driver-plan)**

Landing page headline: *"Toronto drivers: keep your rating high. We keep your car clean."*
- GLEAM Go plan featured ($59/month → $49 first month intro)
- Emphasize: "We come to you — parking lot, home, wherever's convenient"
- Acquisition: Mississauga/Peel Uber/Lyft driver Facebook groups + WhatsApp networks

Target communities:
- "Mississauga Rideshare Drivers" (Facebook)
- "Brampton Uber/Lyft Drivers" (Facebook)
- "GTA Delivery Drivers" groups

**Wedge 3 — General Professional / Family Market**

- Homepage + Google Ads
- Before/after content on Instagram and TikTok
- Neighborhood referral program ("Your neighbor just got a GLEAM — here's $20 off")

### 6.3 Content Strategy (Instagram + TikTok)

**30-Day Content Calendar:**

| Day | Format | Content |
|---|---|---|
| 1 | Reel | "I just launched Mississauga's first detailing subscription. Here's why." |
| 3 | Before/After | Family SUV transformation — "2 kids, 1 dog, 6 months of chaos" |
| 5 | Educational | "How road salt actually destroys your car's paint (and how to stop it)" |
| 7 | Reel | "I cleaned a condo resident's car in their underground parking. Here's how." |
| 9 | Social proof | First 5-star review screenshot + the car |
| 11 | Before/After | Ride-share driver's car — "Before = 3 stars, After = 5 stars" |
| 13 | FAQ | "Can you service my condo? Yes. Here's exactly how." |
| 15 | Lifestyle | "This is what your car looks like after a GLEAM subscription" |
| 17 | Educational | "Ceramic vs wax vs sealant — which one does your car actually need?" |
| 19 | Behind the scenes | A day in the life of a GLEAM partner |
| 21 | Before/After | Pre-sale detail — "Sold for $2,000 more after this detail" |
| 23 | Offer | "Refer a neighbour, get a free month of GLEAM" |
| 25 | Educational | "Why you should never use automated car washes in winter" |
| 27 | Community | "We're officially in [building name] — residents get 15% off" |
| 29 | Social proof | "5 Google reviews in 2 weeks — here's what our customers are saying" |
| 30 | Milestone | "Month 1 complete. Here's what we learned." |

**Platform distribution:**
- TikTok: all Reels content; aim for 1–2M impression/month by Month 3 with consistent posting
- Instagram: Reels + Stories + carousels for educational content
- Facebook: Share all content + post in local community groups

### 6.4 Geographic Expansion Roadmap

| Phase | Zones | Timing | Trigger |
|---|---|---|---|
| Launch | Etobicoke + Mississauga | Month 1 | Now |
| Phase 2 | + North York + Brampton | Month 6–8 | 2 partners in West zone, 80+ subscribers |
| Phase 3 | + Scarborough + Vaughan | Month 10–12 | 4 partners, 200+ subscribers |
| Phase 4 | + Downtown Toronto + Markham/Richmond Hill | Year 2 | 8+ partners, $400K+ ARR |
| Year 3 | Full GTA coverage | Year 3 | 20+ partners, $1M+ ARR |

---

## SECTION 7: FINANCIAL MODEL

### 7.1 Revenue Model

GLEAM has two revenue streams:

**Stream 1: One-Time Bookings (a-la-carte)**
- Customer pays full menu price
- GLEAM pays partner 45–50% upon completion
- GLEAM net margin: 46–52% after supplies and payment fees

**Stream 2: Subscription Revenue (recurring monthly)**
- Customer pays monthly subscription (Stripe Billing)
- GLEAM delivers bundled services through the month via partners
- GLEAM pays partner per service delivered (flat rate, regardless of subscription plan sold)
- GLEAM benefits from: utilization < 100% (subscribers who skip months = pure margin), route density optimization (lower partner cost per visit as volume grows)

### 7.2 Key Unit Economics Assumptions

| Metric | Assumption | Basis |
|---|---|---|
| Average one-time transaction | $185 | Blended mix: 30% express, 40% full detail, 20% interior, 10% premium |
| Average subscription MRR | $129 | Blended: 40% Go ($59), 35% Plus ($109), 20% Full ($189), 5% Prime ($299) |
| Partner cost as % of revenue | 45% | Revenue share model |
| Supplies per job | $12 average | Provided by GLEAM; deducted from partner rate |
| Payment processing fees | 3% of revenue | Stripe |
| Monthly subscriber churn | 4.5% (Y1) → 3% (Y3) | Industry benchmark; improves with service quality |
| Customer LTV (subscriber) | $2,100 (Y1 model) | $129/month × 16-month avg lifetime + upsells |
| Customer LTV (one-time) | $370 | 2 visits average × $185 |
| CAC (blended) | $45–$65 | Mix of referral, SEO, paid |
| LTV:CAC ratio (subscribers) | 32–46× | Strong subscription economics |

### 7.3 Year 1 Monthly Projections (Etobicoke/Mississauga)

| Month | One-Time Jobs | Subscribers (EoY) | Monthly Revenue | Partner Cost | Gross Contribution |
|---|---|---|---|---|---|
| 1 | 10 | 0 | $1,850 | $833 | $900 |
| 2 | 18 | 8 | $3,330 + $1,032 = $4,362 | $1,963 | $2,100 |
| 3 | 28 | 18 | $5,180 + $2,322 = $7,502 | $3,376 | $3,600 |
| 4 | 38 | 30 | $7,030 + $3,870 = $10,900 | $4,905 | $5,240 |
| 5 | 50 | 45 | $9,250 + $5,805 = $15,055 | $6,775 | $7,225 |
| 6 | 62 | 62 | $11,470 + $7,998 = $19,468 | $8,761 | $9,350 |
| 7 | 72 | 78 | $13,320 + $10,062 = $23,382 | $10,522 | $11,220 |
| 8 | 80 | 90 | $14,800 + $11,610 = $26,410 | $11,885 | $12,680 |
| 9 | 88 | 100 | $16,280 + $12,900 = $29,180 | $13,131 | $13,985 |
| 10 | 93 | 108 | $17,205 + $13,932 = $31,137 | $14,012 | $14,945 |
| 11 | 97 | 113 | $17,945 + $14,577 = $32,522 | $14,635 | $15,610 |
| 12 | 100 | 118 | $18,500 + $15,222 = $33,722 | $15,175 | $16,186 |
| **TOTAL** | **736** | **118** | **~$235K** | **~$106K** | **~$113K** |

**Year 1 Fixed Costs:**
- Insurance: $6,000/yr
- Technology stack (Vercel + Supabase + Twilio + Resend + APIs + misc): $1,200–$1,500/yr
- Google Ads (starts Month 3): $3,600/yr
- Legal (partner agreement + business setup): $2,000 one-time
- Branded supplies + uniforms (for 2 partners): $1,500
- **Total fixed costs Year 1: ~$14,300–$14,800** (saves ~$2,000+ vs. SaaS tools approach)

**Year 1 Net Income (before founder salary): ~$98K**
*(Note: This is contribution before any founder compensation. A portion will be reinvested in growth.)*

### 7.4 3-Year Projections Summary

| Year | Zones Active | Partners | Monthly Jobs (EoY) | Subscribers (EoY) | Annual Revenue | Gross Margin | Fixed Costs | Net Income |
|---|---|---|---|---|---|---|---|---|
| **Year 1** | West GTA | 2–3 | 100 | 118 | $235K | 48% | $17K | $96K |
| **Year 2** | + North York, Brampton, Scarborough | 6–8 | 380 | 380 | $580K | 50% | $45K | $245K |
| **Year 3** | Full GTA (8 zones) | 15–20 | 900 | 820 | $1.3M | 52% | $95K | $580K |

**Year 2 growth drivers:**
- 3 new geographic zones × 1.5× Year 1 trajectory each
- Referral engine producing 35%+ of new customers
- Fleet accounts (5–8 accounts by end of Year 2) = $40–$70K ARR
- Seasonal campaigns (Spring Revival + Winter Protect) = $30–$50K additional

**Year 3 moat indicators:**
- 20+ certified GLEAM partners across GTA
- 800+ paying subscribers = ~$1.24M subscriber ARR alone
- Google review volume (500+ reviews) = dominant local SEO
- Brand recognition sufficient to begin franchising or raising seed round

### 7.5 Break-Even Analysis

| Scenario | Monthly Jobs | Monthly Subscribers | Monthly Revenue | Break-Even? |
|---|---|---|---|---|
| Minimal | 8 | 0 | $1,480 | No ($2,083 fixed costs/month) |
| Break-even | 14 | 5 | $3,235 | Yes (exactly) |
| **Target Month 3** | **28** | **18** | **$7,502** | **Yes (+$3,600 contribution)** |
| Strong | 50 | 45 | $15,055 | Yes (+$7,225/month) |

*Monthly fixed costs: ~$1,400 (insurance $500 + platform infra: Vercel/Supabase/APIs $100 + Google Ads $300 + misc $175 + annual legal/supplies amortized ~$325/month in Year 1)*
*Note: Platform development in Months 1–4 means full revenue ramp starts Month 5. Year 1 revenue target is $120K–$160K (executive summary). The $235K projection above reflects a full 12-month ramp for comparison purposes.*

---

## SECTION 8: OPERATIONS PLAN

### 8.1 Founder's Weekly Rhythm (With Full-Time Job)

| Time | Activity |
|---|---|
| Mon–Fri 7–8 AM | Check GLEAM admin dashboard for new bookings; respond to inquiries; assign partner jobs |
| Mon–Fri 6–8 PM | Admin (invoices, partner payments, content creation); respond to Google reviews |
| Saturday 8 AM–6 PM | Do jobs (founder-operated) + supervise first partner jobs |
| Sunday 9 AM–2 PM | 1–2 jobs; content posting; GBP updates; week planning |

**Delegation trigger:** When founder is handling 20+ bookings/week in admin → hire a virtual assistant ($15–$25/hr, 5 hrs/week) for booking and customer management via GLEAM admin dashboard. Cost: ~$300–$500/month.

### 8.2 Zones and Service Radius

| Zone | Partner | Postal Codes | Priority Neighborhoods |
|---|---|---|---|
| Etobicoke | Partner A (founder initially) | M8, M9, M8W, M8X | Sherway Gardens, Kingsway, Humber Valley |
| Mississauga Central | Partner B | L4Z, L5B, L5N, L4T | City Centre, Hurontario, Erin Mills |
| Mississauga East | (Month 4+) | L5G, L5J, L5K | Port Credit, Clarkson, Lakeview |
| Brampton | (Month 6+) | L6Y, L6W, L6Z | Bramalea, Queen + Hurontario |

**Each partner has a defined home zone** (5–8 km radius) to maximize route efficiency. Partners can occasionally take jobs outside their zone but it's not the default.

### 8.3 Condo Logistics Playbook

| Scenario | Solution |
|---|---|
| Underground parking (no outdoor water access) | Rinseless/waterless method only — no exceptions |
| Building won't allow vendor access | Offer to service in surface parking lot nearby (park + detail) |
| Building requires insurance certificate | GLEAM provides certificate of insurance (part of onboarding package) |
| Customer has no parking space to spare | Partner uses visitor parking; customer books visitor spot in advance |
| Building charges for visitor parking | GLEAM absorbs ($5–$15 per job) or adds as surcharge (disclose at booking) |

### 8.4 Winter Operations Plan

| Challenge | Solution |
|---|---|
| Cold temperatures (below -10°C) | Rinseless wash products work to -5°C; interior-only services year-round in cold snaps |
| Snow/ice on vehicle | Deicing spray + microfiber; schedule interior-only when exterior not feasible |
| Less natural light | Partner uses portable LED work light (included in GLEAM partner kit) |
| Partner van won't start | Backup partner on-call protocol; customer rescheduled within 24 hrs + $15 credit |
| Salt buildup urgency | "Salt Alert" campaign after major snowfall events → "Book your salt flush today" |

---

## SECTION 9: LEGAL & COMPLIANCE

### 9.1 Business Structure

**Recommended:** GLEAM Auto Care Inc. (Ontario corporation)
- Incorporate (not sole prop) because Model 4 involves customer contracts, partner agreements, and liability — incorporation provides the clean legal separation needed
- Cost: $800–$1,500 via paralegal or online at ontario.ca
- Directors: founder only initially
- HST/GST registration: register immediately (even below $30K threshold — creates credibility with fleet customers who need ITCs)

### 9.2 Key Legal Documents Required

| Document | Purpose | Cost to Create |
|---|---|---|
| **Service Partner Agreement** | Defines relationship with certified partners; non-solicitation; brand compliance; data ownership; damage liability | $800–$1,500 (Ontario employment lawyer) |
| **Customer Terms of Service** | Governs bookings, subscription terms, cancellation, damage claims, refund policy | $500–$800 (paralegal) |
| **Privacy Policy** | PIPEDA compliance for collecting customer data | $300–$500 or free template from iubenda |
| **Subscription Agreement / Auto-Renewal Disclosure** | Ontario Consumer Protection Act requires clear auto-renewal disclosure | Include in ToS |

### 9.3 Insurance Summary

| Policy | Coverage | Annual Cost |
|---|---|---|
| Commercial General Liability | $2M per occurrence, $4M aggregate | $1,500–$2,500 |
| Garage Keeper's Liability (Care, Custody & Control) | $500K per vehicle | Bundled |
| Commercial Auto (personal vehicle + business use rider) | $1M | $800–$1,500/yr additional |
| Tools & Equipment | $10K | $300–$500 |
| **Total estimated** | | **$4,500–$7,500/yr** |

*Partners: each partner must carry their own liability insurance (minimum $1M) OR be named as additional insured under GLEAM's CGL policy. Discuss with broker at setup.*

### 9.4 Water Use Compliance

- All condo/underground jobs: waterless/rinseless method only
- All outdoor jobs on private property: discharge to lawn or carry grey water for sanitary disposal
- Never discharge wash water to storm drain (Toronto Sewers Bylaw Chapter 681)
- Document in partner training: photograph compliance protocol
- Fine exposure: $500 first offense; up to $50,000 serious violation

---

## SECTION 10: RISK MATRIX

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Partner does poor quality job | Medium | High | Checklist + photo protocol; customer satisfaction score; re-do guarantee |
| Partner poaches customer directly | Low-Medium | High | Service Partner Agreement; non-solicitation clause; all communications through GLEAM |
| Ontario CRA classifies partners as employees | Low-Medium (if structured correctly) | High | Partners have own clients, own tools, set own schedule; lawyer-reviewed agreement |
| No-show by partner | Medium | Medium | Backup partner protocol; customer auto-notified + $15 credit |
| Damage to customer vehicle | Low | High | Before photos mandatory; insurance; damage claims process; transparency |
| Competitor copies model | Medium (Year 2+) | Medium | Brand + data moat; subscriber lock-in; review volume advantage |
| Slow customer acquisition (wrong channel) | Medium | Medium | Diversified channels; pivot to highest-performing within 30 days |
| Founder time constraint | High | Medium | VA at 20+ bookings/week; leverage GLEAM platform automation (notifications, status flows, payout triggers) |
| Seasonal revenue dip (summer) | Medium | Low | Interior services + add-ons maintain revenue; ceramic/correction higher margin |
| Negative viral review | Low | Medium | Respond within 4 hours; offer immediate resolution; founder calls personally |

---

## SECTION 11: MILESTONES & KEY METRICS

### 11.1 Launch Milestones

| Milestone | Target Date | Metric |
|---|---|---|
| Business incorporated + insured | Week 1 | Insurance certificate in hand |
| Website live (5 pages) | Week 2 | gleam.ca live with booking widget |
| Google Business Profile active | Week 2 | GBP verified and published |
| First paying customer | Week 3 | $185+ booking via website |
| 10 Google reviews | Month 2 | 10 × 4.5★+ reviews |
| First subscriber | Month 1 | 1 subscription active in Stripe |
| First GLEAM partner certified | Month 2 | Partner agreement signed, 3 jobs completed |
| 25 subscribers | Month 3 | Subscription revenue >$3,000/month |
| Break-even | Month 3 | Contribution > fixed costs |
| First fleet account | Month 4 | 3+ vehicles on recurring plan |
| 2nd partner certified | Month 4 | West GTA fully covered |
| 100 subscribers | Month 9 | Subscription ARR >$150K annualized |
| Zone 2 launch | Month 8 | North York operational |

### 11.2 Monthly KPIs to Track

| KPI | Target (Month 6) | Target (Month 12) |
|---|---|---|
| Monthly Recurring Revenue (MRR) | $8,000 | $16,000 |
| Total Subscribers | 62 | 118 |
| Monthly Churn Rate | <6% | <4.5% |
| New Customers / Month | 25 | 40 |
| % New from Referral | 20% | 35% |
| Average Transaction Value | $185 | $200 |
| Net Promoter Score | 65+ | 75+ |
| Partner Utilization | 70% | 80% |
| Google Rating | 4.7★ | 4.8★+ |
| CAC (blended) | <$60 | <$50 |
| LTV:CAC | >25× | >35× |

---

## SECTION 12: TEAM & HIRING PLAN

### Year 1 (Part-Time Founder + Contractors)

| Role | Person | Responsibilities | Cost |
|---|---|---|---|
| **Founder / CEO** | You | Brand, marketing, tech, operations, partner management, strategy | Sweat equity |
| **GLEAM Partner 1** | Etobicoke zone | Service delivery, weekdays | 45% of job revenue |
| **GLEAM Partner 2** | Mississauga zone | Service delivery, any days | 45% of job revenue |
| **Virtual Assistant** (Month 5+) | Hire via Upwork/OnlineJobs | Booking management via GLEAM admin dashboard, customer follow-ups, partner comms | $15–$25/hr, 5–10 hrs/week |

### Year 2 Hires

| Role | Timing | Cost | Responsibilities |
|---|---|---|---|
| **Zone Manager / Operations Lead** | Month 10–12 | $50K–$65K salary | Partner management, quality audits, zone expansion |
| **Additional GLEAM Partners** (×4) | As zones expand | 45% revenue share | Service delivery in new zones |
| **Part-time Marketing Coordinator** | Month 8 | $20–$30/hr, 15 hrs/week | Social media, content, campaigns |

---

## APPENDIX: STARTUP CHECKLIST

### Week 1 Actions (In Order)
- [ ] Choose brand name → confirm gleam.ca availability
- [ ] Register GLEAM Auto Care Inc. via ServiceOntario or paralegal
- [ ] Open business bank account (Scotiabank/RBC Business)
- [ ] Apply for insurance — Zensurance.com (takes 3–7 days to bind)
- [ ] Register for HST (canada.ca/en/revenue-agency)
- [ ] Purchase gleam.ca domain (Namecheap)
- [ ] Set up Google Workspace (hello@gleam.ca)

### Week 2 Actions (Platform Build Begins)
- [ ] Initialize Next.js 14 project (`npx create-next-app@latest gleam --typescript --tailwind --app`)
- [ ] Create Supabase project + run initial DB schema migration
- [ ] Deploy skeleton to Vercel (gleam.ca → production; dev.gleam.ca → staging)
- [ ] Configure Stripe account + link to business bank account
- [ ] Set up Twilio, Resend, Google Maps API keys in Vercel env vars
- [ ] Create Google Business Profile
- [ ] Order supplies kit ($600–$800 on Amazon.ca)
- [ ] Create Instagram + TikTok accounts (@gleam.ca or @gleamgta)

### Weeks 3–4 Actions (Continued Platform Build)
- [ ] Implement auth flows: customer + provider + admin role routing
- [ ] Build customer onboarding (signup → vehicle → address)
- [ ] Write Service Partner Agreement draft (send to lawyer for review)
- [ ] Post first job on Kijiji/Facebook for GLEAM Partner applications
- [ ] Do first 3 test jobs on personal network (free/discounted — for before/after content)
- [ ] Post first Instagram/TikTok reel

### Weeks 5–16 (Platform Build Sprint — see GLEAM_Experience_Build.md for full timeline)

### Week 17 Actions (Post-Launch — Month 5)
- [ ] Send "GLEAM is live" announcement to entire personal network
- [ ] Post in 5 condo Facebook groups (Mississauga + Etobicoke)
- [ ] Post in Peel/Mississauga Uber/Lyft driver Facebook groups
- [ ] Send 10 property manager intro emails
- [ ] First Google Ads campaign live (activate once platform is live + 5 reviews collected)

---

*Business Plan v2.0 | February 2026 | Confidential — GLEAM Auto Care Inc.*
*Platform: Proprietary (Next.js + Supabase + Stripe). See GLEAM_Experience_Build.md for full PRD.*
*Assumptions stated throughout. Validate all costs with local suppliers before committing.*
