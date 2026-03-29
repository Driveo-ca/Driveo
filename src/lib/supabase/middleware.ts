import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/auth', '/plans', '/how-it-works', '/apply', '/privacy', '/terms'];

async function getUserRole(supabase: ReturnType<typeof createServerClient>, userId: string, metadata?: Record<string, unknown>): Promise<string | undefined> {
  const metaRole = metadata?.role as string | undefined;
  if (metaRole) return metaRole;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return profile?.role ?? undefined;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, {
                ...options,
                // Ensure auth cookies persist across browser restarts (30 days)
                maxAge: options?.maxAge ?? 60 * 60 * 24 * 30,
                sameSite: 'lax',
                path: '/',
              })
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );
    const isApiRoute = pathname.startsWith('/api');
    const isStaticAsset = pathname.startsWith('/_next') || pathname.includes('.');

    if (isApiRoute || isStaticAsset) {
      return supabaseResponse;
    }

    // Logged-in users hitting landing page or auth pages → redirect to their dashboard
    if (user && (pathname === '/' || pathname.startsWith('/auth'))) {
      if (pathname === '/auth/callback') return supabaseResponse;

      const role = await getUserRole(supabase, user.id, user.user_metadata);
      if (role === 'washer') return NextResponse.redirect(new URL('/washer/dashboard', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
      return NextResponse.redirect(new URL('/app/home', request.url));
    }

    if (isPublicRoute) {
      return supabaseResponse;
    }

    // Not logged in → redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const role = await getUserRole(supabase, user.id, user.user_metadata);

    // Role-based route protection
    if (pathname.startsWith('/app') && role && role !== 'customer') {
      // Redirect non-customers away from customer app
      if (role === 'washer') return NextResponse.redirect(new URL('/washer/dashboard', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (pathname.startsWith('/washer') && role !== 'washer') {
      if (role === 'customer') return NextResponse.redirect(new URL('/app/home', request.url));
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      if (role === 'customer') return NextResponse.redirect(new URL('/app/home', request.url));
      if (role === 'washer') return NextResponse.redirect(new URL('/washer/dashboard', request.url));
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return supabaseResponse;
  } catch (e) {
    console.error('Middleware auth error:', e);
    return supabaseResponse;
  }
}
