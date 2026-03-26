'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLAN_LABELS, centsToDisplay, formatDuration } from '@/lib/pricing';
import {
  Car, MapPin, MessageCircle, Clock, CheckCircle2, Circle,
  Loader2, Star, Shield, ChevronDown, ChevronUp, Navigation,
  Droplets, Camera, CreditCard, ArrowLeft, Sparkles, User,
} from 'lucide-react';
import type { Booking, Profile, WasherProfile, Vehicle } from '@/types';
import { cn } from '@/lib/utils';
import { BookingChat } from '@/components/BookingChat';

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
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  assigned: {
    label: 'Washer assigned',
    description: 'Your washer has accepted the job and is getting ready.',
    icon: User,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  en_route: {
    label: 'On the way',
    description: 'Your washer is driving to your location.',
    icon: Navigation,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  arrived: {
    label: 'Washer arrived',
    description: 'Your washer has arrived at the location.',
    icon: MapPin,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
  },
  washing: {
    label: 'Wash in progress',
    description: 'Your car is being washed right now.',
    icon: Droplets,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  completed: {
    label: 'Wash complete',
    description: 'Your wash is done! Review the before/after photos.',
    icon: Camera,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
  },
  paid: {
    label: 'Payment processed',
    description: 'Payment has been captured. Thank you!',
    icon: CreditCard,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
  },
};

/* ═══════════════════════════════════════════════════════════════
   Map styles (matching booking page)
   ═══════════════════════════════════════════════════════════════ */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1a0f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#111111' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#222222' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#111111' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050510' }] },
];

const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
];

function buildMarkerSvg(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
    <path d="M20 0C9 0 0 9 0 20c0 15 20 32 20 32s20-17 20-32C40 9 31 0 20 0z" fill="${color}"/>
    <circle cx="20" cy="20" r="8" fill="white" opacity="0.9"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function buildWasherMarkerSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
    <path d="M22 0C10 0 0 10 0 22c0 16.5 22 34 22 34s22-17.5 22-34C44 10 34 0 22 0z" fill="#E23232"/>
    <circle cx="22" cy="22" r="9" fill="#050505"/>
    <circle cx="22" cy="22" r="5" fill="white" opacity="0.9"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

/* ═══════════════════════════════════════════════════════════════
   Smooth marker animation
   ═══════════════════════════════════════════════════════════════ */
function animateMarkerTo(
  marker: google.maps.Marker,
  targetLat: number,
  targetLng: number,
  durationMs = 1000,
) {
  const start = marker.getPosition();
  if (!start) { marker.setPosition({ lat: targetLat, lng: targetLng }); return; }
  const startLat = start.lat();
  const startLng = start.lng();
  const deltaLat = targetLat - startLat;
  const deltaLng = targetLng - startLng;
  if (Math.abs(deltaLat) < 1e-7 && Math.abs(deltaLng) < 1e-7) return;
  const startTime = performance.now();
  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / durationMs, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    marker.setPosition({ lat: startLat + deltaLat * ease, lng: startLng + deltaLng * ease });
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════════
   Full-screen tracking map
   ═══════════════════════════════════════════════════════════════ */
function TrackingFullMap({
  serviceLat, serviceLng, washerLat, washerLng, washerName, status, className,
}: {
  serviceLat: number;
  serviceLng: number;
  washerLat: number | null;
  washerLng: number | null;
  washerName: string;
  status: string;
  className?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const serviceMarkerRef = useRef<google.maps.Marker | null>(null);
  const washerMarkerRef = useRef<google.maps.Marker | null>(null);
  const routeLineRef = useRef<google.maps.Polyline | null>(null);
  const directionsRef = useRef<google.maps.DirectionsService | null>(null);
  const [ready, setReady] = useState(false);
  const [eta, setEta] = useState<string | null>(null);

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
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: serviceLat, lng: serviceLng },
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
      backgroundColor: isDark ? '#050505' : '#f5f5f5',
      zoomControlOptions: { position: 6 },
    });

    directionsRef.current = new google.maps.DirectionsService();

    serviceMarkerRef.current = new google.maps.Marker({
      position: { lat: serviceLat, lng: serviceLng },
      map: mapInstance.current,
      icon: {
        url: buildMarkerSvg('#ffffff'),
        scaledSize: new google.maps.Size(36, 46),
        anchor: new google.maps.Point(18, 46),
      },
      title: 'Service Location',
    });

    routeLineRef.current = new google.maps.Polyline({
      map: mapInstance.current,
      strokeColor: '#E23232',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      geodesic: true,
    });

    // React to light/dark mode changes
    const observer = new MutationObserver(() => {
      const nowDark = document.documentElement.classList.contains('dark');
      mapInstance.current?.setOptions({
        styles: nowDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
        backgroundColor: nowDark ? '#050505' : '#f5f5f5',
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [ready, serviceLat, serviceLng]);

  const updateRoute = useCallback((wLat: number, wLng: number) => {
    const map = mapInstance.current;
    const directions = directionsRef.current;
    if (!map || !directions) return;
    directions.route({
      origin: { lat: wLat, lng: wLng },
      destination: { lat: serviceLat, lng: serviceLng },
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, routeStatus) => {
      if (routeStatus === google.maps.DirectionsStatus.OK && result) {
        const leg = result.routes[0]?.legs[0];
        if (leg?.steps) {
          const path: google.maps.LatLng[] = [];
          leg.steps.forEach((step) => step.path.forEach((p) => path.push(p)));
          routeLineRef.current?.setPath(path);
        }
        if (leg?.duration?.text) setEta(leg.duration.text);
      }
    });
  }, [serviceLat, serviceLng]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || washerLat == null || washerLng == null) return;

    if (!washerMarkerRef.current) {
      washerMarkerRef.current = new google.maps.Marker({
        position: { lat: washerLat, lng: washerLng },
        map,
        icon: {
          url: buildWasherMarkerSvg(),
          scaledSize: new google.maps.Size(40, 52),
          anchor: new google.maps.Point(20, 52),
        },
        title: washerName,
        zIndex: 10,
      });
    } else {
      animateMarkerTo(washerMarkerRef.current, washerLat, washerLng);
    }

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: serviceLat, lng: serviceLng });
    bounds.extend({ lat: washerLat, lng: washerLng });
    map.fitBounds(bounds, { top: 80, bottom: 80, left: 880, right: 40 });

    updateRoute(washerLat, washerLng);
  }, [washerLat, washerLng, washerName, serviceLat, serviceLng, updateRoute]);

  if (!ready) {
    return (
      <div className={cn('relative', className)}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 60% 40%, #1a0a0a 0%, #050505 60%, #020202 100%)',
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-12 rounded-full border border-[#E23232]/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute -inset-8 rounded-full border border-[#E23232]/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E23232]/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#E23232]" />
              </div>
              <span className="text-sm text-foreground/55 font-medium tracking-wide">Loading map...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div ref={mapRef} className="absolute inset-0" />

      {/* ETA overlay (en_route) */}
      {status === 'en_route' && washerLat != null && washerLng != null && (
        <div className="absolute top-4 left-1/2 lg:left-auto lg:right-8 lg:translate-x-0 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(5, 5, 5, 0.85)', border: '1px solid rgba(226, 50, 50, 0.3)' }}>
            <Navigation className="w-4 h-4 text-[#E23232] animate-pulse" />
            <span className="text-foreground text-sm font-medium tracking-wide">
              {washerName} is <span className="text-[#E23232] font-bold">{eta ?? '...'}</span> away
            </span>
          </div>
        </div>
      )}

      {/* Status badge on map (desktop, non en_route) */}
      {status !== 'en_route' && status && (
        <div className="hidden lg:block absolute top-4 right-8 z-10">
          <div className="px-4 py-2 rounded-full backdrop-blur-md text-foreground/70 text-xs font-medium uppercase tracking-widest"
            style={{ background: 'rgba(5, 5, 5, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {status === 'pending' && <Loader2 className="w-3 h-3 inline mr-2 animate-spin" />}
            {status.replace(/_/g, ' ')}
          </div>
        </div>
      )}

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0"
        style={{ boxShadow: 'inset 0 0 80px 30px rgba(5, 5, 5, 0.3)' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
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
  const [cancelling, setCancelling] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Ref to track current washer so realtime callback isn't stale
  const washerRef = useRef(washer);
  washerRef.current = washer;

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // Fetch booking + washer helper (reused by initial load & polling)
  const fetchBooking = useCallback(async () => {
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
    return data;
  }, [id]);

  // Initial load + realtime subscription + polling fallback
  useEffect(() => {
    fetchBooking().then(() => setLoading(false));

    const supabase = createClient();

    // Realtime subscription (fires instantly if Realtime is enabled on the table)
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

        // Fetch washer if just assigned (use ref to avoid stale closure)
        if (updated.washer_id && !washerRef.current) {
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

    // Polling fallback — refetch every 5s so status always stays current
    // even if Supabase Realtime isn't enabled or RLS blocks it
    const pollInterval = setInterval(() => {
      fetchBooking();
    }, 5000);

    return () => {
      supabase.removeChannel(bookingChannel);
      clearInterval(pollInterval);
    };
  }, [id, fetchBooking]);

  // Realtime washer location
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
      <div className="flex items-center justify-center h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#E23232] animate-spin" />
          <span className="text-foreground/55 text-sm">Loading tracking...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
        <p className="text-foreground/55">Booking not found</p>
      </div>
    );
  }

  const status = booking.status as StatusKey;
  const currentStatusIdx = STATUS_ORDER.indexOf(status);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const vehicle = booking.vehicles;

  /* ─── Timeline renderer (shared) ─── */
  const renderTimeline = () => (
    <div className="space-y-0">
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
          <div key={s} className="flex items-start gap-2.5">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                isPast ? 'bg-green-500/15' :
                isCurrent ? stepConfig.bgColor :
                'bg-foreground/[0.04]'
              )}>
                {isPast ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
                ) : isCurrent ? (
                  <StepIcon className={cn('w-3.5 h-3.5', stepConfig.color, s === 'pending' && 'animate-spin')} />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-foreground/15" />
                )}
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div className={cn('w-0.5 h-6', isPast ? 'bg-green-500/20' : 'bg-foreground/[0.05]')} />
              )}
            </div>
            <div className="flex-1 flex items-start justify-between pt-1 pb-3">
              <div>
                <span className={cn(
                  'text-[13px]',
                  isPast ? 'text-foreground/55' :
                  isCurrent ? 'text-foreground font-medium' :
                  'text-foreground/50'
                )}>
                  {stepConfig.label}
                </span>
                {isCurrent && (
                  <p className="text-foreground/55 text-[10px] mt-0.5">{stepConfig.description}</p>
                )}
              </div>
              {(isPast || isCurrent) && timestamp && (
                <span className="text-foreground/50 text-[10px] pt-0.5 tabular-nums">
                  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ─── Booking details renderer (shared) ─── */
  const renderBookingDetails = () => (
    <div className="space-y-3 text-[13px]">
      <div className="flex items-center gap-2.5">
        <Car className="w-3.5 h-3.5 text-foreground/55 shrink-0" />
        <span className="text-foreground/60">{vehicle.year} {vehicle.make} {vehicle.model}</span>
      </div>
      <div className="flex items-start gap-2.5">
        <MapPin className="w-3.5 h-3.5 text-foreground/55 shrink-0 mt-0.5" />
        <span className="text-foreground/60 leading-snug">{booking.service_address}</span>
      </div>
      {booking.location_notes && (
        <div className="flex items-start gap-2.5">
          <MessageCircle className="w-3.5 h-3.5 text-foreground/55 mt-0.5 shrink-0" />
          <span className="text-foreground/55 text-xs">{booking.location_notes}</span>
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <Clock className="w-3.5 h-3.5 text-foreground/55 shrink-0" />
        <span className="text-foreground/60">Est. {formatDuration(booking.estimated_duration_min || 0)}</span>
      </div>

      {/* Price breakdown */}
      <div className="border-t border-border pt-3 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-foreground/55">{PLAN_LABELS[booking.wash_plan]}</span>
          <span className="text-foreground/60">{centsToDisplay(booking.base_price)}</span>
        </div>
        {booking.vehicle_multiplier !== 1 && (
          <div className="flex justify-between text-xs">
            <span className="text-foreground/50">Vehicle ({booking.vehicle_multiplier}x)</span>
            <span className="text-foreground/55">+{centsToDisplay(Math.round(booking.base_price * (booking.vehicle_multiplier - 1)))}</span>
          </div>
        )}
        {booking.dirt_multiplier !== 1 && (
          <div className="flex justify-between text-xs">
            <span className="text-foreground/50">Dirt level {booking.dirt_level} ({booking.dirt_multiplier}x)</span>
            <span className="text-amber-600 dark:text-amber-400/70">+{centsToDisplay(Math.round(booking.base_price * booking.vehicle_multiplier * (booking.dirt_multiplier - 1)))}</span>
          </div>
        )}
        <div className="flex justify-between text-xs">
          <span className="text-foreground/50">HST (13%)</span>
          <span className="text-foreground/55">{centsToDisplay(booking.hst_amount)}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between items-baseline">
          <span className="text-foreground font-semibold text-sm">Total</span>
          <span className="text-[#E23232] text-lg font-semibold tabular-nums">{centsToDisplay(booking.total_price)}</span>
        </div>
        <p className="text-foreground/50 text-[10px] flex items-center gap-1">
          <CreditCard className="w-3 h-3" />
          {status === 'paid' ? 'Payment captured' : 'Pre-authorized. Charged after wash.'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] overflow-hidden">

      {/* ═══════ FULL-SCREEN MAP ═══════ */}
      <div className="absolute inset-0 z-0">
        <TrackingFullMap
          serviceLat={booking.service_lat}
          serviceLng={booking.service_lng}
          washerLat={washerLat}
          washerLng={washerLng}
          washerName={washer?.full_name || 'Washer'}
          status={status}
          className="w-full h-full"
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP: Two-column panel (lg+)
          Left col = passive (booking details + price)
          Right col = active (status, washer, timeline)
          No collapse — everything always visible
         ═══════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex absolute z-10 top-0 left-0 bottom-0 w-[840px]">
        {/* Panel background */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl border-r border-border" />

        <div className="relative z-10 flex w-full h-full">

          {/* ── LEFT COL: Passive — Booking details ── */}
          <div className="w-[300px] flex flex-col h-full border-r border-border shrink-0">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/app/bookings')}
                  className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.10] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground/60" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-[15px]">
                    {PLAN_LABELS[booking.wash_plan]}
                  </p>
                  <p className="text-foreground/55 text-[10px] font-mono">#{booking.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>

            {/* Booking details — always visible */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/55 mb-4">Booking Details</p>
              {renderBookingDetails()}
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-border shrink-0 space-y-2">
              {['completed', 'paid'].includes(status) && (
                <Button
                  onClick={() => router.push(`/app/review/${booking.id}`)}
                  className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold py-3 rounded-xl"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Rate your wash
                </Button>
              )}
              {status === 'pending' && (
                <Button
                  variant="outline"
                  disabled={cancelling}
                  onClick={async () => {
                    setCancelling(true);
                    const supabase = createClient();
                    const { error } = await supabase
                      .from('bookings')
                      .update({ status: 'cancelled' })
                      .eq('id', id);
                    if (error) {
                      const { toast } = await import('sonner');
                      toast.error('Failed to cancel booking');
                      setCancelling(false);
                    } else {
                      router.push('/app/bookings');
                    }
                  }}
                  className="w-full border-foreground/30 text-foreground/70 hover:text-red-400 hover:border-red-500/20 rounded-xl"
                >
                  {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {cancelling ? 'Cancelling...' : 'Cancel booking'}
                </Button>
              )}
            </div>
          </div>

          {/* ── RIGHT COL: Active — Status, washer, timeline ── */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Header with badge */}
            <div className="px-6 pt-5 pb-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground font-semibold text-xl leading-tight">Live Tracking</h2>
                <Badge
                  className={cn(
                    'text-[10px] font-medium',
                    status === 'pending' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' :
                    ['en_route', 'assigned'].includes(status) ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25' :
                    status === 'washing' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25' :
                    ['completed', 'paid'].includes(status) ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/25' :
                    'bg-foreground/10 text-foreground/60 border-border'
                  )}
                >
                  {status === 'pending' && <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />}
                  {config.label}
                </Badge>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Status hero */}
              <div className={cn('flex items-center gap-3 p-4 rounded-xl border', config.bgColor, 'border-border')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bgColor)}>
                  <StatusIcon className={cn('w-5 h-5', config.color, status === 'pending' && 'animate-spin')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[15px] font-semibold', config.color)}>{config.label}</p>
                  <p className="text-foreground/50 text-xs mt-0.5 leading-snug">{config.description}</p>
                </div>
              </div>

              {/* Washer Card */}
              {washer && (
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[#E23232]/10 flex items-center justify-center border-2 border-[#E23232]/30">
                        {washer.avatar_url ? (
                          <img src={washer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[#E23232] font-display text-xl">{washer.full_name.charAt(0)}</span>
                        )}
                      </div>
                      {washer.washer_profiles?.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-semibold text-base">{washer.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-amber-500" />
                          <span className="text-foreground/60 text-xs font-medium">
                            {washer.washer_profiles?.rating_avg?.toFixed(1) || '—'}
                          </span>
                        </div>
                        <span className="text-foreground/20">·</span>
                        <span className="text-foreground/55 text-xs">{washer.washer_profiles?.jobs_completed || 0} washes</span>
                        {washer.washer_profiles?.background_check_done && (
                          <>
                            <span className="text-foreground/20">·</span>
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                              <span className="text-green-600/70 dark:text-green-400/70 text-xs">Verified</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setChatOpen(true)}
                      className="w-10 h-10 rounded-xl bg-[#E23232]/10 border border-[#E23232]/20 flex items-center justify-center hover:bg-[#E23232]/15 transition-colors shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 text-[#E23232]" />
                    </button>
                  </div>

                  {washer.washer_profiles?.vehicle_make && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                      <Car className="w-3 h-3 text-foreground/55" />
                      <span className="text-foreground/55 text-[11px]">
                        {washer.washer_profiles.vehicle_make} {washer.washer_profiles.vehicle_model}
                        {washer.washer_profiles.vehicle_year ? ` · ${washer.washer_profiles.vehicle_year}` : ''}
                        {washer.washer_profiles.vehicle_plate ? ` · ${washer.washer_profiles.vehicle_plate}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Before/After Photos */}
              {['completed', 'paid'].includes(status) && (
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="w-4 h-4 text-foreground/55" />
                    <span className="text-foreground/50 text-[10px] font-medium uppercase tracking-wider">Before & After</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-[4/3] rounded-lg bg-foreground/[0.04] border border-border flex flex-col items-center justify-center gap-1.5">
                      <Camera className="w-5 h-5 text-foreground/50" />
                      <span className="text-foreground/50 text-xs">Before</span>
                    </div>
                    <div className="aspect-[4/3] rounded-lg bg-foreground/[0.04] border border-border flex flex-col items-center justify-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-foreground/50" />
                      <span className="text-foreground/50 text-xs">After</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Timeline — always visible, no collapse */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/55 mb-3">Progress Timeline</p>
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-4">
                  {renderTimeline()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE: Bottom sheet (below lg)
          Collapsible sections since space is limited
         ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden absolute inset-x-0 bottom-0 z-10">
        <div className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="bg-background border-t border-border rounded-t-2xl max-h-[72dvh] flex flex-col">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-foreground/15" />
          </div>

          {/* Mobile header */}
          <div className="px-5 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/app/bookings')}
                className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-foreground/60" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-base">
                  {PLAN_LABELS[booking.wash_plan]}
                </p>
                <p className="text-foreground/55 text-[10px] font-mono">#{booking.id.slice(0, 8)}</p>
              </div>
              <Badge
                className={cn(
                  'text-[10px] font-medium shrink-0',
                  status === 'pending' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25' :
                  ['en_route', 'assigned'].includes(status) ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25' :
                  status === 'washing' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25' :
                  ['completed', 'paid'].includes(status) ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/25' :
                  'bg-foreground/10 text-foreground/60 border-border'
                )}
              >
                {status === 'pending' && <Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />}
                {config.label}
              </Badge>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-2">
            {/* Status hero */}
            <div className="px-5 pt-2 pb-3">
              <div className={cn('flex items-center gap-3 p-3.5 rounded-xl border', config.bgColor, 'border-border')}>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', config.bgColor)}>
                  <StatusIcon className={cn('w-4.5 h-4.5', config.color, status === 'pending' && 'animate-spin')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', config.color)}>{config.label}</p>
                  <p className="text-foreground/50 text-[11px] mt-0.5 leading-snug">{config.description}</p>
                </div>
              </div>
            </div>

            {/* Washer Card (mobile) */}
            {washer && (
              <div className="px-5 pb-3">
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-[#E23232]/10 flex items-center justify-center border-2 border-[#E23232]/30">
                        {washer.avatar_url ? (
                          <img src={washer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-[#E23232] font-display text-lg">{washer.full_name.charAt(0)}</span>
                        )}
                      </div>
                      {washer.washer_profiles?.is_online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-semibold text-[15px]">{washer.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 dark:text-amber-400 fill-amber-500" />
                          <span className="text-foreground/60 text-xs font-medium">
                            {washer.washer_profiles?.rating_avg?.toFixed(1) || '—'}
                          </span>
                        </div>
                        <span className="text-foreground/20">·</span>
                        <span className="text-foreground/55 text-xs">{washer.washer_profiles?.jobs_completed || 0} washes</span>
                        {washer.washer_profiles?.background_check_done && (
                          <>
                            <span className="text-foreground/20">·</span>
                            <Shield className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setChatOpen(true)}
                      className="w-9 h-9 rounded-lg bg-[#E23232]/10 border border-[#E23232]/20 flex items-center justify-center hover:bg-[#E23232]/15 transition-colors shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#E23232]" />
                    </button>
                  </div>

                  {washer.washer_profiles?.vehicle_make && (
                    <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-2">
                      <Car className="w-3 h-3 text-foreground/55" />
                      <span className="text-foreground/55 text-[11px]">
                        {washer.washer_profiles.vehicle_make} {washer.washer_profiles.vehicle_model}
                        {washer.washer_profiles.vehicle_year ? ` · ${washer.washer_profiles.vehicle_year}` : ''}
                        {washer.washer_profiles.vehicle_plate ? ` · ${washer.washer_profiles.vehicle_plate}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Before/After (mobile) */}
            {['completed', 'paid'].includes(status) && (
              <div className="px-5 pb-2">
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Camera className="w-3.5 h-3.5 text-foreground/55" />
                    <span className="text-foreground/50 text-[10px] font-medium uppercase tracking-wider">Before & After</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-[4/3] rounded-lg bg-foreground/[0.04] border border-border flex flex-col items-center justify-center gap-1.5">
                      <Camera className="w-4 h-4 text-foreground/50" />
                      <span className="text-foreground/50 text-[10px]">Before</span>
                    </div>
                    <div className="aspect-[4/3] rounded-lg bg-foreground/[0.04] border border-border flex flex-col items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-foreground/50" />
                      <span className="text-foreground/50 text-[10px]">After</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline (collapsible on mobile) */}
            <div className="px-5 pb-2">
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className="w-full flex items-center justify-between py-2.5 text-foreground/55 hover:text-foreground/60 transition-colors"
              >
                <span className="text-[10px] font-medium uppercase tracking-wider">Progress Timeline</span>
                {showTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showTimeline && (
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5">
                  {renderTimeline()}
                </div>
              )}
            </div>

            {/* Booking Details (collapsible on mobile) */}
            <div className="px-5 pb-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between py-2.5 text-foreground/55 hover:text-foreground/60 transition-colors"
              >
                <span className="text-[10px] font-medium uppercase tracking-wider">Booking Details</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showDetails && (
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5">
                  {renderBookingDetails()}
                </div>
              )}
            </div>
          </div>

          {/* Mobile footer */}
          <div className="px-5 py-3 border-t border-border shrink-0">
            {['completed', 'paid'].includes(status) && (
              <Button
                onClick={() => router.push(`/app/review/${booking.id}`)}
                className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold py-3 rounded-xl"
              >
                <Star className="w-4 h-4 mr-2" />
                Rate your wash
              </Button>
            )}
            {status === 'pending' && (
              <Button
                variant="outline"
                disabled={cancelling}
                onClick={async () => {
                  setCancelling(true);
                  const supabase = createClient();
                  const { error } = await supabase
                    .from('bookings')
                    .update({ status: 'cancelled' })
                    .eq('id', id);
                  if (error) {
                    const { toast } = await import('sonner');
                    toast.error('Failed to cancel booking');
                    setCancelling(false);
                  } else {
                    router.push('/app/bookings');
                  }
                }}
                className="w-full border-foreground/30 text-foreground/70 hover:text-red-400 hover:border-red-500/20 rounded-xl"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {cancelling ? 'Cancelling...' : 'Cancel booking'}
              </Button>
            )}
          </div>

          <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>

      {/* ═══════ In-app Chat ═══════ */}
      {washer && currentUserId && (
        <BookingChat
          bookingId={booking.id}
          currentUserId={currentUserId}
          otherPersonName={washer.full_name}
          otherPersonAvatar={washer.avatar_url}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
