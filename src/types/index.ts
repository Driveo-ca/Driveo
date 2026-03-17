// ═══════════════════════════════════════
// DRIVEO — Core Type Definitions
// ═══════════════════════════════════════

// ── User Roles ──
export type UserRole = 'customer' | 'washer' | 'admin';

// ── Vehicle Types ──
export type VehicleType =
  | 'sedan'
  | 'coupe'
  | 'suv'
  | 'crossover'
  | 'minivan'
  | 'pickup'
  | 'large_suv'
  | 'convertible';

// ── Wash Plans ──
export type WashPlan = 'regular' | 'interior_exterior' | 'detailing';

// ── Booking Status ──
export type BookingStatus =
  | 'pending'
  | 'assigned'
  | 'en_route'
  | 'arrived'
  | 'washing'
  | 'completed'
  | 'paid'
  | 'cancelled'
  | 'disputed';

// ── Payment Status ──
export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'refunded'
  | 'failed';

// ── Washer Application Status ──
export type WasherStatus = 'pending' | 'approved' | 'suspended' | 'rejected' | 'query';

// ── Subscription Status ──
export type SubscriptionStatus = 'active' | 'paused' | 'past_due' | 'cancelled';

// ── Photo Type ──
export type PhotoType = 'before' | 'after';
export type PhotoAngle = 'front' | 'rear' | 'driver_side' | 'passenger_side' | 'interior';

// ── Database Row Types ──

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  default_address: string | null;
  default_lat: number | null;
  default_lng: number | null;
  default_postal: string | null;
  referral_code: string | null;
  referred_by: string | null;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface WasherProfile {
  id: string;
  status: WasherStatus;
  bio: string | null;
  service_zones: string[];
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_plate: string | null;
  tools_owned: string[];
  insurance_verified: boolean;
  background_check_done: boolean;
  stripe_account_id: string | null;
  rating_avg: number;
  jobs_completed: number;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  location_updated_at: string | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  plate: string | null;
  type: VehicleType;
  image_url: string | null;
  is_primary: boolean;
  nickname: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  washer_id: string | null;
  vehicle_id: string;
  wash_plan: WashPlan;
  dirt_level: number;
  status: BookingStatus;
  service_address: string;
  service_lat: number;
  service_lng: number;
  location_notes: string | null;
  is_instant: boolean;
  scheduled_at: string | null;
  estimated_duration_min: number | null;
  base_price: number;
  vehicle_multiplier: number;
  dirt_multiplier: number;
  final_price: number;
  hst_amount: number;
  total_price: number;
  washer_payout: number;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  subscription_id: string | null;
  washer_assigned_at: string | null;
  washer_en_route_at: string | null;
  washer_arrived_at: string | null;
  wash_started_at: string | null;
  wash_completed_at: string | null;
  payment_captured_at: string | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingPhoto {
  id: string;
  booking_id: string;
  washer_id: string;
  photo_type: PhotoType;
  storage_path: string;
  angle_label: PhotoAngle;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  washer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  wash_plan: WashPlan;
  monthly_price: number;
  washes_per_month: number;
  stripe_price_id: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  vehicle_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  cancelled_at: string | null;
}

export interface SubscriptionUsage {
  id: string;
  subscription_id: string;
  period_start: string;
  period_end: string;
  allocated: number;
  used: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// ── Pricing Types ──

export interface PriceBreakdown {
  plan: WashPlan;
  planLabel: string;
  basePriceCents: number;
  vehicleMultiplier: number;
  dirtMultiplier: number;
  finalPriceCents: number;
  hstCents: number;
  totalCents: number;
  washerPayoutCents: number;
  estimatedDurationMin: number;
}

// ── Booking Flow Types ──

export interface BookingFormData {
  vehicleId: string;
  vehicle: Vehicle | null;
  address: string;
  lat: number;
  lng: number;
  locationNotes: string;
  washPlan: WashPlan;
  dirtLevel: number;
  isInstant: boolean;
  scheduledAt: string | null;
}

// ── Joined/Expanded Types ──

export interface BookingWithDetails extends Booking {
  vehicle: Vehicle;
  washer: (Profile & { washer_profile: WasherProfile }) | null;
  customer: Profile;
  photos: BookingPhoto[];
  review: Review | null;
}

export interface WasherWithProfile extends Profile {
  washer_profile: WasherProfile;
}

export interface CustomerWithProfile extends Profile {
  customer_profile: CustomerProfile;
  vehicles: Vehicle[];
  subscription: (Subscription & { plan: SubscriptionPlan }) | null;
}
