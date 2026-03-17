import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = await createAdminClient();

    // Verify user is a washer
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'washer') {
      return NextResponse.json({ error: 'Only washers can onboard with Stripe Connect' }, { status: 403 });
    }

    // Check if washer already has a Connect account
    const { data: washerProfile } = await adminSupabase
      .from('washer_profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    let accountId = washerProfile?.stripe_account_id;

    if (!accountId) {
      // Create a new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'CA',
        email: profile.email || user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          driveo_user_id: user.id,
        },
      });

      accountId = account.id;

      // Save Stripe account ID to washer profile
      await adminSupabase
        .from('washer_profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
    }

    // Get return/refresh URL from request body (optional)
    const body = await request.json().catch(() => ({}));
    const returnUrl = body.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://driveo.ca'}/washer/settings`;
    const refreshUrl = body.refreshUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://driveo.ca'}/washer/connect/refresh`;

    // Create an onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId,
    });
  } catch (err) {
    console.error('Stripe Connect onboarding error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET — Check Connect account status
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = await createAdminClient();

    const { data: washerProfile } = await adminSupabase
      .from('washer_profiles')
      .select('stripe_account_id')
      .eq('id', user.id)
      .single();

    if (!washerProfile?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    }

    const account = await stripe.accounts.retrieve(washerProfile.stripe_account_id);

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (err) {
    console.error('Stripe Connect status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
