import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

/**
 * Activates a subscription after Stripe Checkout completes.
 * Accepts either { sessionId } (from Checkout return URL) or { stripeSubscriptionId }.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, stripeSubscriptionId } = body;

    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let subId: string;
    let planId: string;
    let vehicleId: string;
    let washesPerMonth: number;

    if (sessionId) {
      // Retrieve from Checkout Session
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      });

      if (session.metadata?.driveo_user_id !== user.id) {
        return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
      }

      if (session.status !== 'complete') {
        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
      }

      subId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as unknown as { id: string })?.id;

      planId = session.metadata?.plan_id || '';
      vehicleId = session.metadata?.vehicle_id || '';
      washesPerMonth = parseInt(session.metadata?.washes_per_month || '8', 10);
    } else if (stripeSubscriptionId) {
      subId = stripeSubscriptionId;
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      if (stripeSub.metadata?.driveo_user_id !== user.id) {
        return NextResponse.json({ error: 'Subscription mismatch' }, { status: 403 });
      }
      planId = stripeSub.metadata.plan_id || '';
      vehicleId = stripeSub.metadata.vehicle_id || '';
      washesPerMonth = parseInt(stripeSub.metadata.washes_per_month || '8', 10);
    } else {
      return NextResponse.json({ error: 'Missing sessionId or stripeSubscriptionId' }, { status: 400 });
    }

    if (!subId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // Idempotency check
    const { data: existing } = await adminSupabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subId)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, subscriptionId: existing.id });
    }

    // Get period timestamps from Stripe subscription
    const stripeSub = await stripe.subscriptions.retrieve(subId);
    const raw = stripeSub as unknown as Record<string, unknown>;

    let periodStart = new Date().toISOString();
    let periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

    if (typeof raw.current_period_start === 'number') {
      periodStart = new Date((raw.current_period_start as number) * 1000).toISOString();
    } else if (typeof raw.current_period_start === 'string') {
      periodStart = new Date(raw.current_period_start as string).toISOString();
    }

    if (typeof raw.current_period_end === 'number') {
      periodEnd = new Date((raw.current_period_end as number) * 1000).toISOString();
    } else if (typeof raw.current_period_end === 'string') {
      periodEnd = new Date(raw.current_period_end as string).toISOString();
    }

    // Insert subscription record
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .insert({
        customer_id: user.id,
        plan_id: planId,
        vehicle_id: vehicleId,
        stripe_subscription_id: subId,
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: false,
      })
      .select()
      .single();

    if (subError) {
      console.error('Subscription insert error:', subError);
      return NextResponse.json({ error: 'Failed to create subscription record' }, { status: 500 });
    }

    // Create initial usage row
    await adminSupabase.from('subscription_usage').insert({
      subscription_id: subscription.id,
      period_start: periodStart,
      period_end: periodEnd,
      allocated: washesPerMonth,
      used: 0,
    });

    return NextResponse.json({ success: true, subscriptionId: subscription.id });
  } catch (err) {
    console.error('Subscription activate error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
