'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  MapPin, Clock, DollarSign, Car, Droplets,
  Loader2, X, Zap, Navigation, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export interface JobAlertData {
  booking_id: string;
  wash_plan: string;
  washer_payout: number;
  service_address: string;
  service_lat: number;
  service_lng: number;
  dirt_level: number;
  estimated_duration_min: number;
  vehicle: string;
}

interface Props {
  alert: JobAlertData;
  onDismiss: () => void;
  isAdminRequest?: boolean;
}

const PLAN_LABELS: Record<string, string> = {
  regular: 'Regular Wash',
  interior_exterior: 'Interior & Exterior',
  detailing: 'Full Detailing',
};

const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#222222' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#050510' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const LIGHT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
];

const COUNTDOWN_SECONDS = 30;

export function JobAlertPopup({ alert, onDismiss, isAdminRequest = false }: Props) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [expired, setExpired] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Countdown timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Auto-dismiss when expired
  useEffect(() => {
    if (expired) {
      const t = setTimeout(onDismiss, 2000);
      return () => clearTimeout(t);
    }
  }, [expired, onDismiss]);

  // Auto-close if another washer claims the job (Realtime + polling)
  useEffect(() => {
    if (claimed || expired) return;
    const supabase = createClient();

    // Realtime: listen for booking status change from 'pending'
    const channel = supabase
      .channel(`job-alert-booking:${alert.booking_id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${alert.booking_id}`,
      }, (payload) => {
        const updated = payload.new as { status: string };
        if (updated.status !== 'pending') {
          clearInterval(intervalRef.current);
          toast.info('This job was taken by another washer');
          setExpired(true);
        }
      })
      .subscribe();

    // Polling fallback: check every 3s if booking is still pending
    const pollId = setInterval(async () => {
      const { data } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', alert.booking_id)
        .single();
      if (data && data.status !== 'pending') {
        clearInterval(intervalRef.current);
        clearInterval(pollId);
        toast.info('This job was taken by another washer');
        setExpired(true);
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollId);
    };
  }, [alert.booking_id, claimed, expired]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    if (mapInstanceRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: alert.service_lat, lng: alert.service_lng },
      zoom: 14,
      disableDefaultUI: true,
      styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
      backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
    });

    // Customer location marker
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">
      <path d="M20 0C9 0 0 9 0 20c0 15 20 32 20 32s20-17 20-32C40 9 31 0 20 0z" fill="#E23232"/>
      <circle cx="20" cy="20" r="8" fill="white" opacity="0.9"/>
    </svg>`;

    new google.maps.Marker({
      position: { lat: alert.service_lat, lng: alert.service_lng },
      map,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
        scaledSize: new google.maps.Size(36, 47),
        anchor: new google.maps.Point(18, 47),
      },
    });

    // Pulse circle around marker
    new google.maps.Circle({
      center: { lat: alert.service_lat, lng: alert.service_lng },
      radius: 500,
      map,
      fillColor: '#E23232',
      fillOpacity: 0.08,
      strokeColor: '#E23232',
      strokeOpacity: 0.2,
      strokeWeight: 1,
    });

    mapInstanceRef.current = map;
  }, [alert.service_lat, alert.service_lng]);

  const handleClaim = useCallback(async () => {
    if (claiming || claimed || expired) return;
    setClaiming(true);
    clearInterval(intervalRef.current);

    try {
      const res = await fetch('/api/bookings/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: alert.booking_id }),
      });

      const data = await res.json();

      if (data.claimed) {
        setClaimed(true);
        toast.success('Job claimed! Redirecting...');
        setTimeout(() => {
          router.push(`/washer/jobs/${alert.booking_id}`);
          onDismiss();
        }, 1200);
      } else {
        toast.error(data.message || 'Job already taken');
        setExpired(true);
      }
    } catch {
      toast.error('Failed to claim job');
      setClaiming(false);
    }
  }, [claiming, claimed, expired, alert.booking_id, router, onDismiss]);

  const payout = `$${((alert.washer_payout || 0) / 100).toFixed(2)}`;
  const planLabel = PLAN_LABELS[alert.wash_plan] || alert.wash_plan;
  const progress = (timeLeft / COUNTDOWN_SECONDS) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-8"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onDismiss} />

        {/* Alert Card */}
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-background border border-border rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[95dvh] flex flex-col"
        >
          {/* Countdown progress bar */}
          <div className="h-1 bg-foreground/[0.05] shrink-0">
            <motion.div
              className={cn(
                'h-full transition-colors duration-300',
                timeLeft > 10 ? 'bg-[#E23232]' : 'bg-amber-500',
              )}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>

          {/* Drag handle — mobile only */}
          <div className="flex justify-center pt-2.5 pb-1 md:hidden shrink-0">
            <div className="w-10 h-1 rounded-full bg-foreground/15" />
          </div>

          {/* Map preview */}
          <div className="relative h-[130px] md:h-[180px] bg-muted shrink-0">
            <div ref={mapRef} className="w-full h-full" />
            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center border border-border hover:bg-background/80 active:scale-95 transition-all z-10"
            >
              <X className="w-4 h-4 text-foreground/70" />
            </button>

            {/* Timer badge */}
            <div className={cn(
              'absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm border z-10 font-mono text-sm font-bold',
              expired
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : timeLeft <= 10
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 animate-pulse'
                  : 'bg-background/60 border-border text-foreground',
            )}>
              <Clock className="w-3.5 h-3.5" />
              {expired ? 'EXPIRED' : `${timeLeft}s`}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 md:p-5 space-y-3 md:space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isAdminRequest ? (
                      <ShieldCheck className="w-4 h-4 text-[#E23232] shrink-0" />
                    ) : (
                      <Zap className="w-4 h-4 text-[#E23232] shrink-0" />
                    )}
                    <span className="text-[10px] text-[#E23232] uppercase tracking-[0.2em] font-bold">
                      {isAdminRequest ? 'Admin Request' : 'New Job Alert'}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-display text-foreground uppercase tracking-tight truncate">{planLabel}</h3>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider">You Earn</p>
                  <p className="text-2xl font-bold text-[#E23232]">{payout}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="flex items-center gap-2 p-2.5 md:p-3 bg-foreground/[0.03] rounded-xl border border-foreground/[0.05]">
                  <Car className="w-4 h-4 text-foreground/40 shrink-0" />
                  <span className="text-foreground/70 text-xs truncate">{alert.vehicle}</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 md:p-3 bg-foreground/[0.03] rounded-xl border border-foreground/[0.05]">
                  <Droplets className="w-4 h-4 text-foreground/40 shrink-0" />
                  <span className="text-foreground/70 text-xs">Dirt {alert.dirt_level}/10</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 md:p-3 bg-foreground/[0.03] rounded-xl border border-foreground/[0.05] col-span-2">
                  <MapPin className="w-4 h-4 text-foreground/40 shrink-0" />
                  <span className="text-foreground/70 text-xs truncate">{alert.service_address}</span>
                </div>
              </div>

              {/* Est. duration */}
              {alert.estimated_duration_min > 0 && (
                <div className="flex items-center gap-2 text-foreground/30 text-xs">
                  <Clock className="w-3 h-3" />
                  ~{alert.estimated_duration_min} min estimated
                </div>
              )}
            </div>
          </div>

          {/* Action buttons — pinned to bottom */}
          <div className="p-4 md:p-5 pt-2 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {claimed ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-full py-4 rounded-2xl bg-green-600 text-white text-center font-display text-lg uppercase tracking-wider"
              >
                Job Claimed!
              </motion.div>
            ) : expired ? (
              <div className="w-full py-4 rounded-2xl bg-foreground/[0.05] text-foreground/30 text-center font-display text-lg uppercase tracking-wider border border-foreground/[0.05]">
                Offer Expired
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={onDismiss}
                  className={cn(
                    'flex-[0.35] py-4 rounded-2xl font-semibold text-sm border transition-colors active:scale-[0.97]',
                    isAdminRequest
                      ? 'bg-red-500/5 text-red-500 border-red-500/20 hover:bg-red-500/10'
                      : 'bg-foreground/[0.05] text-foreground/50 border-border hover:bg-foreground/[0.10]',
                  )}
                >
                  {isAdminRequest ? 'Decline' : 'Skip'}
                </button>
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="flex-[0.65] py-4 rounded-2xl bg-[#E23232] text-white font-display text-base md:text-lg uppercase tracking-wider hover:bg-[#c92a2a] transition-all active:scale-[0.97] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {claiming ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Claiming...</>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" /> Accept Job
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
