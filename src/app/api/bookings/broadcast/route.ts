// ═══════════════════════════════════════
// POST /api/bookings/broadcast
// Notify all approved washers in service area + admin about a new booking.
// Called internally after booking creation.
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail, createNotification } from '@/lib/notifications';

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

    const { bookingId } = (await request.json()) as { bookingId?: string };
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    const admin = await createAdminClient();

    // Get booking details
    const { data: booking, error: bookingErr } = await admin
      .from('bookings')
      .select('id, service_address, wash_plan, total_price, washer_payout, dirt_level, estimated_duration_min, service_lat, service_lng, vehicles(year, make, model, type)')
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get all approved washers
    const { data: washers } = await admin
      .from('profiles')
      .select('id, full_name, email, phone, washer_profiles!inner(status, service_zones)')
      .eq('role', 'washer')
      .eq('washer_profiles.status', 'approved');

    const planLabels: Record<string, string> = {
      regular: 'Regular Wash',
      interior_exterior: 'Interior & Exterior',
      detailing: 'Full Detailing',
    };
    const planLabel = planLabels[booking.wash_plan] || booking.wash_plan;
    const payout = `$${((booking.washer_payout || 0) / 100).toFixed(2)}`;
    const vehicle = booking.vehicles as unknown as { year: number; make: string; model: string; type: string } | null;
    const vehicleStr = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle';

    // Notify each approved washer
    const notifyPromises: Promise<unknown>[] = [];

    if (washers) {
      for (const washer of washers) {
        // In-app notification
        notifyPromises.push(
          createNotification(
            washer.id,
            'new_job_alert',
            'New Job Available!',
            `${planLabel} — ${vehicleStr} at ${booking.service_address}. Earn ${payout}. Claim it now!`,
            {
              booking_id: booking.id,
              wash_plan: booking.wash_plan,
              washer_payout: booking.washer_payout,
              service_address: booking.service_address,
              service_lat: booking.service_lat,
              service_lng: booking.service_lng,
              dirt_level: booking.dirt_level,
              estimated_duration_min: booking.estimated_duration_min,
              vehicle: vehicleStr,
            },
          ),
        );

        // Email notification
        if (washer.email) {
          notifyPromises.push(
            sendEmail(
              washer.email,
              `New Job Alert — ${planLabel} | Earn ${payout}`,
              `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#E23232;color:white;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
                  <h1 style="margin:0;font-size:24px;">New Job Available!</h1>
                  <p style="margin:8px 0 0;opacity:0.9;">Claim it before someone else does</p>
                </div>
                <div style="background:#f9f9f9;padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;">
                  <p>Hi ${washer.full_name},</p>
                  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                    <tr><td style="padding:8px 0;color:#666;">Plan</td><td style="padding:8px 0;font-weight:600;">${planLabel}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Vehicle</td><td style="padding:8px 0;font-weight:600;">${vehicleStr}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Location</td><td style="padding:8px 0;font-weight:600;">${booking.service_address}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Dirt Level</td><td style="padding:8px 0;font-weight:600;">${booking.dirt_level}/10</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Your Payout</td><td style="padding:8px 0;font-weight:600;color:#E23232;font-size:18px;">${payout}</td></tr>
                  </table>
                  <p style="text-align:center;margin-top:24px;">
                    <a href="https://driveo.ca/washer/dashboard" style="background:#E23232;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Open App to Claim</a>
                  </p>
                  <p style="color:#999;font-size:12px;text-align:center;margin-top:16px;">First washer to accept gets the job. Be quick!</p>
                </div>
              </div>`,
            ),
          );
        }
      }
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      notifyPromises.push(
        sendEmail(
          adminEmail,
          `New Booking — ${planLabel} #${booking.id.slice(0, 8)}`,
          `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#E23232;">New Booking Received</h2>
            <ul>
              <li><strong>Booking:</strong> #${booking.id.slice(0, 8)}</li>
              <li><strong>Plan:</strong> ${planLabel}</li>
              <li><strong>Vehicle:</strong> ${vehicleStr}</li>
              <li><strong>Location:</strong> ${booking.service_address}</li>
              <li><strong>Dirt:</strong> ${booking.dirt_level}/10</li>
              <li><strong>Total:</strong> $${((booking.total_price || 0) / 100).toFixed(2)}</li>
            </ul>
            <p>Washers have been notified. First to claim wins.</p>
            <p style="color:#666;font-size:12px;">— DRIVEO System</p>
          </div>`,
        ),
      );
    }

    await Promise.allSettled(notifyPromises);

    return NextResponse.json({
      success: true,
      notified: washers?.length || 0,
    });
  } catch (err) {
    console.error('[POST /api/bookings/broadcast]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
