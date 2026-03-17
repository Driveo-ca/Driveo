'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Car, CarFront, MapPin, ArrowRight, Clock, CreditCard, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, PLAN_PRICES } from '@/lib/pricing';
import type { Profile, Vehicle, Booking, WashPlan } from '@/types';

/* ── service data ── */
const services: {
  plan: WashPlan;
  sku: string;
  label: string;
  desc: string;
  time: string;
  tag?: string;
}[] = [
    {
      plan: 'regular',
      sku: 'SKU-100',
      label: 'Regular Wash',
      desc: 'Exterior hand wash, wheel cleaning, and tire dressing.',
      time: '30 MINS',
    },
    {
      plan: 'interior_exterior',
      sku: 'SKU-200',
      label: 'Interior & Exterior',
      desc: 'Full exterior wash plus interior vacuum and wipe down.',
      time: '45 MINS',
      tag: 'POPULAR',
    },
    {
      plan: 'detailing',
      sku: 'SKU-300',
      label: 'Full Detailing',
      desc: 'Showroom finish. Deep clean, wax, and leather conditioning.',
      time: '3 HOURS',
    },
  ];

/* ── progress ── */
const stages = ['EN ROUTE', 'WASHING', 'COMPLETE'];
const stageMap: Record<string, number> = {
  pending: 0, assigned: 0, en_route: 0,
  arrived: 1, washing: 1, completed: 2,
};


export default function CustomerHomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, vehiclesRes, bookingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('vehicles').select('*').eq('customer_id', user.id).order('is_primary', { ascending: false }),
        supabase.from('bookings').select('*').eq('customer_id', user.id)
          .not('status', 'in', '("completed","paid","cancelled")')
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (bookingsRes.data?.[0]) setActiveBooking(bookingsRes.data[0]);
      setLoading(false);
    }
    load();
  }, []);

  const primaryVehicle = useMemo(
    () => vehicles.find((v) => v.is_primary) || vehicles[0],
    [vehicles],
  );

  const nextSlot = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30 - (d.getMinutes() % 30));
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }, []);

  if (loading) {
    return (
      <div className="px-5 md:px-10 pt-6 pb-8 max-w-[1280px] mx-auto">
        <Skeleton className="h-4 w-28 bg-white/[0.04] rounded mb-2" />
        <Skeleton className="h-9 w-40 bg-white/[0.06] rounded mb-8" />
        <Skeleton className="h-60 w-full bg-white/[0.04] rounded-xl mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-52 bg-white/[0.04] rounded-xl" />
          <Skeleton className="h-52 bg-white/[0.04] rounded-xl" />
          <Skeleton className="h-52 bg-white/[0.04] rounded-xl hidden md:block" />
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const currentStage = activeBooking ? (stageMap[activeBooking.status] ?? 0) : 0;

  return (
    <div className="px-5 md:px-10 pt-2 md:pt-8 pb-10 max-w-[1280px] mx-auto animate-fade-in-up">

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className="flex items-end justify-between mb-6 md:mb-10 border-b border-white/[0.06] pb-5 md:pb-6">
        <div>
          <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em] text-white/25 mb-1">
            Welcome back
          </p>
          <h1 className="text-[28px] md:text-[40px] text-white font-light tracking-[-0.02em] leading-none">
            {firstName}<span className="text-[#E23232]">.</span>
          </h1>
        </div>
        {primaryVehicle && (
          <div className="text-right">
            <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.18em] text-white/25 mb-0.5 md:mb-1">
              <span className="hidden md:inline">Current Vehicle</span>
              <span className="md:hidden">{primaryVehicle.year} {primaryVehicle.make}</span>
            </p>
            <p className="text-white/70 md:text-white text-xs md:text-[15px] font-medium leading-tight">
              <span className="hidden md:inline">{primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}</span>
              <span className="md:hidden">{primaryVehicle.model} {primaryVehicle.type.replace('_', ' ').toUpperCase()}</span>
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════ MAIN GRID ═══════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">

        {/* ──────── LEFT COLUMN ──────── */}
        <div className="space-y-6 md:space-y-8 min-w-0">

          {/* BOOK A WASH */}
          <Link href="/app/book" className="block group">
            <div className="relative overflow-hidden rounded-xl bg-[#0c0c0c] border border-white/[0.05] p-6 md:p-8 lg:p-10 min-h-[260px] md:min-h-[340px] flex flex-col justify-between hover:border-white/[0.08] transition-colors">

              {/* top row: labels */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em] text-white/20">
                  On-Demand Service
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
                  <span className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.15em] text-white/25">
                    Next Slot: {nextSlot}
                  </span>
                </span>
              </div>

              {/* giant title */}
              <div className="py-6 md:py-8 flex flex-col items-start gap-1">
                <h2 className="font-sans text-[clamp(4rem,11vw,6.5rem)] font-light leading-none text-white tracking-[-0.02em]">
                  BOOK
                </h2>
                <h2 className="font-sans text-[clamp(4rem,11vw,6.5rem)] font-light leading-none text-white/40 tracking-[-0.02em]">
                  A WASH
                </h2>
              </div>

              {/* bottom row: location + arrow */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] text-white/15 mb-1.5">
                    Location
                  </p>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#E23232] shrink-0" />
                    <span className="text-white/60 text-[13px] md:text-[14px]">
                      {activeBooking?.service_address || '46 Panorama Ct'}
                    </span>
                  </span>
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#E23232] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </Link>

          {/* ACTIVE SESSION */}
          {activeBooking && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-[7px] h-[7px] rounded-full bg-[#E23232] pulse-dot" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E23232]">
                    Active Session
                  </span>
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/15">
                  ID: WSH-{activeBooking.id.slice(0, 4).toUpperCase()}
                </span>
              </div>

              <div className="flex items-start justify-between pt-1">
                <div>
                  <h3 className="text-white text-[17px] font-medium leading-tight">
                    {PLAN_LABELS[activeBooking.wash_plan]}
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25 mt-1">
                    Vehicle: {primaryVehicle ? `${primaryVehicle.year} ${primaryVehicle.model}` : '—'}
                  </p>
                </div>
                <Link
                  href={`/app/track/${activeBooking.id}`}
                  className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/40 hover:text-white/70 transition-colors"
                >
                  Live Track
                </Link>
              </div>

              {/* 3-step progress */}
              <div className="pt-3 pb-1">
                <div className="relative flex items-start">
                  {/* track bg */}
                  <div className="absolute top-[4px] left-0 right-0 h-[2px] bg-white/[0.06]" />
                  {/* track fill */}
                  <div
                    className="absolute top-[4px] left-0 h-[2px] bg-[#E23232] transition-all duration-700"
                    style={{ width: `${Math.max(15, currentStage * 50)}%` }}
                  />
                  {stages.map((s, i) => {
                    const align = i === 0 ? 'items-start' : i === stages.length - 1 ? 'items-end' : 'items-center';
                    return (
                      <div key={s} className={`relative flex-1 flex flex-col ${align}`}>
                        <div className={`w-[10px] h-[10px] rounded-full border-[2px] z-10 ${i <= currentStage
                            ? 'border-[#E23232] bg-[#E23232]'
                            : 'border-white/10 bg-[#0a0a0a]'
                          }`} />
                        <span className={`text-[8px] md:text-[9px] font-mono uppercase tracking-[0.15em] mt-2 ${i <= currentStage ? 'text-white/50' : 'text-white/15'
                          }`}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-white/[0.06]" />
            </div>
          )}

          {/* SELECT SERVICE */}
          <div>
            <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em] text-white/25 mb-4 md:mb-5">
              Select Service
            </p>

            <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
              {services.map(({ plan, sku, label, desc, time, tag }) => (
                <Link key={plan} href={`/app/book?plan=${plan}`} className="block flex-shrink-0 w-[200px] md:w-auto snap-start">
                  <div
                    className={`h-full rounded-xl bg-[#0e0e0e] border border-white/[0.06] hover:border-white/[0.1] transition-colors flex flex-col justify-between relative overflow-hidden ${tag ? 'border-t-[2px] border-t-[#E23232]' : ''
                      }`}
                    style={{ minHeight: 220 }}
                  >
                    {/* red gradient glow on tagged card */}
                    {tag && (
                      <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-[#E23232]/[0.06] to-transparent pointer-events-none" />
                    )}

                    <div className="relative z-10 p-4 md:p-5 pb-0">
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <span className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] text-white/15">
                          {sku}
                        </span>
                        {tag && (
                          <span className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.15em] text-[#E23232] border border-[#E23232]/40 px-2 py-0.5 rounded-sm">
                            {tag}
                          </span>
                        )}
                      </div>
                      <h3 className="text-white text-[14px] md:text-[16px] font-semibold mb-1.5">{label}</h3>
                      <p className="text-white/25 text-[12px] md:text-[13px] leading-[1.55]">{desc}</p>
                    </div>

                    <div className="relative z-10 mx-4 md:mx-5 border-t border-white/[0.06]" />

                    <div className="relative z-10 p-4 md:p-5 pt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[8px] font-mono uppercase tracking-[0.18em] text-white/15 mb-0.5">
                          Est. Time
                        </p>
                        <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.1em] text-white/30">
                          {time}
                        </p>
                      </div>
                      <p className="text-white text-[20px] md:text-[22px] font-light tracking-[-0.01em]">
                        {centsToDisplay(PLAN_PRICES[plan])}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN ──────── */}
        <div className="space-y-5 md:space-y-6">

          {/* VEHICLE CARD */}
          {primaryVehicle ? (
            <div className="rounded-xl bg-[#0c0c0c] border border-white/[0.06] p-6 md:p-7 relative overflow-hidden">
              {/* top row: icon + status */}
              <div className="flex items-start justify-between mb-8">
                <div className="w-11 h-11 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
                  <Car className="w-[18px] h-[18px] text-white/40" />
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 mb-1">
                    Status
                  </p>
                  <span className="flex items-center gap-2 justify-end">
                    <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
                    <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-emerald-400 font-medium">
                      Ready
                    </span>
                  </span>
                </div>
              </div>

              {/* vehicle name + car svg */}
              <div className="flex items-end justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-white text-[22px] md:text-[26px] font-medium leading-tight tracking-[-0.01em]">
                    {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                  </h3>
                  <p className="text-white/30 text-[14px] mt-1.5 capitalize">
                    {primaryVehicle.type.replace('_', ' ')}
                    {primaryVehicle.color ? ` \u00B7 ${primaryVehicle.color}` : ''}
                  </p>
                </div>
                <div className="shrink-0 -mr-1 -mb-1 opacity-[0.12]">
                  <CarFront className="w-28 md:w-36 h-28 md:h-36 text-white" strokeWidth={1} />
                </div>
              </div>

              {/* VIN + manage */}
              <div className="flex items-end justify-between mt-8 pt-5 border-t border-white/[0.06]">
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 mb-1">
                    VIN
                  </p>
                  <p className="text-[12px] font-mono tracking-[0.05em] text-white/35">
                    {primaryVehicle.plate || 'WP0AB299...'}
                  </p>
                </div>
                <Link
                  href="/app/vehicles"
                  className="text-[12px] font-mono uppercase tracking-[0.18em] text-[#E23232] hover:text-[#ff4444] transition-colors font-medium"
                >
                  Manage
                </Link>
              </div>
            </div>
          ) : (
            <Link href="/app/onboarding" className="block">
              <div className="rounded-xl bg-[#0e0e0e] border border-dashed border-white/[0.08] p-6 text-center hover:border-[#E23232]/30 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-[#E23232]/8 flex items-center justify-center mx-auto mb-3">
                  <Car className="w-5 h-5 text-[#E23232]" />
                </div>
                <p className="text-white text-sm font-medium">Add your vehicle</p>
                <p className="text-white/25 text-xs mt-1">Required to book a wash</p>
              </div>
            </Link>
          )}

          {/* HISTORY + PLANS */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <Link href="/app/bookings" className="block">
              <div className="rounded-xl bg-[#0e0e0e] border border-white/[0.06] p-5 hover:border-white/[0.1] transition-colors min-h-[120px] md:min-h-[140px] flex flex-col justify-between">
                <Clock className="w-[22px] h-[22px] text-white/20" />
                <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.18em] text-white/35">
                  History
                </p>
              </div>
            </Link>
            <Link href="/app/membership" className="block">
              <div className="rounded-xl bg-[#0e0e0e] border border-white/[0.06] p-5 hover:border-white/[0.1] transition-colors min-h-[120px] md:min-h-[140px] flex flex-col justify-between">
                <CreditCard className="w-[22px] h-[22px] text-white/20" />
                <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.18em] text-white/35">
                  Plans
                </p>
              </div>
            </Link>
          </div>

          {/* DRIVEO PLUS */}
          <Link href="/app/membership" className="block">
            <div className="rounded-xl bg-[#E23232]/[0.04] border border-[#E23232]/[0.1] p-5 hover:border-[#E23232]/20 transition-colors">
              <span className="flex items-center gap-2 mb-3">
                <Sparkles className="w-[14px] h-[14px] text-[#E23232]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E23232]">
                  Driveo Plus
                </span>
              </span>
              <p className="text-white/50 text-[13px] leading-[1.6] mb-4">
                Unlimited exterior washes and priority booking for $79/mo.
              </p>
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/30 border-b border-white/15 pb-0.5">
                View Membership
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
