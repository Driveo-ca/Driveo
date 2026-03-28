// ═══════════════════════════════════════
// PATCH /api/washer/status
// Update booking status (washer workflow)
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  notifyCustomerWasherEnRoute,
  notifyCustomerWashComplete,
  createNotification,
} from '@/lib/notifications';
import type { BookingStatus } from '@/types';

// ── Valid status transitions for the washer workflow ──
const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus | null> = {
  pending: null,
  assigned: 'en_route',
  en_route: 'arrived',
  arrived: 'washing',
  washing: 'completed',
  completed: null,
  paid: null,
  cancelled: null,
  disputed: null,
};

// ── Map status to timestamp field ──
const STATUS_TIMESTAMP_FIELD: Record<string, string> = {
  en_route: 'washer_en_route_at',
  arrived: 'washer_arrived_at',
  washing: 'wash_started_at',
  completed: 'wash_completed_at',
};

export async function PATCH(request: NextRequest) {
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

    // ── Must be a washer ──
    const userRole = user.user_metadata?.role as string | undefined;

    if (userRole !== 'washer') {
      return NextResponse.json(
        { error: 'Forbidden: washer role required' },
        { status: 403 }
      );
    }

    // ── Parse body ──
    const body = await request.json();
    const { bookingId, status } = body as {
      bookingId?: string;
      status?: BookingStatus;
    };

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'bookingId and status are required' },
        { status: 400 }
      );
    }

    // ── Fetch booking using admin client ──
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select('id, washer_id, status, customer_id, total_price')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // ── Must be the assigned washer ──
    if (booking.washer_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: you are not assigned to this booking' },
        { status: 403 }
      );
    }

    // ── Validate status transition ──
    const currentStatus = booking.status as BookingStatus;
    const allowedNext = VALID_TRANSITIONS[currentStatus];

    if (!allowedNext || allowedNext !== status) {
      return NextResponse.json(
        {
          error: `Invalid transition: cannot go from '${currentStatus}' to '${status}'`,
        },
        { status: 409 }
      );
    }

    // ── Server-side photo validation for completion ──
    if (status === 'completed') {
      const { data: afterPhotos } = await adminClient
        .from('booking_photos')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('photo_type', 'after');
      if (!afterPhotos || afterPhotos.length < 5) {
        return NextResponse.json(
          { error: `Upload at least 5 after photos (${afterPhotos?.length || 0}/5)` },
          { status: 400 }
        );
      }
    }

    // ── Build update payload ──
    const now = new Date().toISOString();
    const timestampField = STATUS_TIMESTAMP_FIELD[status];

    const updatePayload: Record<string, string> = {
      status,
      updated_at: now,
    };

    if (timestampField) {
      updatePayload[timestampField] = now;
    }

    // ── Update booking ──
    const { error: updateError } = await adminClient
      .from('bookings')
      .update(updatePayload)
      .eq('id', bookingId);

    if (updateError) {
      console.error('[PATCH /api/washer/status]', updateError.message);
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }

    // ── Notify customer on key status changes (non-blocking) ──
    const washerName = user.user_metadata?.full_name || 'Your washer';

    if (status === 'en_route') {
      notifyCustomerWasherEnRoute(booking.customer_id, washerName, bookingId).catch(() => {});
    } else if (status === 'arrived') {
      createNotification(
        booking.customer_id,
        'washer_arrived',
        'Washer has arrived',
        `${washerName} has arrived at your location.`,
        { booking_id: bookingId },
      ).catch(() => {});
    } else if (status === 'washing') {
      createNotification(
        booking.customer_id,
        'wash_started',
        'Wash in progress',
        `${washerName} has started washing your car.`,
        { booking_id: bookingId },
      ).catch(() => {});
    } else if (status === 'completed') {
      notifyCustomerWashComplete(booking.customer_id, bookingId, booking.total_price).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      bookingId,
      previousStatus: currentStatus,
      newStatus: status,
    });
  } catch (err) {
    console.error('[PATCH /api/washer/status]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
