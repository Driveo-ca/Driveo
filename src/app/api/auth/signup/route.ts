import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { userId, fullName, email, phone, role } = await request.json();

    if (!userId || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Create base profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      role,
      full_name: fullName,
      email,
      phone,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    // Create role-specific profile
    if (role === 'customer') {
      // Generate referral code from name
      const referralCode = fullName
        .replace(/\s+/g, '')
        .toUpperCase()
        .slice(0, 6) + Math.floor(Math.random() * 100);

      const { error } = await supabase.from('customer_profiles').insert({
        id: userId,
        referral_code: referralCode,
      });

      if (error) {
        console.error('Customer profile error:', error);
      }
    } else if (role === 'washer') {
      const { error } = await supabase.from('washer_profiles').insert({
        id: userId,
        status: 'pending',
        service_zones: [],
        tools_owned: [],
      });

      if (error) {
        console.error('Washer profile error:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Signup API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
