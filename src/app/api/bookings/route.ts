import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import { calculatePrice, PLAN_LABELS } from '@/lib/pricing';
import { createNotification } from '@/lib/notifications';
import type { VehicleType, WashPlan } from '@/types';

/**
 * POST /api/bookings — Create a booking with Stripe pre-authorization.
 * Returns a clientSecret for the frontend to confirm the payment via Stripe Elements.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      vehicleId,
      washPlan,
      dirtLevel,
      serviceAddress,
      serviceLat,
      serviceLng,
      locationNotes,
      isInstant,
      scheduledAt,
    } = body;

    // Validate
    if (!vehicleId || !washPlan || dirtLevel === undefined || !serviceAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get vehicle to determine type
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('customer_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Calculate price
    const price = calculatePrice(
      washPlan as WashPlan,
      vehicle.type as VehicleType,
      dirtLevel
    );

    const adminSupabase = await createAdminClient();

    // Get or create Stripe customer for pre-auth
    const stripeCustomerId = await getOrCreateStripeCustomer(
      user.id,
      user.email || '',
      user.user_metadata?.full_name || 'Driveo Customer',
      adminSupabase
    );

    // Create Stripe PaymentIntent with manual capture (pre-authorization)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.totalCents,
      currency: 'cad',
      customer: stripeCustomerId,
      capture_method: 'manual',
      metadata: {
        driveo_user_id: user.id,
        vehicle_id: vehicleId,
        wash_plan: washPlan,
        dirt_level: String(dirtLevel),
      },
      description: `${PLAN_LABELS[washPlan as WashPlan]} — ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create booking
    const { data: booking, error: bookingError } = await adminSupabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        vehicle_id: vehicleId,
        wash_plan: washPlan,
        dirt_level: dirtLevel,
        status: 'pending',
        service_address: serviceAddress,
        service_lat: serviceLat || 0,
        service_lng: serviceLng || 0,
        location_notes: locationNotes || null,
        is_instant: isInstant,
        scheduled_at: scheduledAt || new Date().toISOString(),
        estimated_duration_min: price.estimatedDurationMin,
        base_price: price.basePriceCents,
        vehicle_multiplier: price.vehicleMultiplier,
        dirt_multiplier: price.dirtMultiplier,
        final_price: price.finalPriceCents,
        hst_amount: price.hstCents,
        total_price: price.totalCents,
        washer_payout: price.washerPayoutCents,
        payment_status: 'authorized',
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select()
      .single();

    if (bookingError) {
      // Cancel the PaymentIntent if booking creation fails
      await stripe.paymentIntents.cancel(paymentIntent.id);
      console.error('Booking creation error:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    // Update PaymentIntent metadata with booking ID
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: { ...paymentIntent.metadata, booking_id: booking.id },
    });

    // Create notification for customer
    await adminSupabase.from('notifications').insert({
      user_id: user.id,
      type: 'booking_created',
      title: 'Booking Confirmed',
      body: `Your ${price.planLabel} wash has been confirmed. Finding you a washer now.`,
      data: { booking_id: booking.id },
    });

    // Broadcast job alert to all approved washers directly (no HTTP self-call)
    const vehicleStr = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    broadcastJobAlert(adminSupabase, booking, price.planLabel, vehicleStr).catch(
      (err) => console.error('Broadcast failed (non-blocking):', err)
    );

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      price: price.totalCents,
    });
  } catch (err) {
    console.error('Booking API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('bookings')
    .select('*, vehicles(*)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }

  return NextResponse.json({ bookings: data });
}

// ── Inline broadcast to avoid HTTP self-call (fails on Vercel) ──

interface BookingRecord {
  id: string;
  wash_plan: string;
  washer_payout: number;
  service_address: string;
  service_lat: number;
  service_lng: number;
  dirt_level: number;
  estimated_duration_min: number;
}

async function broadcastJobAlert(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  booking: BookingRecord,
  planLabel: string,
  vehicleStr: string,
) {
  const payout = `$${((booking.washer_payout || 0) / 100).toFixed(2)}`;

  // Get all approved washers
  const { data: washers } = await admin
    .from('profiles')
    .select('id, full_name, email, washer_profiles!inner(status)')
    .eq('role', 'washer')
    .eq('washer_profiles.status', 'approved');

  if (!washers || washers.length === 0) {
    console.warn('[Broadcast] No approved washers found');
    return;
  }

  const promises: Promise<unknown>[] = [];

  for (const washer of washers) {
    promises.push(
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
  }

  await Promise.allSettled(promises);
  console.log(`[Broadcast] Notified ${washers.length} washers for booking ${booking.id}`);
}
