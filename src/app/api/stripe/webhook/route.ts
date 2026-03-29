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

        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only handle subscription checkouts
        if (session.mode === 'subscription' && session.metadata?.driveo_user_id) {
          const userId = session.metadata.driveo_user_id;
          const planId = session.metadata.plan_id;
          const vehicleId = session.metadata.vehicle_id;
          const washesPerMonth = parseInt(session.metadata.washes_per_month || '8', 10);
          const stripeSubId = typeof session.subscription === 'string'
            ? session.subscription
            : (session.subscription as unknown as { id: string })?.id;

          // Idempotency check
          if (stripeSubId) {
            const { data: existing } = await adminSupabase
              .from('subscriptions')
              .select('id')
              .eq('stripe_subscription_id', stripeSubId)
              .single();

            if (!existing) {
              // Retrieve subscription for period dates
              const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
              const rawStart = (stripeSub as unknown as Record<string, unknown>).current_period_start;
              const rawEnd = (stripeSub as unknown as Record<string, unknown>).current_period_end;

              let periodStart = new Date().toISOString();
              let periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
              if (typeof rawStart === 'number') periodStart = new Date(rawStart * 1000).toISOString();
              else if (typeof rawStart === 'string') periodStart = new Date(rawStart).toISOString();
              if (typeof rawEnd === 'number') periodEnd = new Date(rawEnd * 1000).toISOString();
              else if (typeof rawEnd === 'string') periodEnd = new Date(rawEnd).toISOString();

              const { data: sub } = await adminSupabase
                .from('subscriptions')
                .insert({
                  customer_id: userId,
                  plan_id: planId,
                  vehicle_id: vehicleId,
                  stripe_subscription_id: stripeSubId,
                  status: 'active',
                  current_period_start: periodStart,
                  current_period_end: periodEnd,
                  cancel_at_period_end: false,
                })
                .select()
                .single();

              if (sub) {
                await adminSupabase.from('subscription_usage').insert({
                  subscription_id: sub.id,
                  period_start: periodStart,
                  period_end: periodEnd,
                  allocated: washesPerMonth,
                  used: 0,
                });
              }

            }
          }
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

        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`[Webhook] Error processing ${event.type}:`, err);
    // Return 200 to prevent Stripe from retrying — we log the error for manual review
    return NextResponse.json({ received: true, error: 'Processing error logged' });
  }

  return NextResponse.json({ received: true });
}
