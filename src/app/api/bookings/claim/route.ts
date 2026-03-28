// ═══════════════════════════════════════
// POST /api/bookings/claim
// Race-condition-safe: first washer to claim wins.
// Uses optimistic locking — UPDATE ... WHERE status='pending'
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { notifyCustomerWasherAssigned, sendEmail, createNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Must be a washer
    if (user.user_metadata?.role !== 'washer') {
      return NextResponse.json({ error: 'Only washers can claim jobs' }, { status: 403 });
    }

    const { bookingId } = (await request.json()) as { bookingId?: string };
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    const admin = await createAdminClient();

    // Verify washer is approved
    const { data: washerProfile } = await admin
      .from('washer_profiles')
      .select('id, status')
      .eq('id', user.id)
      .single();

    if (!washerProfile || washerProfile.status !== 'approved') {
      return NextResponse.json({ error: 'Washer not approved' }, { status: 403 });
    }

    // Atomic claim: only succeeds if booking is still 'pending'
    const { data: claimed, error: claimError } = await admin
      .from('bookings')
      .update({
        washer_id: user.id,
        status: 'assigned',
        washer_assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('status', 'pending')
      .select('id, customer_id, service_address, wash_plan, total_price')
      .single();

    if (claimError || !claimed) {
      // Another washer already claimed it, or booking doesn't exist
      return NextResponse.json(
        { claimed: false, message: 'Job already taken or not available' },
        { status: 200 },
      );
    }

    // Notify customer that washer was assigned
    const washerName = user.user_metadata?.full_name || 'Your washer';
    notifyCustomerWasherAssigned(claimed.customer_id, washerName, claimed.id).catch(() => {});

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendEmail(
        adminEmail,
        `Job Claimed — #${claimed.id.slice(0, 8)}`,
        `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#E23232;">Job Claimed</h2>
          <p><strong>${washerName}</strong> accepted a job.</p>
          <ul>
            <li><strong>Booking:</strong> #${claimed.id.slice(0, 8)}</li>
            <li><strong>Location:</strong> ${claimed.service_address}</li>
          </ul>
          <p style="color:#666;font-size:12px;">— DRIVEO System</p>
        </div>`,
      ).catch(() => {});
    }

    return NextResponse.json({ claimed: true, bookingId: claimed.id });
  } catch (err) {
    console.error('[POST /api/bookings/claim]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
