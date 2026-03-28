// ═══════════════════════════════════════
// POST /api/admin/bookings
// Admin: accept (assign washer) or reject a booking
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

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

    // ── Accept — requires washerId ──
    if (action === 'accept') {
      if (!washerId) {
        return NextResponse.json(
          { error: 'washerId is required to accept a booking' },
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

      // Assign washer to booking
      const { error } = await admin
        .from('bookings')
        .update({
          washer_id: washerId,
          status: 'assigned',
          washer_assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: 'assigned', washerId });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/admin/bookings]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
