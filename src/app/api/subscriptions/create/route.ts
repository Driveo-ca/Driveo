import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';

/**
 * Creates a Stripe Embedded Checkout session for subscription payment.
 * Returns `clientSecret` for the EmbeddedCheckout component.
 * DB record is created after payment via /api/subscriptions/activate or webhook.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, vehicleId } = await request.json();

    if (!planId || !vehicleId) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, vehicleId' },
        { status: 400 }
      );
    }

    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Look up the plan
    const { data: plan, error: planError } = await adminSupabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
    }

    if (!plan.stripe_price_id) {
      return NextResponse.json({ error: 'Plan is not configured for payments' }, { status: 400 });
    }

    // Verify vehicle ownership
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .eq('customer_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check for existing active subscription on the same plan
    const { data: existingSub } = await adminSupabase
      .from('subscriptions')
      .select('id')
      .eq('customer_id', user.id)
      .eq('plan_id', planId)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription for this plan.' },
        { status: 409 }
      );
    }

    // Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      user.id,
      user.email || '',
      user.user_metadata?.full_name || 'Driveo Customer',
      adminSupabase
    );

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Embedded Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      ui_mode: 'embedded',
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      return_url: `${origin}/app/membership?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        driveo_user_id: user.id,
        plan_id: planId,
        vehicle_id: vehicleId,
        washes_per_month: String(plan.washes_per_month),
      },
      subscription_data: {
        metadata: {
          driveo_user_id: user.id,
          plan_id: planId,
          vehicle_id: vehicleId,
          washes_per_month: String(plan.washes_per_month),
        },
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
    });
  } catch (err) {
    console.error('Subscription create API error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
