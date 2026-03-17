'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUpRight, Star, MapPin, Sparkles, LocateFixed, Loader2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useCursor } from './CursorProvider';
import { vehiclePrices } from '@/lib/data';

interface Prediction {
  place_id: string;
  description: string;
}

export function HeroSection() {
  const { setIsHovering } = useCursor();
  const [selectedVehicle, setSelectedVehicle] = useState('Sedan');
  const [address, setAddress] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasGoogleMaps = typeof window !== 'undefined' && window.google?.maps?.places;

  useEffect(() => {
    if (hasGoogleMaps) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      const div = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(div);
    }
  }, [hasGoogleMaps]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (hasGoogleMaps) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setAddress(results[0].formatted_address);
            }
          });
        } else {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'Driveo/1.0' } }
            );
            const data = await res.json();
            if (data.display_name) setAddress(data.display_name);
          } catch { /* ignore */ }
        }
      },
      () => { /* permission denied — leave empty */ },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 3) {
      setPredictions([]);
      return;
    }
    autocompleteService.current.getPlacePredictions(
      { input, componentRestrictions: { country: 'ca' }, types: ['address'] },
      (results) => {
        setPredictions(results?.map((r) => ({ place_id: r.place_id, description: r.description })) || []);
      }
    );
  }, []);

  function handleAddressChange(val: string) {
    setAddress(val);
    setShowDropdown(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchPredictions(val), 300);
  }

  function selectPrediction(p: Prediction) {
    setAddress(p.description);
    setShowDropdown(false);
    setPredictions([]);
  }

  function detectLocation() {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (hasGoogleMaps) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            setDetecting(false);
            if (status === 'OK' && results?.[0]) setAddress(results[0].formatted_address);
          });
        } else {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'User-Agent': 'Driveo/1.0' } }
            );
            const data = await res.json();
            if (data.display_name) setAddress(data.display_name);
          } catch { /* ignore */ }
          setDetecting(false);
        }
      },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const { scrollYProgress: heroScroll } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScroll, [0, 1], [0, 300]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pb-20 overflow-hidden -mt-[88px] pt-[88px]">
      {/* Video Background */}
      <motion.div style={{ y: heroY }} className="absolute inset-0 z-0 pointer-events-none">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#050505]/40" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #050505 20%, rgba(5,5,5,0.6) 50%, transparent 70%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #050505 0%, transparent 15%)' }} />
      </motion.div>

      <div className="relative z-10 max-w-[1600px] mx-auto w-full flex flex-col gap-10">
        {/* Social proof */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#E23232] text-[#E23232]" />)}
            <span className="font-mono text-xs text-white/80 uppercase tracking-wider ml-1">4.9 on Google</span>
          </div>
          <span className="text-white/40">|</span>
          <span className="font-mono text-xs text-white/80 uppercase tracking-wider">2,400+ Cars Washed</span>
          <span className="text-white/40">|</span>
          <span className="font-mono text-xs text-white/80 uppercase tracking-wider">$2M Insured</span>
        </motion.div>

        <div className="w-full pt-12">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11vw] sm:text-[9vw] md:text-[8vw] lg:text-[6.5vw] xl:text-[5.5vw] font-display leading-none uppercase tracking-tighter whitespace-nowrap"
          >
            Spotless Car Wash
          </motion.h1>
          <div className="flex items-center gap-4 md:gap-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#E23232] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <motion.h1 initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="text-[12vw] lg:text-[7vw] font-display leading-[0.85] uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "2px white" }}>
              In Your Spot.
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="font-mono text-sm md:text-base text-white/80 uppercase tracking-widest max-w-2xl mt-4">
            Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. No scratches. Ever.
          </motion.p>
        </div>

        {/* Hero Booking Widget */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="w-full max-w-xl border border-white/20 p-8 rounded-3xl backdrop-blur-md bg-black/40" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-4 h-4 text-[#E23232]" />
            <span className="font-mono text-xs text-[#E23232] uppercase tracking-widest">Spring Revival — 20% off your first wash</span>
          </div>
          <div ref={dropdownRef} className="relative border-b border-white/20 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <MapPin className="text-[#E23232] w-6 h-6 shrink-0" />
              <input
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => predictions.length > 0 && setShowDropdown(true)}
                placeholder="WHERE SHOULD WE COME? (ADDRESS)"
                autoComplete="off"
                className="bg-transparent outline-none font-mono text-sm w-full uppercase placeholder:text-white/50 text-white"
              />
              <button
                type="button"
                onClick={detectLocation}
                disabled={detecting}
                className="shrink-0 p-1.5 rounded-full text-white/40 hover:text-[#E23232] transition-colors"
                title="Use my current location"
              >
                {detecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
              </button>
            </div>
            {showDropdown && predictions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl">
                {predictions.map((p) => (
                  <button
                    key={p.place_id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectPrediction(p)}
                    className="w-full px-4 py-3 text-left font-mono text-xs text-white/80 hover:bg-white/10 transition-colors flex items-start gap-3 uppercase tracking-wider"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#E23232]/60 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{p.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.keys(vehiclePrices).map((vehicle) => (
              <button
                key={vehicle}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider rounded-full border transition-all ${selectedVehicle === vehicle ? 'bg-[#E23232] border-[#E23232] text-white' : 'border-white/20 text-white/80 hover:border-white hover:text-white'}`}
              >
                {vehicle}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="font-mono text-xs text-white/70 uppercase tracking-widest block mb-1">Full Wash From</span>
              <span className="font-display text-5xl text-[#E23232] leading-none">${vehiclePrices[selectedVehicle]}</span>
            </div>
            <Link href="/auth/signup" className="bg-[#E23232] text-white font-mono text-xs uppercase tracking-widest px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
              Book Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
