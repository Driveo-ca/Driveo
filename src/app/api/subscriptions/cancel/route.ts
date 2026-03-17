import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

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
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required field: subscriptionId' },
        { status: 400 }
      );
    }

    const adminSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the subscription and verify ownership
    const { data: subscription, error: subError } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('customer_id', user.id)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Set cancel_at_period_end on Stripe subscription
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update DB subscription record
    const { error: updateError } = await adminSupabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('Subscription cancel update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Subscription will be cancelled at the end of the current billing period',
      cancelAtPeriodEnd: true,
      currentPeriodEnd: subscription.current_period_end,
    });
  } catch (err) {
    console.error('Subscription cancel API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
