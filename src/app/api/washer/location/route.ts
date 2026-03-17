// ═══════════════════════════════════════
// POST /api/washer/location
// Update washer GPS coordinates
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ── Must be a washer ──
    const userRole = user.user_metadata?.role as string | undefined;

    if (userRole !== 'washer') {
      return NextResponse.json(
        { error: 'Forbidden: washer role required' },
        { status: 403 }
      );
    }

    // ── Parse body ──
    const body = await request.json();
    const { lat, lng } = body as { lat?: number; lng?: number };

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'lat and lng are required as numbers' },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // ── Update location using admin client (bypasses RLS) ──
    const adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: updateError } = await adminClient
      .from('washer_profiles')
      .update({
        current_lat: lat,
        current_lng: lng,
        is_online: true,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[POST /api/washer/location]', updateError.message);
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/washer/location]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
