'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLAN_LABELS, centsToDisplay, formatDuration } from '@/lib/pricing';
import { toast } from 'sonner';
import {
  Car, MapPin, Navigation, Camera, Clock, DollarSign,
  CheckCircle2, Loader2, User, X, MessageCircle, ImagePlus,
  ArrowLeft, Droplets, Circle, Shield, Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { Booking, Profile, Vehicle, BookingPhoto } from '@/types';
import { cn } from '@/lib/utils';
import { BookingChat } from '@/components/BookingChat';

export const dynamic = 'force-dynamic';

interface BookingWithDetails extends Booking {
  vehicles: Vehicle;
  profiles: Profile;
}

const statusFlow = [
  { status: 'assigned', label: 'En Route', action: 'en_route', icon: Navigation, desc: 'Start navigating to the customer' },
  { status: 'en_route', label: 'I\'ve Arrived', action: 'arrived', icon: MapPin, desc: 'Confirm you\'re at the location' },
  { status: 'arrived', label: 'Start Wash', action: 'washing', icon: Droplets, desc: 'Begin the wash' },
  { status: 'washing', label: 'Mark Complete', action: 'completed', icon: CheckCircle2, desc: 'Finish and capture payment' },
];

type StatusKey = 'assigned' | 'en_route' | 'arrived' | 'washing' | 'completed' | 'paid';

const STATUS_ORDER: StatusKey[] = ['assigned', 'en_route', 'arrived', 'washing', 'completed', 'paid'];

const STATUS_CONFIG: Record<StatusKey, {
  label: string;
  description: string;
  icon: typeof Loader2;
  color: string;
  bgColor: string;
}> = {
  assigned: {
    label: 'Job Accepted',
    description: 'Navigate to the customer\'s location.',
    icon: Navigation,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  en_route: {
    label: 'En Route',
    description: 'Driving to the service location.',
    icon: Navigation,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  arrived: {
    label: 'Arrived',
    description: 'Take before photos, then start washing.',
    icon: MapPin,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
  },
  washing: {
    label: 'Washing',
    description: 'Wash in progress. Take after photos when done.',
    icon: Droplets,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  completed: {
    label: 'Completed',
    description: 'Wash done! Payment has been captured.',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
  },
  paid: {
    label: 'Paid',
    description: 'Payment processed. Great work!',
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
  },
};

/* ═══ Map styles ═══ */
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

/* ═══ Smooth marker animation ═══ */
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

/* ═══ Full-screen map component with live tracking ═══ */
function JobFullMap({
  serviceLat, serviceLng, serviceAddress, washerLat, washerLng, status, className,
}: {
  serviceLat: number;
  serviceLng: number;
  serviceAddress: string;
  washerLat: number | null;
  washerLng: number | null;
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

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: serviceLat, lng: serviceLng },
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
      backgroundColor: isDark ? '#050505' : '#f5f5f5',
      zoomControlOptions: { position: 6 },
    });
    mapInstance.current = map;

    directionsRef.current = new google.maps.DirectionsService();

    serviceMarkerRef.current = new google.maps.Marker({
      position: { lat: serviceLat, lng: serviceLng },
      map,
      icon: {
        url: buildMarkerSvg('#ffffff'),
        scaledSize: new google.maps.Size(36, 46),
        anchor: new google.maps.Point(18, 46),
      },
      title: serviceAddress,
    });

    new google.maps.Circle({
      center: { lat: serviceLat, lng: serviceLng },
      radius: 200,
      map,
      fillColor: '#E23232',
      fillOpacity: 0.06,
      strokeColor: '#E23232',
      strokeOpacity: 0.15,
      strokeWeight: 1,
    });

    routeLineRef.current = new google.maps.Polyline({
      map,
      strokeColor: '#E23232',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      geodesic: true,
    });

    const observer = new MutationObserver(() => {
      const nowDark = document.documentElement.classList.contains('dark');
      map.setOptions({
        styles: nowDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
        backgroundColor: nowDark ? '#050505' : '#f5f5f5',
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [ready, serviceLat, serviceLng, serviceAddress]);

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

  // Update washer marker + route when position changes
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
        title: 'Your Location',
        zIndex: 10,
      });
    } else {
      animateMarkerTo(washerMarkerRef.current, washerLat, washerLng);
    }

    // Fit bounds to show both markers (pad left for desktop panels)
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: serviceLat, lng: serviceLng });
    bounds.extend({ lat: washerLat, lng: washerLng });
    const isDesktop = window.innerWidth >= 1024;
    map.fitBounds(bounds, {
      top: 80,
      bottom: isDesktop ? 80 : 300,
      left: isDesktop ? 880 : 40,
      right: 40,
    });

    // Draw route if en_route or arrived
    if (['en_route', 'arrived'].includes(status)) {
      updateRoute(washerLat, washerLng);
    }
  }, [washerLat, washerLng, serviceLat, serviceLng, status, updateRoute]);

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
              <span className="text-sm text-foreground/65 font-medium tracking-wide">Loading map...</span>
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
      {status === 'en_route' && washerLat != null && washerLng != null && eta && (
        <div className="absolute top-4 left-1/2 lg:left-auto lg:right-8 lg:translate-x-0 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2.5 px-5 py-3 rounded-full backdrop-blur-md"
            style={{ background: 'rgba(5, 5, 5, 0.85)', border: '1px solid rgba(226, 50, 50, 0.3)' }}>
            <Navigation className="w-4 h-4 text-[#E23232] animate-pulse" />
            <span className="text-foreground text-sm font-medium tracking-wide">
              ETA: <span className="text-[#E23232] font-bold">{eta}</span>
            </span>
          </div>
        </div>
      )}

      {/* Status badge on map when not en_route */}
      {status !== 'en_route' && (
        <div className="hidden lg:block absolute top-4 right-8 z-10">
          <div className="px-4 py-2 rounded-full backdrop-blur-md text-foreground/70 text-xs font-medium uppercase tracking-widest"
            style={{ background: 'rgba(5, 5, 5, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
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

/* ═══ Client-side image compression ═══ */
function compressImage(file: File, maxDim = 1920, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : resolve(file),
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/* ═══ Masked customer name helper ═══ */
function maskName(fullName: string): string {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length < 1 || !parts[0]) return 'Customer';
  const first = parts[0];
  const masked = first[0] + '\u2022'.repeat(Math.max(first.length - 1, 2));
  return parts.length > 1 ? `${masked} ${parts[parts.length - 1][0]}.` : masked;
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function WasherJobPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [customer, setCustomer] = useState<Profile | null>(null);
  const [photos, setPhotos] = useState<BookingPhoto[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);

  // Send washer GPS while en_route/arrived/washing + update local state for map
  useEffect(() => {
    if (!booking || !['en_route', 'arrived', 'washing'].includes(booking.status)) return;
    if (!navigator.geolocation) return;
    let active = true;
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        if (!active) return;
        const { latitude: lat, longitude: lng } = pos.coords;
        setMyLat(lat);
        setMyLng(lng);
        try {
          await fetch('/api/washer/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng }),
          });
        } catch { /* silently fail */ }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    return () => { active = false; navigator.geolocation.clearWatch(watchId); };
  }, [booking?.status, booking?.id]);

  // Also get initial GPS position immediately on load
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLat(pos.coords.latitude);
        setMyLng(pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .eq('id', id)
        .single();

      if (bookingData) {
        setBooking(bookingData);
        const { data: customerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', bookingData.customer_id)
          .single();
        if (customerData) setCustomer(customerData);

        const { data: photosData } = await supabase
          .from('booking_photos')
          .select('*')
          .eq('booking_id', bookingData.id)
          .order('created_at', { ascending: true });
        if (photosData) setPhotos(photosData);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  // Load signed URLs for photos
  useEffect(() => {
    if (photos.length === 0) return;
    async function loadUrls() {
      const supabase = createClient();
      const urls: Record<string, string> = {};
      for (const photo of photos) {
        if (photoUrls[photo.id]) { urls[photo.id] = photoUrls[photo.id]; continue; }
        const { data } = await supabase.storage
          .from('booking-photos')
          .createSignedUrl(photo.storage_path, 3600);
        if (data?.signedUrl) urls[photo.id] = data.signedUrl;
      }
      setPhotoUrls(urls);
    }
    loadUrls();
  }, [photos]);

  async function handleDeletePhoto(photo: BookingPhoto) {
    setDeleting(photo.id);
    const supabase = createClient();
    await supabase.storage.from('booking-photos').remove([photo.storage_path]);
    const { error } = await supabase.from('booking_photos').delete().eq('id', photo.id);
    if (error) { toast.error('Failed to delete photo'); setDeleting(null); return; }
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    setPhotoUrls((prev) => { const next = { ...prev }; delete next[photo.id]; return next; });
    setDeleting(null);
    toast.success('Photo deleted');
  }

  async function updateStatus(newStatus: string) {
    if (!booking) return;
    if (newStatus === 'completed') {
      const afterPhotos = photos.filter((p) => p.photo_type === 'after');
      if (afterPhotos.length < 5) {
        toast.error(`Upload at least 5 after photos (${afterPhotos.length}/5)`);
        return;
      }
    }
    setUpdating(true);
    const supabase = createClient();
    const timestamps: Record<string, string> = {};
    if (newStatus === 'en_route') timestamps.washer_en_route_at = new Date().toISOString();
    if (newStatus === 'arrived') timestamps.washer_arrived_at = new Date().toISOString();
    if (newStatus === 'washing') timestamps.wash_started_at = new Date().toISOString();
    if (newStatus === 'completed') timestamps.wash_completed_at = new Date().toISOString();

    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, ...timestamps })
      .eq('id', booking.id);

    if (error) { toast.error('Failed to update status'); setUpdating(false); return; }

    toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    setBooking((prev) => prev ? { ...prev, status: newStatus as Booking['status'], ...timestamps } : null);

    if (newStatus === 'completed') {
      try {
        const captureRes = await fetch('/api/bookings/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        });
        if (captureRes.ok) {
          toast.success('Payment captured successfully');
          setBooking((prev) => prev ? { ...prev, payment_status: 'captured', status: 'paid' } : null);
        } else {
          toast.error('Wash completed, but payment capture failed. Admin will handle it.');
        }
      } catch {
        toast.error('Wash completed, but payment capture failed. Admin will handle it.');
      }
    }
    setUpdating(false);
  }

  async function handlePhotoUpload(type: 'before' | 'after', files: FileList | null) {
    if (!files || !booking) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const angles = ['front', 'rear', 'driver_side', 'passenger_side', 'interior'];
    let uploaded = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const angle = angles[photos.filter((p) => p.photo_type === type).length + i] || 'front';
      const path = `${booking.id}/${type}/${crypto.randomUUID()}.jpg`;

      // Compress image before upload (5-10MB → ~200-400KB)
      let blob: Blob;
      try {
        blob = await compressImage(file);
      } catch {
        blob = file;
      }

      const { error: uploadError } = await supabase.storage
        .from('booking-photos')
        .upload(path, blob, { contentType: 'image/jpeg' });
      if (uploadError) { toast.error(`Upload failed: ${uploadError.message}`); continue; }
      const { data: inserted, error: insertError } = await supabase.from('booking_photos').insert({
        booking_id: booking.id,
        washer_id: user.id,
        photo_type: type,
        storage_path: path,
        angle_label: angle,
      }).select().single();
      if (insertError) { toast.error(`Save failed: ${insertError.message}`); continue; }
      if (inserted) {
        const localUrl = URL.createObjectURL(blob);
        setPhotos((prev) => [...prev, inserted]);
        setPhotoUrls((prev) => ({ ...prev, [inserted.id]: localUrl }));
        uploaded++;
      }
    }
    if (uploaded > 0) toast.success(`${uploaded} photo${uploaded > 1 ? 's' : ''} uploaded`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#E23232] animate-spin" />
          <span className="text-foreground/65 text-sm">Loading job...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)]">
        <p className="text-foreground/65">Job not found</p>
      </div>
    );
  }

  const vehicle = booking.vehicles;
  const status = booking.status as StatusKey;
  const currentStatusIdx = STATUS_ORDER.indexOf(status);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.assigned;
  const StatusIcon = config.icon;
  const currentAction = statusFlow.find((s) => s.status === booking.status);
  const beforePhotos = photos.filter((p) => p.photo_type === 'before');
  const afterPhotos = photos.filter((p) => p.photo_type === 'after');
  const maskedCustomerName = customer ? maskName(customer.full_name) : 'Customer';

  /* ─── Photo grid renderer ─── */
  const renderPhotoGrid = (type: 'before' | 'after', list: BookingPhoto[], canUpload: boolean) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-foreground text-sm font-semibold">
          {type === 'before' ? 'Before' : 'After'} Photos
          <span className="text-foreground/65 font-normal ml-1">({list.length}/5)</span>
        </p>
        {canUpload && list.length < 5 && (
          <div className="flex items-center gap-1.5">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhotoUpload(type, e.target.files)}
              />
              <span className="flex items-center gap-1.5 text-[#E23232] text-xs font-medium px-3 py-1.5 rounded-full bg-[#E23232]/10 border border-[#E23232]/20 hover:border-[#E23232]/40 transition-colors">
                <Camera className="w-3 h-3" /> Camera
              </span>
            </label>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handlePhotoUpload(type, e.target.files)}
              />
              <span className="flex items-center gap-1.5 text-foreground/60 text-xs font-medium px-3 py-1.5 rounded-full bg-foreground/[0.05] border border-border hover:border-foreground/20 transition-colors">
                <ImagePlus className="w-3 h-3" /> Gallery
              </span>
            </label>
          </div>
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }, (_, i) => {
          const photo = list[i];
          const url = photo ? photoUrls[photo.id] : null;
          return (
            <div key={photo?.id || `empty-${type}-${i}`} className="relative aspect-square">
              {photo && url ? (
                <>
                  <img src={url} alt={photo.angle_label || type} className="w-full h-full object-cover rounded-xl border-2 border-green-500/30" />
                  {canUpload && (
                    <button
                      onClick={() => handleDeletePhoto(photo)}
                      disabled={deleting === photo.id}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      {deleting === photo.id
                        ? <Loader2 className="w-3 h-3 text-white animate-spin" />
                        : <X className="w-3 h-3 text-white" />}
                    </button>
                  )}
                  <span className="absolute bottom-1 left-1 text-[8px] font-medium text-white bg-black/60 px-1.5 py-0.5 rounded">
                    {['Front', 'Rear', 'Left', 'Right', 'Int'][i]}
                  </span>
                </>
              ) : photo ? (
                <div className="w-full h-full rounded-xl border-2 border-green-500/30 bg-green-500/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-green-600 dark:text-green-400 animate-spin" />
                </div>
              ) : (
                <div className="w-full h-full rounded-xl border-2 border-dashed border-border bg-card flex items-center justify-center text-[10px] font-medium text-foreground/50">
                  {['F', 'R', 'L', 'R', 'Int'][i]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ─── Timeline renderer ─── */
  const renderTimeline = () => (
    <div className="space-y-0">
      {STATUS_ORDER.map((s, i) => {
        const isPast = i < currentStatusIdx;
        const isCurrent = i === currentStatusIdx;
        const stepConfig = STATUS_CONFIG[s];
        const StepIcon = stepConfig.icon;
        const timestamp =
          s === 'assigned' ? booking.washer_assigned_at :
          s === 'en_route' ? booking.washer_en_route_at :
          s === 'arrived' ? booking.washer_arrived_at :
          s === 'washing' ? booking.wash_started_at :
          s === 'completed' ? booking.wash_completed_at :
          s === 'paid' ? booking.payment_captured_at : null;
        return (
          <div key={s} className="flex items-start gap-2.5">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                isPast ? 'bg-green-500/15' : isCurrent ? stepConfig.bgColor : 'bg-foreground/[0.04]'
              )}>
                {isPast ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-500" /> :
                 isCurrent ? <StepIcon className={cn('w-3.5 h-3.5', stepConfig.color)} /> :
                 <Circle className="w-3.5 h-3.5 text-foreground/15" />}
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div className={cn('w-0.5 h-6', isPast ? 'bg-green-500/20' : 'bg-foreground/[0.05]')} />
              )}
            </div>
            <div className="flex-1 flex items-start justify-between pt-1 pb-3">
              <span className={cn('text-[13px]',
                isPast ? 'text-foreground/65' : isCurrent ? 'text-foreground font-medium' : 'text-foreground/50'
              )}>{stepConfig.label}</span>
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

  /* ─── Job details renderer ─── */
  const renderJobDetails = () => (
    <div className="space-y-3 text-[13px]">
      <div className="flex items-center gap-2.5">
        <Car className="w-3.5 h-3.5 text-foreground/65 shrink-0" />
        <span className="text-foreground/60">{vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.type.replace('_', ' ')})</span>
      </div>
      <div className="flex items-start gap-2.5">
        <MapPin className="w-3.5 h-3.5 text-foreground/65 shrink-0 mt-0.5" />
        <span className="text-foreground/60 leading-snug">{booking.service_address}</span>
      </div>
      {booking.location_notes && (
        <div className="ml-6 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <p className="text-amber-600/80 dark:text-amber-400/80 text-xs">{booking.location_notes}</p>
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <Clock className="w-3.5 h-3.5 text-foreground/65 shrink-0" />
        <span className="text-foreground/60">~{formatDuration(booking.estimated_duration_min || 0)} · Dirt level {booking.dirt_level}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-500 shrink-0" />
        <span className="text-green-600 dark:text-green-500 font-semibold">You earn {centsToDisplay(booking.washer_payout)}</span>
      </div>
      <div className="border-t border-border pt-3">
        <a
          href={`https://maps.google.com/maps/dir/?api=1&destination=${booking.service_lat},${booking.service_lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[#E23232] text-xs hover:text-[#E23232]/80 transition-colors font-medium"
        >
          <Navigation className="w-3 h-3" /> Open in Google Maps
        </a>
      </div>
    </div>
  );

  return (
    <div className="relative h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] overflow-hidden">

      {/* ═══ FULL-SCREEN MAP ═══ */}
      <div className="absolute inset-0 z-0">
        <JobFullMap
          serviceLat={booking.service_lat}
          serviceLng={booking.service_lng}
          serviceAddress={booking.service_address}
          washerLat={myLat}
          washerLng={myLng}
          status={booking.status}
          className="w-full h-full"
        />
      </div>

      {/* ═══ DESKTOP: Multi-panel layout (lg+) ═══ */}
      <div className={cn(
        "hidden lg:flex absolute z-10 top-0 left-0 bottom-0 transition-all duration-300",
        chatOpen ? "w-[1180px]" : "w-[840px]"
      )}>
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl border-r border-border" />

        <div className="relative z-10 flex w-full h-full">

          {/* ── LEFT COL: Job details + customer ── */}
          <div className="w-[300px] flex flex-col h-full border-r border-border shrink-0">
            <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/washer/jobs')}
                  className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center hover:bg-foreground/[0.10] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-foreground/60" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-[15px]">{PLAN_LABELS[booking.wash_plan]}</p>
                  <p className="text-foreground/65 text-[10px] font-mono">#{booking.id.slice(0, 8)}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/65 mb-4">Job Details</p>
                {renderJobDetails()}
              </div>

              {/* Customer card */}
              {customer && (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/65 mb-3">Customer</p>
                  <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border">
                        <User className="w-4 h-4 text-foreground/65" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-semibold">{maskedCustomerName}</p>
                        <p className="text-foreground/65 text-xs mt-0.5">
                          {customer.email ? customer.email[0] + '\u2022\u2022\u2022@' + customer.email.split('@')[1] : ''}
                        </p>
                      </div>
                      {['assigned', 'en_route', 'arrived', 'washing'].includes(status) && (
                        <button
                          onClick={() => setChatOpen(true)}
                          className="w-9 h-9 rounded-xl bg-[#E23232]/10 border border-[#E23232]/20 flex items-center justify-center hover:bg-[#E23232]/15 transition-colors shrink-0"
                        >
                          <MessageCircle className="w-4 h-4 text-[#E23232]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chat CTA */}
                  {['assigned', 'en_route', 'arrived', 'washing'].includes(status) && (
                    <button
                      onClick={() => setChatOpen(true)}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#E23232]/10 border border-[#E23232]/20 hover:bg-[#E23232]/15 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#E23232]" />
                      <span className="text-[#E23232] text-sm font-semibold">Chat with Customer</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action button in footer */}
            <div className="px-5 py-4 border-t border-border shrink-0">
              {currentAction && (
                <Button
                  onClick={() => updateStatus(currentAction.action)}
                  disabled={updating || (currentAction.action === 'completed' && afterPhotos.length < 5)}
                  className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold py-6 text-sm rounded-xl"
                >
                  {updating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                  ) : (
                    <>
                      <currentAction.icon className="w-4 h-4 mr-2" />
                      {currentAction.label}
                      {currentAction.action === 'completed' && afterPhotos.length < 5 && (
                        <span className="ml-2 text-xs opacity-60">({afterPhotos.length}/5 photos)</span>
                      )}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* ── RIGHT COL: Status, photos, timeline ── */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            <div className="px-6 pt-5 pb-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground font-semibold text-xl leading-tight">Job Progress</h2>
                <Badge className={cn('text-[10px] font-medium', config.bgColor,
                  config.color, 'border-border'
                )}>
                  {config.label}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Status hero */}
              <div className={cn('flex items-center gap-3 p-4 rounded-xl border', config.bgColor, 'border-border')}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bgColor)}>
                  <StatusIcon className={cn('w-5 h-5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[15px] font-semibold', config.color)}>{config.label}</p>
                  <p className="text-foreground/50 text-xs mt-0.5 leading-snug">{config.description}</p>
                </div>
              </div>

              {/* Photos */}
              {['arrived', 'washing', 'completed', 'paid'].includes(status) && (
                <div className="space-y-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/65">Photos</p>
                  <div className="bg-foreground/[0.03] border border-border rounded-xl p-4 space-y-4">
                    {renderPhotoGrid('before', beforePhotos, status === 'arrived')}
                    <div className="border-t border-border" />
                    {renderPhotoGrid('after', afterPhotos, status === 'washing')}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-foreground/65 mb-3">Timeline</p>
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-4">
                  {renderTimeline()}
                </div>
              </div>
            </div>
          </div>

          {/* ── THIRD COL: Chat (desktop, inline) ── */}
          {chatOpen && customer && currentUserId && (
            <div className="w-[340px] flex flex-col h-full border-l border-border shrink-0 bg-card">
              <BookingChat
                bookingId={booking.id}
                currentUserId={currentUserId}
                otherPersonName={maskedCustomerName}
                open={chatOpen}
                onClose={() => setChatOpen(false)}
                role="washer"
                inline
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigate badge on map (desktop) */}
      <div className="hidden lg:block absolute top-4 right-8 z-10">
        <a
          href={`https://maps.google.com/maps/dir/?api=1&destination=${booking.service_lat},${booking.service_lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-5 py-3 rounded-full backdrop-blur-md hover:scale-105 transition-transform"
          style={{ background: 'rgba(5, 5, 5, 0.85)', border: '1px solid rgba(226, 50, 50, 0.3)' }}
        >
          <Navigation className="w-4 h-4 text-[#E23232]" />
          <span className="text-foreground text-sm font-medium">Navigate</span>
        </a>
      </div>

      {/* ═══ MOBILE: Bottom sheet (below lg) ═══ */}
      <div className="lg:hidden absolute inset-x-0 bottom-0 z-10">
        <div className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="bg-background border-t border-border rounded-t-2xl max-h-[72dvh] flex flex-col">
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-foreground/15" />
          </div>

          {/* Mobile header */}
          <div className="px-5 pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/washer/jobs')}
                className="w-8 h-8 rounded-full bg-foreground/[0.06] flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-foreground/60" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-base">{PLAN_LABELS[booking.wash_plan]}</p>
                <p className="text-foreground/65 text-[10px] font-mono">#{booking.id.slice(0, 8)}</p>
              </div>
              <Badge className={cn('text-[10px] font-medium shrink-0', config.bgColor, config.color, 'border-border')}>
                {config.label}
              </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 pb-2">
            {/* Status hero */}
            <div className="px-5 pt-2 pb-3">
              <div className={cn('flex items-center gap-3 p-3.5 rounded-xl border', config.bgColor, 'border-border')}>
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', config.bgColor)}>
                  <StatusIcon className={cn('w-4.5 h-4.5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', config.color)}>{config.label}</p>
                  <p className="text-foreground/50 text-[11px] mt-0.5">{config.description}</p>
                </div>
              </div>
            </div>

            {/* Customer (mobile) */}
            {customer && (
              <div className="px-5 pb-3">
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border">
                      <User className="w-4 h-4 text-foreground/65" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-semibold">{maskedCustomerName}</p>
                      <p className="text-foreground/65 text-xs">
                        {customer.email ? customer.email[0] + '\u2022\u2022\u2022@' + customer.email.split('@')[1] : ''}
                      </p>
                    </div>
                    {['assigned', 'en_route', 'arrived', 'washing'].includes(status) && (
                      <button
                        onClick={() => setChatOpen(true)}
                        className="w-9 h-9 rounded-lg bg-[#E23232]/10 border border-[#E23232]/20 flex items-center justify-center"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#E23232]" />
                      </button>
                    )}
                  </div>

                  {/* Chat CTA */}
                  {['assigned', 'en_route', 'arrived', 'washing'].includes(status) && (
                    <button
                      onClick={() => setChatOpen(true)}
                      className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#E23232]/10 border border-[#E23232]/20 hover:bg-[#E23232]/15 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#E23232]" />
                      <span className="text-[#E23232] text-sm font-semibold">Chat with Customer</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Photos (mobile) */}
            {['arrived', 'washing', 'completed', 'paid'].includes(status) && (
              <div className="px-5 pb-3">
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5 space-y-3">
                  {renderPhotoGrid('before', beforePhotos, status === 'arrived')}
                  <div className="border-t border-border" />
                  {renderPhotoGrid('after', afterPhotos, status === 'washing')}
                </div>
              </div>
            )}

            {/* Job Details (collapsible mobile) */}
            <div className="px-5 pb-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between py-2.5 text-foreground/65"
              >
                <span className="text-[10px] font-medium uppercase tracking-wider">Job Details</span>
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showDetails && (
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5">
                  {renderJobDetails()}
                </div>
              )}
            </div>

            {/* Timeline (collapsible mobile) */}
            <div className="px-5 pb-2">
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className="w-full flex items-center justify-between py-2.5 text-foreground/65"
              >
                <span className="text-[10px] font-medium uppercase tracking-wider">Timeline</span>
                {showTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showTimeline && (
                <div className="bg-foreground/[0.03] border border-border rounded-xl p-3.5">
                  {renderTimeline()}
                </div>
              )}
            </div>
          </div>

          {/* Mobile action button */}
          <div className="px-5 py-3 border-t border-border shrink-0">
            {currentAction && (
              <Button
                onClick={() => updateStatus(currentAction.action)}
                disabled={updating || (currentAction.action === 'completed' && afterPhotos.length < 5)}
                className="w-full bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold py-6 text-sm rounded-xl"
              >
                {updating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                ) : (
                  <>
                    <currentAction.icon className="w-4 h-4 mr-2" />
                    {currentAction.label}
                    {currentAction.action === 'completed' && afterPhotos.length < 5 && (
                      <span className="ml-2 text-xs opacity-60">({afterPhotos.length}/5 photos)</span>
                    )}
                  </>
                )}
              </Button>
            )}
          </div>

          <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>

      {/* ═══ Chat — mobile only (desktop uses inline panel) ═══ */}
      <div className="lg:hidden">
        {customer && currentUserId && ['assigned', 'en_route', 'arrived', 'washing'].includes(status) && (
          <BookingChat
            bookingId={booking.id}
            currentUserId={currentUserId}
            otherPersonName={maskedCustomerName}
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            role="washer"
          />
        )}
      </div>
    </div>
  );
}
