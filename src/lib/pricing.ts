import type { VehicleType, WashPlan, PriceBreakdown } from '@/types';

// ── Plan Base Prices (in cents) ──
export const PLAN_PRICES: Record<WashPlan, number> = {
  regular: 1800,           // $18.00
  interior_exterior: 2500, // $25.00
  detailing: 18900,        // $189.00
};

export const PLAN_LABELS: Record<WashPlan, string> = {
  regular: 'Regular Wash',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Detailing',
};

export const PLAN_DESCRIPTIONS: Record<WashPlan, string> = {
  regular: 'Exterior hand wash, rinse, and dry',
  interior_exterior: 'Full interior vacuum & wipe + exterior wash',
  detailing: 'Deep clean, polish, wax, full interior detail',
};

// ── Vehicle Type Multipliers ──
export const VEHICLE_MULTIPLIERS: Record<VehicleType, number> = {
  sedan: 1.0,
  coupe: 1.0,
  convertible: 1.0,
  crossover: 1.15,
  suv: 1.25,
  minivan: 1.25,
  pickup: 1.2,
  large_suv: 1.4,
};

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  sedan: 'Sedan',
  coupe: 'Coupe',
  convertible: 'Convertible',
  crossover: 'Crossover',
  suv: 'SUV',
  minivan: 'Minivan',
  pickup: 'Pickup Truck',
  large_suv: 'Large SUV / Truck',
};

// ── Dirt Level Multipliers (Driveo Slide) ──
export const DIRT_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 1.0,
  5: 1.0,
  6: 1.15,
  7: 1.3,
  8: 1.5,
  9: 1.75,
  10: 2.0,
};

export const DIRT_LABELS: Record<number, string> = {
  0: 'Just Washed',
  1: 'Almost Clean',
  2: 'Light Dust',
  3: 'Lightly Dusty',
  4: 'Some Dirt',
  5: 'Normal',
  6: 'Moderately Dirty',
  7: 'Dirty',
  8: 'Very Dirty',
  9: 'Heavily Soiled',
  10: 'Extreme',
};

// ── Washer Payouts (flat rate per wash, in cents) ──
export const WASHER_PAYOUTS: Record<WashPlan, number> = {
  regular: 1100,           // $11.00
  interior_exterior: 1100, // $11.00
  detailing: 2200,         // $22.00
};

// ── Estimated Duration (minutes, for sedan at dirt level 5) ──
const BASE_DURATION: Record<WashPlan, number> = {
  regular: 35,
  interior_exterior: 75,
  detailing: 240,
};

const VEHICLE_DURATION_MULTIPLIER: Record<VehicleType, number> = {
  sedan: 1.0,
  coupe: 1.0,
  convertible: 1.0,
  crossover: 1.1,
  suv: 1.2,
  minivan: 1.25,
  pickup: 1.15,
  large_suv: 1.35,
};

const HST_RATE = 0.13;

// ── Main Pricing Function ──
export function calculatePrice(
  plan: WashPlan,
  vehicleType: VehicleType,
  dirtLevel: number
): PriceBreakdown {
  const basePriceCents = PLAN_PRICES[plan];
  const vehicleMultiplier = VEHICLE_MULTIPLIERS[vehicleType];
  const dirtMultiplier = DIRT_MULTIPLIERS[dirtLevel] ?? 1.0;

  const finalPriceCents = Math.round(basePriceCents * vehicleMultiplier * dirtMultiplier);
  const hstCents = Math.round(finalPriceCents * HST_RATE);
  const totalCents = finalPriceCents + hstCents;
  const washerPayoutCents = WASHER_PAYOUTS[plan];

  // Duration estimation
  const baseDuration = BASE_DURATION[plan];
  const durationVehicleMult = VEHICLE_DURATION_MULTIPLIER[vehicleType];
  const durationDirtMult = dirtLevel > 5 ? 1 + (dirtLevel - 5) * 0.1 : 1;
  const estimatedDurationMin = Math.round(baseDuration * durationVehicleMult * durationDirtMult);

  return {
    plan,
    planLabel: PLAN_LABELS[plan],
    basePriceCents,
    vehicleMultiplier,
    dirtMultiplier,
    finalPriceCents,
    hstCents,
    totalCents,
    washerPayoutCents,
    estimatedDurationMin,
  };
}

// ── Helpers ──
export function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min`;
}
