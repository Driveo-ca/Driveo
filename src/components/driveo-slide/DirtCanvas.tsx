'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface DirtCanvasProps {
  vehicleId: string;
  vehicleLabel: string;   // used to trigger generation if not cached
  vehicleColor?: string;  // e.g. "Pearl White", defaults to "Pearl White"
  dirtLevel: number;      // 0-10
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function getStorageUrl(vehicleId: string, level: number) {
  return `${SUPABASE_URL}/storage/v1/object/public/dirty-cars/${vehicleId}/level-${level}.jpg`;
}

export function DirtCanvas({ vehicleId, vehicleLabel, vehicleColor, dirtLevel }: DirtCanvasProps) {
  const [aiImages, setAiImages]     = useState<Record<number, string>>({});
  const [loadingLevels, setLoading] = useState<Set<number>>(new Set());
  const triggeredRef = useRef<Set<number>>(new Set());

  // crossfade layers
  const [layerA, setLayerA] = useState<string | null>(null);
  const [layerB, setLayerB] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const prevLevel = useRef<number | null>(null);

  // Attempt to load all 11 levels from Supabase
  useEffect(() => {
    if (!vehicleId) return;

    // Use a cache-bust param so the browser never returns a cached 404
    const bust = `?t=${Date.now()}`;
    for (let lvl = 0; lvl <= 10; lvl++) {
      const url = getStorageUrl(vehicleId, lvl);
      const img = new Image();
      // onload: store the clean URL (no bust) for display
      img.onload = () => setAiImages(prev => ({ ...prev, [lvl]: url }));
      img.onerror = () => {
        // Not cached yet -- request Gemini generation
        if (!triggeredRef.current.has(lvl)) {
          triggeredRef.current.add(lvl);
          setLoading(prev => new Set(prev).add(lvl));
          fetch('/api/generate-dirty-car', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              vehicleId,
              dirtLevel: lvl,
              vehicleLabel,
              vehicleColor: vehicleColor || 'Pearl White',
            }),
          })
            .then(r => r.json())
            .then(data => {
              if (data.url) {
                // Cache-bust so browser fetches the newly generated image
                const img2 = new Image();
                img2.onload = () => setAiImages(prev => ({ ...prev, [lvl]: data.url }));
                img2.src = `${data.url}?t=${Date.now()}`;
              }
            })
            .catch(() => {})
            .finally(() => setLoading(prev => { const s = new Set(prev); s.delete(lvl); return s; }));
        }
      };
      img.src = url + bust;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  // Crossfade when level changes
  useEffect(() => {
    const src = aiImages[dirtLevel];
    if (!src || prevLevel.current === dirtLevel) return;
    prevLevel.current = dirtLevel;

    if (activeLayer === 'A') {
      setLayerB(src);
      setActiveLayer('B');
    } else {
      setLayerA(src);
      setActiveLayer('A');
    }
  }, [dirtLevel, aiImages, activeLayer]);

  // Init first layer
  useEffect(() => {
    const src = aiImages[dirtLevel];
    if (src && !layerA && !layerB) {
      setLayerA(src);
      prevLevel.current = dirtLevel;
    }
  }, [aiImages, dirtLevel, layerA, layerB]);

  const isAIReady    = !!aiImages[dirtLevel];
  const isGenerating = loadingLevels.has(dirtLevel);
  const readyCount   = Object.keys(aiImages).length;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-card"
      style={{ aspectRatio: '16/10' }}>

      {layerA && (
        <img src={layerA} alt="" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: activeLayer === 'A' ? 1 : 0 }} />
      )}
      {layerB && (
        <img src={layerB} alt="" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: activeLayer === 'B' ? 1 : 0 }} />
      )}

      {!isAIReady && !layerA && !layerB && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#E23232] animate-spin" />
          <p className="text-foreground/55 dark:text-foreground/50 text-xs">Generating your car...</p>
        </div>
      )}

      {isGenerating && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
          <Loader2 className="w-3 h-3 text-[#E23232] animate-spin" />
          <span className="text-[10px] text-foreground/60 font-medium">Generating level {dirtLevel}...</span>
        </div>
      )}

      <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: aiImages[i]
                ? i === dirtLevel ? '#E23232' : 'rgba(255,255,255,0.5)'
                : loadingLevels.has(i) ? 'rgba(226,50,50,0.3)' : 'rgba(255,255,255,0.1)',
              transform: i === dirtLevel ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      {readyCount < 11 && readyCount > 0 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <span className="text-[9px] text-foreground/50 dark:text-foreground/20">{readyCount}/11 levels ready</span>
        </div>
      )}
    </div>
  );
}
