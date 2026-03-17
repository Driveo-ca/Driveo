import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
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

  // Delete associated bookings first (foreign key constraint)
  await admin.from('bookings').delete().eq('vehicle_id', id);

  const { error } = await admin.from('vehicles').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
