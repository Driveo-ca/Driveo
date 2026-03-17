import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import type Stripe from 'stripe';

// Disable body parsing — Stripe needs the raw body for signature verification
export const runtime = 'nodejs';

function getAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const adminSupabase = getAdminSupabase();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          await adminSupabase
            .from('bookings')
            .update({
              payment_status: 'captured',
              payment_captured_at: new Date().toISOString(),
            })
            .eq('id', bookingId)
            .eq('stripe_payment_intent_id', paymentIntent.id);

          console.log(`[Webhook] payment_intent.succeeded for booking ${bookingId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          await adminSupabase
            .from('bookings')
            .update({ payment_status: 'failed' })
            .eq('id', bookingId)
            .eq('stripe_payment_intent_id', paymentIntent.id);

          // Notify customer of failed payment
          const { data: booking } = await adminSupabase
            .from('bookings')
            .select('customer_id')
            .eq('id', bookingId)
            .single();

          if (booking) {
            await adminSupabase.from('notifications').insert({
              user_id: booking.customer_id,
              type: 'payment_failed',
              title: 'Payment Failed',
              body: 'Your payment could not be processed. Please update your payment method.',
              data: { booking_id: bookingId },
            });
          }

          console.log(`[Webhook] payment_intent.payment_failed for booking ${bookingId}`);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          await adminSupabase
            .from('bookings')
            .update({
              payment_status: 'refunded',
              status: 'cancelled',
            })
            .eq('id', bookingId)
            .eq('stripe_payment_intent_id', paymentIntent.id);

          console.log(`[Webhook] payment_intent.canceled for booking ${bookingId}`);
        }
        break;
      }

      case 'account.updated': {
        // Stripe Connect account status updates
        const account = event.data.object as Stripe.Account;

        if (account.charges_enabled && account.payouts_enabled) {
          await adminSupabase
            .from('washer_profiles')
            .update({ status: 'approved' })
            .eq('stripe_account_id', account.id);

          console.log(`[Webhook] Connect account ${account.id} fully onboarded`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Webhook] Error processing ${event.type}:`, err);
    // Return 200 to prevent Stripe from retrying — we log the error for manual review
    return NextResponse.json({ received: true, error: 'Processing error logged' });
  }

  return NextResponse.json({ received: true });
}
