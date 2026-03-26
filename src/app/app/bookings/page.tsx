'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getVehicleImageUrl } from '@/lib/vehicle-image';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Calendar, Car, ChevronRight, Droplets, Sparkles, Clock,
  MapPin, CheckCircle2, XCircle, AlertCircle, Loader2, Zap,
} from 'lucide-react';
import type { Booking } from '@/types';

/* ─── Status config ─── */
const STATUS_CONFIG: Record<string, {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  icon: typeof CheckCircle2;
  isActive: boolean;
}> = {
  pending:   { label: 'Pending',   dotColor: 'bg-amber-500',  bgColor: 'bg-amber-500/10', textColor: 'text-amber-600 dark:text-amber-400', icon: Clock,         isActive: true },
  assigned:  { label: 'Assigned',  dotColor: 'bg-blue-500',   bgColor: 'bg-blue-500/10',  textColor: 'text-blue-600 dark:text-blue-400',   icon: Zap,           isActive: true },
  en_route:  { label: 'En Route',  dotColor: 'bg-blue-500',   bgColor: 'bg-blue-500/10',  textColor: 'text-blue-600 dark:text-blue-400',   icon: MapPin,        isActive: true },
  arrived:   { label: 'Arrived',   dotColor: 'bg-violet-500', bgColor: 'bg-violet-500/10', textColor: 'text-violet-600 dark:text-violet-400', icon: MapPin,      isActive: true },
  washing:   { label: 'Washing',   dotColor: 'bg-violet-500', bgColor: 'bg-violet-500/10', textColor: 'text-violet-600 dark:text-violet-400', icon: Droplets,    isActive: true },
  completed: { label: 'Completed', dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, isActive: false },
  paid:      { label: 'Paid',      dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2, isActive: false },
  cancelled: { label: 'Cancelled', dotColor: 'bg-red-500',    bgColor: 'bg-red-500/10',   textColor: 'text-red-600 dark:text-red-400',     icon: XCircle,       isActive: false },
  disputed:  { label: 'Disputed',  dotColor: 'bg-orange-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-600 dark:text-orange-400', icon: AlertCircle, isActive: false },
};

const PLAN_LABELS: Record<string, string> = {
  regular: 'Regular Wash',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Full Detailing',
};

const PLAN_ICONS: Record<string, typeof Droplets> = {
  regular: Droplets,
  interior_exterior: Sparkles,
  detailing: Car,
};

type FilterTab = 'all' | 'active' | 'past';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const supabase = createClient();

  useEffect(() => {
    async function fetchBookings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('bookings')
        .select('*, vehicles(make, model, year, type, color)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setBookings(data as Booking[]);
      setLoading(false);
    }
    fetchBookings();
  }, [supabase]);

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    const cfg = STATUS_CONFIG[b.status];
    return filter === 'active' ? cfg?.isActive : !cfg?.isActive;
  });

  const activeCount = bookings.filter(b => STATUS_CONFIG[b.status]?.isActive).length;

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Washes</h1>
            {bookings.length > 0 && (
              <span className="text-foreground/50 text-sm tabular-nums">{bookings.length} total</span>
            )}
          </div>
          {activeCount > 0 && (
            <p className="text-[#E23232] text-sm font-medium mt-1">{activeCount} active</p>
          )}
        </div>

        {/* Filter tabs */}
        {bookings.length > 0 && (
          <div className="flex gap-1.5 mb-5 p-1 rounded-xl bg-foreground/[0.04] border border-border/40 w-fit">
            {([['all', 'All'], ['active', 'Active'], ['past', 'History']] as [FilterTab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                  filter === key
                    ? 'bg-foreground/[0.08] dark:bg-foreground/[0.10] text-foreground shadow-sm'
                    : 'text-foreground/50 hover:text-foreground/70'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[88px] w-full bg-foreground/[0.04] rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-foreground/[0.05] border border-border/50 flex items-center justify-center mx-auto mb-5">
              <Calendar className="w-7 h-7 text-foreground/50" />
            </div>
            <p className="text-foreground/70 text-sm font-medium">No washes yet</p>
            <p className="text-foreground/60 text-xs mt-1.5">Your wash history will appear here</p>
            <Link href="/app/book">
              <button className="mt-6 px-6 py-2.5 rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white text-sm font-semibold transition-all active:scale-[0.98]">
                Book Your First Wash
              </button>
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-foreground/50 text-sm">No {filter === 'active' ? 'active' : 'past'} bookings</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((booking) => {
              const vehicle = (booking as any).vehicles;
              const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const PlanIcon = PLAN_ICONS[booking.wash_plan] || Droplets;
              const imgUrl = vehicle ? getVehicleImageUrl(vehicle.make, vehicle.model, vehicle.year, { angle: 'front-side', width: 300, color: vehicle.color || undefined }) : '';
              const isActive = cfg.isActive;
              const date = new Date(booking.created_at);

              return (
                <Link key={booking.id} href={`/app/track/${booking.id}`} className="block group">
                  <div className={cn(
                    'relative rounded-2xl border transition-all duration-200 overflow-hidden',
                    isActive
                      ? 'border-[#E23232]/20 bg-gradient-to-r from-[#E23232]/[0.03] to-transparent hover:border-[#E23232]/35 hover:shadow-[0_2px_16px_rgba(226,50,50,0.06)]'
                      : 'border-border/50 bg-foreground/[0.015] hover:border-border hover:bg-foreground/[0.025]'
                  )}>
                    {/* Active top accent */}
                    {isActive && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E23232]/40 via-[#E23232]/20 to-transparent" />}

                    <div className="flex items-center gap-4 p-4">
                      {/* Car thumbnail */}
                      <div className={cn(
                        'w-[72px] h-[52px] rounded-xl overflow-hidden shrink-0 relative',
                        isActive ? 'bg-[#E23232]/[0.06]' : 'bg-foreground/[0.04]'
                      )}>
                        {vehicle && (
                          <img
                            src={imgUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain p-0.5"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Car className="w-5 h-5 text-foreground/[0.06]" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-foreground font-semibold text-sm truncate">
                            {PLAN_LABELS[booking.wash_plan] || booking.wash_plan}
                          </span>
                          <span className="text-foreground/50 text-xs shrink-0">·</span>
                          <span className="text-foreground/50 text-xs shrink-0">Lvl {booking.dirt_level}</span>
                        </div>

                        {vehicle && (
                          <p className="text-foreground/50 text-xs truncate">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-1.5">
                          {/* Status pill */}
                          <div className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md', cfg.bgColor)}>
                            {isActive && (
                              <span className="relative flex h-1.5 w-1.5">
                                <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', cfg.dotColor)} />
                                <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', cfg.dotColor)} />
                              </span>
                            )}
                            {!isActive && <StatusIcon className={cn('w-3 h-3', cfg.textColor)} />}
                            <span className={cn('text-[10px] font-semibold uppercase tracking-wider', cfg.textColor)}>
                              {cfg.label}
                            </span>
                          </div>

                          <span className="text-foreground/55 text-[11px]">
                            {date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Price + arrow */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-foreground font-bold text-base tabular-nums">
                          ${(booking.total_price / 100).toFixed(2)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-foreground/50 group-hover:text-foreground/50 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
