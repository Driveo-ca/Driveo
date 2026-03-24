import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

/**
 * Called after Stripe Checkout redirect to finalize the subscription in DB.
 * POST /api/subscriptions/confirm { sessionId }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Verify this session belongs to the current user
    if (session.metadata?.driveo_user_id !== user.id) {
      return NextResponse.json({ error: 'Session mismatch' }, { status: 403 });
    }

    if (session.status !== 'complete') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const planId = session.metadata?.plan_id;
    const vehicleId = session.metadata?.vehicle_id;
    const washesPerMonth = parseInt(session.metadata?.washes_per_month || '8', 10);

    // Check if already confirmed (idempotency)
    const stripeSubId = typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as { id: string })?.id;

    if (stripeSubId) {
      const { data: existing } = await adminSupabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', stripeSubId)
        .single();

      if (existing) {
        return NextResponse.json({ success: true, subscriptionId: existing.id, alreadyConfirmed: true });
      }
    }

    // Get subscription period from Stripe
    let periodStart = new Date().toISOString();
    let periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

    if (session.subscription && typeof session.subscription !== 'string') {
      const sub = session.subscription as unknown as Record<string, unknown>;
      const rawStart = sub.current_period_start;
      const rawEnd = sub.current_period_end;

      if (typeof rawStart === 'number') periodStart = new Date(rawStart * 1000).toISOString();
      else if (typeof rawStart === 'string') periodStart = new Date(rawStart).toISOString();

      if (typeof rawEnd === 'number') periodEnd = new Date(rawEnd * 1000).toISOString();
      else if (typeof rawEnd === 'string') periodEnd = new Date(rawEnd).toISOString();
    }

    // Insert subscription record
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .insert({
        customer_id: user.id,
        plan_id: planId,
        vehicle_id: vehicleId,
        stripe_subscription_id: stripeSubId || session.id,
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
    console.error('Subscription confirm error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
