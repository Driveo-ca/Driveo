import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { WASHER_PAYOUTS } from '@/lib/pricing';
import type { WashPlan } from '@/types';

export async function POST(request: Request) {
  try {
    // Auth: verify caller is admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = await createAdminClient();

    const { data: callerProfile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can trigger payouts' }, { status: 403 });
    }

    const { washer_id } = await request.json();

    if (!washer_id) {
      return NextResponse.json({ error: 'Missing washer_id' }, { status: 400 });
    }

    // Get washer's Stripe Connect account
    const { data: washerProfile } = await adminSupabase
      .from('washer_profiles')
      .select('stripe_account_id')
      .eq('id', washer_id)
      .single();

    if (!washerProfile?.stripe_account_id) {
      return NextResponse.json(
        { error: 'Washer has not completed Stripe Connect onboarding' },
        { status: 400 }
      );
    }

    // Get all completed (unpaid) bookings for this washer
    const { data: bookings } = await adminSupabase
      .from('bookings')
      .select('id, wash_plan, washer_payout, total_price')
      .eq('washer_id', washer_id)
      .eq('status', 'completed')
      .eq('payment_status', 'captured');

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'No completed bookings to pay out' }, { status: 400 });
    }

    // Calculate total payout
    const totalPayout = bookings.reduce((sum, b) => {
      const amount = b.washer_payout || WASHER_PAYOUTS[b.wash_plan as WashPlan] || 1100;
      return sum + amount;
    }, 0);

    // Create a Transfer to the washer's Connect account
    const transfer = await stripe.transfers.create({
      amount: totalPayout,
      currency: 'cad',
      destination: washerProfile.stripe_account_id,
      transfer_group: `payout_${washer_id}_${Date.now()}`,
      metadata: {
        washer_id,
        booking_count: String(bookings.length),
      },
      description: `Bulk payout for ${bookings.length} completed bookings`,
    });

    // Mark all these bookings as paid
    const bookingIds = bookings.map((b) => b.id);
    await adminSupabase
      .from('bookings')
      .update({ status: 'paid' })
      .in('id', bookingIds);

    // Notify the washer
    await adminSupabase.from('notifications').insert({
      user_id: washer_id,
      type: 'payout_sent',
      title: 'Payout Sent',
      body: `$${(totalPayout / 100).toFixed(2)} has been transferred for ${bookings.length} completed job${bookings.length > 1 ? 's' : ''}.`,
      data: { transfer_id: transfer.id, amount: totalPayout, booking_count: bookings.length },
    });

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      amount: totalPayout,
      bookingCount: bookings.length,
    });
  } catch (err) {
    console.error('Admin payout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
