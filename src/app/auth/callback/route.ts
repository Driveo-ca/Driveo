import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Read from query params first, fall back to cookies (OAuth strips query params)
  const next = searchParams.get('next') || request.cookies.get('oauth_signup_next')?.value || '/';
  const signupRole = searchParams.get('role') || request.cookies.get('oauth_signup_role')?.value || null;

  if (code) {
    // Capture cookies that Supabase wants to set so we can forward them
    // on the redirect response — using cookies() API alone doesn't work
    // because NextResponse.redirect() doesn't inherit those cookies.
    const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookies) { cookiesToSet.push(...cookies); },
        },
      },
    );

    // Helper: create a redirect response with session cookies attached
    function redirect(url: string) {
      const res = NextResponse.redirect(url);
      cookiesToSet.forEach(({ name, value, options }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.cookies.set(name, value, options as any);
      });
      // Clear OAuth signup cookies after use
      res.cookies.set('oauth_signup_role', '', { path: '/', maxAge: 0 });
      res.cookies.set('oauth_signup_next', '', { path: '/', maxAge: 0 });
      return res;
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth code exchange failed:', error.message);
    }

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
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Driveo User';
          const email = user.email || '';
          const phone = user.user_metadata?.phone || null;
          const role = signupRole === 'washer' ? 'washer' : 'customer';

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

          if (role === 'washer') {
            // Create washer profile (pending approval)
            await adminSupabase.from('washer_profiles').insert({
              id: user.id,
              status: 'pending',
              service_zones: [],
              tools_owned: [],
            });

            // Redirect to washer onboarding form
            return redirect(`${origin}/apply/onboarding`);
          }

          // Customer: create customer profile with referral code
          const referralCode = fullName
            .replace(/\s+/g, '')
            .toUpperCase()
            .slice(0, 6) + Math.floor(Math.random() * 100);

          await adminSupabase.from('customer_profiles').insert({
            id: user.id,
            referral_code: referralCode,
          });

          // Redirect new customer OAuth users to onboarding
          return redirect(`${origin}/app/onboarding`);
        }

        // Fetch role from profiles table (source of truth)
        let role = user.user_metadata?.role;
        const { data: profileData } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (profileData?.role) role = profileData.role;

        // Block unapproved washers from accessing the app
        if (role === 'washer') {
          const { data: washerProfile } = await adminSupabase
            .from('washer_profiles')
            .select('status')
            .eq('id', user.id)
            .single();

          if (!washerProfile || washerProfile.status !== 'approved') {
            // Sign out the pending/rejected washer
            await supabase.auth.signOut();
            const errorType = washerProfile?.status === 'rejected' ? 'washer_rejected' : 'washer_pending';
            return redirect(`${origin}/auth/login?error=${errorType}`);
          }
        }

        // Route based on role
        if (next !== '/') {
          return redirect(`${origin}${next}`);
        }
        if (role === 'washer') {
          return redirect(`${origin}/washer/dashboard`);
        }
        if (role === 'admin') {
          return redirect(`${origin}/admin`);
        }
        return redirect(`${origin}/app/home`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
