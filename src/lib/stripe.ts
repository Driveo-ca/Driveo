import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

/**
 * Get or create a Stripe customer for a Driveo user.
 * Checks customer_profiles.stripe_customer_id first; creates if missing.
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminSupabase: any
): Promise<string> {
  // Check if customer already has a Stripe ID
  const { data: profile } = await adminSupabase
    .from('customer_profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { driveo_user_id: userId },
  });

  // Save to DB
  await adminSupabase
    .from('customer_profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}
