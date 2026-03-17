import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

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

    // Fetch the booking — verify it exists and washer owns it
    const { data: booking, error: fetchError } = await adminSupabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only the assigned washer or an admin can capture
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isWasher = booking.washer_id === user.id;
    const isAdmin = profile?.role === 'admin';

    if (!isWasher && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify the booking is in a capturable state
    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Booking must be completed before capturing payment' },
        { status: 400 }
      );
    }

    if (booking.payment_status !== 'authorized') {
      return NextResponse.json(
        { error: `Payment cannot be captured (current status: ${booking.payment_status})` },
        { status: 400 }
      );
    }

    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'No PaymentIntent associated with this booking' },
        { status: 400 }
      );
    }

    // Capture the pre-authorized PaymentIntent
    const paymentIntent = await stripe.paymentIntents.capture(
      booking.stripe_payment_intent_id
    );

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: `Payment capture failed (status: ${paymentIntent.status})` },
        { status: 500 }
      );
    }

    // Update booking payment status
    const { error: updateError } = await adminSupabase
      .from('bookings')
      .update({
        payment_status: 'captured',
        payment_captured_at: new Date().toISOString(),
        status: 'paid',
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Failed to update booking after capture:', updateError);
      // Payment was captured but DB update failed — log for reconciliation
      return NextResponse.json(
        { error: 'Payment captured but failed to update booking record' },
        { status: 500 }
      );
    }

    // Notify customer
    await adminSupabase.from('notifications').insert({
      user_id: booking.customer_id,
      type: 'payment_captured',
      title: 'Payment Processed',
      body: `Your payment of $${(booking.total_price / 100).toFixed(2)} has been processed.`,
      data: { booking_id: bookingId },
    });

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      amountCaptured: paymentIntent.amount,
    });
  } catch (err) {
    console.error('Payment capture error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
