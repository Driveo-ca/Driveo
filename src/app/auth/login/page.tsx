'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Loader2, MapPin } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

/* ── Map styles (same as booking flow) ── */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3e' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#a0a0b0' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#16162a' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1e32' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6a6a7a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2a1a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e1e30' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#353548' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#7a7a8a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e1e32' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e1e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a4a5a' }] },
];

const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
];

const GTA_CENTER = { lat: 43.7, lng: -79.42 };

const WASH_POINTS = [
  { lat: 43.6532, lng: -79.3832 },
  { lat: 43.7615, lng: -79.4111 },
  { lat: 43.5890, lng: -79.6441 },
  { lat: 43.8561, lng: -79.3370 },
  { lat: 43.6896, lng: -79.5971 },
  { lat: 43.7735, lng: -79.2580 },
  { lat: 43.8372, lng: -79.5082 },
  { lat: 43.5448, lng: -79.6625 },
];

function AuthMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.google?.maps) { setReady(true); return; }
    const iv = setInterval(() => {
      if (window.google?.maps) { setReady(true); clearInterval(iv); }
    }, 400);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || mapInstance.current) return;
    const isDark = document.documentElement.classList.contains('dark');

    const map = new google.maps.Map(mapRef.current, {
      center: GTA_CENTER,
      zoom: 10.5,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
      backgroundColor: isDark ? '#050505' : '#eaeaec',
      zoomControlOptions: { position: 6 },
    });
    mapInstance.current = map;

    new google.maps.Circle({
      map,
      center: GTA_CENTER,
      radius: 28000,
      fillColor: '#E23232',
      fillOpacity: 0.04,
      strokeColor: '#E23232',
      strokeOpacity: 0.15,
      strokeWeight: 1,
    });

    WASH_POINTS.forEach((point) => {
      new google.maps.Marker({
        map,
        position: point,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: '#E23232',
          fillOpacity: 0.9,
          strokeColor: '#E23232',
          strokeOpacity: 0.3,
          strokeWeight: 8,
        },
      });
    });
  }, [ready]);

  // React to theme changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      mapInstance.current?.setOptions({
        styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
        backgroundColor: isDark ? '#050505' : '#eaeaec',
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [ready]);

  return <div ref={mapRef} className="absolute inset-0" />;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => { setMounted(true); }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    let role = data.user?.user_metadata?.role;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    if (profile?.role) role = profile.role;

    if (redirect && redirect !== '/') router.push(redirect);
    else if (role === 'washer') router.push('/washer/dashboard');
    else if (role === 'admin') router.push('/admin');
    else router.push('/app/home');
    router.refresh();
  }

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <style jsx global>{`
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .auth-in {
          animation: authSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .auth-fade {
          animation: authFadeIn 0.6s ease forwards;
          opacity: 0;
        }
      `}</style>

      {/* ═══ LEFT — Form Panel (40%) ═══ */}
      <div className="relative w-full lg:w-[40%] shrink-0 flex flex-col h-screen z-10 bg-background">
        {/* Right edge separator */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-border hidden lg:block" />

        {/* Mini nav */}
        <div className={`flex items-center justify-between px-6 sm:px-8 pt-5 pb-2 ${mounted ? 'auth-fade' : 'opacity-0'}`} style={{ animationDelay: '0.05s' }}>
          <Link href="/">
            <Image src="/Driveo-logo.png" alt="Driveo" width={100} height={36} className="h-8 w-auto" />
          </Link>
          <ThemeToggle />
        </div>

        {/* Form content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-10 xl:px-14">
          {/* Heading */}
          <div className={mounted ? 'auth-in' : 'opacity-0'} style={{ animationDelay: '0.1s' }}>
            <h1 className="font-display text-[2.4rem] sm:text-[2.8rem] leading-none text-foreground tracking-wide mb-1">
              WELCOME BACK
            </h1>
            <p className="text-muted-foreground text-sm mb-7">Sign in to your Driveo account</p>
          </div>

          {/* Google OAuth */}
          <div className={mounted ? 'auth-in' : 'opacity-0'} style={{ animationDelay: '0.15s' }}>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                const supabase = createClient();
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
                    queryParams: { access_type: 'offline', prompt: 'consent' },
                  },
                });
                if (error) { toast.error(error.message); setLoading(false); }
              }}
              className="w-full h-12 rounded-xl bg-card border border-border hover:border-foreground/20 text-foreground font-medium text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 shadow-sm"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className={`flex items-center gap-4 my-5 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div className={mounted ? 'auth-in' : 'opacity-0'} style={{ animationDelay: '0.25s' }}>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-medium mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
            <div className={mounted ? 'auth-in' : 'opacity-0'} style={{ animationDelay: '0.3s' }}>
              <label className="block text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-medium mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>

            <div className={mounted ? 'auth-in' : 'opacity-0'} style={{ animationDelay: '0.35s' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40 mt-1 shadow-[0_2px_16px_rgba(226,50,50,0.25)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>Sign In<ArrowRight className="w-4 h-4" /></>)}
              </button>
            </div>
          </form>

          {/* Links */}
          <div className={`mt-6 space-y-1.5 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">Sign up</Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Want to wash cars?{' '}
              <Link href="/auth/signup?role=washer" className="text-primary hover:text-primary/80 font-medium transition-colors">Apply as a washer</Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 sm:px-8 pb-4 ${mounted ? 'auth-fade' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-2 text-muted-foreground/40 text-[11px]">
            <span>&copy; {new Date().getFullYear()} Driveo</span>
            <span>·</span>
            <span>GTA&apos;s Premium Car Wash</span>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT — Interactive Map (60%) ═══ */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <AuthMap />


        {/* Floating stats */}
        <div className={`absolute bottom-8 right-8 z-20 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 min-w-[220px] shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground font-medium">Live Service Area</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xl font-bold text-foreground tabular-nums">500+</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Washes completed</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground tabular-nums">15+</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Active washers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location badge */}
        <div className={`absolute top-6 right-8 z-20 ${mounted ? 'auth-in' : 'opacity-0'}`} style={{ animationDelay: '0.9s' }}>
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-full px-3.5 py-2 flex items-center gap-2 shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] text-muted-foreground font-medium">Greater Toronto Area</span>
          </div>
        </div>

      </div>

      {/* Mobile: map as subtle background */}
      <div className="fixed inset-0 lg:hidden pointer-events-none z-0 opacity-15">
        <AuthMap />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
