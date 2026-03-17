import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active subscription with plan details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('customer_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return NextResponse.json({ subscription: null, usage: null });
    }

    // Fetch latest usage record for this subscription
    const { data: usage, error: usageError } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('subscription_id', subscription.id)
      .order('period_start', { ascending: false })
      .limit(1)
      .single();

    if (usageError) {
      console.error('Usage fetch error:', usageError);
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planId: subscription.plan_id,
        vehicleId: subscription.vehicle_id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        plan: subscription.subscription_plans,
      },
      usage: usage
        ? {
            allocated: usage.allocated,
            used: usage.used,
            periodStart: usage.period_start,
            periodEnd: usage.period_end,
          }
        : null,
    });
  } catch (err) {
    console.error('Subscription usage API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
