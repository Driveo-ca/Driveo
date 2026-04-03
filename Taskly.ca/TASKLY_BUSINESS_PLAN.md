# TASKLY.CA — Complete Business Plan & System Architecture

## "Urban Company for Canada" — Managed Home Services Marketplace

**Version 1.0 | April 2026 | taskly.ca | Confidential**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Research (GTA-Specific)](#2-market-research-gta-specific)
3. [Business Model & Pricing](#3-business-model--pricing)
4. [Go-to-Market Strategy](#4-go-to-market-strategy)
5. [Operations & Quality](#5-operations--quality)
6. [Revenue Projections](#6-revenue-projections)
7. [Product Architecture](#7-product-architecture)
8. [Database Schema](#8-database-schema)
9. [Core User Flows](#9-core-user-flows)
10. [Tech Platform Spec](#10-tech-platform-spec)
11. [Design System](#11-design-system)
12. [Competitive Advantages](#12-competitive-advantages)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Actionable Next Steps](#14-actionable-next-steps)
15. [Key Assumptions](#15-key-assumptions)

---

## 1. Executive Summary

**Taskly.ca** is a managed, two-sided home services marketplace targeting the Greater Toronto Area (GTA). We connect homeowners and renters with vetted, insured service professionals across four verticals: **cleaning**, **emergency repairs**, **maintenance**, and **seasonal services**.

### The Problem

The GTA's home services market is fragmented. Homeowners waste hours on Google, Kijiji, and word-of-mouth to find reliable providers. Existing platforms:

| Platform              | Problem                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------- |
| **HomeStars**         | Lead-gen directory — not managed. No booking, no payments, no quality guarantee             |
| **TaskRabbit**        | Gig-economy feel, inconsistent quality, US-centric, not built for Canadian compliance       |
| **Jiffy**             | Closest competitor but limited geo coverage, limited categories, hasn't scaled aggressively |
| **Kijiji / Facebook** | Zero vetting, no trust layer, classifieds not marketplaces                                  |

**No player in the GTA owns the "managed marketplace" position.** The opportunity is a trust-first, full-stack platform that owns the customer experience end-to-end.

### The Solution

Taskly is a **full-stack managed marketplace** — we own the customer experience end-to-end:

- Standardized flat-rate pricing (know the price before booking)
- Vetted providers (CPIC background check, $2M liability insurance, skill assessment)
- Instant + scheduled booking with real-time provider tracking
- In-app payments via Stripe Connect (split payments, instant provider payouts)
- Before/after photo documentation on every job
- Satisfaction guarantee: re-do within 48 hours or full refund
- $10,000 property damage protection

### Wedge Strategy

Launch with **home cleaning** in downtown Toronto and Midtown (highest frequency service = fastest path to recurring revenue), then expand to emergency services, then the full marketplace across the GTA. This is the Urban Company playbook, adapted for Canada.

### Key Metrics (Targets)

| Metric                | Target            |
| --------------------- | ----------------- |
| Vetted Providers      | 500+ (Month 12)   |
| Monthly Bookings      | 3,000+ (Month 12) |
| Year 1 GMV            | $2.5M             |
| Path to Profitability | 18-24 months      |
| LTV:CAC Ratio         | 16:1              |

---

## 2. Market Research (GTA-Specific)

### 2.1 Market Sizing

| Metric                                | Value                                  | Source              |
| ------------------------------------- | -------------------------------------- | ------------------- |
| Canada Home Improvement Market        | $38.3B (2025)                          | Industry data       |
| Canada Online On-Demand Home Services | Projected US$738M by 2030 (14.8% CAGR) | Grand View Research |
| GTA Population                        | ~7.0M (2026 est.)                      | Census/StatCan      |
| GTA Households                        | ~2.7M                                  | StatCan             |
| Avg Household Spend on Home Services  | ~$3,200/year                           | Industry estimates  |

| Market Layer                       | Value   |
| ---------------------------------- | ------- |
| **TAM** (Total Addressable Market) | ~$8.6B  |
| **SAM** (Serviceable Addressable)  | ~$3.4B  |
| **SOM** (Year 3 Target GMV)        | $17-34M |
| **Industry CAGR**                  | 14.8%   |

### 2.2 Competitor Landscape (Deep Dive)

| Platform              | Model               | Strengths                                | Weaknesses                                                               | Take Rate        |
| --------------------- | ------------------- | ---------------------------------------- | ------------------------------------------------------------------------ | ---------------- |
| **HomeStars**         | Lead-gen directory  | Large contractor DB, strong SEO, reviews | Not managed — just referrals. No booking, payments, or quality guarantee | $15-$50/lead     |
| **Jiffy**             | Managed marketplace | Fixed pricing, vetted pros, good UX      | Limited categories, smaller geo coverage                                 | ~20-25%          |
| **TaskRabbit**        | Gig marketplace     | Wide task variety, Ikea-backed brand     | Inconsistent quality, gig-economy feel, US-centric                       | ~15%             |
| **UrbanTasker**       | Marketplace         | Canadian-focused, growing                | Smaller network, less brand recognition                                  | Commission-based |
| **Handy**             | Managed marketplace | Strong in cleaning vertical              | US-focused, limited Canadian presence                                    | ~20%             |
| **Kijiji / Facebook** | Classifieds         | Free, massive audience                   | Zero vetting, no trust layer                                             | Free / ads       |

**Key Insight:** No player in the GTA owns the "managed marketplace" position with the quality bar of Urban Company. HomeStars is a directory. TaskRabbit is gig-economy. Jiffy is closest but hasn't scaled aggressively. The opportunity is a trust-first, full-stack platform.

### 2.3 GTA Pricing Benchmarks

#### Home Cleaning

| Service                         | Market Range (CAD) | Taskly Target Price |
| ------------------------------- | ------------------ | ------------------- |
| Standard Cleaning (1-bed apt)   | $80-$140           | **$99 flat**        |
| Standard Cleaning (2-bed)       | $100-$200          | **$139 flat**       |
| Standard Cleaning (3-bed house) | $140-$280          | **$199 flat**       |
| Deep Cleaning (2-bed)           | $200-$400          | **$279 flat**       |
| Move-in/out Cleaning (2-bed)    | $250-$500          | **$349 flat**       |
| Post-renovation Cleaning        | $300-$600          | **$449 flat**       |

#### Emergency Services

| Service                                 | Market Range (CAD) | Taskly Target Price              |
| --------------------------------------- | ------------------ | -------------------------------- |
| Plumber (service call + first hour)     | $150-$350          | **$199 flat** (diagnostic + 1hr) |
| Electrician (service call + first hour) | $150-$300          | **$189 flat**                    |
| Locksmith (lockout)                     | $100-$250          | **$149 flat**                    |
| Appliance Repair (diagnostic)           | $80-$150           | **$99 flat** (diagnostic only)   |

#### Maintenance & Seasonal

| Service                       | Market Range (CAD) | Taskly Target Price             |
| ----------------------------- | ------------------ | ------------------------------- |
| Handyman (per hour)           | $50-$100           | **$75/hr** (2hr minimum)        |
| Furniture Assembly (per item) | $50-$150           | **$79 flat** (standard item)    |
| Snow Removal (driveway)       | $40-$80            | **$49/visit** or **$199/month** |
| Lawn Mowing                   | $40-$80            | **$45/visit** or **$149/month** |
| Gutter Cleaning               | $150-$300          | **$179 flat**                   |
| Pressure Washing (driveway)   | $150-$350          | **$199 flat**                   |

**Pricing Strategy:** Price at or slightly below market midpoint with standardized flat rates. The certainty of knowing the exact price before booking is a massive conversion driver vs. "get a quote" competitors.

---

## 3. Business Model & Pricing

### 3.1 Revenue Streams

| Stream                   | Description                                         | % of Revenue (Mature) |
| ------------------------ | --------------------------------------------------- | --------------------- |
| **Commission**           | 20% of service price on every booking               | 65%                   |
| **Service Fee**          | 7% fee charged to customers on top of service price | 20%                   |
| **Subscription Revenue** | Monthly Taskly Plus / Taskly Home plans             | 10%                   |
| **Priority Placement**   | Providers pay for preferred scheduling slots        | 3%                    |
| **Partnership Fees**     | Property management bulk deals, annual contracts    | 2%                    |

### 3.2 Commission Structure

| Provider Tier                        | Commission Rate | Unlock Criteria           |
| ------------------------------------ | --------------- | ------------------------- |
| New Provider (first 20 bookings)     | **15%**         | Onboarding incentive      |
| Standard                             | **20%**         | Default rate              |
| Volume (50+ bookings/month)          | **18%**         | High-performing providers |
| Elite (4.9+ rating, 95%+ completion) | **17%**         | Top-tier performers       |

### 3.3 Customer Pricing — Cleaning Vertical (Launch)

#### Flat-Rate Cleaning Pricing

| Service               | 1-Bed | 2-Bed | 3-Bed | 4-Bed | 5+ Bed |
| --------------------- | ----- | ----- | ----- | ----- | ------ |
| **Standard Cleaning** | $99   | $139  | $199  | $249  | $299   |
| **Deep Cleaning**     | $179  | $279  | $379  | $479  | $579   |
| **Move-in/out**       | $229  | $349  | $449  | $549  | $649   |
| **Post-renovation**   | $299  | $449  | $549  | $699  | Custom |

**Add-ons** (available on any cleaning):

| Add-on                          | Price |
| ------------------------------- | ----- |
| Inside Fridge                   | +$30  |
| Inside Oven                     | +$30  |
| Inside Cabinets                 | +$45  |
| Laundry (wash + fold, per load) | +$25  |
| Interior Windows                | +$40  |
| Balcony/Patio                   | +$35  |

### 3.4 Subscription Plans

| Plan                | Monthly Price | What's Included                                                                                                     | Best For                      |
| ------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Taskly Plus**     | $29/month     | 10% off all bookings + priority matching + no service fee                                                           | Regular bookers (2+/month)    |
| **Taskly Home**     | $59/month     | 15% off all bookings + priority matching + no service fee + 1 free standard cleaning/month + dedicated support line | Families, property managers   |
| **Taskly Property** | Custom        | Bulk pricing (15-20% off), API access, dedicated account manager, branded portal                                    | Property management companies |

**Subscription Unit Economics:**

| Metric                           | Taskly Plus ($29/mo)                                                | Taskly Home ($59/mo)                                              |
| -------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Subscription revenue/year        | $348                                                                | $708                                                              |
| Avg bookings/month (subscribers) | 2.5                                                                 | 4                                                                 |
| Discount given/year              | ~$420                                                               | ~$1,080                                                           |
| Service fee waived/year          | ~$234                                                               | ~$470                                                             |
| Net impact vs non-subscriber     | Slightly negative on margin but massively increases retention & LTV | Positive — free cleaning costs ~$80 but subscriber books 4x/month |
| 12-month retention               | 70%                                                                 | 80%                                                               |

### 3.5 Provider Payout Model

Providers receive **80% of the service price** (standard tier). Payouts processed via **Stripe Connect Express**.

| Example Booking                  | Customer Pays                       | Provider Receives (80%) | Taskly Commission (20%) |
| -------------------------------- | ----------------------------------- | ----------------------- | ----------------------- |
| Standard Cleaning (2-bed, $139)  | $139 + $9.73 service fee = $148.73  | $111.20                 | $27.80                  |
| Deep Cleaning (3-bed, $379)      | $379 + $26.53 service fee = $405.53 | $303.20                 | $75.80                  |
| Plumber (diagnostic + 1hr, $199) | $199 + $13.93 service fee = $212.93 | $159.20                 | $39.80                  |
| Snow Removal (monthly $199)      | $199 + $13.93 service fee = $212.93 | $159.20                 | $39.80                  |

### 3.6 Provider Incentive Programs

| Incentive              | Details                                                                  |
| ---------------------- | ------------------------------------------------------------------------ |
| **New Provider Bonus** | 15% commission (instead of 20%) for first 20 bookings                    |
| **Peak Hours Bonus**   | +10% payout for bookings during high-demand windows (weekends, evenings) |
| **Consistency Bonus**  | $100/month bonus for 95%+ completion rate AND 4.8+ rating                |
| **Referral Bonus**     | $75 per referred provider who completes 10 bookings                      |
| **Volume Tiers**       | Commission drops to 18% after 50 bookings/month                          |

### 3.7 Unit Economics — Per Booking (Standard Cleaning, 2-Bed, $139)

| Line Item                                 | Amount                                 |
| ----------------------------------------- | -------------------------------------- |
| Customer Pays                             | $139 + $9.73 service fee = **$148.73** |
| Provider Receives                         | $139 x 80% = **$111.20**               |
| Taskly Commission                         | $139 x 20% = **$27.80**                |
| Taskly Service Fee                        | **$9.73**                              |
| **Gross Revenue per Booking**             | **$37.53**                             |
| Payment Processing (Stripe ~2.9% + $0.30) | -$4.61                                 |
| Insurance/Guarantee Reserve (2%)          | -$2.97                                 |
| Customer Support Allocation               | -$2.50                                 |
| **Net Revenue per Booking**               | **$27.45**                             |
| **Net Margin per Booking**                | **~18.5%**                             |

### 3.8 Customer Acquisition & Lifetime Value

| Metric                               | Value     |
| ------------------------------------ | --------- |
| Blended CAC                          | $45       |
| Customer LTV                         | $780      |
| LTV:CAC Ratio                        | **16:1**  |
| Avg Customer Lifespan                | 2.5 years |
| Avg Bookings/Month (active customer) | 1.8       |
| Avg Order Value                      | $158      |

---

## 4. Go-to-Market Strategy

### 4.1 Phased Geographic Rollout

#### Wave 1 — Downtown Core + Midtown Toronto (Month 1-3)

**Neighborhoods:** Liberty Village, King West, Queen West, The Annex, Yorkville, Midtown, North York (Yonge corridor)

- Highest density of condo renters/young professionals who book cleaning digitally
- **Target:** 50 cleaning providers, 500 bookings/month by Month 3

#### Wave 2 — Expand Toronto + Inner Suburbs (Month 4-6)

**Add:** Etobicoke, Scarborough, East York, all of North York

- Add **emergency services** vertical (plumbing, electrical, locksmith)
- **Target:** 150 providers, 1,500 bookings/month by Month 6

#### Wave 3 — Full GTA (Month 7-12)

**Add:** Mississauga, Brampton, Vaughan, Markham, Richmond Hill, Oakville

- Add **maintenance + seasonal** verticals
- **Target:** 500 providers, 3,000 bookings/month by Month 12

### 4.2 Phased Vertical Rollout

**Why Cleaning First:** Highest frequency (weekly/biweekly) = fastest path to recurring revenue. Lowest regulatory barrier. Easiest to standardize. Builds customer trust for higher-value services. Proven Urban Company playbook.

| Phase       | Timeframe   | Verticals                                                                     |
| ----------- | ----------- | ----------------------------------------------------------------------------- |
| **Phase 1** | Month 1-3   | Standard cleaning, Deep cleaning, Move-in/move-out, Post-renovation           |
| **Phase 2** | Month 4-8   | + Plumbing, Electrical, Locksmith, Appliance repair                           |
| **Phase 3** | Month 9-14  | + Handyman, Painting, Furniture assembly, Drywall, Caulking/grouting          |
| **Phase 4** | Month 12-18 | + Snow removal, Lawn care, Gutter cleaning, Window cleaning, Pressure washing |

### 4.3 Supply-Side Acquisition (Provider Recruitment)

**Strategy: "Best gig they've ever had"**

| Channel                           | Tactic                                                                           | Expected Yield |
| --------------------------------- | -------------------------------------------------------------------------------- | -------------- |
| **Direct Outreach**               | Contact top-rated cleaners on HomeStars, Google, Yelp. Pitch guaranteed bookings | 30%            |
| **Cleaning Company Partnerships** | Partner with small cleaning companies (5-15 cleaners)                            | 25%            |
| **Indeed / Job Boards**           | "Earn $25-$35/hr as a Taskly Cleaning Professional"                              | 20%            |
| **Referral Program**              | $75 per referred provider who completes 10 bookings                              | 15%            |
| **Community Networks**            | Partner with newcomer settlement agencies, community centres                     | 10%            |

### 4.4 Demand-Side Acquisition (Customer Channels)

| Channel                      | Budget % | CAC Est. | Notes                                                       |
| ---------------------------- | -------- | -------- | ----------------------------------------------------------- |
| **Google Ads (Search)**      | 30%      | $40-$60  | High intent: "house cleaning Toronto", "plumber near me"    |
| **Instagram / Facebook Ads** | 20%      | $25-$40  | Visual before/after content, targeting condo dwellers 25-45 |
| **SEO / Content Marketing**  | 15%      | $10-$20  | Blog targeting high-intent keywords                         |
| **Referral Program**         | 15%      | $20-$30  | $25 credit for referrer + $25 off first booking             |
| **Partnership Marketing**    | 10%      | $15-$25  | Property managers, real estate agents, condo boards         |
| **Local / Guerrilla**        | 10%      | $15-$30  | Flyers in condo mailrooms, local Facebook groups            |

### 4.5 Partnership Opportunities

| Partner Type            | Value Proposition                                            | Revenue Model                                 |
| ----------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| **Property Management** | Streamline maintenance requests, tenant move-in/out cleaning | Bulk pricing (15% discount), annual contracts |
| **Real Estate Agents**  | "Taskly Welcome Package" at closing                          | Co-marketing, branded gift                    |
| **Condo Boards**        | Preferred vendor, resident discounts                         | Captive audience of 200-500 units             |
| **Airbnb / STR Hosts**  | Automated turnover cleaning between guests                   | API integration, volume pricing               |
| **Insurance Companies** | Preferred vendor for emergency repairs                       | Priority referral agreements                  |
| **Home Warranty Co.**   | Fulfill warranty claims via Taskly network                   | Service fulfillment fees                      |

### 4.6 Launch Promotions

| Promo                      | Details                                                         | Budget                 |
| -------------------------- | --------------------------------------------------------------- | ---------------------- |
| **First Clean Free**       | Up to $99 value for first-time customers                        | $20K (200 free cleans) |
| **Referral Double**        | $50 for referrer + $50 off for referee (first month only)       | $15K                   |
| **Condo Blitz**            | Partner with 10 condo buildings, offer 20% off to all residents | $10K                   |
| **Provider Signing Bonus** | $100 bonus after completing first 5 bookings                    | $5K (50 providers)     |

---

## 5. Operations & Quality

### 5.1 Provider Vetting Process (5-Step Pipeline)

```
Step 1: APPLICATION (Online Form)
  Initial application with basic information and service category
          ↓
Step 2: DOCUMENT VERIFICATION (1-2 days)
  Valid ID, trade licence, proof of $2M liability insurance,
  WSIB clearance, business registration
          ↓
Step 3: BACKGROUND CHECK (3-5 days)
  CPIC criminal record check via Certn API,
  vulnerable sector check (optional), 2 professional references
          ↓
Step 4: SKILL ASSESSMENT
  Cleaning → in-person/video assessment
  Trades → licence verification + portfolio review
  Handyman → skills quiz + photo evidence of past work
          ↓
Step 5: ONBOARDING (1 day)
  Platform training, service standards, brand guidelines,
  supervised test booking
          ↓
  ✓ ACTIVE PROVIDER
  Maintain 4.5+ rating, annual insurance & background check renewal,
  minimum 4 bookings/month to stay active
```

### 5.2 Quality Assurance System

| Mechanism               | Description                                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Two-Way Ratings**     | Customers rate providers (1-5 stars + tags). Providers rate customers.                                      |
| **Before/After Photos** | Required on all cleaning jobs. Auto-prompted in-app. Customer can view in booking history.                  |
| **Service Checklists**  | Digital checklists for each service type. Customer can see what was done.                                   |
| **Post-Service Survey** | Automated NPS survey 2 hours after completion. Low scores trigger follow-up call.                           |
| **Mystery Bookings**    | Quarterly QA bookings by Taskly staff to evaluate provider quality.                                         |
| **Re-Do Guarantee**     | Unsatisfied? Another provider sent within 48 hours at no charge.                                            |
| **Auto-Suspension**     | Rating drops below 4.2 → provider suspended pending review. 3 complaints in 30 days → immediate suspension. |

### 5.3 Dispute Resolution & Guarantee Policy

**Taskly Satisfaction Guarantee:**

- Cleaning not up to standards → Re-clean within 48 hours, free
- Repair fails within 30 days → Provider returns at no additional labour cost
- Property damaged during service → Covered up to $10,000 (provider liability insurance + Taskly platform insurance)

**Refund Policy:**

| Scenario                     | Policy                                     |
| ---------------------------- | ------------------------------------------ |
| Cancellation >24 hrs before  | Full refund                                |
| Cancellation 4-24 hrs before | 50% refund                                 |
| Cancellation <4 hrs before   | No refund (provider compensated)           |
| No-show by provider          | Full refund + $25 credit                   |
| Unsatisfactory service       | Re-do or full refund (Taskly's discretion) |

### 5.4 Insurance & Liability Model

| Coverage           | Provider                         | Amount                             |
| ------------------ | -------------------------------- | ---------------------------------- |
| General Liability  | Each provider (required)         | Min $2M                            |
| WSIB               | Each provider (where applicable) | Per Ontario requirements           |
| Platform Insurance | Taskly (umbrella policy)         | $5M aggregate                      |
| Property Damage    | Taskly guarantee fund            | Up to $10K per incident            |
| Cyber / Data       | Taskly                           | $1M — covers data breach liability |

**Cost:** Platform insurance estimated at $15K-$25K/year initially, scaling with bookings.

---

## 6. Revenue Projections

### 6.1 Year 1 — Launch & Establish

| Metric                      | Q1    | Q2    | Q3    | Q4     | Year 1 Total |
| --------------------------- | ----- | ----- | ----- | ------ | ------------ |
| Active Providers            | 50    | 150   | 350   | 500    | 500          |
| Monthly Bookings (end of Q) | 300   | 1,200 | 2,200 | 3,000  | —            |
| Avg Order Value             | $140  | $155  | $160  | $165   | $158         |
| GMV                         | $84K  | $465K | $792K | $1.19M | **$2.5M**    |
| Gross Revenue (27% take)    | $23K  | $126K | $214K | $321K  | **$683K**    |
| Operating Expenses          | $120K | $145K | $160K | $170K  | **$595K**    |
| Net Income                  | -$97K | -$19K | +$54K | +$151K | **+$88K**    |

### 6.2 Year 2 — Scale GTA + Full Marketplace

| Metric                 | Value  |
| ---------------------- | ------ |
| Annual GMV             | $16.8M |
| Total Revenue          | $4.85M |
| Net Income             | +$1.3M |
| Monthly Bookings (avg) | 8,000  |

### 6.3 Year 3 — Market Leadership + Expansion Prep

| Metric                 | Value  |
| ---------------------- | ------ |
| Annual GMV             | $40M   |
| Total Revenue          | $12M   |
| Net Income             | +$3.3M |
| Monthly Bookings (avg) | 18,000 |

### 6.4 Unit Economics by Vertical (Mature State)

| Vertical    | AOV      | Bookings/Mo | GMV/Mo       | Gross Margin | Contribution |
| ----------- | -------- | ----------- | ------------ | ------------ | ------------ |
| Cleaning    | $155     | 10,000      | $1.55M       | 30%          | $465K        |
| Emergency   | $280     | 2,500       | $700K        | 22%          | $154K        |
| Maintenance | $175     | 3,500       | $613K        | 25%          | $153K        |
| Seasonal    | $120     | 2,000       | $240K        | 28%          | $67K         |
| **Total**   | **$185** | **18,000**  | **$3.1M/mo** | **27%**      | **$839K/mo** |

### 6.5 Break-Even Analysis

| Scenario                           | Monthly Bookings Needed | Timeline    |
| ---------------------------------- | ----------------------- | ----------- |
| Cash-flow break-even               | ~1,800/month @ $160 AOV | Month 7-8   |
| Fully-loaded break-even            | ~3,500/month            | Month 14-16 |
| Payback on seed investment ($500K) | —                       | Month 18-22 |

### 6.6 Funding Requirements & Use of Funds

**Seed Round: $500K** (self-funded + angel investors)

| Category            | Amount | %   | Details                                           |
| ------------------- | ------ | --- | ------------------------------------------------- |
| Product Development | $125K  | 25% | App development, infrastructure, integrations     |
| Marketing & Growth  | $175K  | 35% | Paid acquisition, referral programs, partnerships |
| Operations          | $75K   | 15% | Provider onboarding, quality assurance, insurance |
| Team                | $100K  | 20% | Key hires (ops manager, growth marketer, support) |
| Reserve             | $25K   | 5%  | Contingency                                       |

**Series A (Month 14-18, if pursuing aggressive growth): $2-3M**

Use: Expand to Ottawa, Hamilton, Kitchener-Waterloo. Scale marketing spend. Build provider training academy. Hire engineering team for platform v2.

---

## 7. Product Architecture

### 7.1 Module Map

| Module              | Route Segment    | Description                                                         | User     |
| ------------------- | ---------------- | ------------------------------------------------------------------- | -------- |
| **Marketing**       | `/(marketing)/*` | SEO-optimized public pages, service pages, local landing pages      | Public   |
| **Customer App**    | `/app/*`         | Browse, book, track, pay, manage subscriptions                      | Customer |
| **Provider App**    | `/provider/*`    | Job feed, schedule, earnings, photos, checklists                    | Provider |
| **Admin Dashboard** | `/admin/*`       | Operations, analytics, finance, quality, provider management        | Admin    |
| **API Layer**       | `/api/*`         | Next.js Route Handlers — all business logic, webhooks, integrations | Internal |

### 7.2 Route Structure (App Router)

```
src/app/
├── page.tsx                        → Marketing landing page (SSR)
├── services/                       → Service category pages (SEO)
│   ├── cleaning/page.tsx
│   ├── emergency/page.tsx
│   ├── maintenance/page.tsx
│   └── seasonal/page.tsx
├── auth/                           → Login, signup, OAuth callback
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── callback/route.ts
├── apply/                          → Provider application flow
│   └── page.tsx
├── app/                            → Customer PWA (/app/*)
│   ├── layout.tsx                  → CustomerNav, auth-gated
│   ├── page.tsx                    → Dashboard (upcoming bookings, quick book)
│   ├── book/                       → Booking flow
│   │   └── page.tsx                → Multi-step booking (service → details → schedule → pay)
│   ├── bookings/                   → Booking history & active tracking
│   │   ├── page.tsx                → All bookings list
│   │   └── [id]/page.tsx           → Single booking detail + live tracking
│   ├── subscription/               → Subscription management
│   │   └── page.tsx
│   ├── addresses/                  → Saved addresses
│   │   └── page.tsx
│   └── profile/                    → Account settings
│       └── page.tsx
├── provider/                       → Provider PWA (/provider/*)
│   ├── layout.tsx                  → ProviderNav, auth-gated
│   ├── page.tsx                    → Dashboard (today's jobs, earnings summary)
│   ├── jobs/                       → Job management
│   │   ├── page.tsx                → Job feed + upcoming schedule
│   │   └── [id]/page.tsx           → Single job detail + checklist + photo upload
│   ├── earnings/                   → Earnings & payout history
│   │   └── page.tsx
│   ├── schedule/                   → Availability management
│   │   └── page.tsx
│   ├── documents/                  → Insurance, background check uploads
│   │   └── page.tsx
│   └── profile/                    → Provider profile settings
│       └── page.tsx
├── admin/                          → Admin dashboard (/admin/*)
│   ├── layout.tsx                  → AdminNav, auth-gated
│   ├── page.tsx                    → Dashboard (KPIs, real-time map)
│   ├── bookings/                   → Booking management
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── providers/                  → Provider pipeline & management
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── customers/                  → Customer management
│   │   └── page.tsx
│   ├── disputes/                   → Dispute resolution queue
│   │   └── page.tsx
│   ├── analytics/                  → Analytics & reporting
│   │   └── page.tsx
│   ├── payouts/                    → Payout management
│   │   └── page.tsx
│   └── settings/                   → Platform settings
│       └── page.tsx
└── api/                            → Route Handlers
    ├── auth/
    │   └── signup/route.ts
    ├── bookings/
    │   ├── route.ts                → GET (list), POST (create)
    │   ├── [id]/route.ts           → GET, PATCH (update status)
    │   ├── assign/route.ts         → Auto-assignment logic
    │   └── capture/route.ts        → Capture payment after completion
    ├── services/
    │   └── route.ts                → GET service categories + pricing
    ├── providers/
    │   ├── connect/route.ts        → Stripe Connect onboarding
    │   ├── location/route.ts       → GPS position updates
    │   ├── payout/route.ts         → Payout status
    │   └── status/route.ts         → Online/offline toggle
    ├── subscriptions/
    │   ├── create/route.ts
    │   ├── cancel/route.ts
    │   └── usage/route.ts
    ├── stripe/
    │   └── webhook/route.ts        → Stripe event handler
    ├── notifications/
    │   ├── route.ts                → GET list
    │   └── read/route.ts           → Mark as read
    ├── apply/
    │   └── route.ts                → Provider application submission
    ├── reviews/
    │   └── route.ts                → POST review after booking
    └── admin/
        ├── providers/route.ts      → Provider management
        ├── analytics/route.ts      → Dashboard data
        └── disputes/route.ts       → Dispute management
```

### 7.3 Cross-Cutting Concerns

| Concern                | Implementation                                                                   |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Authentication**     | Supabase Auth (email + phone OTP + Google OAuth), JWT tokens, role-based routing |
| **Authorization**      | Supabase RLS on every table + server-side role checks in API routes              |
| **Payments**           | Stripe: pre-authorize on booking, capture after service completion               |
| **Provider Payouts**   | Stripe Connect Express: percentage-based split per booking                       |
| **Notifications**      | Tri-channel: in-app (DB), SMS (Twilio), email (SendGrid)                         |
| **File Storage**       | Supabase Storage (private buckets, signed URLs for photos, documents)            |
| **Maps & Tracking**    | Google Maps API (address autocomplete + live provider GPS tracking)              |
| **Background Checks**  | Certn API (CPIC criminal record check, identity verification)                    |
| **Push Notifications** | Firebase Cloud Messaging (cross-platform PWA push)                               |
| **Analytics**          | PostHog (product analytics, funnel tracking, A/B testing)                        |
| **Error Monitoring**   | Sentry (error tracking + performance monitoring)                                 |
| **Session Management** | Middleware-based session refresh (same pattern as Driveo)                        |

### 7.4 Supabase Client Pattern

Two server-side clients in `src/lib/supabase/server.ts`:

- `createClient()` — uses anon key, respects RLS (for user-scoped queries)
- `createAdminClient()` — uses service role key, bypasses RLS (for admin/system operations)

Browser client in `src/lib/supabase/client.ts` — used in client components.

Session refresh handled by middleware (`middleware.ts` → `src/lib/supabase/middleware.ts`).

### 7.5 Key Lib Modules

| Module                     | Purpose                                                                        |
| -------------------------- | ------------------------------------------------------------------------------ |
| `src/lib/pricing.ts`       | Price calculator: base price by service/size + add-ons + subscription discount |
| `src/lib/assignment.ts`    | Provider matching: nearest available, skill-qualified, rating-weighted         |
| `src/lib/stripe.ts`        | Stripe client initialization                                                   |
| `src/lib/notifications.ts` | Tri-channel notification helpers (in-app + SMS + email)                        |
| `src/lib/providers.tsx`    | TanStack Query + Sonner toast provider                                         |
| `src/lib/service-data.ts`  | Service categories, pricing tables, add-ons                                    |
| `src/lib/geo.ts`           | Geolocation utilities, distance calculation, service zone validation           |
| `src/lib/checklists.ts`    | Service checklists by category                                                 |

---

## 8. Database Schema

### 8.1 Entity Relationship Diagram

```
AUTH_USERS  ──1:1──  PROFILES
                       │
            ┌──────────┼──────────┐
            │          │          │
      CUSTOMER    PROVIDER      ADMIN
      PROFILES    PROFILES    (role-based)
         │           │
         │     ┌─────┴──────┐
         │     │            │
      ADDRESSES  PROVIDER     PROVIDER
         │     SERVICES    AVAILABILITY
         │     ZONES
         │
    ┌────┴────┐
    │         │
 BOOKINGS  SUBSCRIPTIONS ── SUBSCRIPTION_PLANS
    │         │
    │    SUBSCRIPTION
    │      USAGE
    │
    ├── BOOKING_PHOTOS
    ├── BOOKING_CHECKLISTS
    ├── REVIEWS
    └── DISPUTES

 NOTIFICATIONS ── PROFILES
 SERVICE_CATEGORIES
 SERVICE_PRICING
```

### 8.2 Complete SQL Schema

```sql
-- ═══════════════════════════════════════════════════════════════
-- TASKLY.CA — DATABASE SCHEMA
-- Managed Home Services Marketplace
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════
-- PROFILES (extends Supabase auth.users)
-- ═══════════════════════════════════════

CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
  full_name   text NOT NULL,
  phone       text,
  email       text,
  avatar_url  text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- CUSTOMER PROFILES
-- ═══════════════════════════════════════

CREATE TABLE public.customer_profiles (
  id                  uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code       text UNIQUE,
  referred_by         uuid REFERENCES public.profiles(id),
  subscription_id     uuid,
  stripe_customer_id  text,
  preferred_language  text DEFAULT 'en',
  created_at          timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- CUSTOMER ADDRESSES (multiple per customer)
-- ═══════════════════════════════════════

CREATE TABLE public.addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label         text NOT NULL DEFAULT 'Home',  -- "Home", "Office", "Rental Unit #302"
  address_line  text NOT NULL,
  unit_number   text,
  city          text NOT NULL,
  province      text NOT NULL DEFAULT 'ON',
  postal_code   text NOT NULL,
  lat           numeric(10,7) NOT NULL,
  lng           numeric(10,7) NOT NULL,
  is_default    boolean DEFAULT false,
  access_notes  text,                          -- "Buzz #302", "Key under mat", "Gate code 1234"
  property_type text CHECK (property_type IN (
                  'condo', 'apartment', 'house', 'townhouse', 'commercial'
                )),
  bedrooms      int,                           -- pre-fill for cleaning pricing
  bathrooms     int,
  sqft          int,
  created_at    timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- PROVIDER PROFILES
-- ═══════════════════════════════════════

CREATE TABLE public.provider_profiles (
  id                      uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                  text NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  bio                     text,
  service_categories      text[],             -- {"cleaning", "plumbing", "electrical"}
  experience_years        int,

  -- Verification
  insurance_verified      boolean DEFAULT false,
  insurance_expiry        date,
  background_check_done   boolean DEFAULT false,
  background_check_date   date,
  wsib_clearance          boolean DEFAULT false,
  trade_licence_number    text,
  trade_licence_verified  boolean DEFAULT false,

  -- Stripe Connect
  stripe_account_id       text,               -- Stripe Connect Express
  stripe_onboarding_done  boolean DEFAULT false,

  -- Performance
  rating_avg              numeric(3,2) DEFAULT 0,
  ratings_count           int DEFAULT 0,
  jobs_completed          int DEFAULT 0,
  completion_rate         numeric(5,2) DEFAULT 100.00,
  response_time_avg_min   int,                -- avg time to accept jobs

  -- Live Tracking
  is_online               boolean DEFAULT false,
  current_lat             numeric(10,7),
  current_lng             numeric(10,7),
  location_updated_at     timestamptz,

  created_at              timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- PROVIDER SERVICE ZONES
-- ═══════════════════════════════════════

CREATE TABLE public.provider_service_zones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  postal_prefix text NOT NULL,                -- "M5V", "L4Z", etc.
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(provider_id, postal_prefix)
);

-- ═══════════════════════════════════════
-- PROVIDER AVAILABILITY
-- ═══════════════════════════════════════

CREATE TABLE public.provider_availability (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  day_of_week   int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sun, 6=Sat
  start_time    time NOT NULL,
  end_time      time NOT NULL,
  is_available  boolean DEFAULT true,
  UNIQUE(provider_id, day_of_week)
);

-- ═══════════════════════════════════════
-- SERVICE CATEGORIES & PRICING
-- ═══════════════════════════════════════

CREATE TABLE public.service_categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,                -- "Standard Cleaning", "Deep Cleaning", "Plumbing"
  slug          text NOT NULL UNIQUE,         -- "standard-cleaning"
  vertical      text NOT NULL CHECK (vertical IN (
                  'cleaning', 'emergency', 'maintenance', 'seasonal'
                )),
  description   text,
  icon          text,                         -- Lucide icon name
  is_active     boolean DEFAULT true,
  sort_order    int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE public.service_pricing (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  variant_label   text NOT NULL,              -- "1-Bed", "2-Bed", "Per Hour", "Flat Rate"
  price           int NOT NULL,               -- in cents
  duration_min    int,                        -- estimated duration in minutes
  description     text,
  is_active       boolean DEFAULT true,
  sort_order      int DEFAULT 0,
  UNIQUE(category_id, variant_label)
);

CREATE TABLE public.service_addons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name            text NOT NULL,              -- "Inside Fridge", "Inside Oven"
  price           int NOT NULL,               -- in cents
  is_active       boolean DEFAULT true,
  sort_order      int DEFAULT 0
);

-- ═══════════════════════════════════════
-- BOOKINGS
-- ═══════════════════════════════════════

CREATE TABLE public.bookings (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id                 uuid NOT NULL REFERENCES public.profiles(id),
  provider_id                 uuid REFERENCES public.profiles(id),  -- null until assigned
  address_id                  uuid NOT NULL REFERENCES public.addresses(id),

  -- Service
  service_category_id         uuid NOT NULL REFERENCES public.service_categories(id),
  service_pricing_id          uuid NOT NULL REFERENCES public.service_pricing(id),
  addon_ids                   uuid[],         -- array of service_addon IDs

  -- Status
  status                      text NOT NULL DEFAULT 'pending' CHECK (status IN (
                                'pending',        -- just created, searching for provider
                                'assigned',       -- provider found, awaiting acceptance
                                'accepted',       -- provider accepted
                                'en_route',       -- provider driving to customer
                                'arrived',        -- provider at location
                                'in_progress',    -- service in progress
                                'completed',      -- service done, photos uploaded
                                'paid',           -- payment captured
                                'cancelled',      -- cancelled by customer or system
                                'disputed'        -- issue raised
                              )),

  -- Scheduling
  booking_type                text NOT NULL DEFAULT 'instant' CHECK (booking_type IN (
                                'instant', 'scheduled', 'emergency'
                              )),
  scheduled_at                timestamptz,
  estimated_duration_min      int,

  -- Pricing (all in cents)
  base_price                  int NOT NULL,
  addon_total                 int NOT NULL DEFAULT 0,
  discount_amount             int NOT NULL DEFAULT 0,    -- subscription discount
  subtotal                    int NOT NULL,               -- base + addons - discount
  hst_amount                  int NOT NULL,               -- 13% HST
  service_fee                 int NOT NULL,               -- 7% service fee
  total_price                 int NOT NULL,               -- subtotal + HST + service fee
  provider_payout             int NOT NULL,               -- 80% of subtotal (adjustable by tier)

  -- Payment
  payment_status              text DEFAULT 'pending' CHECK (payment_status IN (
                                'pending', 'authorized', 'captured', 'refunded', 'failed'
                              )),
  stripe_payment_intent_id    text,

  -- Subscription (if booking from membership)
  subscription_id             uuid REFERENCES public.subscriptions(id),

  -- Timestamps
  provider_assigned_at        timestamptz,
  provider_accepted_at        timestamptz,
  provider_en_route_at        timestamptz,
  provider_arrived_at         timestamptz,
  service_started_at          timestamptz,
  service_completed_at        timestamptz,
  payment_captured_at         timestamptz,

  -- Notes
  customer_notes              text,
  provider_notes              text,
  cancellation_reason         text,

  created_at                  timestamptz DEFAULT now(),
  updated_at                  timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- BOOKING PHOTOS
-- ═══════════════════════════════════════

CREATE TABLE public.booking_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider_id   uuid NOT NULL REFERENCES public.profiles(id),
  photo_type    text NOT NULL CHECK (photo_type IN ('before', 'after')),
  storage_path  text NOT NULL,
  label         text,                         -- "Kitchen", "Bathroom", "Living Room"
  created_at    timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- BOOKING CHECKLISTS
-- ═══════════════════════════════════════

CREATE TABLE public.booking_checklists (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  item_name     text NOT NULL,                -- "Vacuum floors", "Wipe counters"
  is_completed  boolean DEFAULT false,
  completed_at  timestamptz,
  sort_order    int DEFAULT 0
);

-- ═══════════════════════════════════════
-- REVIEWS (Two-Way)
-- ═══════════════════════════════════════

CREATE TABLE public.reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id   uuid NOT NULL REFERENCES public.profiles(id),
  reviewee_id   uuid NOT NULL REFERENCES public.profiles(id),
  reviewer_role text NOT NULL CHECK (reviewer_role IN ('customer', 'provider')),
  rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text,
  tags          text[],                       -- {"punctual", "thorough", "friendly"}
  created_at    timestamptz DEFAULT now(),
  UNIQUE(booking_id, reviewer_role)           -- one review per role per booking
);

-- ═══════════════════════════════════════
-- DISPUTES
-- ═══════════════════════════════════════

CREATE TABLE public.disputes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid NOT NULL REFERENCES public.bookings(id),
  raised_by       uuid NOT NULL REFERENCES public.profiles(id),
  status          text NOT NULL DEFAULT 'open' CHECK (status IN (
                    'open', 'investigating', 'resolved', 'closed'
                  )),
  category        text NOT NULL CHECK (category IN (
                    'quality', 'damage', 'no_show', 'incomplete', 'billing', 'other'
                  )),
  description     text NOT NULL,
  resolution      text,
  refund_amount   int,                        -- in cents, if refund issued
  resolved_by     uuid REFERENCES public.profiles(id),
  created_at      timestamptz DEFAULT now(),
  resolved_at     timestamptz
);

-- ═══════════════════════════════════════
-- SUBSCRIPTION PLANS
-- ═══════════════════════════════════════

CREATE TABLE public.subscription_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,            -- "Taskly Plus", "Taskly Home"
  slug              text NOT NULL UNIQUE,
  monthly_price     int NOT NULL,             -- in cents
  discount_percent  int NOT NULL DEFAULT 0,   -- 10 or 15
  includes_cleaning boolean DEFAULT false,    -- Taskly Home includes 1 free clean
  no_service_fee    boolean DEFAULT true,
  priority_matching boolean DEFAULT true,
  stripe_price_id   text,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- SUBSCRIPTIONS
-- ═══════════════════════════════════════

CREATE TABLE public.subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id             uuid NOT NULL REFERENCES public.profiles(id),
  plan_id                 uuid NOT NULL REFERENCES public.subscription_plans(id),
  stripe_subscription_id  text,
  status                  text NOT NULL DEFAULT 'active' CHECK (status IN (
                            'active', 'paused', 'past_due', 'cancelled'
                          )),
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- SUBSCRIPTION USAGE
-- ═══════════════════════════════════════

CREATE TABLE public.subscription_usage (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id   uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  period_start      timestamptz NOT NULL,
  period_end        timestamptz NOT NULL,
  free_cleanings_allocated  int DEFAULT 0,    -- 1 for Taskly Home
  free_cleanings_used       int DEFAULT 0,
  bookings_count    int DEFAULT 0,
  discount_saved    int DEFAULT 0             -- total discount amount saved (cents)
);

-- ═══════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════

CREATE TABLE public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text NOT NULL,                  -- "booking_confirmed", "provider_en_route", etc.
  title       text NOT NULL,
  body        text,
  data        jsonb,                          -- { booking_id, provider_id, etc. }
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════
-- PROVIDER APPLICATIONS
-- ═══════════════════════════════════════

CREATE TABLE public.provider_applications (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES public.profiles(id),
  status                text NOT NULL DEFAULT 'submitted' CHECK (status IN (
                          'submitted', 'reviewing', 'approved', 'rejected'
                        )),
  service_categories    text[],
  experience_years      int,
  has_vehicle           boolean DEFAULT false,
  has_insurance         boolean DEFAULT false,
  has_tools             boolean DEFAULT false,
  cover_letter          text,
  resume_path           text,
  insurance_doc_path    text,
  id_doc_path           text,
  reviewed_by           uuid REFERENCES public.profiles(id),
  review_notes          text,
  created_at            timestamptz DEFAULT now(),
  reviewed_at           timestamptz
);

-- ═══════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════

CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_scheduled ON public.bookings(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_bookings_created ON public.bookings(created_at DESC);

CREATE INDEX idx_provider_profiles_status ON public.provider_profiles(status);
CREATE INDEX idx_provider_profiles_online ON public.provider_profiles(is_online) WHERE is_online = true;
CREATE INDEX idx_provider_profiles_location ON public.provider_profiles(current_lat, current_lng) WHERE is_online = true;

CREATE INDEX idx_addresses_customer ON public.addresses(customer_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_reviews_reviewee ON public.reviews(reviewee_id);
CREATE INDEX idx_booking_photos_booking ON public.booking_photos(booking_id);
CREATE INDEX idx_provider_zones ON public.provider_service_zones(postal_prefix);

-- ═══════════════════════════════════════
-- RLS POLICIES (Pattern: same as Driveo)
-- ═══════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Bookings: customers see their own, providers see assigned, admins see all
CREATE POLICY "Customers view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Providers view assigned bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = provider_id);

-- Addresses: customers see their own
CREATE POLICY "Customers manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = customer_id);

-- Notifications: users see their own
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: readable by all authenticated users
CREATE POLICY "Reviews are readable" ON public.reviews
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Reviewers can create" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Service categories & pricing: readable by all
-- (No RLS needed — use anon key for public read)
```

---

## 9. Core User Flows

### 9.1 Customer Booking Flow

The entire booking is completable in **under 60 seconds** for returning users:

```
STEP 1: SELECT SERVICE
┌─────────────────────────────────┐
│  What do you need?               │
│                                  │
│  ┌────────┐  ┌────────┐        │
│  │🧹      │  │🔧      │        │
│  │Cleaning │  │Emergency│        │
│  └────────┘  └────────┘        │
│  ┌────────┐  ┌────────┐        │
│  │🔨      │  │🌿      │        │
│  │Maintain.│  │Seasonal │        │
│  └────────┘  └────────┘        │
│                                  │
│  Popular: Standard Cleaning      │
│  [Quick Book →]                  │
└─────────────────────────────────┘
          ↓
STEP 2: SERVICE DETAILS
┌─────────────────────────────────┐
│  Standard Cleaning               │
│                                  │
│  Property size:                  │
│  [1-Bed $99] [2-Bed $139]       │
│  [3-Bed $199] [4-Bed $249]      │
│                                  │
│  Add-ons:                        │
│  □ Inside Fridge (+$30)          │
│  □ Inside Oven (+$30)            │
│  □ Inside Cabinets (+$45)        │
│  □ Laundry per load (+$25)       │
│                                  │
│  Special instructions:           │
│  [___________________________]   │
│                                  │
│  [Continue →]                    │
└─────────────────────────────────┘
          ↓
STEP 3: LOCATION
┌─────────────────────────────────┐
│  Where is the service?           │
│                                  │
│  📍 [123 King St W, Toronto_]   │
│     (Google autocomplete)        │
│                                  │
│  ── or use saved address ──     │
│  [🏠 Home] [💼 Office]          │
│                                  │
│  Unit/Apt: [302___]              │
│  Access notes: [Buzz #302___]    │
│                                  │
│  [Continue →]                    │
└─────────────────────────────────┘
          ↓
STEP 4: SCHEDULE
┌─────────────────────────────────┐
│  When do you need it?            │
│                                  │
│  [⚡ ASAP]    [📅 Schedule]     │
│                                  │
│  If ASAP: Next available provider│
│  If Schedule: Calendar + time    │
│  picker with available slots     │
│                                  │
│  [Continue →]                    │
└─────────────────────────────────┘
          ↓
STEP 5: CONFIRM & PAY
┌─────────────────────────────────┐
│  Confirm your booking            │
│                                  │
│  🧹 Standard Cleaning (2-Bed)   │
│  📍 123 King St W, Unit 302     │
│  ⏰ ASAP — next available        │
│  ➕ Inside Fridge                │
│                                  │
│  ─────────────────────────────  │
│  Standard Cleaning     $139.00   │
│  Inside Fridge          $30.00   │
│  Subtotal              $169.00   │
│  HST (13%)              $21.97   │
│  Service Fee (7%)       $11.83   │
│  Total                 $202.80   │
│                                  │
│  💳 Visa ****4242     [Change]   │
│                                  │
│  ℹ️  Card pre-authorized now.    │
│  Charged after service complete. │
│                                  │
│  [Confirm Booking →]             │
└─────────────────────────────────┘
```

### 9.2 Post-Booking: Real-Time Tracking (Customer View)

```
Booking Status Lifecycle:

  pending → assigned → accepted → en_route → arrived → in_progress → completed → paid

Customer Status Screen:
┌─────────────────────────────────┐
│  ← Back        Booking #T-1042  │
├─────────────────────────────────┤
│                                  │
│  🟢 PROVIDER EN ROUTE            │
│  Maria S. is on the way          │
│  ★ 4.9 · 312 jobs completed     │
│  📞 Call  💬 Message             │
│                                  │
│  ┌────────────────────────┐     │
│  │                        │     │
│  │   [GOOGLE MAP]         │     │
│  │   Live provider dot 📍 │     │
│  │   moving toward you    │     │
│  │                        │     │
│  └────────────────────────┘     │
│  ETA: ~15 minutes                │
│                                  │
│  STATUS TIMELINE:                │
│  ✅ Booking confirmed   2:23 PM │
│  ✅ Provider assigned   2:24 PM │
│  ✅ Provider en route   2:28 PM │
│  ⏳ Provider arrived    —       │
│  ○  Service in progress —       │
│  ○  Complete            —       │
│                                  │
│  🧹 Standard Cleaning (2-Bed)   │
│  📍 123 King St W, Unit 302     │
│  💰 $202.80 (pre-authorized)    │
└─────────────────────────────────┘
```

### 9.3 Provider Job Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         PROVIDER FLOW                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. RECEIVE JOB       → Push notification + SMS                   │
│     "New job: Standard Cleaning, 2-bed, 2.3 km away"            │
│     Payout: $111.20 · Est: 2.5 hours                             │
│     [Accept] [Decline] — 60 sec countdown                        │
│                                                                   │
│  2. TAP "ON MY WAY"   → Customer sees live GPS on map            │
│     Turn-by-turn navigation opens in Google Maps                  │
│                                                                   │
│  3. TAP "ARRIVED"     → Customer gets push notification          │
│                                                                   │
│  4. BEFORE PHOTOS     → Camera opens, take photos of each area   │
│     Prompted: Kitchen, Bathroom(s), Living Room, Bedroom(s)      │
│     Minimum 3 photos required to proceed                          │
│                                                                   │
│  5. START SERVICE     → Timer starts, customer sees "In Progress"│
│     Digital checklist loads for the service type                   │
│     Provider checks off items as completed                        │
│                                                                   │
│  6. COMPLETE CHECKLIST → All items must be checked                │
│                                                                   │
│  7. AFTER PHOTOS      → Same areas. Minimum 3 photos.            │
│     "Mark Complete" LOCKED until photos uploaded                  │
│                                                                   │
│  8. TAP "COMPLETE"    → Payment captured from customer's card    │
│                       → Provider earnings credited ($111.20)      │
│                       → Customer gets "Service complete!" push    │
│                       → Before/after photos visible to customer   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 9.4 Emergency Booking Flow

```
Customer selects "Emergency" →
  Describes issue (text + optional photos) →
  System broadcasts to ALL nearby available providers (within 15km) →
  First provider accepts (target: within 15 minutes) →
  Provider dispatched with live ETA →
  Provider arrives, diagnoses, provides quote for additional work →
  Customer approves quote in-app →
  Service performed →
  Customer rates →
  Payment processed

Emergency Surge Pricing:
  - Standard hours (8am-8pm): No surge
  - After hours (8pm-8am): +25% surcharge
  - Weekends/holidays: +15% surcharge
  - Stacking: After hours + weekend = +40%
```

### 9.5 Provider Auto-Assignment Algorithm

```
Input: booking location, service category, booking type

1. Query all providers WHERE:
   - status = 'approved'
   - is_online = true
   - service_categories @> {requested_category}
   - service zone matches customer postal prefix
   - NOT currently on another active job
   - day_of_week availability includes now

2. Calculate for each:
   - distance = haversine(provider_lat/lng, booking_lat/lng)
   - score = (1/distance) × rating_avg × completion_rate_factor

3. Sort by score DESC

4. For 'instant' bookings:
   - Assign top-scoring provider
   - If declined/timeout (60s), move to next

5. For 'emergency' bookings:
   - Broadcast to top 10 providers simultaneously
   - First to accept wins

6. For 'scheduled' bookings:
   - Assign top-scoring available provider
   - Provider has 4 hours to confirm
```

---

## 10. Tech Platform Spec

### 10.1 Tech Stack

| Layer                  | Technology                                        | Rationale                                              |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| **Frontend**           | Next.js 15 (App Router)                           | SSR for SEO, React ecosystem, same as Driveo           |
| **Styling**            | Tailwind CSS v4 + shadcn/ui                       | Rapid UI development, consistent design                |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Realtime + Storage) | Rapid development, RLS, real-time subscriptions        |
| **Payments**           | Stripe Connect                                    | Split payments, provider payouts, subscription billing |
| **Hosting**            | Vercel                                            | Seamless Next.js deployment, edge functions            |
| **Maps / Geocoding**   | Google Maps Platform                              | Address autocomplete, provider routing, live tracking  |
| **SMS**                | Twilio                                            | Booking confirmations, provider alerts                 |
| **Email**              | SendGrid                                          | Transactional email, marketing email                   |
| **Background Checks**  | Certn API                                         | Canadian-focused CPIC background checks                |
| **Push Notifications** | Firebase Cloud Messaging                          | Cross-platform push for PWA                            |
| **Analytics**          | PostHog                                           | Product analytics, funnel tracking, A/B testing        |
| **Error Monitoring**   | Sentry                                            | Error tracking + performance monitoring                |
| **State Management**   | TanStack Query                                    | Server state, caching, optimistic updates              |
| **Forms**              | React Hook Form + Zod                             | Form handling + validation                             |
| **Animations**         | Framer Motion                                     | Smooth UI transitions                                  |

### 10.2 Key Integrations Diagram

```
┌─────────────────────────────────────────────────────┐
│                  TASKLY PLATFORM                      │
│              Next.js 15 + Supabase                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Stripe   │  │  Google   │  │  Twilio   │          │
│  │  Connect  │  │  Maps API │  │  SMS      │          │
│  │           │  │           │  │           │          │
│  │ Payments  │  │ Geocoding │  │ Alerts    │          │
│  │ Payouts   │  │ Routing   │  │ OTP       │          │
│  │ Subscript.│  │ Tracking  │  │ Reminders │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ SendGrid  │  │  Certn    │  │  PostHog  │          │
│  │           │  │  API      │  │           │          │
│  │ Email     │  │ CPIC      │  │ Analytics │          │
│  │ Templates │  │ Verify    │  │ Funnels   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Firebase  │  │ Supabase  │  │  Sentry   │          │
│  │ FCM       │  │ Storage   │  │           │          │
│  │           │  │           │  │ Error     │          │
│  │ Push      │  │ Photos    │  │ Tracking  │          │
│  │ Notifs    │  │ Documents │  │ Perf Mon  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 10.3 Platform Features by App

**Customer App:**

- Browse services by category
- Instant booking with date/time picker
- Real-time provider matching & ETA
- In-app messaging with provider
- Secure payment (Stripe, Apple Pay, Google Pay)
- Booking history and rebooking
- Provider profiles with verified credentials
- Real-time provider tracking (Google Maps)
- Before/after photos viewable
- Subscription management & recurring bookings
- Multiple saved addresses
- Review & rating system

**Provider App:**

- Job feed / booking requests with accept/decline
- Daily/weekly schedule view
- Turn-by-turn navigation to job site
- Earnings dashboard & payout history (Stripe Connect)
- Digital service checklist (per job type)
- Before/after photo upload (mandatory)
- Time tracking for hourly services
- Manage availability & service zones
- Document management (insurance, licences)
- Training materials & service guides
- Performance metrics (rating, completion rate)

**Admin Dashboard:**

- Real-time booking map (all active jobs)
- Provider pipeline (applications → vetting → approval)
- Booking management & manual assignment
- Dispute resolution queue
- GMV, revenue, bookings analytics
- Provider & customer metrics
- Geographic demand heatmap
- Category performance breakdown
- Payout management
- Subscription tracking
- Low-rating alerts & auto-suspension
- Mystery booking scheduling

### 10.4 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Certn (Background Checks)
CERTN_API_KEY=
CERTN_WEBHOOK_SECRET=

# Firebase (Push Notifications)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Sentry
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=https://taskly.ca
NEXT_PUBLIC_APP_NAME=Taskly
```

---

## 11. Design System

### 11.1 Brand Identity

**Brand Essence:** Taskly represents trustworthy, professional home services with a focus on convenience, quality, and peace of mind. The brand conveys warmth, reliability, and modern service delivery.

**Brand Voice:**

- **Tone:** Warm, confident, trustworthy
- **Language:** Clear, reassuring, benefit-driven
- **Examples:**
  - "Your home, handled."
  - "Book in 30 seconds. Guaranteed satisfaction."
  - "Vetted pros. Fixed prices. Zero stress."

**Target Audience:**

- Condo dwellers in GTA (25-45, digital-native)
- Busy professionals & dual-income families
- Property managers & Airbnb hosts
- New homeowners
- Seniors who need reliable help

## 12. Competitive Advantages

### 12.1 Feature Comparison

| Differentiator       | HomeStars     | TaskRabbit | Jiffy   | **Taskly**            |
| -------------------- | ------------- | ---------- | ------- | --------------------- |
| Managed marketplace  | ✗             | Partial    | ✓       | **✓**                 |
| Instant booking      | ✗             | ✓          | ✓       | **✓**                 |
| Flat-rate pricing    | ✗             | ✗          | ✓       | **✓**                 |
| In-app payments      | ✗             | ✓          | ✓       | **✓**                 |
| Background checks    | Partial       | ✓          | ✓       | **✓ (CPIC + annual)** |
| Emergency services   | ✗             | ✗          | ✓       | **✓ (with surge)**    |
| Subscription plans   | ✗             | ✗          | ✗       | **✓**                 |
| Before/after photos  | ✗             | ✗          | ✗       | **✓ (required)**      |
| Service guarantee    | ✗             | ✗          | Limited | **✓ (re-do + $10K)**  |
| Property mgmt portal | ✗             | ✗          | ✗       | **✓**                 |
| Provider training    | ✗             | ✗          | ✗       | **✓**                 |
| Digital checklists   | ✗             | ✗          | ✗       | **✓**                 |
| Two-way ratings      | ✗             | ✓          | ✓       | **✓**                 |
| Live GPS tracking    | ✗             | ✗          | Limited | **✓**                 |
| Multi-vertical       | ✓ (directory) | ✓          | Limited | **✓ (phased)**        |

### 12.2 The Urban Company Playbook — Adapted for Canada

**What We Borrow:**

1. Managed marketplace model — own the experience
2. Standardized pricing — know the price before booking
3. Provider investment — training, tools, brand
4. Cleaning as wedge — high frequency builds trust
5. Ratings-driven quality — algorithmic matching

**What We Adapt for Canada:**

1. Higher provider take-home (80% vs UC's ~72%)
2. Regulatory compliance as feature (WSIB, trade licences)
3. Seasonal vertical (snow removal Oct-Apr = huge GTA demand)
4. Property management vertical (GTA has massive condo stock)
5. No product sales (stay asset-light, unlike UC selling products)
6. Less aggressive commission (start at 20%, not 25-30%)

### 12.3 Trust & Safety as a Moat

Trust is the #1 barrier in home services — someone is entering your home. Taskly's **10-layer trust stack** is expensive and operationally complex to replicate:

| #   | Trust Layer                | Description                                          |
| --- | -------------------------- | ---------------------------------------------------- |
| 1   | Verified Identity          | Government ID verification for all providers         |
| 2   | Criminal Background Check  | CPIC check via Certn, renewed annually               |
| 3   | Trade Verification         | Licence numbers verified with Skilled Trades Ontario |
| 4   | Insurance Verification     | $2M liability insurance confirmed and tracked        |
| 5   | WSIB Compliance            | Clearance certificates on file                       |
| 6   | Real-Time Tracking         | Know when your provider is arriving                  |
| 7   | Before/After Documentation | Photo evidence of every job                          |
| 8   | Satisfaction Guarantee     | Re-do or refund, no questions asked                  |
| 9   | $10K Property Protection   | Damage coverage beyond provider insurance            |
| 10  | Two-Way Ratings            | Both parties are accountable                         |

---

## 13. Risks & Mitigations

| Risk                                 | Severity | Likelihood | Mitigation                                                                                                  |
| ------------------------------------ | -------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| **Low provider supply at launch**    | High     | Medium     | Pre-recruit 50 providers. 15% commission for first 20 bookings. Partner with small cleaning companies.      |
| **High customer acquisition costs**  | Medium   | Medium     | Focus on high-LTV channels (referrals, partnerships). Cleaning subscription = low CAC amortization.         |
| **Provider quality inconsistency**   | High     | Medium     | Rigorous vetting, mandatory checklists, mystery bookings, fast suspension for low performers.               |
| **Regulatory/WSIB complexity**       | Medium   | Low        | Legal counsel on retainer. Compliance built into onboarding. Automate document expiry tracking.             |
| **Competitor response**              | Medium   | Medium     | Move fast on trust/quality differentiation. Subscription lock-in. Sticky property management relationships. |
| **Seasonality**                      | Low      | High       | Seasonal vertical fills winter demand. Push indoor services (cleaning, repairs) in winter.                  |
| **Insurance claim / major incident** | High     | Low        | Platform insurance policy. Strict vetting. Incident response playbook. Legal review.                        |
| **Provider classified as employee**  | High     | Low        | Legal structure as marketplace, not employer. Providers set own schedule, use own tools. Legal counsel.     |
| **Stripe Connect compliance**        | Medium   | Low        | Follow Stripe's marketplace compliance guidelines. KYC handled by Stripe.                                   |

---

## 14. Actionable Next Steps

### Immediate (Next 30 Days)

- [ ] **Register business:** Incorporate Taskly (Ontario corp or federal). Register domain taskly.ca. Trademark application.
- [ ] **Legal:** Engage startup lawyer for terms of service, provider agreements, privacy policy, insurance structure.
- [ ] **MVP build:** Customer booking flow (cleaning only), provider acceptance flow, Stripe Connect integration, basic admin dashboard.
- [ ] **Provider recruitment:** Begin outreach to 100 cleaning professionals via HomeStars, Indeed, and community networks. Target 50 for launch.
- [ ] **Insurance:** Obtain platform liability insurance quote. Set up provider insurance verification process.
- [ ] **Brand:** Finalize logo, brand guidelines, social media accounts (@tasklyca).

### Pre-Launch (Days 30-60)

- [ ] **Beta test:** 20 beta customers x 50 bookings. Iterate on UX and provider experience.
- [ ] **Provider onboarding:** Finalize vetting pipeline (Certn for background checks, document upload flow).
- [ ] **Pricing validation:** A/B test pricing with beta customers. Confirm willingness to pay.
- [ ] **Partnership outreach:** Contact 10 property management companies, 20 real estate agents.
- [ ] **Content/SEO:** Publish 10 SEO articles targeting high-intent keywords.
- [ ] **Payment testing:** Full Stripe Connect flow tested end-to-end with real providers.

### Launch (Days 60-90)

- [ ] **Public launch:** Downtown Toronto + Midtown. Google Ads + Instagram campaign.
- [ ] **First 200 customers:** "First Clean Free" promo (up to $99 value).
- [ ] **PR:** Local media outreach — BlogTO, Toronto Life, BetaKit, TechTO.
- [ ] **Iterate:** Weekly review of ratings, NPS, provider feedback. Fix top 3 issues every week.

### Post-Launch (Month 3-6)

- [ ] **Emergency vertical:** Begin recruiting licensed plumbers, electricians, locksmiths.
- [ ] **Subscription launch:** Introduce Taskly Plus and Taskly Home tiers.
- [ ] **Geographic expansion:** Expand coverage to full Toronto and inner suburbs.
- [ ] **Fundraise (optional):** If metrics are strong, begin angel/seed conversations.

---

## 15. Key Assumptions

| Assumption                      | Value                          | Sensitivity                                     |
| ------------------------------- | ------------------------------ | ----------------------------------------------- |
| Average take rate               | 27% (commission + service fee) | ±3% has moderate impact on break-even           |
| Customer acquisition cost       | $45 (blended)                  | If >$70, adjust channel mix                     |
| Provider churn (monthly)        | 8%                             | If >12%, revisit payout/incentive structure     |
| Customer retention (12-month)   | 40%                            | Subscriptions should push this to 50%+          |
| Avg bookings per provider/month | 15                             | Below 10 = supply/demand imbalance              |
| Payment processing cost         | 2.9% + $0.30                   | Stripe standard; negotiate at volume            |
| HST rate (Ontario)              | 13%                            | Regulatory — not variable                       |
| Provider take-home              | 80%                            | Core recruitment pitch; do not reduce below 75% |

---

**This plan is a living document. Update quarterly based on actual metrics vs. projections.**

_Prepared for Taskly.ca | April 2026 | Confidential_
