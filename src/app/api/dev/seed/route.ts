import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Only allow in development
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const admin = await createAdminClient();

  // ── Helper: days ago ──
  function daysAgo(d: number, h = 10, m = 0) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setHours(h, m, 0, 0);
    return date.toISOString();
  }

  try {
    // ══════════════════════════════════════════
    // 1. CREATE AUTH USERS
    // ══════════════════════════════════════════
    const users = [
      { email: 'customer@driveo.test', password: 'Test1234!', role: 'customer', name: 'Priya Sharma' },
      { email: 'washer@driveo.test', password: 'Test1234!', role: 'washer', name: 'Arjun Kumar' },
      { email: 'admin@driveo.test', password: 'Test1234!', role: 'admin', name: 'Nishant Admin' },
    ];

    const userIds: Record<string, string> = {};

    for (const u of users) {
      // Delete existing test user if any
      const { data: existing } = await admin.auth.admin.listUsers();
      const existingUser = existing?.users?.find((x) => x.email === u.email);
      if (existingUser) {
        // Clean up related data first
        await admin.from('notifications').delete().eq('user_id', existingUser.id);
        await admin.from('booking_photos').delete().in(
          'booking_id',
          (await admin.from('bookings').select('id').or(`customer_id.eq.${existingUser.id},washer_id.eq.${existingUser.id}`)).data?.map((b) => b.id) || []
        );
        try {
          await admin.from('booking_messages').delete().in(
            'booking_id',
            (await admin.from('bookings').select('id').or(`customer_id.eq.${existingUser.id},washer_id.eq.${existingUser.id}`)).data?.map((b) => b.id) || []
          );
        } catch { /* booking_messages table may not exist yet */ }
        await admin.from('bookings').delete().or(`customer_id.eq.${existingUser.id},washer_id.eq.${existingUser.id}`);
        await admin.from('reviews').delete().or(`customer_id.eq.${existingUser.id},washer_id.eq.${existingUser.id}`);
        await admin.from('washer_availability').delete().eq('washer_id', existingUser.id);
        await admin.from('washer_blocks').delete().eq('washer_id', existingUser.id);
        await admin.from('vehicles').delete().eq('customer_id', existingUser.id);
        await admin.from('customer_profiles').delete().eq('id', existingUser.id);
        await admin.from('washer_profiles').delete().eq('id', existingUser.id);
        await admin.from('profiles').delete().eq('id', existingUser.id);
        await admin.auth.admin.deleteUser(existingUser.id);
      }

      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role, full_name: u.name },
      });
      if (error) throw new Error(`Failed to create ${u.email}: ${error.message}`);
      userIds[u.role] = data.user.id;
    }

    const customerId = userIds.customer;
    const washerId = userIds.washer;
    const adminId = userIds.admin;

    // ══════════════════════════════════════════
    // 2. CREATE PROFILES
    // ══════════════════════════════════════════
    await admin.from('profiles').insert([
      { id: customerId, role: 'customer', full_name: 'Priya Sharma', email: 'customer@driveo.test', phone: '+16475551234' },
      { id: washerId, role: 'washer', full_name: 'Arjun Kumar', email: 'washer@driveo.test', phone: '+14165559876' },
      { id: adminId, role: 'admin', full_name: 'Nishant Admin', email: 'admin@driveo.test', phone: '+14165550000' },
    ]);

    // ══════════════════════════════════════════
    // 3. CUSTOMER PROFILE + VEHICLES
    // ══════════════════════════════════════════
    await admin.from('customer_profiles').insert({
      id: customerId,
      referral_code: 'PRIYA42',
      default_address: '100 City Centre Dr, Mississauga, ON L5B 2C9',
      default_lat: 43.5932,
      default_lng: -79.6441,
      default_postal: 'L5B 2C9',
    });

    const { data: vehicles } = await admin.from('vehicles').insert([
      {
        customer_id: customerId,
        make: 'Toyota', model: 'Camry', year: 2023,
        color: 'Pearl White', plate: 'DRVEO1', type: 'sedan',
        is_primary: true, nickname: 'Daily Driver',
      },
      {
        customer_id: customerId,
        make: 'Tesla', model: 'Model Y', year: 2024,
        color: 'Midnight Black', plate: 'ELEC99', type: 'suv',
        is_primary: false, nickname: 'Weekend Car',
      },
    ]).select('id, type');

    const sedanId = vehicles?.[0]?.id;
    const suvId = vehicles?.[1]?.id;

    // ══════════════════════════════════════════
    // 4. WASHER PROFILE + AVAILABILITY
    // ══════════════════════════════════════════
    await admin.from('washer_profiles').insert({
      id: washerId,
      status: 'approved',
      bio: JSON.stringify({
        experience: '3 years professional auto detailing',
        certifications: 'IDA Certified Detailer',
        why: 'Love making cars look brand new. Flexible schedule works perfectly for me.',
      }),
      service_zones: ['L4Z', 'L5B', 'M9C'],
      vehicle_make: 'Honda', vehicle_model: 'Civic',
      vehicle_year: 2021, vehicle_plate: 'WASH01',
      tools_owned: ['pressure_washer', 'vacuum', 'polisher', 'microfiber_towels', 'clay_bar_kit'],
      insurance_verified: true,
      background_check_done: true,
      rating_avg: 4.85,
      jobs_completed: 47,
      is_online: true,
      current_lat: 43.5890,
      current_lng: -79.6442,
    });

    // Availability: Mon-Fri 8-18, Sat 9-15
    const availability = [];
    for (let day = 1; day <= 5; day++) {
      availability.push({ washer_id: washerId, day_of_week: day, start_time: '08:00', end_time: '18:00', is_available: true });
    }
    availability.push({ washer_id: washerId, day_of_week: 6, start_time: '09:00', end_time: '15:00', is_available: true });
    availability.push({ washer_id: washerId, day_of_week: 0, start_time: '10:00', end_time: '10:00', is_available: false });
    await admin.from('washer_availability').insert(availability);

    // ══════════════════════════════════════════
    // 5. ADMIN PROFILE (no sub-profile needed)
    // ══════════════════════════════════════════
    // Already created in profiles table

    // ══════════════════════════════════════════
    // 6. BOOKINGS — completed jobs (past 3 weeks)
    // ══════════════════════════════════════════
    type BookingSeed = {
      daysAgo: number; hour: number;
      plan: string; vehicleId: string | undefined; vehicleType: string;
      dirt: number; status: string;
    };

    const bookingSeeds: BookingSeed[] = [
      // Today
      { daysAgo: 0, hour: 9, plan: 'regular', vehicleId: sedanId, vehicleType: 'sedan', dirt: 3, status: 'completed' },
      { daysAgo: 0, hour: 11, plan: 'interior_exterior', vehicleId: suvId, vehicleType: 'suv', dirt: 5, status: 'washing' },
      // Yesterday
      { daysAgo: 1, hour: 8, plan: 'regular', vehicleId: sedanId, vehicleType: 'sedan', dirt: 4, status: 'completed' },
      { daysAgo: 1, hour: 14, plan: 'regular', vehicleId: suvId, vehicleType: 'suv', dirt: 2, status: 'completed' },
      // 2 days ago
      { daysAgo: 2, hour: 10, plan: 'interior_exterior', vehicleId: sedanId, vehicleType: 'sedan', dirt: 6, status: 'completed' },
      // 3 days ago
      { daysAgo: 3, hour: 9, plan: 'regular', vehicleId: suvId, vehicleType: 'suv', dirt: 3, status: 'completed' },
      { daysAgo: 3, hour: 13, plan: 'detailing', vehicleId: sedanId, vehicleType: 'sedan', dirt: 7, status: 'completed' },
      // 5 days ago
      { daysAgo: 5, hour: 11, plan: 'regular', vehicleId: sedanId, vehicleType: 'sedan', dirt: 5, status: 'completed' },
      { daysAgo: 5, hour: 15, plan: 'interior_exterior', vehicleId: suvId, vehicleType: 'suv', dirt: 4, status: 'completed' },
      // 7 days ago
      { daysAgo: 7, hour: 9, plan: 'regular', vehicleId: sedanId, vehicleType: 'sedan', dirt: 2, status: 'completed' },
      { daysAgo: 7, hour: 12, plan: 'regular', vehicleId: suvId, vehicleType: 'suv', dirt: 6, status: 'completed' },
      // 10 days ago
      { daysAgo: 10, hour: 10, plan: 'interior_exterior', vehicleId: sedanId, vehicleType: 'sedan', dirt: 5, status: 'completed' },
      { daysAgo: 10, hour: 14, plan: 'detailing', vehicleId: suvId, vehicleType: 'suv', dirt: 8, status: 'completed' },
      // 14 days ago
      { daysAgo: 14, hour: 8, plan: 'regular', vehicleId: sedanId, vehicleType: 'sedan', dirt: 3, status: 'completed' },
      { daysAgo: 14, hour: 11, plan: 'regular', vehicleId: suvId, vehicleType: 'suv', dirt: 4, status: 'completed' },
      // 18 days ago
      { daysAgo: 18, hour: 9, plan: 'interior_exterior', vehicleId: sedanId, vehicleType: 'sedan', dirt: 7, status: 'completed' },
      // Upcoming (scheduled)
      { daysAgo: -1, hour: 10, plan: 'regular', vehicleId: sedanId, vehicleType: 'sedan', dirt: 5, status: 'assigned' },
      { daysAgo: -2, hour: 14, plan: 'interior_exterior', vehicleId: suvId, vehicleType: 'suv', dirt: 4, status: 'pending' },
    ];

    const PLAN_PRICES: Record<string, number> = { regular: 1800, interior_exterior: 2500, detailing: 18900 };
    const VEH_MULT: Record<string, number> = { sedan: 1.0, suv: 1.25 };
    const DIRT_MULT: Record<number, number> = { 0:1,1:1,2:1,3:1,4:1,5:1,6:1.15,7:1.3,8:1.5,9:1.75,10:2 };
    const PAYOUT: Record<string, number> = { regular: 1100, interior_exterior: 1100, detailing: 2200 };

    const bookingRows = bookingSeeds.map((b) => {
      const base = PLAN_PRICES[b.plan];
      const vm = VEH_MULT[b.vehicleType] ?? 1;
      const dm = DIRT_MULT[b.dirt] ?? 1;
      const finalPrice = Math.round(base * vm * dm);
      const hst = Math.round(finalPrice * 0.13);
      const total = finalPrice + hst;
      const created = daysAgo(b.daysAgo, b.hour);
      const isCompleted = b.status === 'completed';
      const isActive = ['washing', 'en_route', 'arrived'].includes(b.status);

      return {
        customer_id: customerId,
        washer_id: isCompleted || isActive || b.status === 'assigned' ? washerId : null,
        vehicle_id: b.vehicleId,
        wash_plan: b.plan,
        dirt_level: b.dirt,
        status: b.status,
        service_address: '100 City Centre Dr, Mississauga, ON L5B 2C9',
        service_lat: 43.5932,
        service_lng: -79.6441,
        is_instant: b.daysAgo >= 0,
        scheduled_at: b.daysAgo < 0 ? daysAgo(b.daysAgo, b.hour) : null,
        base_price: base,
        vehicle_multiplier: vm,
        dirt_multiplier: dm,
        final_price: finalPrice,
        hst_amount: hst,
        total_price: total,
        washer_payout: PAYOUT[b.plan],
        payment_status: isCompleted ? 'captured' : (isActive || b.status === 'assigned') ? 'authorized' : 'pending',
        created_at: created,
        washer_assigned_at: isCompleted || isActive || b.status === 'assigned' ? created : null,
        wash_started_at: isCompleted || b.status === 'washing' ? created : null,
        wash_completed_at: isCompleted ? daysAgo(b.daysAgo, b.hour + 1) : null,
        payment_captured_at: isCompleted ? daysAgo(b.daysAgo, b.hour + 1) : null,
        estimated_duration_min: b.plan === 'detailing' ? 240 : b.plan === 'interior_exterior' ? 75 : 35,
      };
    });

    await admin.from('bookings').insert(bookingRows);

    // ══════════════════════════════════════════
    // 7. NOTIFICATIONS
    // ══════════════════════════════════════════
    const notifications = [
      // Washer notifications
      { user_id: washerId, type: 'new_job', title: 'New Job Assigned', body: 'Regular wash at 100 City Centre Dr — Toyota Camry', is_read: false, created_at: daysAgo(0, 11) },
      { user_id: washerId, type: 'payment', title: 'Payment Received', body: 'You earned $11.00 for a Regular Wash', is_read: false, created_at: daysAgo(0, 10) },
      { user_id: washerId, type: 'payment', title: 'Payment Received', body: 'You earned $11.00 for a Regular Wash', is_read: true, created_at: daysAgo(1, 9) },
      { user_id: washerId, type: 'payment', title: 'Payment Received', body: 'You earned $11.00 for a Regular Wash', is_read: true, created_at: daysAgo(1, 15) },
      { user_id: washerId, type: 'system', title: 'Weekly Summary', body: 'You completed 5 washes this week and earned $77.00. Great job!', is_read: true, created_at: daysAgo(2, 18) },
      { user_id: washerId, type: 'new_job', title: 'New Job Assigned', body: 'Interior & Exterior at 100 City Centre Dr — Toyota Camry', is_read: true, created_at: daysAgo(2, 10) },
      { user_id: washerId, type: 'payment', title: 'Payment Received', body: 'You earned $22.00 for a Detailing job', is_read: true, created_at: daysAgo(3, 14) },
      { user_id: washerId, type: 'system', title: 'Rating Update', body: 'Your average rating is now 4.85 stars!', is_read: true, created_at: daysAgo(5, 9) },
      { user_id: washerId, type: 'new_job', title: 'Upcoming Job', body: 'Scheduled Regular Wash tomorrow at 10:00 AM', is_read: false, created_at: daysAgo(0, 8) },
      { user_id: washerId, type: 'system', title: 'Welcome to Driveo!', body: 'Your washer application has been approved. Start accepting jobs now!', is_read: true, created_at: daysAgo(21, 9) },
      // Customer notifications
      { user_id: customerId, type: 'booking_confirmed', title: 'Booking Confirmed', body: 'Your Regular Wash is confirmed for today', is_read: false, created_at: daysAgo(0, 9) },
      { user_id: customerId, type: 'washer_assigned', title: 'Washer On The Way', body: 'Arjun K. is heading to your location', is_read: false, created_at: daysAgo(0, 11) },
      { user_id: customerId, type: 'wash_completed', title: 'Wash Complete!', body: 'Your Toyota Camry is sparkling clean!', is_read: true, created_at: daysAgo(1, 9) },
      { user_id: customerId, type: 'payment', title: 'Payment Processed', body: '$20.34 charged for Regular Wash', is_read: true, created_at: daysAgo(1, 9) },
      { user_id: customerId, type: 'system', title: 'Welcome to Driveo!', body: 'Your account is set up. Book your first wash now!', is_read: true, created_at: daysAgo(20, 9) },
    ];

    await admin.from('notifications').insert(notifications);

    // ══════════════════════════════════════════
    // 8. REVIEWS (for some completed bookings)
    // ══════════════════════════════════════════
    const { data: completedBookings } = await admin
      .from('bookings')
      .select('id')
      .eq('status', 'completed')
      .eq('washer_id', washerId)
      .order('created_at', { ascending: false })
      .limit(8);

    if (completedBookings?.length) {
      const reviewTexts = [
        'Amazing job! Car looks brand new.',
        'Very thorough, will book again.',
        'Great service, very professional.',
        'Exceeded my expectations!',
        'Good work, arrived on time.',
        'Fantastic attention to detail.',
        'Quick and efficient. Highly recommend.',
        'Best car wash service in the GTA!',
      ];
      const reviews = completedBookings.map((b, i) => ({
        booking_id: b.id,
        customer_id: customerId,
        washer_id: washerId,
        rating: i < 6 ? 5 : 4,
        comment: reviewTexts[i],
      }));
      await admin.from('reviews').insert(reviews);
    }

    return NextResponse.json({
      success: true,
      accounts: {
        customer: { email: 'customer@driveo.test', password: 'Test1234!' },
        washer: { email: 'washer@driveo.test', password: 'Test1234!' },
        admin: { email: 'admin@driveo.test', password: 'Test1234!' },
      },
      data: {
        bookings: bookingRows.length,
        vehicles: 2,
        notifications: notifications.length,
        reviews: completedBookings?.length || 0,
      },
    });
  } catch (err) {
    console.error('Seed error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
