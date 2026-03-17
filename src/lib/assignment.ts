// ═══════════════════════════════════════
// DRIVEO — Washer Auto-Assignment Engine
// ═══════════════════════════════════════

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { WasherProfile } from '@/types';

// Service-role client to bypass RLS for assignment operations
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Haversine Distance (km) ──

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// ── Maximum assignment radius ──
const MAX_RADIUS_KM = 30;

// ── Find Nearest Available Washer ──

export async function findNearestWasher(
  lat: number,
  lng: number
): Promise<(WasherProfile & { distance_km: number }) | null> {
  const supabase = getAdminClient();

  // Fetch all online, approved washers that have a known location
  const { data: washers, error } = await supabase
    .from('washer_profiles')
    .select('*')
    .eq('status', 'approved')
    .eq('is_online', true)
    .not('current_lat', 'is', null)
    .not('current_lng', 'is', null);

  if (error) {
    console.error('[assignment] Error fetching washers:', error.message);
    return null;
  }

  if (!washers || washers.length === 0) {
    return null;
  }

  // Calculate distance for each washer and find the nearest one within range
  let nearest: (WasherProfile & { distance_km: number }) | null = null;

  for (const washer of washers as WasherProfile[]) {
    const distance = haversineDistance(
      lat,
      lng,
      washer.current_lat!,
      washer.current_lng!
    );

    if (distance <= MAX_RADIUS_KM) {
      if (!nearest || distance < nearest.distance_km) {
        nearest = { ...washer, distance_km: distance };
      }
    }
  }

  return nearest;
}

// ── Assign Washer to Booking ──

export async function assignWasher(
  bookingId: string,
  washerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from('bookings')
    .update({
      washer_id: washerId,
      status: 'assigned',
      washer_assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .eq('status', 'pending'); // Only assign if still pending

  if (error) {
    console.error('[assignment] Error assigning washer:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
