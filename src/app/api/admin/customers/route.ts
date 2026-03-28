// ═══════════════════════════════════════
// /api/admin/customers
// Admin: delete, block/unblock, refund customers
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || user.user_metadata?.role !== 'admin') {
    return null;
  }
  return user;
}

// ── PATCH: block / unblock ──
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { customerId, action } = (await request.json()) as {
      customerId?: string;
      action?: 'block' | 'unblock';
    };

    if (!customerId || !action) {
      return NextResponse.json({ error: 'customerId and action required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    if (action === 'block') {
      const { error } = await supabase.auth.admin.updateUserById(customerId, {
        ban_duration: '876000h', // ~100 years
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, blocked: true });
    }

    if (action === 'unblock') {
      const { error } = await supabase.auth.admin.updateUserById(customerId, {
        ban_duration: 'none',
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, blocked: false });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[PATCH /api/admin/customers]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE: remove customer ──
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { customerId } = (await request.json()) as { customerId?: string };
    if (!customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // Delete profile row (cascades to vehicles, bookings, etc.)
    await supabase.from('profiles').delete().eq('id', customerId);
    await supabase.from('customer_profiles').delete().eq('id', customerId);

    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(customerId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/customers]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: refund a booking ──
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { bookingId } = (await request.json()) as { bookingId?: string };
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('id, stripe_payment_intent_id, payment_status, total_price, status')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.payment_status === 'refunded') {
      return NextResponse.json({ error: 'Already refunded' }, { status: 409 });
    }

    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json({ error: 'No payment intent found for this booking' }, { status: 400 });
    }

    // Refund via Stripe
    await stripe.refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
    });

    // Update booking
    await supabase
      .from('bookings')
      .update({
        payment_status: 'refunded',
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    return NextResponse.json({ success: true, refundedAmount: booking.total_price });
  } catch (err) {
    console.error('[POST /api/admin/customers]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
