'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
}

interface Prediction {
  place_id: string;
  description: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Enter your address',
  className,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasGoogleMaps = typeof window !== 'undefined' && window.google?.maps?.places;

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Initialize Google Maps services
  useEffect(() => {
    if (hasGoogleMaps) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const div = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(div);
    }
  }, [hasGoogleMaps]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      return;
    }

    autocompleteService.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'ca' },
        types: ['address'],
      },
      (results) => {
        setPredictions(
          results?.map((r) => ({
            place_id: r.place_id,
            description: r.description,
          })) || []
        );
      }
    );
  }, []);

  function handleInputChange(val: string) {
    setInputValue(val);
    setOpen(true);

    // Also update parent with text (lat/lng will be 0 until selection)
    onChange(val, 0, 0);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchPredictions(val), 300);
  }

  function selectPrediction(prediction: Prediction) {
    setInputValue(prediction.description);
    setOpen(false);

    if (placesService.current) {
      placesService.current.getDetails(
        { placeId: prediction.place_id, fields: ['geometry', 'formatted_address'] },
        (place) => {
          if (place?.geometry?.location) {
            onChange(
              place.formatted_address || prediction.description,
              place.geometry.location.lat(),
              place.geometry.location.lng()
            );
          } else {
            onChange(prediction.description, 0, 0);
          }
        }
      );
    } else {
      onChange(prediction.description, 0, 0);
    }
  }

  async function detectLocation() {
    if (!navigator.geolocation) {
      onChange(inputValue, 0, 0);
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try Google reverse geocoding first
        if (hasGoogleMaps) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              setDetecting(false);
              if (status === 'OK' && results?.[0]) {
                const addr = results[0].formatted_address;
                setInputValue(addr);
                onChange(addr, latitude, longitude);
              } else {
                // Fallback: use coordinates
                const addr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                setInputValue(addr);
                onChange(addr, latitude, longitude);
              }
            }
          );
        } else {
          // No Google Maps - use free reverse geocoding
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'Driveo/1.0' } }
            );
            const data = await res.json();
            const addr = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setInputValue(addr);
            onChange(addr, latitude, longitude);
          } catch {
            const addr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setInputValue(addr);
            onChange(addr, latitude, longitude);
          }
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div ref={wrapperRef} className="space-y-3">
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#E23232]/10 flex items-center justify-center pointer-events-none">
          <MapPin className="w-3 h-3 text-[#E23232]" />
        </div>
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn('pl-11 pr-4', className)}
        />
        {open && predictions.length > 0 && (
          <div className="absolute z-50 mt-1.5 w-full max-h-52 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
            {predictions.map((p, i) => (
              <button
                key={p.place_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectPrediction(p)}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm text-foreground/70 hover:bg-[#E23232]/[0.04] hover:text-foreground transition-colors flex items-start gap-3',
                  i !== 0 && 'border-t border-border/50'
                )}
              >
                <div className="w-7 h-7 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-foreground/30" />
                </div>
                <span className="line-clamp-2 leading-snug">{p.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={detectLocation}
        disabled={detecting}
        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-dashed border-foreground/10 hover:border-[#E23232]/30 hover:bg-[#E23232]/[0.03] text-foreground/45 hover:text-[#E23232] text-sm font-medium transition-all disabled:opacity-40"
      >
        {detecting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Detecting location...</>
        ) : (
          <><LocateFixed className="w-4 h-4" /> Use my current location</>
        )}
      </button>
    </div>
  );
}
