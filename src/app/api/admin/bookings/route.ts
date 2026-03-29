// ═══════════════════════════════════════
// POST /api/admin/bookings
// Admin: accept (assign washer) or reject a booking
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { notifyWasherJobRequest } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    // Auth check — must be admin
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { bookingId, action, washerId } = body as {
      bookingId?: string;
      action?: 'accept' | 'reject';
      washerId?: string;
    };

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: 'bookingId and action are required' },
        { status: 400 },
      );
    }

    const admin = await createAdminClient();

    // Verify booking exists and is pending
    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .select('id, status, customer_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: `Booking is ${booking.status}, can only review pending bookings` },
        { status: 409 },
      );
    }

    // ── Reject ──
    if (action === 'reject') {
      const { error } = await admin
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: 'cancelled' });
    }

    // ── Accept — send job request to selected washer ──
    if (action === 'accept') {
      if (!washerId) {
        return NextResponse.json(
          { error: 'washerId is required to send a job request' },
          { status: 400 },
        );
      }

      // Verify washer exists and is approved
      const { data: washer, error: washerError } = await admin
        .from('washer_profiles')
        .select('id, status')
        .eq('id', washerId)
        .single();

      if (washerError || !washer) {
        return NextResponse.json({ error: 'Washer not found' }, { status: 404 });
      }

      if (washer.status !== 'approved') {
        return NextResponse.json(
          { error: 'Washer is not approved' },
          { status: 400 },
        );
      }

      // Fetch full booking details for the notification
      const { data: fullBooking, error: fullErr } = await admin
        .from('bookings')
        .select('id, service_address, wash_plan, washer_payout, dirt_level, estimated_duration_min, service_lat, service_lng, vehicles(year, make, model, type)')
        .eq('id', bookingId)
        .single();

      if (fullErr || !fullBooking) {
        return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
      }

      const vehicle = fullBooking.vehicles as unknown as { year: number; make: string; model: string; type: string } | null;
      const vehicleStr = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle';

      // Send job request notification + email to the washer (booking stays pending)
      await notifyWasherJobRequest(washerId, {
        id: fullBooking.id,
        service_address: fullBooking.service_address,
        wash_plan: fullBooking.wash_plan,
        washer_payout: fullBooking.washer_payout || 0,
        dirt_level: fullBooking.dirt_level,
        estimated_duration_min: fullBooking.estimated_duration_min || 0,
        service_lat: fullBooking.service_lat,
        service_lng: fullBooking.service_lng,
        vehicle: vehicleStr,
      });

      return NextResponse.json({ success: true, status: 'requested', washerId });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/admin/bookings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
