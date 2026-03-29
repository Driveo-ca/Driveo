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

    // Fetch all active subscriptions with plan details
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('customer_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (subError || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ subscription: null, subscriptions: [], usage: null });
    }

    // Batch-fetch usage for all subscriptions (avoids N+1)
    const subIds = subscriptions.map(s => s.id);
    const { data: allUsage } = await supabase
      .from('subscription_usage')
      .select('subscription_id, allocated, used, period_start, period_end')
      .in('subscription_id', subIds)
      .order('period_start', { ascending: false });

    // Group usage by subscription (take latest per sub)
    const usageBySubId = new Map<string, typeof allUsage extends (infer T)[] | null ? T : never>();
    for (const u of allUsage ?? []) {
      if (!usageBySubId.has(u.subscription_id)) {
        usageBySubId.set(u.subscription_id, u);
      }
    }

    const allSubs = subscriptions.map((sub) => {
      const usage = usageBySubId.get(sub.id);
      return {
        subscription: {
          id: sub.id,
          planId: sub.plan_id,
          vehicleId: sub.vehicle_id,
          status: sub.status,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          currentPeriodStart: sub.current_period_start,
          currentPeriodEnd: sub.current_period_end,
          plan: sub.subscription_plans,
        },
        usage: usage
          ? { allocated: usage.allocated, used: usage.used, periodStart: usage.period_start, periodEnd: usage.period_end }
          : null,
      };
    });

    // Backwards compatible: first subscription as top-level fields
    return NextResponse.json({
      subscription: allSubs[0].subscription,
      usage: allSubs[0].usage,
      subscriptions: allSubs,
    });
  } catch (err) {
    console.error('Subscription usage API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
