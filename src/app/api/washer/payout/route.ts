import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { WASHER_PAYOUTS } from '@/lib/pricing';
import type { WashPlan } from '@/types';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    const adminSupabase = await createAdminClient();

    // Verify caller is an admin or the system (washers don't trigger their own payouts)
    const { data: callerProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can trigger payouts' }, { status: 403 });
    }

    // Fetch booking
    const { data: booking, error: fetchError } = await adminSupabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify payment has been captured
    if (booking.payment_status !== 'captured' && booking.status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment must be captured before payout' },
        { status: 400 }
      );
    }

    if (!booking.washer_id) {
      return NextResponse.json({ error: 'No washer assigned to this booking' }, { status: 400 });
    }

    // Get washer's Stripe Connect account
    const { data: washerProfile } = await adminSupabase
      .from('washer_profiles')
      .select('stripe_account_id')
      .eq('id', booking.washer_id)
      .single();

    if (!washerProfile?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Washer has not completed Stripe Connect onboarding' },
        { status: 400 }
      );
    }

    // Determine payout amount from pricing constants
    const payoutAmount = WASHER_PAYOUTS[booking.wash_plan as WashPlan];

    // Create a Transfer to the washer's Connect account
    const transfer = await stripe.transfers.create({
      amount: payoutAmount,
      currency: 'cad',
      destination: washerProfile.stripe_account_id,
      transfer_group: `booking_${bookingId}`,
      metadata: {
        booking_id: bookingId,
        washer_id: booking.washer_id,
        wash_plan: booking.wash_plan,
      },
      description: `Payout for booking ${bookingId}`,
    });

    // Notify the washer
    await adminSupabase.from('notifications').insert({
      user_id: booking.washer_id,
      type: 'payout_sent',
      title: 'Payout Sent',
      body: `$${(payoutAmount / 100).toFixed(2)} has been transferred to your account for booking ${bookingId.slice(0, 8)}...`,
      data: { booking_id: bookingId, transfer_id: transfer.id },
    });

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: payoutAmount,
    });
  } catch (err) {
    console.error('Washer payout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
