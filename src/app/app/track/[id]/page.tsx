'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay, formatDuration } from '@/lib/pricing';
import {
  Car, MapPin, Phone, MessageCircle, Clock, CheckCircle2, Circle,
  Loader2, Star, Shield, ChevronDown, ChevronUp, Navigation,
  Droplets, Camera, CreditCard, ArrowLeft, Sparkles, User,
} from 'lucide-react';
import type { Booking, Profile, WasherProfile, Vehicle } from '@/types';
import { cn } from '@/lib/utils';
import LiveTrackingMap from '@/components/LiveTrackingMap';

interface BookingWithRelations extends Booking {
  vehicles: Vehicle;
}

type StatusKey = 'pending' | 'assigned' | 'en_route' | 'arrived' | 'washing' | 'completed' | 'paid';

const STATUS_ORDER: StatusKey[] = ['pending', 'assigned', 'en_route', 'arrived', 'washing', 'completed', 'paid'];

const STATUS_CONFIG: Record<StatusKey, {
  label: string;
  description: string;
  icon: typeof Loader2;
  color: string;
  bgColor: string;
}> = {
  pending: {
    label: 'Finding a washer',
    description: 'We\'re searching for the best available washer near you.',
    icon: Loader2,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  assigned: {
    label: 'Washer assigned',
    description: 'Your washer has accepted the job and is getting ready.',
    icon: User,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  en_route: {
    label: 'On the way',
    description: 'Your washer is driving to your location.',
    icon: Navigation,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  arrived: {
    label: 'Washer arrived',
    description: 'Your washer has arrived at the location.',
    icon: MapPin,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  washing: {
    label: 'Wash in progress',
    description: 'Your car is being washed right now.',
    icon: Droplets,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
  },
  completed: {
    label: 'Wash complete',
    description: 'Your wash is done! Review the before/after photos.',
    icon: Camera,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
  paid: {
    label: 'Payment processed',
    description: 'Payment has been captured. Thank you!',
    icon: CreditCard,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
};

export default function TrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [washer, setWasher] = useState<(Profile & { washer_profiles: WasherProfile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [washerLat, setWasherLat] = useState<number | null>(null);
  const [washerLng, setWasherLng] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  // Load booking + washer data
  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .eq('id', id)
        .single();

      if (data) {
        setBooking(data);
        if (data.washer_id) {
          const { data: washerData } = await supabase
            .from('profiles')
            .select('*, washer_profiles(*)')
            .eq('id', data.washer_id)
            .single();
          if (washerData) {
            setWasher(washerData);
            setWasherLat(washerData.washer_profiles?.current_lat ?? null);
            setWasherLng(washerData.washer_profiles?.current_lng ?? null);
          }
        }
      }
      setLoading(false);
    }
    load();

    // Real-time booking updates
    const supabase = createClient();
    const bookingChannel = supabase
      .channel(`booking:${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${id}`,
      }, async (payload) => {
        const updated = payload.new as BookingWithRelations;
        setBooking((prev) => prev ? { ...prev, ...updated } : null);

        // If washer just got assigned, fetch washer info
        if (updated.washer_id && !washer) {
          const { data: washerData } = await supabase
            .from('profiles')
            .select('*, washer_profiles(*)')
            .eq('id', updated.washer_id)
            .single();
          if (washerData) {
            setWasher(washerData);
            setWasherLat(washerData.washer_profiles?.current_lat ?? null);
            setWasherLng(washerData.washer_profiles?.current_lng ?? null);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(bookingChannel); };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time washer location
  useEffect(() => {
    if (!booking?.washer_id) return;

    const supabase = createClient();
    const washerChannel = supabase
      .channel(`washer-location:${booking.washer_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'washer_profiles',
        filter: `id=eq.${booking.washer_id}`,
      }, (payload) => {
        const updated = payload.new as WasherProfile;
        setWasherLat(updated.current_lat);
        setWasherLng(updated.current_lng);
      })
      .subscribe();

    return () => { supabase.removeChannel(washerChannel); };
  }, [booking?.washer_id]);

  if (loading) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <Skeleton className="h-56 w-full bg-white/5 rounded-2xl" />
        <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="px-4 pt-20 text-center">
        <p className="text-white/40">Booking not found</p>
      </div>
    );
  }

  const status = booking.status as StatusKey;
  const currentStatusIdx = STATUS_ORDER.indexOf(status);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const vehicle = booking.vehicles;
  const showMap = ['assigned', 'en_route', 'arrived', 'washing'].includes(status);

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-30 bg-[#050505] border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/app/bookings')}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">
            {PLAN_LABELS[booking.wash_plan]}
          </p>
          <p className="text-white/30 text-[10px]">#{booking.id.slice(0, 8)}</p>
        </div>
        <Badge
          className={cn(
            'text-[10px] font-medium',
            status === 'pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
            ['en_route', 'assigned'].includes(status) ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
            status === 'washing' ? 'bg-purple-500/15 text-purple-400 border-purple-500/25' :
            ['completed', 'paid'].includes(status) ? 'bg-green-500/15 text-green-400 border-green-500/25' :
            'bg-white/10 text-white/60 border-white/20'
          )}
        >
          {status === 'pending' && <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />}
          {config.label}
        </Badge>
      </div>

      {/* ── Current status hero ── */}
      <div className="px-4 pt-5 pb-4">
        <div className={cn('flex items-center gap-3 p-4 rounded-2xl border', config.bgColor, 'border-white/[0.06]')}>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bgColor)}>
            <StatusIcon className={cn('w-5 h-5', config.color, status === 'pending' && 'animate-spin')} />
          </div>
          <div className="flex-1">
            <p className={cn('text-sm font-semibold', config.color)}>{config.label}</p>
            <p className="text-white/40 text-xs mt-0.5">{config.description}</p>
          </div>
        </div>
      </div>

      {/* ── Live Map (Zomato-style — shows during active states) ── */}
      {showMap && (
        <div className="px-4 pb-4">
          <div className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ height: 280 }}>
            <LiveTrackingMap
              serviceLat={booking.service_lat}
              serviceLng={booking.service_lng}
              washerLat={washerLat}
              washerLng={washerLng}
              washerName={washer?.full_name || 'Washer'}
              status={booking.status}
            />
          </div>
        </div>
      )}

      {/* ── Washer Card (shown after assignment) ── */}
      {washer && (
        <div className="px-4 pb-4">
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-[#E23232]/10 flex items-center justify-center border-2 border-[#E23232]/30">
                  {washer.avatar_url ? (
                    <img src={washer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[#E23232] font-display text-xl">{washer.full_name.charAt(0)}</span>
                  )}
                </div>
                {/* Online indicator */}
                {washer.washer_profiles?.is_online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#111]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base">{washer.full_name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-white/70 text-xs font-medium">
                      {washer.washer_profiles?.rating_avg?.toFixed(1) || '—'}
                    </span>
                  </div>
                  <span className="text-white/20">·</span>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-white/30" />
                    <span className="text-white/50 text-xs">{washer.washer_profiles?.jobs_completed || 0} washes</span>
                  </div>
                  {washer.washer_profiles?.background_check_done && (
                    <>
                      <span className="text-white/20">·</span>
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span className="text-green-400/70 text-xs">Verified</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contact actions */}
            <div className="flex gap-2 mt-4">
              {washer.phone && (
                <a
                  href={`tel:${washer.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-colors"
                >
                  <Phone className="w-4 h-4 text-green-400" />
                  <span className="text-white/70 text-sm font-medium">Call</span>
                </a>
              )}
              <a
                href={washer.phone ? `sms:${washer.phone}` : '#'}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="text-white/70 text-sm font-medium">Message</span>
              </a>
            </div>

            {/* Washer vehicle info */}
            {washer.washer_profiles?.vehicle_make && (
              <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-white/25" />
                <span className="text-white/35 text-xs">
                  {washer.washer_profiles.vehicle_make} {washer.washer_profiles.vehicle_model}
                  {washer.washer_profiles.vehicle_year ? ` · ${washer.washer_profiles.vehicle_year}` : ''}
                  {washer.washer_profiles.vehicle_plate ? ` · ${washer.washer_profiles.vehicle_plate}` : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Progress Timeline (collapsible) ── */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full flex items-center justify-between py-3 text-white/40 hover:text-white/60 transition-colors"
        >
          <span className="text-xs font-medium uppercase tracking-wider">Progress Timeline</span>
          {showTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTimeline && (
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-4">
            {STATUS_ORDER.map((s, i) => {
              const isPast = i < currentStatusIdx;
              const isCurrent = i === currentStatusIdx;
              const stepConfig = STATUS_CONFIG[s];
              const StepIcon = stepConfig.icon;
              const timestamp =
                s === 'pending' ? booking.created_at :
                s === 'assigned' ? booking.washer_assigned_at :
                s === 'en_route' ? booking.washer_en_route_at :
                s === 'arrived' ? booking.washer_arrived_at :
                s === 'washing' ? booking.wash_started_at :
                s === 'completed' ? booking.wash_completed_at :
                s === 'paid' ? booking.payment_captured_at :
                null;

              return (
                <div key={s} className="flex items-start gap-3">
                  {/* Line + icon column */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      isPast ? 'bg-green-500/15' :
                      isCurrent ? stepConfig.bgColor :
                      'bg-white/[0.03]'
                    )}>
                      {isPast ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : isCurrent ? (
                        <StepIcon className={cn('w-4 h-4', stepConfig.color, s === 'pending' && 'animate-spin')} />
                      ) : (
                        <Circle className="w-4 h-4 text-white/10" />
                      )}
                    </div>
                    {i < STATUS_ORDER.length - 1 && (
                      <div className={cn(
                        'w-0.5 h-8',
                        isPast ? 'bg-green-500/20' : 'bg-white/[0.05]'
                      )} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex items-start justify-between pt-1.5 pb-4">
                    <div>
                      <span className={cn(
                        'text-sm',
                        isPast ? 'text-white/50' :
                        isCurrent ? 'text-white font-medium' :
                        'text-white/15'
                      )}>
                        {stepConfig.label}
                      </span>
                      {isCurrent && (
                        <p className="text-white/30 text-[11px] mt-0.5">{stepConfig.description}</p>
                      )}
                    </div>
                    {(isPast || isCurrent) && timestamp && (
                      <span className="text-white/20 text-[10px] pt-0.5">
                        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Before/After Photos (shown after wash complete) ── */}
      {['completed', 'paid'].includes(status) && (
        <div className="px-4 pb-4">
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-white/30" />
              <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Before & After</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-[4/3] rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center gap-2">
                <Camera className="w-5 h-5 text-white/15" />
                <span className="text-white/20 text-xs">Before</span>
              </div>
              <div className="aspect-[4/3] rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-white/15" />
                <span className="text-white/20 text-xs">After</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking details (collapsible) ── */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-3 text-white/40 hover:text-white/60 transition-colors"
        >
          <span className="text-xs font-medium uppercase tracking-wider">Booking Details</span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Car className="w-4 h-4 text-white/25" />
              <span className="text-white/70">{vehicle.year} {vehicle.make} {vehicle.model}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-white/25" />
              <span className="text-white/70">{booking.service_address}</span>
            </div>
            {booking.location_notes && (
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-white/25 mt-0.5" />
                <span className="text-white/50 text-xs">{booking.location_notes}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-white/25" />
              <span className="text-white/70">Est. {formatDuration(booking.estimated_duration_min || 0)}</span>
            </div>

            {/* Price breakdown */}
            <div className="border-t border-white/[0.06] pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-white/40">{PLAN_LABELS[booking.wash_plan]}</span>
                <span className="text-white/70">{centsToDisplay(booking.base_price)}</span>
              </div>
              {booking.vehicle_multiplier !== 1 && (
                <div className="flex justify-between">
                  <span className="text-white/40">Vehicle ({booking.vehicle_multiplier}x)</span>
                  <span className="text-white/50">+{centsToDisplay(Math.round(booking.base_price * (booking.vehicle_multiplier - 1)))}</span>
                </div>
              )}
              {booking.dirt_multiplier !== 1 && (
                <div className="flex justify-between">
                  <span className="text-white/40">Dirt level {booking.dirt_level} ({booking.dirt_multiplier}x)</span>
                  <span className="text-amber-400/70">+{centsToDisplay(Math.round(booking.base_price * booking.vehicle_multiplier * (booking.dirt_multiplier - 1)))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">HST (13%)</span>
                <span className="text-white/50">{centsToDisplay(booking.hst_amount)}</span>
              </div>
              <div className="border-t border-white/[0.06] pt-2 flex justify-between font-semibold">
                <span className="text-white">Total</span>
                <span className="text-[#E23232] text-lg">{centsToDisplay(booking.total_price)}</span>
              </div>
              <p className="text-white/20 text-[10px] flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                {status === 'paid' ? 'Payment captured' : 'Pre-authorized. Charged after wash is complete.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Rate your wash (shown after completion) ── */}
      {['completed', 'paid'].includes(status) && (
        <div className="px-4 pb-4">
          <Button
            onClick={() => router.push(`/app/review/${booking.id}`)}
            className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold py-3 rounded-xl"
          >
            <Star className="w-4 h-4 mr-2" />
            Rate your wash
          </Button>
        </div>
      )}

      {/* ── Cancel button (only when pending) ── */}
      {status === 'pending' && (
        <div className="px-4">
          <Button
            variant="outline"
            className="w-full border-white/[0.08] text-white/40 hover:text-red-400 hover:border-red-500/20 rounded-xl"
          >
            Cancel booking
          </Button>
        </div>
      )}
    </div>
  );
}
