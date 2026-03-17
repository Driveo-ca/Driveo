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
    <div ref={wrapperRef} className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/30" />
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn('pl-10 pr-10', className)}
        />
        {open && predictions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#0a0a0a] shadow-xl">
            {predictions.map((p) => (
              <button
                key={p.place_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectPrediction(p)}
                className="w-full px-3 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{p.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={detectLocation}
        disabled={detecting}
        className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm"
      >
        {detecting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting location...</>
        ) : (
          <><LocateFixed className="w-4 h-4 mr-2" /> Use my current location</>
        )}
      </Button>
    </div>
  );
}
