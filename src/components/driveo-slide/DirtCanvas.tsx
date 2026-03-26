'use client';

import { useState, useEffect, useRef } from 'react';
import { getVehicleImageUrl } from '@/lib/vehicle-image';
import { cn } from '@/lib/utils';
import { Car, Loader2 } from 'lucide-react';

interface DirtCanvasProps {
  make: string;
  model: string;
  year: number;
  color?: string;
  dirtLevel: number; // 0-10
}

/** Fetch a single dirt level from the API (or cache hit). */
async function fetchDirtUrl(
  make: string, model: string, year: number, color: string, level: number
): Promise<string | null> {
  try {
    const res = await fetch('/api/generate-dirty-car', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ make, model, year, color, dirtLevel: level }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

export function DirtCanvas({ make, model, year, color, dirtLevel }: DirtCanvasProps) {
  const cleanUrl = getVehicleImageUrl(make, model, year, {
    angle: 'front-side',
    width: 1000,
    color: color || undefined,
  });

  const [imgSrc, setImgSrc] = useState(cleanUrl);
  const [loading, setLoading] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const [pregenProgress, setPregenProgress] = useState(0); // 0-10
  const cache = useRef<Record<number, string>>({});
  const pregenStarted = useRef(false);

  // Vehicle key for tracking pre-generation
  const vehicleKey = `${make}-${model}-${year}-${color || ''}`;

  // Reset on vehicle change + start parallel pre-generation
  useEffect(() => {
    cache.current = {};
    pregenStarted.current = false;
    setImgSrc(cleanUrl);
    setImgReady(false);
    setPregenProgress(0);

    // Pre-generate ALL 11 levels in parallel
    const colr = color || '';
    let cancelled = false;
    pregenStarted.current = true;

    // Fire all 10 levels (1-10) simultaneously
    const promises = Array.from({ length: 10 }, (_, i) => i + 1).map(async (lvl) => {
      const url = await fetchDirtUrl(make, model, year, colr, lvl);
      if (cancelled) return;
      if (url) {
        cache.current[lvl] = url;
        setPregenProgress(prev => prev + 1);
      }
    });

    // Don't await — let them run in background
    Promise.all(promises);

    return () => { cancelled = true; };
  }, [vehicleKey, cleanUrl, make, model, year, color]);

  // Show the right image when dirt level changes
  useEffect(() => {
    if (dirtLevel === 0) {
      setImgSrc(cleanUrl);
      setLoading(false);
      return;
    }

    // Already cached from pre-generation → show instantly
    if (cache.current[dirtLevel]) {
      setImgSrc(cache.current[dirtLevel]);
      setLoading(false);
      return;
    }

    // Not ready yet — show spinner and poll cache until ready
    setLoading(true);
    const interval = setInterval(() => {
      if (cache.current[dirtLevel]) {
        setImgSrc(cache.current[dirtLevel]);
        setLoading(false);
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [dirtLevel, cleanUrl]);

  const pregenerating = pregenProgress < 10;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-foreground/[0.02] to-foreground/[0.05]"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Car image */}
      <img
        src={imgSrc}
        alt={`${year} ${make} ${model}`}
        className={cn(
          'absolute inset-0 w-full h-full object-contain object-center p-3 transition-opacity duration-300',
          imgReady ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setImgReady(true)}
      />

      {/* Fallback icon */}
      {!imgReady && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="w-16 h-16 text-foreground/[0.06]" />
        </div>
      )}

      {/* Loading spinner for current level */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-background/60 backdrop-blur-sm rounded-full p-2.5">
            <Loader2 className="w-5 h-5 text-[#E23232] animate-spin" />
          </div>
        </div>
      )}

      {/* Pre-generation progress bar (subtle, at top) */}
      {pregenerating && (
        <div className="absolute top-0 left-0 right-0 h-0.5 z-20 bg-foreground/5">
          <div
            className="h-full bg-[#E23232]/60 transition-all duration-500 ease-out"
            style={{ width: `${(pregenProgress / 10) * 100}%` }}
          />
        </div>
      )}

      {/* Dirt level indicator dots */}
      <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 z-10">
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === dirtLevel ? '7px' : '5px',
              height: i === dirtLevel ? '7px' : '5px',
              background: i === dirtLevel
                ? '#E23232'
                : i <= dirtLevel
                  ? 'rgba(226,50,50,0.35)'
                  : 'rgba(128,128,128,0.25)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
