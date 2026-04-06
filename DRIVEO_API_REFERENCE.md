# Driveo — Backend API Reference

Complete documentation of all API routes, business logic modules, and system flows.

---

## Table of Contents

- [Auth & Session Management](#auth--session-management)
- [Auth Endpoints](#auth-endpoints)
- [Booking Endpoints](#booking-endpoints)
- [Subscription Endpoints](#subscription-endpoints)
- [Washer Endpoints](#washer-endpoints)
- [Vehicle Endpoints](#vehicle-endpoints)
- [Location Endpoints](#location-endpoints)
- [Notification Endpoints](#notification-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Utility Endpoints](#utility-endpoints)
- [Stripe Webhook](#stripe-webhook)
- [Shared Business Logic](#shared-business-logic)
- [RLS & Auth Patterns](#rls--auth-patterns)
- [Quick Reference Table](#quick-reference-table)

---

## Auth & Session Management

**Middleware:** `middleware.ts` → `src/lib/supabase/middleware.ts`

- Uses Supabase SSR with Auth Cookie persistence (30-day max age)
- Validates user on every request via `updateSession()`
- Route-based access control by user role (`customer`, `washer`, `admin`)
- **Public routes:** `/`, `/auth`, `/plans`, `/how-it-works`, `/apply`, `/privacy`, `/terms`
- Authenticated users hitting the landing page are redirected to their dashboard based on role

---

## Auth Endpoints

### `POST /api/auth/signup`

Creates a user profile after Supabase Auth signup.

| Field | Value |
|-------|-------|
| **Auth** | None (public) |
| **Rate Limit** | 5 req/min per IP |

**Request Body:**

```json
{
  "userId": "string (from Supabase auth)",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "role": "customer | washer | admin",
  "utmData": { "utm_source": "string", ... }  // optional
}
```

**Response:** `200`

```json
{ "success": true }
```

**Flow:**

1. Rate limit check on IP
2. Create base profile in `profiles` table
3. If customer → generate referral code, create `customer_profiles` entry, store UTM data
4. If washer → create `washer_profiles` with `status: 'pending'`

**Errors:** `400` missing fields · `429` rate limited · `500` profile creation failed

---

### `POST /api/auth/delete-account`

Deletes the authenticated user and all associated data.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:** Empty

**Response:** `200`

```json
{ "success": true }
```

**Flow:**

1. Fetch avatar URL from profile
2. Delete avatar from Supabase storage if exists
3. Delete auth user via service role (cascades to profiles, vehicles, bookings)

**Errors:** `401` not authenticated · `500` deletion failed

---

### `POST /api/auth/upload-avatar`

Uploads a profile picture.

| Field | Value |
|-------|-------|
| **Auth** | Required |
| **Content-Type** | `multipart/form-data` |

**Request Body:**

```
file: File (max 5MB)
```

**Response:** `200`

```json
{ "url": "https://storage.supabase.co/avatars/..." }
```

**Flow:**

1. Validate file size (< 5MB)
2. Create/verify `avatars` bucket
3. Upload with upsert
4. Update profile `avatar_url`
5. Return public URL

**Errors:** `400` no file or too large · `401` not authenticated · `500` upload failed

---

### `POST /api/apply`

Submits a washer application with supporting documents.

| Field | Value |
|-------|-------|
| **Auth** | Required |
| **Rate Limit** | 3 req/min per IP |
| **Content-Type** | `multipart/form-data` |

**Request Body:**

```
fullName: string (required)
phone: string
streetAddress: string
city: string
province: string
postalCode: string
experienceLevel: "trained" | "fresher"
yearsExperience: string
maxWashesPerDay: string (default: "4")
governmentId: File (optional)
insurance: File (optional)
```

**Response:** `200`

```json
{ "success": true }
```

**Flow:**

1. Authenticate user
2. Rate limit check
3. Upload documents to `washer-docs` storage bucket
4. Update/create washer profile with application JSON in `bio` field
5. Store service zone from postal code (first 3 chars)
6. Send admin email notification with application details

**Errors:** `400` missing name · `401` not authenticated · `429` rate limited · `500` upload/DB failed

---

## Booking Endpoints

### `POST /api/bookings/create`

Creates a new booking with Stripe pre-authorization.

| Field | Value |
|-------|-------|
| **Auth** | Required |
| **Rate Limit** | 10 req/min per IP |

**Request Body:**

```json
{
  "vehicleId": "uuid",
  "washPlan": "regular | interior_exterior | detailing",
  "dirtLevel": 0-10,
  "serviceAddress": "string",
  "serviceLat": number,
  "serviceLng": number,
  "locationNotes": "string (optional)",
  "isInstant": boolean,
  "scheduledAt": "ISO timestamp (optional)"
}
```

**Response:** `200`

```json
{
  "bookingId": "uuid",
  "clientSecret": "stripe_payment_intent_secret",
  "price": 2500
}
```

**Validation:**

- `vehicleId`, `washPlan`, `dirtLevel`, `serviceAddress` all required
- `dirtLevel` must be 0–10
- `washPlan` must be `regular`, `interior_exterior`, or `detailing`
- Vehicle must belong to authenticated user

**Flow:**

1. Fetch vehicle (verify ownership)
2. Calculate price: `base × vehicle_multiplier × dirt_multiplier + 13% HST`
3. Get/create Stripe customer
4. Create PaymentIntent with `capture_method: 'manual'` (pre-authorization only)
5. Insert booking record with `payment_status: 'authorized'`
6. Create in-app notification for customer
7. Return `clientSecret` for frontend payment confirmation

**Errors:** `400` invalid fields · `401` not authenticated · `404` vehicle not found · `429` rate limited · `500` creation failed

---

### `POST /api/bookings/broadcast`

Broadcasts a new job to all approved washers via notification and email.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{ "bookingId": "uuid" }
```

**Response:** `200`

```json
{
  "success": true,
  "notified": 5
}
```

**Flow:**

1. Fetch booking details with vehicle info
2. Get all approved washers
3. For each washer: create in-app notification + send HTML email with job details (plan, location, vehicle, payout, dirt level)
4. Send admin email notification
5. Return count of notified washers

---

### `POST /api/bookings/claim`

Allows a washer to claim a broadcasted job. Race-condition safe.

| Field | Value |
|-------|-------|
| **Auth** | Required (washer, status `approved`) |

**Request Body:**

```json
{ "bookingId": "uuid" }
```

**Response (success):** `200`

```json
{
  "claimed": true,
  "bookingId": "uuid"
}
```

**Response (already taken):** `200`

```json
{
  "claimed": false,
  "message": "Job already taken or not available"
}
```

**Flow:**

1. Verify user is an approved washer
2. Atomic `UPDATE ... WHERE status='pending'` (prevents race conditions)
3. Set `washer_id`, `status='assigned'`, `washer_assigned_at`
4. If successful → notify customer that washer was assigned, email admin
5. If already claimed → return `claimed: false`

**Errors:** `401` not authenticated · `403` not a washer or not approved · `400` missing bookingId

---

### `POST /api/bookings/assign`

Finds and assigns the nearest available washer automatically.

| Field | Value |
|-------|-------|
| **Auth** | Required (booking owner or admin) |

**Request Body:**

```json
{ "bookingId": "uuid" }
```

**Response (assigned):** `200`

```json
{
  "assigned": true,
  "washerId": "uuid",
  "distanceKm": 5.3
}
```

**Response (no washers):** `200`

```json
{
  "assigned": false,
  "message": "No washers available"
}
```

**Flow:**

1. Verify booking is `pending`
2. Find nearest available washer (Haversine formula, 30km radius, online + approved)
3. Assign atomically

**Errors:** `401` not authenticated · `403` not owner/admin · `404` booking not found · `409` not pending

---

### `POST /api/bookings/capture`

Captures a pre-authorized payment after wash completion.

| Field | Value |
|-------|-------|
| **Auth** | Required (assigned washer or admin) |

**Request Body:**

```json
{ "bookingId": "uuid" }
```

**Response:** `200`

```json
{
  "success": true,
  "paymentIntentId": "pi_...",
  "amountCaptured": 2500
}
```

**Preconditions:**

- Booking status must be `completed`
- Payment status must be `authorized`
- Must have `stripe_payment_intent_id`

**Flow:**

1. Verify washer/admin authorization
2. Call Stripe to capture PaymentIntent
3. Update booking: `payment_status='captured'`, `status='paid'`
4. Notify customer
5. Clean up chat messages if they exist

**Errors:** `401` not authenticated · `403` not authorized · `404` booking not found · `400` invalid state

---

### `GET /api/bookings`

Lists bookings for the authenticated customer.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Query Params:**

- `status` (optional) — filter by booking status
- `limit` (optional) — default 20

**Response:** `200`

```json
{
  "bookings": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "washer_id": "uuid | null",
      "vehicle_id": "uuid",
      "wash_plan": "regular",
      "dirt_level": 5,
      "status": "completed",
      "service_address": "string",
      "total_price": 2500,
      "created_at": "ISO timestamp",
      "vehicles": { ... }
    }
  ]
}
```

**Errors:** `401` not authenticated · `500` fetch failed

---

## Subscription Endpoints

### `POST /api/subscriptions/checkout`

Creates a Stripe Checkout Session for a subscription plan.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{
  "planId": "uuid",
  "vehicleId": "uuid"
}
```

**Response:** `200`

```json
{ "url": "https://checkout.stripe.com/pay/..." }
```

**Preconditions:**

- Plan must exist and be active with `stripe_price_id`
- Vehicle must belong to user
- User must not have an active subscription

**Flow:**

1. Verify plan + vehicle
2. Check for existing subscription
3. Get/create Stripe customer
4. Create Checkout Session (mode `subscription`), metadata includes `plan_id`, `vehicle_id`, `washes_per_month`
5. Return redirect URL

**Errors:** `400` missing fields · `404` plan/vehicle not found · `409` already subscribed · `500` session creation failed

---

### `POST /api/subscriptions/create`

Creates an embedded Stripe Checkout Session (for inline UI).

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{
  "planId": "uuid",
  "vehicleId": "uuid"
}
```

**Response:** `200`

```json
{ "clientSecret": "seti_1234..." }
```

**Flow:** Same as `/checkout` but uses `ui_mode: 'embedded'`, returns `clientSecret` for `EmbeddedCheckout` component.

**Errors:** `400` missing fields · `404` plan/vehicle not found · `409` already subscribed

---

### `POST /api/subscriptions/confirm`

Finalizes a subscription after Stripe Checkout completion.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{ "sessionId": "cs_..." }
```

**Response:** `200`

```json
{
  "success": true,
  "subscriptionId": "uuid",
  "alreadyConfirmed": false
}
```

**Flow:**

1. Retrieve Stripe Checkout Session
2. Verify session belongs to user and status is `complete`
3. Idempotency check (already exists for this Stripe subscription ID?)
4. Extract period start/end from Stripe subscription
5. Create `subscriptions` record (status `active`)
6. Create `subscription_usage` row with allocated washes

**Errors:** `400` missing sessionId · `403` session mismatch · `500` DB insert failed

---

### `POST /api/subscriptions/activate`

Activates a subscription from a session ID or Stripe subscription ID.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{
  "sessionId": "cs_...",
  // OR
  "stripeSubscriptionId": "sub_..."
}
```

**Response:** `200`

```json
{
  "success": true,
  "subscriptionId": "uuid"
}
```

**Flow:**

1. Retrieve from Stripe (session or subscription)
2. Verify metadata ownership (`driveo_user_id`)
3. Idempotency check
4. Create subscription + usage records

**Errors:** `400` missing params · `403` ownership mismatch · `500` insert failed

---

### `POST /api/subscriptions/cancel`

Cancels a subscription at the end of the current billing period.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{ "subscriptionId": "uuid" }
```

**Response:** `200`

```json
{
  "message": "Subscription will be cancelled at the end of the current billing period",
  "cancelAtPeriodEnd": true,
  "currentPeriodEnd": "ISO timestamp"
}
```

**Flow:**

1. Verify user owns subscription
2. Set `cancel_at_period_end` on Stripe subscription
3. Update DB: `cancel_at_period_end=true`, `cancelled_at=now`

**Errors:** `401` not authenticated · `404` subscription not found · `500` update failed

---

### `GET /api/subscriptions/usage`

Returns subscription details and wash usage for the current period.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Response:** `200`

```json
{
  "subscription": {
    "id": "uuid",
    "planId": "uuid",
    "vehicleId": "uuid",
    "status": "active",
    "cancelAtPeriodEnd": false,
    "currentPeriodStart": "ISO",
    "currentPeriodEnd": "ISO",
    "plan": { ... }
  },
  "usage": {
    "allocated": 8,
    "used": 3,
    "periodStart": "ISO",
    "periodEnd": "ISO"
  },
  "subscriptions": [ ... ]
}
```

**Flow:**

1. Fetch all active subscriptions for user
2. Batch-fetch usage records (avoids N+1)
3. Group usage by subscription (latest per subscription)
4. Return primary subscription + full array

**Errors:** `401` not authenticated · `500` fetch failed

---

## Washer Endpoints

### `PATCH /api/washer/status`

Updates a booking's status through the wash lifecycle.

| Field | Value |
|-------|-------|
| **Auth** | Required (assigned washer) |

**Request Body:**

```json
{
  "bookingId": "uuid",
  "status": "en_route | arrived | washing | completed"
}
```

**Response:** `200`

```json
{
  "success": true,
  "bookingId": "uuid",
  "previousStatus": "assigned",
  "newStatus": "en_route"
}
```

**Valid Transitions:**

```
assigned → en_route → arrived → washing → completed
```

**Completion Requirement:** Must have at least 5 "after" photos uploaded.

**Flow:**

1. Verify user is the assigned washer
2. Validate status transition
3. If `completed`: verify 5+ after photos exist
4. Update booking with new status + timestamp
5. Notify customer on key transitions (`en_route`, `arrived`, `washing`, `completed`)

**Errors:** `400` invalid transition · `401` not authenticated · `403` not assigned washer · `404` booking not found · `409` invalid transition

---

### `POST /api/washer/location`

Updates the washer's GPS coordinates and sets them online.

| Field | Value |
|-------|-------|
| **Auth** | Required (washer) |

**Request Body:**

```json
{
  "lat": number,
  "lng": number
}
```

**Response:** `200`

```json
{ "success": true }
```

**Validation:** lat: -90 to 90, lng: -180 to 180

**Updates:** `current_lat`, `current_lng`, `is_online=true`, `location_updated_at`

**Errors:** `400` invalid coords · `401` not authenticated · `500` update failed

---

### `POST /api/washer/connect` — Stripe Connect Onboarding

Creates a Stripe Connect Express account and returns the onboarding URL.

| Field | Value |
|-------|-------|
| **Auth** | Required (washer) |

**Request Body:**

```json
{
  "returnUrl": "string (optional)",
  "refreshUrl": "string (optional)"
}
```

**Response:** `200`

```json
{
  "url": "https://connect.stripe.com/onboarding/...",
  "accountId": "acct_..."
}
```

**Flow:**

1. Check if washer already has a Connect account
2. If not: create Express account (individual, Canada)
3. Create account onboarding link
4. Return URL

---

### `GET /api/washer/connect` — Stripe Connect Status

Returns the washer's Connect account status.

**Response:** `200`

```json
{
  "connected": true,
  "accountId": "acct_...",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "detailsSubmitted": true
}
```

---

### `POST /api/washer/payout`

Triggers a payout to a washer for a specific booking.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin only) |

**Request Body:**

```json
{ "bookingId": "uuid" }
```

**Response:** `200`

```json
{
  "success": true,
  "transferId": "tr_...",
  "amount": 1100
}
```

**Preconditions:**

- Booking must be in `paid` or `captured` payment state
- Washer must have completed Stripe Connect setup

**Flow:**

1. Verify admin
2. Fetch booking, verify payment captured
3. Get washer's Connect account
4. Create Stripe Transfer
5. Notify washer

**Errors:** `401` not authenticated · `403` not admin · `400` invalid payment state · `404` booking not found · `500` transfer failed

---

## Vehicle Endpoints

### `DELETE /api/vehicles`

Deletes a vehicle and optionally cascades to subscriptions and bookings.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{
  "id": "uuid",
  "force": boolean  // optional
}
```

**Response (success):** `200`

```json
{ "success": true }
```

**Response (has subscriptions, force=false):** `409`

```json
{
  "error": "has_subscriptions",
  "subscriptionCount": 2
}
```

**Flow:**

1. Verify vehicle ownership
2. Check for active subscriptions
3. If subscriptions exist and `force != true` → return 409
4. If `force=true` or no subscriptions → cascade delete:
   - `subscription_usage` records
   - Nullify `subscription_id` on bookings
   - Subscriptions
   - Bookings
   - Vehicle

**Errors:** `400` missing id · `401` not authenticated · `404` not found · `409` has subscriptions

---

## Location Endpoints

### `POST /api/locations`

Saves a new location for the customer.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{
  "label": "string",
  "address": "string",
  "lat": number,
  "lng": number,
  "notes": "string (optional)"
}
```

**Response:** `201`

```json
{
  "id": "uuid",
  "customer_id": "uuid",
  "label": "string",
  "address": "string",
  "lat": number,
  "lng": number,
  "notes": "string | null",
  "created_at": "ISO"
}
```

**Validation:** `label`, `address`, `lat`, `lng` required. Max 10 locations per user.

---

### `GET /api/locations`

Lists saved locations for the customer.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Response:** `200`

```json
[
  {
    "id": "uuid",
    "label": "Home",
    "address": "...",
    "lat": 43.5932,
    "lng": -79.6441,
    "is_default": true,
    "created_at": "ISO"
  }
]
```

Ordered by `is_default DESC`, `created_at ASC`.

---

### `DELETE /api/locations`

Deletes a saved location.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Query Param:** `id=uuid`

**Response:** `200`

```json
{ "success": true }
```

User must own the location.

---

## Notification Endpoints

### `GET /api/notifications`

Returns the last 50 notifications for the authenticated user.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Response:** `200` (Cache-Control: private, no-store)

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "booking_created | payment_captured | new_job_alert | ...",
      "title": "string",
      "body": "string",
      "data": { ... },
      "is_read": boolean,
      "created_at": "ISO timestamp"
    }
  ]
}
```

---

### `PATCH /api/notifications/read`

Marks notifications as read.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{
  "notificationId": "uuid"
  // OR
  "all": true
}
```

**Response:** `200`

```json
{ "success": true }
```

---

## Admin Endpoints

### `POST /api/admin/bookings`

Accepts or rejects a pending booking.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin) |

**Request Body:**

```json
{
  "bookingId": "uuid",
  "action": "accept | reject",
  "washerId": "uuid"  // required if action='accept'
}
```

**Response (accept):** `200`

```json
{
  "success": true,
  "status": "requested",
  "washerId": "uuid"
}
```

**Response (reject):** `200`

```json
{
  "success": true,
  "status": "cancelled"
}
```

**Flow (accept):**

1. Verify booking is pending and washer is approved
2. Send job request notification to washer (in-app + email)
3. Booking stays `pending` (admin is requesting, not assigning)

**Flow (reject):**

1. Update booking status to `cancelled`

**Errors:** `401/403` not admin · `404` booking/washer not found · `409` not pending

---

### `PATCH /api/admin/customers`

Blocks or unblocks a customer.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin) |

**Request Body:**

```json
{
  "customerId": "uuid",
  "action": "block | unblock"
}
```

**Response:** `200`

```json
{
  "success": true,
  "blocked": true
}
```

**Flow:** `block` → ban user for ~100 years. `unblock` → remove ban.

---

### `DELETE /api/admin/customers`

Permanently deletes a customer account.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin) |

**Request Body:**

```json
{ "customerId": "uuid" }
```

**Response:** `200`

```json
{ "success": true }
```

**Flow:** Delete profile (cascades), delete `customer_profiles`, delete auth user.

---

### `POST /api/admin/customers` (Refund)

Issues a Stripe refund for a booking.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin) |

**Request Body:**

```json
{ "bookingId": "uuid" }
```

**Response:** `200`

```json
{
  "success": true,
  "refundedAmount": 2500
}
```

**Flow:**

1. Fetch booking, verify payment can be refunded
2. Create Stripe refund via PaymentIntent
3. Update booking: `payment_status='refunded'`, `status='cancelled'`

**Errors:** `401/403` not admin · `404` booking not found · `409` already refunded

---

### `GET /api/admin/washers`

Lists all washers with profiles and application documents.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin) |

**Response:** `200`

```json
{
  "washers": [
    {
      "id": "uuid",
      "full_name": "string",
      "email": "string",
      "phone": "string",
      "washer_profiles": {
        "status": "pending | approved | rejected",
        "rating_avg": 4.85,
        "jobs_completed": 47,
        "application_data": {
          "fullName": "string",
          "experienceLevel": "trained | fresher",
          "governmentIdUrl": "signed_url (1hr TTL)",
          "insuranceUrl": "signed_url (1hr TTL)"
        }
      }
    }
  ]
}
```

---

### `PATCH /api/admin/washers`

Updates a washer's application status and sends an email notification.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin) |

**Request Body:**

```json
{
  "washerId": "uuid",
  "status": "approved | rejected | query",
  "query_message": "string (optional, for status='query')"
}
```

**Response:** `200`

```json
{ "success": true }
```

**Email Templates:**

- `approved` → Welcome email with dashboard link
- `rejected` → Rejection notice
- `query` → Request for more info with custom message

---

### `POST /api/admin/payouts`

Triggers a bulk payout to a washer for all their completed bookings.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin) |

**Request Body:**

```json
{ "washer_id": "uuid" }
```

**Response:** `200`

```json
{
  "success": true,
  "transferId": "tr_...",
  "amount": 5500,
  "bookingCount": 5
}
```

**Flow:**

1. Get washer's Stripe Connect account
2. Fetch all completed, captured bookings
3. Sum `washer_payout` amounts
4. Create Stripe Transfer to Connect account
5. Mark bookings as `paid`
6. Notify washer

---

### `POST /api/admin/setup-stripe-plans`

One-time setup to create Stripe products and prices for subscription plans.

| Field | Value |
|-------|-------|
| **Auth** | Required (admin) |

**Request Body:** Empty

**Response:** `200`

```json
{
  "success": true,
  "results": [
    {
      "plan": "Standard Plan",
      "product_id": "prod_...",
      "price_id": "price_...",
      "amount": 1999
    }
  ]
}
```

> Should be disabled/removed after first run.

---

## Utility Endpoints

### `POST /api/generate-dirty-car`

Generates an AI dirty car image using Gemini, with Supabase storage caching.

| Field | Value |
|-------|-------|
| **Auth** | Required |

**Request Body:**

```json
{
  "make": "string",
  "model": "string",
  "year": number,
  "color": "string (optional)",
  "dirtLevel": 0-10
}
```

**Response:** `200`

```json
{
  "url": "https://storage.supabase.co/dirty-cars/...",
  "cached": true
}
```

**Flow:**

1. If `dirtLevel=0` → return clean Imagin Studio image
2. Check `dirty-cars` bucket cache
3. If cached → return
4. Download clean image from Imagin Studio
5. Send to Gemini image-to-image API with dirt prompt
6. Upload to Supabase storage (cache key: `make/model/year/color/dirtLevel`)
7. Return URL

---

### `POST /api/dev/seed`

Creates test data for development. **Blocked in production.**

| Field | Value |
|-------|-------|
| **Auth** | None |
| **Environment** | Development only |

**Response:** `200`

```json
{
  "success": true,
  "accounts": {
    "customer": { "email": "customer@driveo.test", "password": "Test1234!" },
    "washer": { "email": "washer@driveo.test", "password": "Test1234!" },
    "admin": { "email": "admin@driveo.test", "password": "Test1234!" }
  },
  "data": {
    "bookings": 18,
    "vehicles": 2,
    "notifications": 15,
    "reviews": 8
  }
}
```

---

## Stripe Webhook

### `POST /api/stripe/webhook`

Handles Stripe events. Verified via `stripe-signature` header.

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Update booking `payment_status` → `captured` |
| `payment_intent.payment_failed` | Set `payment_status` → `failed`, notify customer |
| `payment_intent.canceled` | Set `payment_status` → `refunded`, `status` → `cancelled` |
| `checkout.session.completed` | Create subscription record (idempotency checked) |
| `account.updated` | Update washer status → `approved` when Connect is enabled |

Returns `200` for all events to prevent Stripe retry storms. Errors are logged for manual review.

---

## Shared Business Logic

### Pricing Engine — `src/lib/pricing.ts`

```
final_price = base_price × vehicle_multiplier × dirt_multiplier
total = final_price + (final_price × 0.13 HST)
```

**Exports:**

| Export | Description |
|--------|-------------|
| `calculatePrice(plan, vehicleType, dirtLevel)` | Returns `PriceBreakdown` object |
| `PLAN_PRICES` | Base prices per plan |
| `VEHICLE_MULTIPLIERS` | Price multipliers by vehicle type |
| `DIRT_MULTIPLIERS` | Price multipliers by dirt level (0–10) |
| `WASHER_PAYOUTS` | Flat payout per wash type |
| `centsToDisplay()` | Format cents to display string |
| `formatDuration()` | Format duration for display |

### Stripe — `src/lib/stripe.ts`

| Export | Description |
|--------|-------------|
| `stripe` | Initialized Stripe client |
| `getOrCreateStripeCustomer(userId, email, name, adminSupabase)` | Returns `stripe_customer_id` |

**Payment flow:** Pre-auth on booking → frontend confirms → backend captures after completion → webhook for async events.

### Assignment — `src/lib/assignment.ts`

| Export | Description |
|--------|-------------|
| `findNearestWasher(lat, lng)` | Returns washer profile + `distance_km` |
| `assignWasher(bookingId, washerId)` | Returns success flag |

Uses Haversine distance formula. Max radius: **30km**. Filters: online + approved + known location.

### Notifications — `src/lib/notifications.ts`

| Export | Description |
|--------|-------------|
| `sendSMS(to, body)` | Twilio |
| `sendEmail(to, subject, html)` | Resend |
| `createNotification(userId, type, title, body, data)` | DB insert |
| `notifyWasherNewJob()` | Multi-channel washer alert |
| `notifyCustomerWasherAssigned()` | Customer notification |
| `notifyCustomerWasherEnRoute()` | Customer notification |
| `notifyCustomerWashComplete()` | Customer notification |
| `notifyWasherJobRequest()` | Washer notification |

**Multi-channel:** SMS (if phone) + Email (if email) + In-app (always).

### Rate Limiting — `src/lib/rate-limit.ts`

| Export | Description |
|--------|-------------|
| `rateLimit(ip, route, { maxRequests, windowMs })` | Returns `{ success: boolean }` |

In-memory per-IP per-route tracking with automatic cleanup every 5 minutes.

---

## RLS & Auth Patterns

### Row-Level Security (Supabase)

| Table | Customer | Washer | Admin |
|-------|----------|--------|-------|
| Bookings | Own bookings | Assigned/claimed | All |
| Vehicles | Own vehicles | — | All |
| Subscriptions | Own subscriptions | — | All |
| Washer Profiles | — | Own profile | All |

### Auth Pattern by Route

| Route Prefix | Auth Check |
|--------------|-----------|
| `/api/auth/*` | Public or session-based |
| `/api/bookings/*` | Authenticated customer |
| `/api/subscriptions/*` | Authenticated customer |
| `/api/washer/*` | `user.user_metadata?.role === 'washer'` |
| `/api/admin/*` | `user.user_metadata?.role === 'admin'` |
| `/api/stripe/webhook` | Stripe signature verification |

### Supabase Client Usage

| Client | Key | RLS | Use Case |
|--------|-----|-----|----------|
| `createClient()` | Anon key | Respected | User-scoped queries |
| `createAdminClient()` | Service role key | Bypassed | Admin/system operations |
| Browser client | Anon key | Respected | Client components |

---

## Quick Reference Table

| Route | Method | Auth | Rate Limit | Purpose |
|-------|--------|------|------------|---------|
| `/api/auth/signup` | POST | None | 5/min | Create user profile |
| `/api/auth/delete-account` | POST | Required | — | Delete user + cascade |
| `/api/auth/upload-avatar` | POST | Required | — | Upload profile picture |
| `/api/apply` | POST | Required | 3/min | Washer application |
| `/api/bookings` | GET | Required | — | List customer bookings |
| `/api/bookings/create` | POST | Required | 10/min | Create booking + payment intent |
| `/api/bookings/broadcast` | POST | Required | — | Notify washers of job |
| `/api/bookings/claim` | POST | Washer | — | Race-safe job claim |
| `/api/bookings/assign` | POST | Required | — | Auto-assign nearest washer |
| `/api/bookings/capture` | POST | Washer/Admin | — | Capture pre-auth payment |
| `/api/subscriptions/checkout` | POST | Required | — | Create Checkout Session |
| `/api/subscriptions/create` | POST | Required | — | Create Embedded Checkout |
| `/api/subscriptions/confirm` | POST | Required | — | Finalize subscription |
| `/api/subscriptions/activate` | POST | Required | — | Activate from Stripe |
| `/api/subscriptions/cancel` | POST | Required | — | Cancel at period end |
| `/api/subscriptions/usage` | GET | Required | — | Get subscription usage |
| `/api/washer/status` | PATCH | Washer | — | Update booking lifecycle |
| `/api/washer/location` | POST | Washer | — | Update GPS coordinates |
| `/api/washer/connect` | POST/GET | Washer | — | Stripe Connect onboarding |
| `/api/washer/payout` | POST | Admin | — | Trigger single payout |
| `/api/vehicles` | DELETE | Required | — | Delete vehicle + cascade |
| `/api/locations` | GET/POST/DELETE | Required | — | Manage saved locations |
| `/api/notifications` | GET | Required | — | List notifications |
| `/api/notifications/read` | PATCH | Required | — | Mark as read |
| `/api/generate-dirty-car` | POST | Required | — | AI dirty car image |
| `/api/admin/bookings` | POST | Admin | — | Accept/reject bookings |
| `/api/admin/customers` | PATCH/DELETE/POST | Admin | — | Block/delete/refund |
| `/api/admin/washers` | GET/PATCH | Admin | — | List/update washers |
| `/api/admin/payouts` | POST | Admin | — | Bulk payout to washer |
| `/api/admin/setup-stripe-plans` | POST | Admin | — | One-time Stripe setup |
| `/api/dev/seed` | POST | Dev only | — | Create test data |
| `/api/stripe/webhook` | POST | Stripe sig | — | Stripe event handler |

---

All endpoints return JSON. Standard HTTP status codes: `200` OK · `201` Created · `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `429` Rate Limited · `500` Internal Server Error.
