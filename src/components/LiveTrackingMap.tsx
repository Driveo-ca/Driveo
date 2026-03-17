'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation, MapPin } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Dark map style (Aubergine / Night variant)                        */
/* ------------------------------------------------------------------ */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#444444' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#0d0d0d' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#111111' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#555555' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f1a0f' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#111111' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#222222' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a1a' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666666' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#111111' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#050510' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#333355' }],
  },
];

/* ------------------------------------------------------------------ */
/*  SVG marker builders                                                */
/* ------------------------------------------------------------------ */
function buildMarkerIcon(color: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z"
            fill="${color}" />
      <circle cx="18" cy="18" r="7" fill="#050505" />
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

const WASHER_ICON_URL = buildMarkerIcon('#E23232');
const SERVICE_ICON_URL = buildMarkerIcon('#ffffff');

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface LiveTrackingMapProps {
  serviceLat: number;
  serviceLng: number;
  washerLat: number | null;
  washerLng: number | null;
  washerName: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Smooth interpolation helper                                        */
/* ------------------------------------------------------------------ */
function animateMarkerTo(
  marker: google.maps.Marker,
  targetLat: number,
  targetLng: number,
  durationMs = 1000,
) {
  const start = marker.getPosition();
  if (!start) {
    marker.setPosition({ lat: targetLat, lng: targetLng });
    return;
  }

  const startLat = start.lat();
  const startLng = start.lng();
  const deltaLat = targetLat - startLat;
  const deltaLng = targetLng - startLng;

  if (Math.abs(deltaLat) < 1e-7 && Math.abs(deltaLng) < 1e-7) return;

  const startTime = performance.now();

  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / durationMs, 1);
    // ease-out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    marker.setPosition({
      lat: startLat + deltaLat * ease,
      lng: startLng + deltaLng * ease,
    });

    if (t < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function LiveTrackingMap({
  serviceLat,
  serviceLng,
  washerLat,
  washerLng,
  washerName,
  status,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const washerMarkerRef = useRef<google.maps.Marker | null>(null);
  const serviceMarkerRef = useRef<google.maps.Marker | null>(null);
  const routeLineRef = useRef<google.maps.Polyline | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

  const [eta, setEta] = useState<string | null>(null);
  const [mapsAvailable, setMapsAvailable] = useState(false);

  /* ---------- Check for google.maps availability ---------- */
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      setMapsAvailable(true);
      return;
    }

    // Poll briefly in case the script loads asynchronously
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.google?.maps) {
        setMapsAvailable(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  /* ---------- Initialize the map once google.maps is ready ---------- */
  useEffect(() => {
    if (!mapsAvailable || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: serviceLat, lng: serviceLng },
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: true,
      styles: DARK_MAP_STYLES,
      backgroundColor: '#050505',
    });

    mapInstanceRef.current = map;
    directionsServiceRef.current = new google.maps.DirectionsService();

    // Service location marker (white)
    serviceMarkerRef.current = new google.maps.Marker({
      position: { lat: serviceLat, lng: serviceLng },
      map,
      icon: {
        url: SERVICE_ICON_URL,
        scaledSize: new google.maps.Size(32, 42),
        anchor: new google.maps.Point(16, 42),
      },
      title: 'Service Location',
    });

    // Route polyline
    routeLineRef.current = new google.maps.Polyline({
      map,
      strokeColor: '#E23232',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      geodesic: true,
    });
  }, [mapsAvailable, serviceLat, serviceLng]);

  /* ---------- Update washer marker & route ---------- */
  const updateRoute = useCallback(
    (wLat: number, wLng: number) => {
      const map = mapInstanceRef.current;
      const directions = directionsServiceRef.current;
      if (!map || !directions) return;

      directions.route(
        {
          origin: { lat: wLat, lng: wLng },
          destination: { lat: serviceLat, lng: serviceLng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, routeStatus) => {
          if (routeStatus === google.maps.DirectionsStatus.OK && result) {
            const leg = result.routes[0]?.legs[0];
            if (leg?.steps) {
              const path: google.maps.LatLng[] = [];
              leg.steps.forEach((step) => {
                step.path.forEach((p) => path.push(p));
              });
              routeLineRef.current?.setPath(path);
            }
            if (leg?.duration?.text) {
              setEta(leg.duration.text);
            }
          }
        },
      );
    },
    [serviceLat, serviceLng],
  );

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || washerLat == null || washerLng == null) return;

    // Create or animate washer marker
    if (!washerMarkerRef.current) {
      washerMarkerRef.current = new google.maps.Marker({
        position: { lat: washerLat, lng: washerLng },
        map,
        icon: {
          url: WASHER_ICON_URL,
          scaledSize: new google.maps.Size(36, 48),
          anchor: new google.maps.Point(18, 48),
        },
        title: washerName,
        zIndex: 10,
      });
    } else {
      animateMarkerTo(washerMarkerRef.current, washerLat, washerLng);
    }

    // Fit bounds to show both markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: serviceLat, lng: serviceLng });
    bounds.extend({ lat: washerLat, lng: washerLng });
    map.fitBounds(bounds, { top: 80, bottom: 80, left: 40, right: 40 });

    // Update route + ETA
    updateRoute(washerLat, washerLng);
  }, [washerLat, washerLng, washerName, serviceLat, serviceLng, updateRoute]);

  /* ---------- Fallback gradient placeholder ---------- */
  if (!mapsAvailable) {
    return (
      <div className="relative h-full w-full min-h-[400px] rounded-2xl overflow-hidden">
        {/* Gradient placeholder */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 30% 40%, #1a0a0a 0%, #050505 60%, #020202 100%)',
          }}
        />

        {/* Animated pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div
              className="absolute -inset-12 rounded-full border border-[#E23232]/10 animate-ping"
              style={{ animationDuration: '3s' }}
            />
            <div
              className="absolute -inset-8 rounded-full border border-[#E23232]/20 animate-ping"
              style={{ animationDuration: '2s' }}
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E23232]/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#E23232]" />
              </div>
              <span className="text-sm text-white/40 font-medium tracking-wide">
                Loading map...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Main render ---------- */
  return (
    <div className="relative h-full w-full min-h-[400px] rounded-2xl overflow-hidden">
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* ETA overlay */}
      {status === 'en_route' && washerLat != null && washerLng != null && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div
            className="flex items-center gap-2.5 px-5 py-3 rounded-full backdrop-blur-md"
            style={{
              background: 'rgba(5, 5, 5, 0.85)',
              border: '1px solid rgba(226, 50, 50, 0.3)',
            }}
          >
            <Navigation className="w-4 h-4 text-[#E23232] animate-pulse" />
            <span className="text-white text-sm font-medium tracking-wide">
              {washerName} is{' '}
              <span className="text-[#E23232] font-bold">
                {eta ?? '...'}
              </span>{' '}
              away
            </span>
          </div>
        </div>
      )}

      {/* Status badge (non en_route) */}
      {status !== 'en_route' && status && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div
            className="px-4 py-2 rounded-full backdrop-blur-md text-white/70 text-xs font-medium uppercase tracking-widest"
            style={{
              background: 'rgba(5, 5, 5, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {status.replace(/_/g, ' ')}
          </div>
        </div>
      )}

      {/* Vignette border for visual polish */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          boxShadow: 'inset 0 0 60px 20px rgba(5, 5, 5, 0.5)',
        }}
      />
    </div>
  );
}
