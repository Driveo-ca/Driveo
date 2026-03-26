import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  const { id, force } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing vehicle id' }, { status: 400 });
  }

  // Verify the user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Use admin client to bypass RLS, but verify ownership
  const admin = await createAdminClient();

  // First verify the vehicle belongs to this user
  const { data: vehicle } = await admin
    .from('vehicles')
    .select('id, customer_id')
    .eq('id', id)
    .single();

  if (!vehicle || vehicle.customer_id !== user.id) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  // Check for subscriptions on this vehicle (any status)
  const { data: subs } = await admin
    .from('subscriptions')
    .select('id, plan_id, status')
    .eq('vehicle_id', id);

  const activeSubs = subs?.filter(s => s.status === 'active' || s.status === 'paused' || s.status === 'past_due') || [];

  if (activeSubs.length > 0 && !force) {
    return NextResponse.json({
      error: 'has_subscriptions',
      subscriptionCount: activeSubs.length,
    }, { status: 409 });
  }

  // Delete all associated records in correct order (respecting FK chains):
  // subscription_usage → subscriptions → vehicles
  // bookings → vehicles (also bookings.subscription_id → subscriptions)
  if (subs && subs.length > 0) {
    const subIds = subs.map(s => s.id);
    // 1. Remove subscription_usage (references subscriptions)
    await admin.from('subscription_usage').delete().in('subscription_id', subIds);
    // 2. Nullify subscription_id on bookings so they don't block subscription deletion
    await admin.from('bookings').update({ subscription_id: null }).in('subscription_id', subIds);
  }
  // 3. Delete subscriptions (references vehicles)
  await admin.from('subscriptions').delete().eq('vehicle_id', id);
  // 4. Delete bookings (references vehicles)
  await admin.from('bookings').delete().eq('vehicle_id', id);

  const { error } = await admin.from('vehicles').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
