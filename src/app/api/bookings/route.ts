import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import { calculatePrice, PLAN_LABELS } from '@/lib/pricing';
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

    // Auto-assign nearest washer for instant bookings
    if (isInstant && serviceLat && serviceLng) {
      try {
        const { findNearestWasher, assignWasher } = await import('@/lib/assignment');
        const nearestWasher = await findNearestWasher(serviceLat, serviceLng);
        if (nearestWasher) {
          await assignWasher(booking.id, nearestWasher.id);
        }
      } catch (assignErr) {
        console.error('Auto-assignment failed (non-blocking):', assignErr);
      }
    }

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
