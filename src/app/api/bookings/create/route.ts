import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import { calculatePrice, PLAN_LABELS } from '@/lib/pricing';
import type { VehicleType, WashPlan } from '@/types';

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

    // Validate required fields
    if (!vehicleId || !washPlan || dirtLevel === undefined || !serviceAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (dirtLevel < 0 || dirtLevel > 10) {
      return NextResponse.json({ error: 'Invalid dirt level' }, { status: 400 });
    }

    const validPlans: WashPlan[] = ['regular', 'interior_exterior', 'detailing'];
    if (!validPlans.includes(washPlan)) {
      return NextResponse.json({ error: 'Invalid wash plan' }, { status: 400 });
    }

    // Get vehicle (verify ownership)
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('customer_id', user.id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Calculate price using existing pricing engine
    const price = calculatePrice(
      washPlan as WashPlan,
      vehicle.type as VehicleType,
      dirtLevel
    );

    const adminSupabase = await createAdminClient();

    // Get or create Stripe customer
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
      capture_method: 'manual', // Pre-authorize only — capture after wash completion
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

    // Create booking record with authorized payment status
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
      metadata: {
        ...paymentIntent.metadata,
        booking_id: booking.id,
      },
    });

    // Create notification
    await adminSupabase.from('notifications').insert({
      user_id: user.id,
      type: 'booking_created',
      title: 'Booking Confirmed',
      body: `Your ${price.planLabel} wash has been confirmed. Finding you a washer now.`,
      data: { booking_id: booking.id },
    });

    return NextResponse.json({
      bookingId: booking.id,
      clientSecret: paymentIntent.client_secret,
      price: price.totalCents,
    });
  } catch (err) {
    console.error('Booking create API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
