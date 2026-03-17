import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists — if not, this is a first-time OAuth sign-in
        const adminSupabase = await createAdminClient();
        const { data: existingProfile } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          // First-time Google OAuth user — create profile as customer
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Driveo User';
          const email = user.email || '';
          const phone = user.user_metadata?.phone || null;
          const role = 'customer';

          // Set role in user_metadata so middleware can route correctly
          await adminSupabase.auth.admin.updateUserById(user.id, {
            user_metadata: { ...user.user_metadata, role },
          });

          // Create base profile
          await adminSupabase.from('profiles').insert({
            id: user.id,
            role,
            full_name: fullName,
            email,
            phone,
          });

          // Create customer profile with referral code
          const referralCode = fullName
            .replace(/\s+/g, '')
            .toUpperCase()
            .slice(0, 6) + Math.floor(Math.random() * 100);

          await adminSupabase.from('customer_profiles').insert({
            id: user.id,
            referral_code: referralCode,
          });

          // Redirect new OAuth users to onboarding
          return NextResponse.redirect(`${origin}/app/onboarding`);
        }

        // Fetch role from profiles table (source of truth)
        let role = user.user_metadata?.role;
        const { data: profileData } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profileData?.role) role = profileData.role;

        // Route based on role
        if (next !== '/') {
          return NextResponse.redirect(`${origin}${next}`);
        }
        if (role === 'washer') {
          return NextResponse.redirect(`${origin}/washer/dashboard`);
        }
        if (role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`);
        }
        return NextResponse.redirect(`${origin}/app/home`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
