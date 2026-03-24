import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * ONE-TIME setup: Creates Stripe products + prices for each subscription plan
 * and updates the DB with stripe_price_id.
 *
 * POST /api/admin/setup-stripe-plans
 * Delete this route after running it once.
 */
export async function POST() {
  try {
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch all active plans missing stripe_price_id
    const { data: plans, error } = await admin
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .is('stripe_price_id', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!plans || plans.length === 0) {
      return NextResponse.json({ message: 'All plans already have Stripe prices configured.' });
    }

    const results = [];

    for (const plan of plans) {
      // Create a Stripe product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description || `${plan.name} — ${plan.washes_per_month} washes/month`,
        metadata: {
          driveo_plan_id: plan.id,
          wash_plan: plan.wash_plan,
        },
      });

      // Create a recurring price (monthly_price is in cents)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthly_price,
        currency: 'cad',
        recurring: { interval: 'month' },
        metadata: {
          driveo_plan_id: plan.id,
        },
      });

      // Update the plan with the Stripe price ID
      const { error: updateError } = await admin
        .from('subscription_plans')
        .update({ stripe_price_id: price.id })
        .eq('id', plan.id);

      if (updateError) {
        results.push({ plan: plan.name, error: updateError.message });
      } else {
        results.push({
          plan: plan.name,
          product_id: product.id,
          price_id: price.id,
          amount: plan.monthly_price,
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('Setup Stripe plans error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
