'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { MapPin, Calendar, ChevronDown, Sparkles, AlertTriangle, Wrench, Leaf, Check } from 'lucide-react';

const serviceCategories = [
  { name: 'Cleaning', icon: Sparkles, items: ['Standard Clean', 'Deep Clean', 'Move-in / Move-out'] },
  { name: 'Emergency', icon: AlertTriangle, items: ['Plumbing', 'Electrical', 'Locksmith'] },
  { name: 'Maintenance', icon: Wrench, items: ['Handyman', 'Painting', 'Furniture Assembly'] },
  { name: 'Seasonal', icon: Leaf, items: ['Snow Removal', 'Lawn Care', 'Gutter Cleaning'] },
];

export function Hero() {
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState({
    category: 'Cleaning',
    item: 'Standard Clean',
    icon: Sparkles,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Opening Reveal — Gold Curtain Wipe */}
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1], delay: 0.6 }}
        className="fixed inset-0 z-[100] bg-rich-black origin-top flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="font-display text-[28px] font-800 tracking-tight text-cream">
            taskly<span className="text-gold">.</span>
          </span>
          <div className="w-12 h-[1px] bg-gold/40" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.5em] text-gold/60">
            Reimagining Home
          </span>
        </motion.div>
      </motion.div>

      <section ref={heroRef} className="relative min-h-screen w-full bg-cream overflow-hidden flex flex-col">
        {/* Video Background with parallax */}
        <div className="absolute inset-0 z-0">
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.5, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ y: videoY }}
            className="absolute inset-0"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/hero.mp4" type="video/mp4" />
            </video>
          </motion.div>

          {/* Right side crystal clear, fades to cream on the left for text */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-cream md:via-cream/20 md:to-cream" />
          {/* Extra left text protection layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/60 to-transparent w-[55%]" />
          {/* Bottom fade for booking bar readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent" />
          {/* Subtle top fade for navbar */}
          <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-cream/40 to-transparent" />
        </div>

        {/* Main Content */}
        <motion.div style={{ opacity: contentOpacity }} className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-[100px] pb-[240px] md:pb-[200px] max-w-[1600px] mx-auto w-full">
          {/* Section Tag */}
          <div className="overflow-hidden mb-8">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span className="font-mono text-[10px] font-700 uppercase tracking-[0.3em] text-gold-dark">
                Now in Toronto & GTA
              </span>
            </motion.div>
          </div>

          {/* Massive Headline */}
          <h1 className="font-display leading-[0.82] font-800 tracking-[-0.04em] text-rich-black uppercase max-w-[900px]">
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.3, delay: 2.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15vw] md:text-[9.5vw] lg:text-[140px]"
              >
                Your
              </motion.div>
            </div>
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.3, delay: 2.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15vw] md:text-[9.5vw] lg:text-[140px]"
              >
                Home<span className="text-gold">.</span>
              </motion.div>
            </div>
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.3, delay: 2.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15vw] md:text-[9.5vw] lg:text-[140px]"
              >
                Handled<span className="text-gold">.</span>
              </motion.div>
            </div>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.8 }}
            className="font-sans text-[14px] md:text-[16px] font-600 text-rich-black/70 leading-[1.7] max-w-[440px] mt-10"
          >
            The premium managed marketplace for home services.
            Vetted professionals. Fixed prices. Effortless booking.
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 3.0 }}
            className="flex flex-wrap items-center gap-6 mt-8"
          >
            {[
              'CPIC Verified',
              'Insured to $2M',
              '$10K Protection',
            ].map((badge) => (
              <span key={badge} className="flex items-center gap-2">
                <span className="text-gold text-[11px]">&#10003;</span>
                <span className="font-mono text-[9px] font-700 uppercase tracking-[0.15em] text-rich-black/50">
                  {badge}
                </span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating Booking Bar — Glass card, premium, warm */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 3.0, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-8 left-4 right-4 md:left-12 md:right-12 lg:left-20 lg:right-20 z-30"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-gold/15 shadow-[0_30px_100px_rgba(13,13,13,0.12),0_0_0_1px_rgba(197,164,126,0.1)] max-w-[1600px] mx-auto overflow-visible">
            {/* Main booking row */}
            <div className="flex flex-col md:flex-row items-stretch">
              {/* Service Dropdown */}
              <div
                ref={dropdownRef}
                className="flex-1 relative group cursor-pointer border-b md:border-b-0 md:border-r border-rich-black/[0.06]"
                onClick={() => setIsServiceOpen(!isServiceOpen)}
              >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.06] to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </div>
                <div className="relative px-6 py-6 md:px-8 md:py-8 flex flex-col justify-center">
                  <span className="font-mono text-[8px] font-700 uppercase tracking-[0.25em] text-gold-dark mb-2">
                    What do you need?
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gold/10 flex items-center justify-center">
                        <selectedService.icon className="w-4 h-4 text-gold-dark" />
                      </div>
                      <span className="font-display text-[18px] md:text-[22px] font-800 text-rich-black tracking-[-0.02em]">
                        {selectedService.item}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-rich-black/30 transition-all duration-500 ${isServiceOpen ? 'rotate-180 text-gold-dark' : 'group-hover:text-gold-dark'}`} />
                  </div>
                </div>

                <AnimatePresence>
                  {isServiceOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                      className="absolute bottom-full left-0 w-full md:w-[380px] bg-white shadow-[0_-20px_60px_rgba(13,13,13,0.15)] border border-border mb-2 z-50 max-h-[50vh] overflow-y-auto scrollbar-hide"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-2">
                        {serviceCategories.map((category) => (
                          <div key={category.name} className="mb-1 last:mb-0">
                            <div className="px-6 py-3 flex items-center gap-2 border-b border-rich-black/[0.04]">
                              <category.icon className="w-3.5 h-3.5 text-gold-dark" />
                              <span className="font-mono text-[8px] font-700 uppercase tracking-[0.25em] text-warm-gray">
                                {category.name}
                              </span>
                            </div>
                            {category.items.map((item) => (
                              <button
                                key={item}
                                onClick={() => {
                                  setSelectedService({ category: category.name, item, icon: category.icon });
                                  setIsServiceOpen(false);
                                }}
                                className="w-full text-left px-6 py-3.5 hover:bg-gold/[0.04] transition-colors flex items-center justify-between group/item"
                              >
                                <span className={`font-sans text-[15px] font-600 transition-colors ${selectedService.item === item ? 'text-gold-dark' : 'text-rich-black group-hover/item:text-gold-dark'}`}>
                                  {item}
                                </span>
                                {selectedService.item === item && <Check className="w-4 h-4 text-gold-dark" />}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Address Input */}
              <div className="flex-[1.5] relative group border-b md:border-b-0 md:border-r border-rich-black/[0.06]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.06] to-transparent translate-y-full group-focus-within:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </div>
                <div className="relative px-6 py-6 md:px-8 md:py-8 flex flex-col justify-center">
                  <span className="font-mono text-[8px] font-700 uppercase tracking-[0.25em] text-gold-dark mb-2">
                    Where is the service?
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-gold-dark" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your address..."
                      className="bg-transparent border-none outline-none font-display text-[18px] md:text-[22px] font-800 text-rich-black placeholder:text-rich-black/25 w-full tracking-[-0.02em]"
                    />
                  </div>
                </div>
              </div>

              {/* Date/Time */}
              <div className="flex-1 relative group cursor-pointer border-b md:border-b-0 border-rich-black/[0.06]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.06] to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </div>
                <div className="relative px-6 py-6 md:px-8 md:py-8 flex flex-col justify-center">
                  <span className="font-mono text-[8px] font-700 uppercase tracking-[0.25em] text-gold-dark mb-2">
                    When do you need it?
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gold/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gold-dark" />
                      </div>
                      <span className="font-display text-[18px] md:text-[22px] font-800 text-rich-black tracking-[-0.02em]">ASAP</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-rich-black/30 group-hover:text-gold-dark transition-colors duration-300" />
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="relative overflow-hidden bg-rich-black text-cream px-8 py-6 md:px-12 md:py-8 group flex items-center justify-center gap-4 min-w-[160px] md:min-w-[200px]">
                <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10 font-display text-[18px] md:text-[20px] font-800 uppercase tracking-[-0.01em] group-hover:text-rich-black transition-colors duration-500">
                  Book Now
                </span>
                <span className="relative z-10 text-[20px] group-hover:text-rich-black group-hover:translate-x-1 transition-all duration-500">
                  &rarr;
                </span>
              </button>
            </div>

            {/* Bottom info strip */}
            <div className="flex items-center justify-between px-6 md:px-8 py-3 border-t border-rich-black/[0.04] bg-gold/[0.03]">
              <div className="flex items-center gap-4">
                {['No payment until complete', 'Free cancellation 24h before', 'CPIC verified pros'].map((text, i) => (
                  <span key={i} className="font-mono text-[8px] font-600 uppercase tracking-[0.15em] text-warm-gray flex items-center gap-1.5">
                    <span className="text-gold-dark text-[9px]">&#10003;</span>
                    {text}
                  </span>
                ))}
              </div>
              <span className="hidden md:block font-display text-[16px] font-800 text-gold-dark">
                From $99
              </span>
            </div>
          </div>
        </motion.div>

      </section>
    </>
  );
}
