// ═══════════════════════════════════════
// POST /api/bookings/assign
// Auto-assign nearest washer to a booking
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { findNearestWasher, assignWasher } from '@/lib/assignment';

export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = user.user_metadata?.role as string | undefined;

    // ── Parse body ──
    const body = await request.json();
    const { bookingId } = body as { bookingId?: string };

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      );
    }

    // ── Fetch booking using admin client (bypasses RLS) ──
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select('id, customer_id, service_lat, service_lng, status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // ── Authorization: must be admin or the booking's customer ──
    if (userRole !== 'admin' && booking.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // ── Only assign pending bookings ──
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}, cannot assign` },
        { status: 409 }
      );
    }

    // ── Find nearest washer ──
    const washer = await findNearestWasher(
      booking.service_lat,
      booking.service_lng
    );

    if (!washer) {
      return NextResponse.json(
        { assigned: false, message: 'No washers available' },
        { status: 200 }
      );
    }

    // ── Assign the washer ──
    const result = await assignWasher(bookingId, washer.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? 'Failed to assign washer' },
        { status: 500 }
      );
    }

    // ── TODO: Send push notification to washer ──
    // await sendPushNotification(washer.id, {
    //   title: 'New Job Assigned',
    //   body: `You have a new wash job ${washer.distance_km.toFixed(1)}km away`,
    //   data: { bookingId },
    // });

    return NextResponse.json({
      assigned: true,
      washerId: washer.id,
      distanceKm: Math.round(washer.distance_km * 10) / 10,
    });
  } catch (err) {
    console.error('[POST /api/bookings/assign]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
