'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Input } from '@/components/ui/input';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { DirtCanvas } from '@/components/driveo-slide/DirtCanvas';
import { DriveoSlide } from '@/components/driveo-slide/DriveoSlide';
import { Slider } from '@/components/ui/slider';
import { CalendarPicker } from '@/components/CalendarPicker';
import { calculatePrice, centsToDisplay, formatDuration, PLAN_LABELS, DIRT_LABELS, VEHICLE_TYPE_LABELS } from '@/lib/pricing';
import { getVehicleImageUrl } from '@/lib/vehicle-image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Car, MapPin, ChevronRight, Zap, CalendarDays, Sparkles,
  Clock, CreditCard, Loader2, ShieldCheck, Lock, Check, ArrowLeft,
  Droplets, X, Star, Gauge, MessageCircle,
} from 'lucide-react';
import type { Vehicle, WashPlan, BookingFormData } from '@/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ═══════════════════════════════════════════════════════════════
   Map styles
   ═══════════════════════════════════════════════════════════════ */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3e' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1e1e32' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#242438' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#7a7a8a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2e2e42' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#252538' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a50' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9a9aaa' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#242438' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#121228' }] },
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

const PLANS: { plan: WashPlan; label: string; desc: string; time: string; icon: typeof Droplets }[] = [
  { plan: 'regular',           label: 'Regular Wash',        desc: 'Exterior hand wash, rinse, and dry',         time: '~35 min', icon: Droplets },
  { plan: 'interior_exterior', label: 'Interior & Exterior', desc: 'Full exterior wash + interior vacuum & wipe', time: '~75 min', icon: Sparkles },
  { plan: 'detailing',         label: 'Full Detailing',      desc: 'Deep clean, polish, wax, leather conditioning', time: '~3 hrs', icon: Car },
];

/* ═══════════════════════════════════════════════════════════════
   Google Map
   ═══════════════════════════════════════════════════════════════ */
function BookingMap({ lat, lng, className }: { lat: number; lng: number; className?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
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
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: lat || 43.6532, lng: lng || -79.3832 },
      zoom: lat ? 15 : 12,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
      backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
      zoomControlOptions: { position: 6 }, // RIGHT_CENTER
    });
  }, [ready, lat, lng]);

  // React to light/dark mode changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      mapInstance.current?.setOptions({
        styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
        backgroundColor: isDark ? '#1a1a2e' : '#f5f5f5',
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    if (!mapInstance.current || !lat || !lng) {
      markerRef.current?.setMap(null);
      markerRef.current = null;
      return;
    }
    const pos = { lat, lng };
    if (markerRef.current) {
      markerRef.current.setPosition(pos);
    } else {
      markerRef.current = new google.maps.Marker({
        position: pos,
        map: mapInstance.current,
        icon: {
          url: buildMarkerSvg('#E23232'),
          scaledSize: new google.maps.Size(40, 52),
          anchor: new google.maps.Point(20, 52),
        },
      });
    }
    mapInstance.current.panTo(pos);
    mapInstance.current.setZoom(15);
  }, [lat, lng]);

  if (!ready) {
    return (
      <div className={cn('bg-muted relative', className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-10 rounded-full border border-[#E23232]/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="w-12 h-12 rounded-full bg-[#E23232]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#E23232]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={cn('w-full h-full', className)} />;
}

/* ═══════════════════════════════════════════════════════════════
   Stripe Payment Form
   ═══════════════════════════════════════════════════════════════ */
function PaymentForm({
  onSuccess, totalCents, submitting, setSubmitting,
}: {
  onSuccess: () => void;
  totalCents: number;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentReady, setPaymentReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setErrorMessage(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/app/book/success` },
      redirect: 'if_required',
    });
    if (error) { setErrorMessage(error.message || 'Payment failed.'); setSubmitting(false); return; }
    onSuccess();
  }, [stripe, elements, setSubmitting, onSuccess]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-foreground/40" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-foreground/40">Secured by Stripe</span>
        </div>
        <PaymentElement onReady={() => setPaymentReady(true)} options={{ layout: 'tabs' }} />
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{errorMessage}</div>
        )}
      </div>
      <div className="flex items-start gap-2 px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-foreground/45 text-[11px] leading-relaxed">
          Pre-authorized for <strong className="text-foreground/65">{centsToDisplay(totalCents)}</strong>. Charged after wash.
        </p>
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting || !stripe || !paymentReady}
        className="w-full h-[52px] rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.98]"
      >
        {submitting
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
          : <>Authorize {centsToDisplay(totalCents)}</>
        }
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Context Sidebar (visible during expanded service step)
   Shows a persistent summary of selections — like Uber's sidebar
   ═══════════════════════════════════════════════════════════════ */
function ContextSidebar({
  form, price, onEditVehicle, onEditLocation, onEditSchedule,
}: {
  form: BookingFormData;
  price: ReturnType<typeof calculatePrice> | null;
  onEditVehicle: () => void;
  onEditLocation: () => void;
  onEditSchedule: () => void;
}) {
  const carImgUrl = form.vehicle ? getVehicleImageUrl(form.vehicle.make, form.vehicle.model, form.vehicle.year, { angle: 'front-side', width: 300 }) : '';
  return (
    <div className="flex flex-col h-full">
      {/* Header + car preview */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/45 mb-3">Your wash</p>
        {form.vehicle && (
          <div className="relative h-24 rounded-xl bg-gradient-to-br from-foreground/[0.04] via-foreground/[0.02] to-transparent overflow-hidden mb-1">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }} />
            <img src={carImgUrl} alt="" className="absolute inset-0 w-full h-full object-contain p-1.5 drop-shadow-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-3">
        <div className="relative pl-6 space-y-5">
          <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-foreground/15 via-foreground/10 to-transparent" />

          {form.vehicle && (
            <button onClick={onEditVehicle} className="relative w-full text-left group">
              <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 border-foreground/20 bg-background group-hover:border-[#E23232]/40 transition-colors" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45 mb-0.5">Vehicle</p>
              <p className="text-foreground/80 text-sm font-medium truncate">{form.vehicle.year} {form.vehicle.make} {form.vehicle.model}</p>
              <p className="text-foreground/50 text-[11px] capitalize">{form.vehicle.type.replace('_', ' ')}</p>
            </button>
          )}

          {form.address && (
            <button onClick={onEditLocation} className="relative w-full text-left group">
              <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-sm bg-[#E23232] shadow-[0_0_6px_rgba(226,50,50,0.3)] group-hover:shadow-[0_0_10px_rgba(226,50,50,0.4)] transition-shadow" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45 mb-0.5">Location</p>
              <p className="text-foreground/80 text-sm leading-snug">{form.address}</p>
            </button>
          )}

          <button onClick={onEditSchedule} className="relative w-full text-left group">
            <div className="absolute -left-[20px] top-1">
              <Clock className="w-3.5 h-3.5 text-foreground/35 group-hover:text-[#E23232]/50 transition-colors" />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45 mb-0.5">When</p>
            <p className="text-foreground/80 text-sm font-medium">
              {form.isInstant ? 'Now' : form.scheduledAt
                ? new Date(form.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                : 'Not set'}
            </p>
          </button>
        </div>
      </div>

      {/* Price footer */}
      {price && (
        <div className="px-5 py-4 border-t border-border/50 mt-auto">
          <div className="flex items-baseline justify-between">
            <span className="text-foreground/45 text-[10px] font-semibold uppercase tracking-[0.12em]">Estimated</span>
            <span className="text-[#E23232] text-xl font-bold tabular-nums tracking-tight">{centsToDisplay(price.totalCents)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Booking Flow
   ═══════════════════════════════════════════════════════════════ */
function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get('plan') as WashPlan | null;

  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const stripeAppearance = isDark
    ? {
        theme: 'night' as const,
        variables: {
          colorPrimary: '#E23232', colorBackground: '#0a0a0a',
          colorText: '#f5f5f5', colorTextSecondary: '#999999',
          colorDanger: '#ef4444', fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: '12px', spacingUnit: '4px',
        },
        rules: {
          '.Input': { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f5f5' },
          '.Input:focus': { border: '1px solid #E23232', boxShadow: '0 0 0 1px #E23232' },
          '.Label': { color: 'rgba(255,255,255,0.5)' },
          '.Tab': { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' },
          '.Tab--selected': { backgroundColor: 'rgba(226,50,50,0.1)', border: '1px solid #E23232', color: '#f5f5f5' },
        },
      }
    : {
        theme: 'stripe' as const,
        variables: {
          colorPrimary: '#E23232', colorBackground: '#ffffff',
          colorText: '#111111', colorTextSecondary: '#555555',
          colorDanger: '#ef4444', fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: '12px', spacingUnit: '4px',
        },
        rules: {
          '.Input': { backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', color: '#111111' },
          '.Input:focus': { border: '1px solid #E23232', boxShadow: '0 0 0 1px #E23232' },
          '.Label': { color: '#555555' },
          '.Tab': { backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', color: '#555555' },
          '.Tab--selected': { backgroundColor: 'rgba(226,50,50,0.08)', border: '1px solid #E23232', color: '#111111' },
        },
      };

  const [step, setStep] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [form, setForm] = useState<BookingFormData>({
    vehicleId: '',
    vehicle: null,
    address: '',
    lat: 0,
    lng: 0,
    locationNotes: '',
    washPlan: preselectedPlan || 'regular',
    dirtLevel: 5,
    isInstant: true,
    scheduledAt: null,
  });

  // Auto-detect location on step 1
  useEffect(() => {
    if (step !== 1 || form.address) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const hasGoogle = typeof window !== 'undefined' && !!(window as typeof window & { google?: { maps?: { places?: unknown } } }).google?.maps?.places;
      if (hasGoogle) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            setForm(f => ({ ...f, address: results[0].formatted_address, lat: latitude, lng: longitude }));
          }
        });
      } else {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, { headers: { 'User-Agent': 'Driveo/1.0' } });
          const data = await res.json();
          if (data.display_name) setForm(f => ({ ...f, address: data.display_name, lat: latitude, lng: longitude }));
        } catch { /* ignore */ }
      }
    }, () => {}, { enableHighAccuracy: false, timeout: 5000 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('vehicles').select('*').eq('customer_id', user.id).order('is_primary', { ascending: false });
      if (data && data.length > 0) {
        setVehicles(data);
        const primary = data.find(v => v.is_primary) || data[0];
        setForm(f => ({ ...f, vehicleId: primary.id, vehicle: primary }));
      }
      setLoading(false);
    }
    loadVehicles();
  }, []);

  const price = form.vehicle ? calculatePrice(form.washPlan, form.vehicle.type, form.dirtLevel) : null;
  const isExpanded = step === 2 || step === 5; // Service & payment steps expand

  function nextStep() {
    if (step === 0 && !form.vehicleId) { toast.error('Select a vehicle'); return; }
    if (step === 1 && !form.address) { toast.error('Enter your address'); return; }
    if (step === 3 && !form.isInstant && !form.scheduledAt) { toast.error('Pick a date and time'); return; }
    setStep(s => Math.min(s + 1, 5));
  }

  function prevStep() { setStep(s => Math.max(s - 1, 0)); }

  async function handleProceedToPayment() {
    if (!form.vehicle || !price) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: form.vehicleId, washPlan: form.washPlan, dirtLevel: form.dirtLevel,
          serviceAddress: form.address, serviceLat: form.lat, serviceLng: form.lng,
          locationNotes: form.locationNotes, isInstant: form.isInstant, scheduledAt: form.scheduledAt,
        }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Failed to create booking'); setSubmitting(false); return; }
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setBookingId(data.bookingId);
      setStep(5);
    } catch { toast.error('Something went wrong'); }
    finally { setSubmitting(false); }
  }

  function handlePaymentSuccess() {
    toast.success('Booking confirmed! Finding you a washer…');
    router.push(`/app/track/${bookingId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-[#E23232] animate-spin" />
      </div>
    );
  }

  const ctaDisabled =
    (step === 0 && !form.vehicleId) ||
    (step === 1 && !form.address) ||
    (step === 3 && !form.isInstant && !form.scheduledAt);

  const stepTitles: Record<number, string> = {
    0: 'Select a vehicle',
    1: 'Where should we come?',
    2: 'Choose a service',
    3: 'When do you want us?',
    4: 'Confirm your wash',
    5: 'Payment',
  };

  return (
    <div className="relative h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] overflow-hidden">

      {/* ═══════ FULL-SCREEN MAP ═══════ */}
      <div className="absolute inset-0 z-0">
        <BookingMap lat={form.lat} lng={form.lng} className="w-full h-full" />
      </div>

      {/* ═══════ DESKTOP PANEL (lg+) ═══════
          Full-height left panel that UNFOLDS for service step.
          - Compact steps: ~420px (single column)
          - Service step: 3 columns (context + plans + car preview) ≈ 1100px
          Like Uber: sidebar persists, center content unfolds, preview panel appears */}
      <div
        className={cn(
          'hidden lg:flex absolute z-10 top-0 left-0 bottom-0',
          'transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isExpanded
            ? step === 5 ? 'w-[860px]' : 'w-[1120px]'
            : 'w-[420px]',
        )}
      >
        {/* Panel background */}
        <div className="absolute inset-0 bg-background/[0.97] backdrop-blur-2xl border-r border-border/50" />

        <div className="relative z-10 flex w-full h-full">

          {/* ── COL 1: Main form (compact) OR context sidebar (expanded) ── */}
          <div className={cn(
            'flex flex-col shrink-0 h-full transition-[width] duration-500',
            isExpanded ? 'w-[260px] border-r border-border' : 'w-full',
          )}>
            {isExpanded ? (
              step === 5 ? (
                /* ── Payment order summary sidebar ── */
                <div className="flex flex-col h-full">
                  <div className="px-5 pt-6 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <button onClick={prevStep} className="w-7 h-7 rounded-full bg-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.10] transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5 text-foreground/60" />
                      </button>
                    </div>
                    <h2 className="text-foreground font-semibold text-[15px] mt-2">Order summary</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 space-y-4">
                    {form.vehicle && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-foreground/40 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-foreground/50 font-medium uppercase tracking-wider">Vehicle</p>
                          <p className="text-foreground text-sm font-medium truncate mt-0.5">{form.vehicle.year} {form.vehicle.make} {form.vehicle.model}</p>
                          <p className="text-foreground/55 text-xs capitalize">{form.vehicle.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    )}
                    {form.address && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-sm bg-[#E23232] mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-foreground/50 font-medium uppercase tracking-wider">Location</p>
                          <p className="text-foreground text-sm leading-snug mt-0.5">{form.address}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Clock className="w-3.5 h-3.5 text-foreground/40 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground/50 font-medium uppercase tracking-wider">When</p>
                        <p className="text-foreground text-sm font-medium mt-0.5">
                          {form.isInstant ? 'Now' : form.scheduledAt
                            ? new Date(form.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                            : 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-3.5 h-3.5 text-foreground/40 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-foreground/50 font-medium uppercase tracking-wider">Service</p>
                        <p className="text-foreground text-sm font-medium mt-0.5">{PLAN_LABELS[form.washPlan]}</p>
                        <p className="text-foreground/55 text-xs mt-0.5">Dirt level {form.dirtLevel}</p>
                      </div>
                    </div>
                  </div>
                  {price && (
                    <div className="px-5 py-4 border-t border-border mt-auto space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60">{price.planLabel}</span>
                        <span className="text-foreground">{centsToDisplay(price.basePriceCents)}</span>
                      </div>
                      {price.vehicleMultiplier !== 1 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground/50">Vehicle ({price.vehicleMultiplier}x)</span>
                          <span className="text-foreground/65">+{centsToDisplay(Math.round(price.basePriceCents * (price.vehicleMultiplier - 1)))}</span>
                        </div>
                      )}
                      {price.dirtMultiplier !== 1 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground/50">Dirt ({price.dirtMultiplier}x)</span>
                          <span className="text-amber-600 dark:text-amber-500">+{centsToDisplay(Math.round(price.basePriceCents * price.vehicleMultiplier * (price.dirtMultiplier - 1)))}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground/50">HST (13%)</span>
                        <span className="text-foreground/55">{centsToDisplay(price.hstCents)}</span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between items-baseline">
                        <span className="text-foreground font-semibold text-sm">Total</span>
                        <span className="text-[#E23232] text-lg font-semibold tabular-nums">{centsToDisplay(price.totalCents)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
                        <p className="text-foreground/50 text-[10px]">Pre-authorized. Charged after wash.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ContextSidebar
                  form={form}
                  price={price}
                  onEditVehicle={() => setStep(0)}
                  onEditLocation={() => setStep(1)}
                  onEditSchedule={() => setStep(3)}
                />
              )
            ) : (
              <>
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-border shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    {step > 0 ? (
                      <button onClick={prevStep} className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.10] transition-colors">
                        <ArrowLeft className="w-4 h-4 text-foreground/60" />
                      </button>
                    ) : (
                      <button onClick={() => router.push('/app/home')} className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.10] transition-colors">
                        <X className="w-4 h-4 text-foreground/60" />
                      </button>
                    )}
                    {step === 4 && <span className="text-foreground/35 text-xs font-mono">Almost done</span>}
                  </div>
                  <h1 className="text-foreground font-semibold text-xl leading-tight mt-3">
                    {stepTitles[step]}
                  </h1>
                  {step <= 3 && form.vehicle && step > 0 && (
                    <p className="text-foreground/40 text-sm mt-1">
                      {form.vehicle.year} {form.vehicle.make} {form.vehicle.model}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {renderStepContent()}
                </div>

                {/* CTA */}
                {step < 5 && (
                  <div className="px-6 py-4 border-t border-border shrink-0">
                    {renderCTA()}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── COL 2: Service plan cards + dirt slider (only during step 2) ── */}
          {isExpanded && step === 2 && form.vehicle && (
            <div className="w-[460px] flex flex-col h-full border-r border-border/50">
              {/* Header */}
              <div className="px-6 pt-5 pb-5 border-b border-border/50 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevStep} className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.10] transition-colors">
                    <ArrowLeft className="w-4 h-4 text-foreground/60" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E23232]" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/40">Step 3 of 5</span>
                  </div>
                </div>
                <h1 className="text-foreground font-bold text-[22px] leading-tight tracking-tight">
                  Choose a service
                </h1>
                <p className="text-foreground/50 text-sm mt-1.5">
                  Tailored for your <span className="text-foreground/70 font-medium">{form.vehicle.make} {form.vehicle.model}</span>
                </p>
              </div>

              {/* Plan cards */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {PLANS.map(({ plan, label, desc, time, icon: Icon }) => {
                  const planPrice = calculatePrice(plan, form.vehicle!.type, form.dirtLevel);
                  const active = form.washPlan === plan;
                  const isPopular = plan === 'interior_exterior';
                  return (
                    <button
                      key={plan}
                      onClick={() => setForm(f => ({ ...f, washPlan: plan }))}
                      className={cn(
                        'group relative w-full rounded-2xl border transition-all duration-300 text-left overflow-hidden',
                        active
                          ? 'border-[#E23232]/30 bg-gradient-to-br from-[#E23232]/[0.07] via-[#E23232]/[0.03] to-transparent shadow-[0_4px_24px_rgba(226,50,50,0.06)]'
                          : 'border-border/60 bg-foreground/[0.015] hover:border-foreground/12 hover:bg-foreground/[0.025]'
                      )}
                    >
                      {active && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E23232]/60 to-transparent" />
                      )}

                      <div className="relative p-5 flex items-start gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300',
                          active
                            ? 'bg-[#E23232]/12 shadow-[0_0_16px_rgba(226,50,50,0.1)]'
                            : 'bg-foreground/[0.06] group-hover:bg-foreground/[0.08]'
                        )}>
                          <Icon className={cn('w-5 h-5 transition-colors duration-300', active ? 'text-[#E23232]' : 'text-foreground/40 group-hover:text-foreground/50')} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={cn('font-bold text-[15px] transition-colors', active ? 'text-foreground' : 'text-foreground/70')}>{label}</h3>
                            {isPopular && (
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">Popular</span>
                            )}
                          </div>
                          <p className={cn('text-[13px] mt-1 leading-relaxed transition-colors', active ? 'text-foreground/55' : 'text-foreground/45')}>{time} · {desc}</p>
                        </div>

                        <p className={cn(
                          'text-lg font-bold tabular-nums shrink-0 transition-colors pt-0.5',
                          active ? 'text-foreground' : 'text-foreground/50'
                        )}>
                          {centsToDisplay(planPrice.totalCents)}
                        </p>
                      </div>
                    </button>
                  );
                })}

              </div>

              {/* CTA */}
              <div className="px-6 py-4 border-t border-border/50 shrink-0">
                <button
                  onClick={nextStep}
                  className="w-full h-[52px] rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-[0_4px_12px_rgba(226,50,50,0.25)]"
                >
                  Continue with {PLAN_LABELS[form.washPlan]}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── COL 3: Car preview + price breakdown (only during step 2) ── */}
          {isExpanded && step === 2 && form.vehicle && price && (
            <div className="flex-1 flex flex-col h-full min-w-0">
              {/* Cinematic car display */}
              <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
                {/* Showroom ambient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E23232]/[0.015] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-background/60 to-transparent" />
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }} />
                {/* Subtle floor reflection line */}
                <div className="absolute bottom-[38%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />

                <div className="relative z-10 w-full px-6">
                  <DirtCanvas
                    vehicleId={form.vehicle.id}
                    vehicleLabel={`${form.vehicle.year} ${form.vehicle.make} ${form.vehicle.model}`}
                    vehicleColor={form.vehicle.color || undefined}
                    dirtLevel={form.dirtLevel}
                  />
                </div>
                <p className="relative z-10 text-foreground/50 text-sm font-medium tracking-wide mt-2">{form.vehicle.year} {form.vehicle.make} {form.vehicle.model}</p>
              </div>

              {/* Dirt slider — directly under the car for visual feedback */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-foreground/40" />
                    <span className="text-foreground/55 text-xs font-medium">Dirt level</span>
                  </div>
                  <span className={cn('text-sm font-bold px-3 py-0.5 rounded-lg',
                    form.dirtLevel <= 3 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' :
                    form.dirtLevel <= 6 ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10' :
                    form.dirtLevel <= 8 ? 'text-orange-600 dark:text-orange-400 bg-orange-500/10' : 'text-red-600 dark:text-red-400 bg-red-500/10'
                  )}>
                    {form.dirtLevel} — {DIRT_LABELS[form.dirtLevel]}
                  </span>
                </div>
                <Slider
                  value={[form.dirtLevel]}
                  onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; setForm(f => ({ ...f, dirtLevel: v })); }}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-foreground/35 text-[10px] px-0.5 mt-1.5">
                  <span>Clean</span>
                  <span>Extreme</span>
                </div>
              </div>

              {/* Price breakdown receipt */}
              <div className="px-6 pb-6">
                <div className="rounded-2xl border border-border/40 bg-foreground/[0.015] overflow-hidden">
                  <div className="px-5 pt-4 pb-3 border-b border-border/30">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/45">Price breakdown</p>
                  </div>
                  <div className="px-5 py-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/60 text-sm">{price.planLabel}</span>
                      <span className="text-foreground text-sm font-medium tabular-nums">{centsToDisplay(price.basePriceCents)}</span>
                    </div>
                    {price.vehicleMultiplier !== 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-foreground/50 text-[13px]">Vehicle adj. ({price.vehicleMultiplier}x)</span>
                        <span className="text-foreground/65 text-[13px] tabular-nums">+{centsToDisplay(Math.round(price.basePriceCents * (price.vehicleMultiplier - 1)))}</span>
                      </div>
                    )}
                    {price.dirtMultiplier !== 1 && (
                      <div className="flex justify-between items-center">
                        <span className="text-foreground/50 text-[13px]">Dirt adj. ({price.dirtMultiplier}x)</span>
                        <span className="text-amber-600 dark:text-amber-400 text-[13px] tabular-nums">+{centsToDisplay(Math.round(price.basePriceCents * price.vehicleMultiplier * (price.dirtMultiplier - 1)))}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/50 text-[13px]">HST (13%)</span>
                      <span className="text-foreground/55 text-[13px] tabular-nums">{centsToDisplay(price.hstCents)}</span>
                    </div>
                    <div className="border-t border-border/40 pt-3 flex justify-between items-baseline">
                      <span className="text-foreground font-bold text-base">Total</span>
                      <span className="text-[#E23232] text-2xl font-bold tabular-nums tracking-tight">{centsToDisplay(price.totalCents)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── COL 2: Stripe payment form (only during step 5) ── */}
          {isExpanded && step === 5 && clientSecret && price && (
            <div className="flex-1 flex flex-col h-full min-w-0">
              {/* Header */}
              <div className="px-6 pt-5 pb-4 border-b border-border shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <h1 className="text-foreground font-semibold text-xl leading-tight">Payment</h1>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-foreground/30" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/30">Secured by Stripe</span>
                  </div>
                </div>
                <p className="text-foreground/40 text-sm mt-1">Complete your booking</p>
              </div>

              {/* Stripe form */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: stripeAppearance,
                  }}
                >
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    totalCents={price.totalCents}
                    submitting={submitting}
                    setSubmitting={setSubmitting}
                  />
                </Elements>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ MOBILE PANEL (below lg) ═══════
          Bottom sheet over the map */}
      <div className="lg:hidden absolute inset-x-0 bottom-0 z-10">
        {/* Gradient for map readability */}
        <div className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="bg-background border-t border-border rounded-t-2xl max-h-[78dvh] flex flex-col">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-foreground/15" />
          </div>

          {/* Mobile header */}
          <div className="px-5 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <button onClick={prevStep} className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center">
                  <ArrowLeft className="w-4 h-4 text-foreground/60" />
                </button>
              ) : (
                <button onClick={() => router.push('/app/home')} className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center">
                  <X className="w-4 h-4 text-foreground/60" />
                </button>
              )}
              <h1 className="text-foreground font-semibold text-lg flex-1">{stepTitles[step]}</h1>
            </div>
          </div>

          {/* Mobile content */}
          <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0">
            {renderMobileStepContent()}
          </div>

          {/* Mobile CTA */}
          {step < 5 && (
            <div className="px-5 py-3 border-t border-border shrink-0">
              {renderCTA()}
            </div>
          )}

          {/* Safe area */}
          <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>
    </div>
  );

  /* ─── Step content for desktop compact panel ─── */
  function renderStepContent() {
    // Step 0: Vehicle
    if (step === 0) {
      return (
        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <div className="py-10 text-center">
              <Car className="w-10 h-10 text-foreground/15 mx-auto mb-3" />
              <p className="text-foreground/45 text-sm mb-5">No vehicles yet</p>
              <button onClick={() => router.push('/app/onboarding')} className="px-6 py-2.5 rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white text-sm font-medium transition-all">
                Add Vehicle
              </button>
            </div>
          ) : (
            vehicles.map(v => {
              const selected = form.vehicleId === v.id;
              const imgUrl = getVehicleImageUrl(v.make, v.model, v.year, { angle: 'front-side', width: 400, color: v.color || undefined });
              return (
                <button
                  key={v.id}
                  onClick={() => setForm(f => ({ ...f, vehicleId: v.id, vehicle: v }))}
                  className={cn(
                    'w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 text-left group relative overflow-hidden',
                    selected
                      ? 'border-foreground/15 bg-foreground/[0.04]'
                      : 'border-border/50 hover:border-border hover:bg-foreground/[0.02]'
                  )}
                >
                  {/* Selected left accent */}
                  {selected && (
                    <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-[#E23232]" />
                  )}

                  {/* Car image thumbnail */}
                  <div className={cn(
                    'w-14 h-14 rounded-xl overflow-hidden shrink-0 relative transition-colors',
                    selected ? 'bg-foreground/[0.06]' : 'bg-foreground/[0.03]'
                  )}>
                    <img
                      src={imgUrl}
                      alt={`${v.make} ${v.model}`}
                      className="absolute inset-0 w-full h-full object-contain p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Car className="w-5 h-5 text-foreground/[0.04]" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-semibold text-sm truncate', selected ? 'text-foreground' : 'text-foreground/70')}>
                      {v.year} {v.make} {v.model}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-foreground/35 text-[11px] capitalize">{VEHICLE_TYPE_LABELS[v.type]}</span>
                      {v.color && (
                        <>
                          <span className="text-foreground/20">·</span>
                          <span className="text-foreground/35 text-[11px]">{v.color}</span>
                        </>
                      )}
                      {v.is_primary && (
                        <>
                          <span className="text-foreground/20">·</span>
                          <span className="text-[10px] font-semibold text-foreground/40">Default</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200',
                    selected
                      ? 'bg-[#E23232] shadow-[0_0_8px_rgba(226,50,50,0.3)]'
                      : 'border-2 border-foreground/10 group-hover:border-foreground/20'
                  )}>
                    {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      );
    }

    // Step 1: Location
    if (step === 1) {
      const locationConfirmed = form.address && form.lat !== 0;
      return (
        <div className="space-y-4">
          {/* Address search */}
          <div>
            <AddressAutocomplete
              value={form.address}
              onChange={(address, lat, lng) => setForm(f => ({ ...f, address, lat, lng }))}
              placeholder="Search for your address..."
              className="h-12 rounded-xl bg-foreground/[0.04] border-border text-foreground placeholder:text-foreground/25 text-sm"
            />
          </div>

          {/* Location notes */}
          <div className="relative">
            <MessageCircle className="absolute left-3.5 top-3 w-4 h-4 text-foreground/20 pointer-events-none" />
            <Input
              placeholder="Parking notes, gate code, unit #..."
              value={form.locationNotes}
              onChange={e => setForm(f => ({ ...f, locationNotes: e.target.value }))}
              className="h-11 pl-10 rounded-xl bg-foreground/[0.04] border-border text-foreground placeholder:text-foreground/20 text-sm"
            />
          </div>

          {/* Confirmed address card */}
          {locationConfirmed && (
            <div className="relative rounded-2xl bg-gradient-to-br from-[#E23232]/[0.06] via-[#E23232]/[0.03] to-transparent backdrop-blur-sm overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl border border-[#E23232]/15" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E23232]/60 to-transparent" />

              <div className="relative px-4 py-3.5">
                <div className="flex items-center gap-3">
                  {/* Pulsing location dot */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#E23232]/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#E23232] shadow-[0_0_8px_rgba(226,50,50,0.4)]" />
                    </div>
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#E23232] flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#E23232]/70">Pinned</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-[#E23232]/15 to-transparent" />
                    </div>
                    <p className="text-foreground text-[13px] font-medium leading-snug truncate">{form.address}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Step 2: handled by expanded panel on desktop
    // Step 3: Schedule
    if (step === 3) {
      return (
        <div className="space-y-5">
          {/* Segmented toggle */}
          <div className="relative rounded-2xl bg-foreground/[0.03] border border-border/40 p-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setForm(f => ({ ...f, isInstant: true, scheduledAt: null }))}
                className={cn(
                  'relative flex items-center justify-center gap-2.5 py-4 rounded-xl transition-all duration-300',
                  form.isInstant
                    ? 'bg-gradient-to-br from-[#E23232]/[0.12] to-[#E23232]/[0.05] shadow-[0_2px_12px_rgba(226,50,50,0.1)]'
                    : 'hover:bg-foreground/[0.03]'
                )}
              >
                {form.isInstant && <div className="absolute top-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#E23232]/50 to-transparent rounded-full" />}
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                  form.isInstant ? 'bg-[#E23232]/15 shadow-[0_0_10px_rgba(226,50,50,0.08)]' : 'bg-foreground/[0.04]'
                )}>
                  <Zap className={cn('w-4 h-4 transition-colors', form.isInstant ? 'text-[#E23232]' : 'text-foreground/25')} />
                </div>
                <div className="text-left">
                  <p className={cn('text-sm font-bold transition-colors', form.isInstant ? 'text-foreground' : 'text-foreground/40')}>Now</p>
                  <p className={cn('text-[10px] transition-colors', form.isInstant ? 'text-foreground/40' : 'text-foreground/20')}>Next available</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const next = new Date(); next.setHours(next.getHours() + 1, 0, 0, 0);
                  setForm(f => ({ ...f, isInstant: false, scheduledAt: f.scheduledAt || next.toISOString() }));
                }}
                className={cn(
                  'relative flex items-center justify-center gap-2.5 py-4 rounded-xl transition-all duration-300',
                  !form.isInstant
                    ? 'bg-gradient-to-br from-[#E23232]/[0.12] to-[#E23232]/[0.05] shadow-[0_2px_12px_rgba(226,50,50,0.1)]'
                    : 'hover:bg-foreground/[0.03]'
                )}
              >
                {!form.isInstant && <div className="absolute top-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#E23232]/50 to-transparent rounded-full" />}
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                  !form.isInstant ? 'bg-[#E23232]/15 shadow-[0_0_10px_rgba(226,50,50,0.08)]' : 'bg-foreground/[0.04]'
                )}>
                  <CalendarDays className={cn('w-4 h-4 transition-colors', !form.isInstant ? 'text-[#E23232]' : 'text-foreground/25')} />
                </div>
                <div className="text-left">
                  <p className={cn('text-sm font-bold transition-colors', !form.isInstant ? 'text-foreground' : 'text-foreground/40')}>Schedule</p>
                  <p className={cn('text-[10px] transition-colors', !form.isInstant ? 'text-foreground/40' : 'text-foreground/20')}>Pick a time</p>
                </div>
              </button>
            </div>
          </div>

          {/* Content below toggle */}
          {!form.isInstant && (
            <CalendarPicker
              value={form.scheduledAt}
              onChange={iso => setForm(f => ({ ...f, scheduledAt: iso }))}
            />
          )}
          {form.isInstant && (
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-foreground/[0.02] border border-border/30">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-foreground/50 text-[13px] leading-snug">We&apos;ll match you with the nearest available washer immediately.</p>
            </div>
          )}
        </div>
      );
    }

    // Step 4: Review (Uber's "Confirming your ride" style)
    if (step === 4 && form.vehicle && price) {
      return (
        <div className="space-y-4">
          {/* Route line summary */}
          <div className="flex items-start gap-3.5">
            <div className="flex flex-col items-center pt-1.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-foreground/40" />
              <div className="w-px h-10 bg-foreground/20 my-1" />
              <div className="w-2.5 h-2.5 rounded-sm bg-[#E23232]" />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <p className="text-foreground font-medium text-[15px]">{form.vehicle.year} {form.vehicle.make} {form.vehicle.model}</p>
                <p className="text-foreground/50 text-xs capitalize">{form.vehicle.type.replace('_', ' ')}{form.vehicle.color ? ` · ${form.vehicle.color}` : ''}</p>
              </div>
              <div>
                <p className="text-foreground text-sm leading-snug">{form.address}</p>
                {form.locationNotes && <p className="text-foreground/50 text-xs mt-0.5">{form.locationNotes}</p>}
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Service + when */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-foreground/50" />
                <div>
                  <p className="text-foreground text-sm font-medium">{PLAN_LABELS[form.washPlan]}</p>
                  <p className="text-foreground/50 text-xs">Dirt {form.dirtLevel} · Est. {formatDuration(price.estimatedDurationMin)}</p>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="text-[#E23232]/80 hover:text-[#E23232] text-xs font-medium border border-[#E23232]/25 hover:border-[#E23232]/40 hover:bg-[#E23232]/[0.04] rounded-lg px-2.5 py-1 transition-all">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {form.isInstant ? <Zap className="w-4 h-4 text-amber-600 dark:text-amber-500" /> : <Clock className="w-4 h-4 text-foreground/50" />}
                <div>
                  <p className="text-foreground text-sm font-medium">{form.isInstant ? 'Now' : 'Scheduled'}</p>
                  {!form.isInstant && form.scheduledAt && (
                    <p className="text-foreground/50 text-xs">
                      {new Date(form.scheduledAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setStep(3)} className="text-[#E23232]/80 hover:text-[#E23232] text-xs font-medium border border-[#E23232]/25 hover:border-[#E23232]/40 hover:bg-[#E23232]/[0.04] rounded-lg px-2.5 py-1 transition-all">Change</button>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">{price.planLabel}</span>
              <span className="text-foreground">{centsToDisplay(price.basePriceCents)}</span>
            </div>
            {price.vehicleMultiplier !== 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground/50">Vehicle ({price.vehicleMultiplier}x)</span>
                <span className="text-foreground/65">+{centsToDisplay(Math.round(price.basePriceCents * (price.vehicleMultiplier - 1)))}</span>
              </div>
            )}
            {price.dirtMultiplier !== 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground/50">Dirt ({price.dirtMultiplier}x)</span>
                <span className="text-amber-600 dark:text-amber-500">+{centsToDisplay(Math.round(price.basePriceCents * price.vehicleMultiplier * (price.dirtMultiplier - 1)))}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-foreground/50">HST (13%)</span>
              <span className="text-foreground/55">{centsToDisplay(price.hstCents)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-baseline">
              <span className="text-foreground font-semibold">Total</span>
              <span className="text-foreground text-xl font-semibold tabular-nums">{centsToDisplay(price.totalCents)}</span>
            </div>
          </div>

          <p className="text-foreground/45 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3" />
            Pre-authorized only. Charged after wash completion.
          </p>
        </div>
      );
    }

    // Step 5: Payment
    if (step === 5 && clientSecret && price) {
      return (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: stripeAppearance,
          }}
        >
          <PaymentForm
            onSuccess={handlePaymentSuccess}
            totalCents={price.totalCents}
            submitting={submitting}
            setSubmitting={setSubmitting}
          />
        </Elements>
      );
    }

    return null;
  }

  /* ─── Mobile step content (includes step 2 inline) ─── */
  function renderMobileStepContent() {
    // Steps 0, 1, 3, 4, 5 are same as desktop
    if (step !== 2) return renderStepContent();

    // Step 2 on mobile: inline service selection (no split layout)
    if (!form.vehicle) return null;
    return (
      <div className="space-y-5 pb-2">
        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/[0.04] text-foreground/50 text-xs font-medium border border-border/30">
            <Car className="w-3 h-3" /> {form.vehicle.year} {form.vehicle.make}
          </span>
          {form.address && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/[0.04] text-foreground/50 text-xs font-medium truncate max-w-[200px] border border-border/30">
              <MapPin className="w-3 h-3" /> {form.address.split(',')[0]}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/[0.04] text-foreground/50 text-xs font-medium border border-border/30">
            {form.isInstant ? <><Zap className="w-3 h-3" /> Now</> : <><Clock className="w-3 h-3" /> Scheduled</>}
          </span>
        </div>

        {/* Service cards */}
        <div className="space-y-2.5">
          {PLANS.map(({ plan, label, desc, time, icon: Icon }) => {
            const planPrice = calculatePrice(plan, form.vehicle!.type, form.dirtLevel);
            const active = form.washPlan === plan;
            const isPopular = plan === 'interior_exterior';
            return (
              <button
                key={plan}
                onClick={() => setForm(f => ({ ...f, washPlan: plan }))}
                className={cn(
                  'group relative w-full rounded-2xl border transition-all duration-300 text-left overflow-hidden',
                  active
                    ? 'border-[#E23232]/30 bg-gradient-to-br from-[#E23232]/[0.07] via-[#E23232]/[0.03] to-transparent'
                    : 'border-border/60 bg-foreground/[0.015] hover:border-foreground/12'
                )}
              >
                {active && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E23232]/60 to-transparent" />
                )}
                <div className="relative p-4 flex items-start gap-3.5">
                  <div className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all',
                    active ? 'bg-[#E23232]/12 shadow-[0_0_12px_rgba(226,50,50,0.08)]' : 'bg-foreground/[0.06]'
                  )}>
                    <Icon className={cn('w-5 h-5 transition-colors', active ? 'text-[#E23232]' : 'text-foreground/40')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={cn('font-bold text-sm transition-colors', active ? 'text-foreground' : 'text-foreground/70')}>{label}</h3>
                      {isPopular && (
                        <span className="text-[8px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">Popular</span>
                      )}
                    </div>
                    <p className={cn('text-xs mt-0.5 leading-relaxed transition-colors', active ? 'text-foreground/55' : 'text-foreground/45')}>{time} · {desc}</p>
                  </div>
                  <p className={cn('text-base font-bold tabular-nums shrink-0', active ? 'text-foreground' : 'text-foreground/50')}>
                    {centsToDisplay(planPrice.totalCents)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dirt level */}
        <div>
          <p className="text-foreground/50 text-xs font-semibold uppercase tracking-[0.12em] mb-2">Dirt Level</p>
          <DriveoSlide
            vehicleId={form.vehicle.id}
            vehicleType={form.vehicle.type}
            vehicleLabel={`${form.vehicle.year} ${form.vehicle.make} ${form.vehicle.model}`}
            vehicleColor={form.vehicle.color || undefined}
            selectedPlan={form.washPlan}
            onPlanSelect={plan => setForm(f => ({ ...f, washPlan: plan }))}
            onDirtLevelChange={level => setForm(f => ({ ...f, dirtLevel: level }))}
            initialDirtLevel={form.dirtLevel}
          />
        </div>
      </div>
    );
  }

  /* ─── Shared CTA button ─── */
  function renderCTA() {
    if (step === 4) {
      return (
        <button
          onClick={handleProceedToPayment}
          disabled={submitting}
          className="w-full h-[52px] rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.98]"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up…</>
            : <>Proceed to Payment</>
          }
        </button>
      );
    }

    if (step === 2) {
      return (
        <button
          onClick={nextStep}
          className="w-full h-[52px] rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Continue with {PLAN_LABELS[form.washPlan]}
          <ChevronRight className="w-4 h-4" />
        </button>
      );
    }

    return (
      <button
        onClick={nextStep}
        disabled={ctaDisabled}
        className="w-full h-[52px] rounded-xl bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-30 transition-all active:scale-[0.98]"
      >
        {step === 0 ? 'Continue' : step === 1 ? 'Confirm Location' : step === 3 ? 'Next' : 'Continue'}
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  }
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingForm />
    </Suspense>
  );
}
