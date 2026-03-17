import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, vehicleId } = body;

    if (!planId || !vehicleId) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, vehicleId' },
        { status: 400 }
      );
    }

    // Admin client for DB operations that bypass RLS
    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Look up the subscription plan
    const { data: plan, error: planError } = await adminSupabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    if (!plan.stripe_price_id) {
      return NextResponse.json(
        { error: 'Plan is not configured for payments' },
        { status: 400 }
      );
    }

    // Verify vehicle ownership
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .eq('customer_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check for existing active subscription
    const { data: existingSub } = await adminSupabase
      .from('subscriptions')
      .select('id')
      .eq('customer_id', user.id)
      .eq('status', 'active')
      .single();

    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription. Cancel it first.' },
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

    // Create Stripe Subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripe_price_id }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        driveo_user_id: user.id,
        plan_id: planId,
        vehicle_id: vehicleId,
      },
    });

    // Extract client secret for payment confirmation
    const invoice = stripeSubscription.latest_invoice as unknown as {
      payment_intent: { client_secret: string };
    };
    const clientSecret = invoice?.payment_intent?.client_secret || null;

    // Extract period timestamps from the Stripe subscription object
    const sub = stripeSubscription as unknown as {
      id: string;
      current_period_start: number;
      current_period_end: number;
    };

    // Insert subscription record into DB
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .insert({
        customer_id: user.id,
        plan_id: planId,
        vehicle_id: vehicleId,
        stripe_subscription_id: stripeSubscription.id,
        status: 'active',
        current_period_start: new Date(
          sub.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          sub.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: false,
      })
      .select()
      .single();

    if (subError) {
      // Cancel Stripe subscription if DB insert fails
      await stripe.subscriptions.cancel(stripeSubscription.id);
      console.error('Subscription insert error:', subError);
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      );
    }

    // Create initial subscription_usage row
    const periodStart = new Date(
      sub.current_period_start * 1000
    ).toISOString();
    const periodEnd = new Date(
      sub.current_period_end * 1000
    ).toISOString();

    await adminSupabase.from('subscription_usage').insert({
      subscription_id: subscription.id,
      period_start: periodStart,
      period_end: periodEnd,
      allocated: plan.washes_per_month,
      used: 0,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
    });
  } catch (err) {
    console.error('Subscription create API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
