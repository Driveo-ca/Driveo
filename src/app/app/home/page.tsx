'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getVehicleImageUrl } from '@/lib/vehicle-image';
import { cn } from '@/lib/utils';
import {
  Car, MapPin, ArrowRight, Clock, CreditCard, Sparkles,
  Droplets, ChevronRight, Plus, CalendarDays, Zap,
  CheckCircle2, Navigation, Star,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, PLAN_PRICES } from '@/lib/pricing';
import type { Profile, Vehicle, Booking, WashPlan } from '@/types';

/* ── service data ── */
const services: {
  plan: WashPlan;
  label: string;
  desc: string;
  time: string;
  icon: typeof Droplets;
  tag?: string;
}[] = [
  {
    plan: 'regular',
    label: 'Regular Wash',
    desc: 'Exterior hand wash, wheel cleaning & tire dressing',
    time: '30 min',
    icon: Droplets,
  },
  {
    plan: 'interior_exterior',
    label: 'Interior & Exterior',
    desc: 'Full exterior wash plus interior vacuum & wipe down',
    time: '45 min',
    icon: Sparkles,
    tag: 'Popular',
  },
  {
    plan: 'detailing',
    label: 'Full Detailing',
    desc: 'Showroom finish with deep clean, wax & leather care',
    time: '3 hrs',
    icon: Star,
  },
];

/* ── active booking status config ── */
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Finding Washer', color: 'text-amber-500' },
  assigned:  { label: 'Washer Assigned', color: 'text-blue-500' },
  en_route:  { label: 'En Route', color: 'text-blue-500' },
  arrived:   { label: 'Washer Arrived', color: 'text-violet-500' },
  washing:   { label: 'Washing Now', color: 'text-violet-500' },
};

const STAGE_STEPS = ['Assigned', 'En Route', 'Washing', 'Done'];
const stageIndex: Record<string, number> = {
  pending: 0, assigned: 0, en_route: 1, arrived: 2, washing: 2, completed: 3,
};

export default function CustomerHomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<string | null>(null);
  const [liveAddress, setLiveAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, vehiclesRes, bookingsRes, customerRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('vehicles').select('*').eq('customer_id', user.id).order('is_primary', { ascending: false }),
        supabase.from('bookings').select('*').eq('customer_id', user.id)
          .not('status', 'in', '("completed","paid","cancelled")')
          .order('created_at', { ascending: false })
          .limit(1),
        supabase.from('customer_profiles').select('default_address').eq('id', user.id).single(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (bookingsRes.data?.[0]) setActiveBooking(bookingsRes.data[0]);
      if (customerRes.data?.default_address) setDefaultAddress(customerRes.data.default_address);
      setLoading(false);
    }
    load();
  }, []);

  // Auto-detect location via browser geolocation + reverse geocode
  const [locationStatus, setLocationStatus] = useState<'idle' | 'detecting' | 'done' | 'denied'>('idle');

  useEffect(() => {
    if (defaultAddress || liveAddress) { setLocationStatus('done'); return; }
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }

    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${key}`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            const components = data.results[0].address_components;
            const street = components.find((c: any) => c.types.includes('route'))?.short_name;
            const streetNum = components.find((c: any) => c.types.includes('street_number'))?.short_name;
            const city = components.find((c: any) => c.types.includes('locality'))?.short_name;
            const short = [streetNum, street].filter(Boolean).join(' ');
            setLiveAddress(short && city ? `${short}, ${city}` : data.results[0].formatted_address.split(',').slice(0, 2).join(','));
          }
          setLocationStatus('done');
        } catch {
          setLocationStatus('denied');
        }
      },
      () => setLocationStatus('denied'),
      { timeout: 8000, maximumAge: 300000 }
    );
  }, [defaultAddress, liveAddress]);

  const primaryVehicle = useMemo(
    () => vehicles.find((v) => v.is_primary) || vehicles[0],
    [vehicles],
  );

  const carImageUrl = useMemo(() => {
    if (!primaryVehicle) return '';
    return getVehicleImageUrl(primaryVehicle.make, primaryVehicle.model, primaryVehicle.year, {
      angle: 'front-side',
      width: 600,
      color: primaryVehicle.color || undefined,
    });
  }, [primaryVehicle]);

  const nextSlot = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30 - (d.getMinutes() % 30));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (loading) {
    return (
      <div className="px-5 md:px-10 pt-6 pb-8 max-w-[1280px] mx-auto">
        <Skeleton className="h-5 w-32 bg-foreground/[0.04] rounded mb-2" />
        <Skeleton className="h-8 w-48 bg-foreground/[0.06] rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <Skeleton className="h-[320px] bg-foreground/[0.04] rounded-2xl" />
          <Skeleton className="h-[320px] bg-foreground/[0.04] rounded-2xl" />
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const currentStage = activeBooking ? (stageIndex[activeBooking.status] ?? 0) : 0;
  const statusInfo = activeBooking ? STATUS_LABELS[activeBooking.status] : null;

  return (
    <div className="px-5 md:px-10 pt-4 md:pt-8 pb-10 max-w-[1280px] mx-auto">

      {/* ═══════════════════ GREETING ═══════════════════ */}
      <div className="mb-6 md:mb-8">
        <p className="text-xs text-foreground/60 font-medium mb-0.5">{greeting}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {firstName}<span className="text-[#E23232]">.</span>
        </h1>
      </div>

      {/* ═══════════════════ ACTIVE BOOKING BANNER ═══════════════════ */}
      {activeBooking && statusInfo && (
        <Link href={`/app/track/${activeBooking.id}`} className="block mb-6 group">
          <div className="rounded-2xl border border-border/60 overflow-hidden">
            <div className="px-4 md:px-5 py-4">
              {/* Top: status + track */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E23232] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E23232]" />
                  </span>
                  <span className="text-[13px] font-semibold text-foreground">{PLAN_LABELS[activeBooking.wash_plan]}</span>
                  <span className="text-[10px] text-foreground/50 font-mono">WSH-{activeBooking.id.slice(0, 4).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#E23232] group-hover:gap-2 transition-all">
                  Track <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Progress: segmented bar with labels */}
              <div className="flex gap-1.5">
                {STAGE_STEPS.map((step, i) => (
                  <div key={step} className="flex-1">
                    <div className={cn(
                      'h-[3px] rounded-full mb-1.5',
                      i <= currentStage ? 'bg-[#E23232]' : 'bg-foreground/[0.08]'
                    )} />
                    <span className={cn(
                      'text-[10px] font-medium',
                      i === currentStage ? 'text-[#E23232]' : i < currentStage ? 'text-foreground/50' : 'text-foreground/50'
                    )}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* ═══════════════════ MAIN GRID ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-5 lg:gap-6 items-start">

        {/* ──────── LEFT COLUMN ──────── */}
        <div className="space-y-5 min-w-0">

          {/* ── HERO: BOOK A WASH ── */}
          <Link href="/app/book" className="block group">
            <div className="relative rounded-2xl border border-border/50 overflow-hidden min-h-[240px] md:min-h-[300px] flex flex-col">
              {/* Background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] via-transparent to-[#E23232]/[0.04]" />

              {/* Car image watermark (right side) */}
              {primaryVehicle && (
                <div className="absolute -right-8 md:-right-4 top-1/2 -translate-y-1/2 w-[280px] md:w-[380px] h-[180px] md:h-[240px] opacity-[0.12] dark:opacity-[0.08] pointer-events-none">
                  <img
                    src={carImageUrl}
                    alt=""
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="relative flex flex-col justify-between flex-1 p-5 md:p-7">
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#E23232]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground/50">On-Demand Service</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-foreground/60">Next: {nextSlot}</span>
                  </div>
                </div>

                {/* Center content */}
                <div className="py-6 md:py-10">
                  <h2 className="text-4xl md:text-6xl font-display uppercase text-foreground tracking-wide leading-[1]">
                    Book a Wash
                  </h2>
                  <p className="text-sm text-foreground/60 mt-3 max-w-[320px]">
                    Professional car wash at your doorstep. We come to you.
                  </p>
                </div>

                {/* Bottom row */}
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#E23232] shrink-0" />
                    <span className="text-sm text-foreground/55 truncate max-w-[240px]">
                      {activeBooking?.service_address || defaultAddress || liveAddress || (
                        locationStatus === 'detecting' ? 'Detecting location...' : 'Allow location access'
                      )}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#E23232] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-[0_4px_20px_rgba(226,50,50,0.3)] transition-all">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* ── SERVICES GRID ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/55">Services</span>
                <div className="h-px w-12 bg-border/50" />
              </div>
              <Link href="/app/book" className="text-[11px] font-medium text-foreground/55 hover:text-foreground/55 transition-colors">
                View all
              </Link>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
              {services.map(({ plan, label, desc, time, icon: Icon, tag }) => (
                <Link key={plan} href={`/app/book?plan=${plan}`} className="block flex-shrink-0 w-[220px] md:w-auto snap-start group/card">
                  <div className={cn(
                    'h-full rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden',
                    tag
                      ? 'border-[#E23232]/25 bg-gradient-to-b from-[#E23232]/[0.04] to-transparent hover:border-[#E23232]/40'
                      : 'border-border/50 hover:border-border hover:bg-foreground/[0.02]'
                  )} style={{ minHeight: 200 }}>
                    {tag && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E23232]/50 via-[#E23232]/20 to-transparent" />}

                    <div className="p-4 md:p-5 pb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center',
                          tag ? 'bg-[#E23232]/10' : 'bg-foreground/[0.05]'
                        )}>
                          <Icon className={cn('w-4 h-4', tag ? 'text-[#E23232]' : 'text-foreground/55')} />
                        </div>
                        {tag && (
                          <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#E23232] bg-[#E23232]/10 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        )}
                      </div>
                      <h3 className="text-foreground text-sm font-semibold mb-1">{label}</h3>
                      <p className="text-foreground/55 text-xs leading-relaxed">{desc}</p>
                    </div>

                    <div className="p-4 md:p-5 pt-3">
                      <div className="flex items-end justify-between pt-3 border-t border-border/40">
                        <span className="text-[11px] text-foreground/55">{time}</span>
                        <span className="text-lg font-bold text-foreground tracking-tight">
                          {centsToDisplay(PLAN_PRICES[plan])}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN ──────── */}
        <div className="space-y-5">

          {/* ── VEHICLE CARD ── */}
          {primaryVehicle ? (
            <div className="rounded-2xl border border-border/50 overflow-hidden">
              {/* Car image section */}
              <div className="relative h-[160px] md:h-[180px] bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.01] flex items-center justify-center">
                {/* Dot grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }} />
                {/* Red ambient */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[60px] bg-[#E23232]/[0.06] rounded-full blur-3xl" />

                <img
                  src={carImageUrl}
                  alt={`${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`}
                  className="relative w-[260px] md:w-[300px] h-auto object-contain drop-shadow-lg"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Fallback */}
                <Car className="absolute w-16 h-16 text-foreground/[0.04]" />

                {/* Status badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Ready</span>
                </div>
              </div>

              {/* Vehicle info */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-foreground leading-tight">
                      {primaryVehicle.year} {primaryVehicle.make}
                    </h3>
                    <p className="text-foreground/70 text-sm font-medium">{primaryVehicle.model}</p>
                    <p className="text-foreground/55 text-xs mt-1 capitalize">
                      {primaryVehicle.type.replace('_', ' ')}
                      {primaryVehicle.color ? ` · ${primaryVehicle.color}` : ''}
                    </p>
                  </div>
                  <Link
                    href="/app/vehicles"
                    className="text-[11px] font-medium text-[#E23232] hover:text-[#c92a2a] px-2.5 py-1 rounded-lg hover:bg-[#E23232]/[0.06] transition-all"
                  >
                    Manage
                  </Link>
                </div>

                {vehicles.length > 1 && (
                  <p className="text-[11px] text-foreground/50 mt-3 pt-3 border-t border-border/40">
                    +{vehicles.length - 1} other vehicle{vehicles.length > 2 ? 's' : ''} registered
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Link href="/app/onboarding" className="block">
              <div className="rounded-2xl border-2 border-dashed border-border/60 hover:border-[#E23232]/30 p-8 text-center transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-[#E23232]/[0.06] flex items-center justify-center mx-auto mb-4 group-hover:bg-[#E23232]/10 transition-colors">
                  <Plus className="w-6 h-6 text-[#E23232]" />
                </div>
                <p className="text-foreground font-semibold text-sm">Add Your Vehicle</p>
                <p className="text-foreground/55 text-xs mt-1">Required to book a wash</p>
              </div>
            </Link>
          )}

          {/* ── QUICK ACTIONS ── */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/app/bookings" className="block group">
              <div className="rounded-2xl border border-border/50 hover:border-border p-4 transition-all hover:bg-foreground/[0.02] min-h-[100px] flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] group-hover:bg-foreground/[0.07] flex items-center justify-center transition-colors">
                  <CalendarDays className="w-4 h-4 text-foreground/55 group-hover:text-foreground/60 transition-colors" />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">Wash History</p>
                  <p className="text-[11px] text-foreground/50 mt-0.5">View past washes</p>
                </div>
              </div>
            </Link>
            <Link href="/app/membership" className="block group">
              <div className="rounded-2xl border border-border/50 hover:border-border p-4 transition-all hover:bg-foreground/[0.02] min-h-[100px] flex flex-col justify-between">
                <div className="w-9 h-9 rounded-xl bg-foreground/[0.05] group-hover:bg-foreground/[0.07] flex items-center justify-center transition-colors">
                  <CreditCard className="w-4 h-4 text-foreground/55 group-hover:text-foreground/60 transition-colors" />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">Subscription</p>
                  <p className="text-[11px] text-foreground/50 mt-0.5">Manage plan</p>
                </div>
              </div>
            </Link>
          </div>

          {/* ── MEMBERSHIP UPSELL ── */}
          <Link href="/app/membership" className="block group">
            <div className="relative rounded-2xl border border-[#E23232]/20 overflow-hidden hover:border-[#E23232]/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E23232]/[0.06] via-transparent to-[#E23232]/[0.03]" />
              <div className="relative p-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#E23232]/15 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#E23232]" />
                  </div>
                  <span className="text-xs font-bold text-[#E23232] uppercase tracking-[0.06em]">Driveo Plus</span>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed mb-3">
                  Unlimited exterior washes & priority booking for <span className="text-foreground font-semibold">$79/mo</span>.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#E23232] group-hover:gap-2.5 transition-all">
                  View Membership
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
