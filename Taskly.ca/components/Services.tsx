'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

export function Services() {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const services = [
    {
      id: '01',
      name: 'CLEANING',
      description: 'Standard \u00b7 Deep \u00b7 Move-in/out',
      price: 'From $99',
      image: '/assets/CLEANING.jpg',
    },
    {
      id: '02',
      name: 'EMERGENCY',
      description: 'Plumbing \u00b7 Electrical \u00b7 Locks',
      price: '15 min response',
      image: '/assets/EMERGENCY.jpg',
    },
    {
      id: '03',
      name: 'MAINTENANCE',
      description: 'Handyman \u00b7 Painting \u00b7 Assembly',
      price: 'From $75/hr',
      image: '/assets/MAINTENANCE.jpg',
    },
    {
      id: '04',
      name: 'SEASONAL',
      description: 'Snow \u00b7 Lawn \u00b7 Gutters \u00b7 Windows',
      price: 'From $45/visit',
      image: '/assets/SEASONAL.jpg',
    },
  ];

  return (
    <section id="services" className="relative px-6 md:px-16 lg:px-24 py-28 md:py-40 bg-cream-dark text-rich-black max-w-[1600px] mx-auto">
      {/* Gold mesh atmosphere */}
      <div className="absolute inset-0 gold-mesh opacity-40 pointer-events-none" />

      {/* Section Header */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between mb-20 md:mb-28">
        <div>
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-[10px] font-600 uppercase tracking-[0.3em] text-gold mb-6"
            >
              002 &mdash; Services
            </motion.p>
          </div>
          <div className="overflow-hidden">
            <motion.h2
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-display text-[48px] md:text-[88px] leading-[0.88] font-800 tracking-[-0.04em] uppercase"
            >
              Everything<br />you need<span className="text-gold">.</span>
            </motion.h2>
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-8 md:mt-0 max-w-[300px] font-sans text-[13px] font-600 text-rich-black/50 leading-[1.7]"
        >
          One platform. Vetted professionals. Guaranteed quality for every corner of your home.
        </motion.p>
      </div>

      {/* Service List + Image Reveal */}
      <div className="relative flex flex-col md:flex-row gap-12">
        {/* Left: Service Rows */}
        <div className="w-full md:w-[60%] border-t border-border relative z-10">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: index * 0.08 }}
            >
              <Link
                href={`#${service.name.toLowerCase()}`}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
                className="group flex flex-col md:flex-row md:items-center justify-between py-10 md:py-12 border-b border-border hover:border-gold/30 transition-colors duration-500 relative overflow-hidden"
              >
                {/* Hover sweep */}
                <div className="absolute inset-0 bg-gold-muted translate-y-full group-hover:translate-y-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />

                <div className="flex items-baseline gap-6 md:gap-8 z-10">
                  <span className="font-mono text-[10px] font-700 text-warm-gray group-hover:text-gold transition-colors duration-300">
                    {service.id}
                  </span>
                  <div>
                    <h3 className="font-display text-[36px] md:text-[56px] font-800 tracking-[-0.03em] uppercase group-hover:text-gold transition-colors duration-400">
                      {service.name}
                    </h3>
                    <p className="font-mono text-[10px] font-600 uppercase tracking-[0.15em] text-rich-black/45 mt-1.5">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-5 z-10">
                  <span className="font-mono text-[11px] font-600 uppercase tracking-[0.1em] text-rich-black">
                    {service.price}
                  </span>
                  <span className="text-gold text-xl group-hover:translate-x-3 transition-transform duration-400">
                    &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right: Sticky Image Reveal — Grainy noise reveal effect */}
        <div className="hidden md:block w-[40%] h-[600px] sticky top-32 overflow-hidden bg-cream-dark border border-border relative">
          {/* Noise texture overlay — always visible on the container */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.08] mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 512 512%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')] bg-repeat bg-[length:256px_256px]" style={{ animation: 'grain 0.3s steps(1) infinite' }} />

          <AnimatePresence mode="wait">
            {hoveredService ? (
              <motion.div
                key={hoveredService}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0"
              >
                {/* Image with grainy reveal animation */}
                <div className="absolute inset-0 animate-noise-reveal">
                  <Image
                    src={services.find((s) => s.id === hoveredService)?.image || ''}
                    fill
                    className="object-cover"
                    alt="Service preview"
                  />
                </div>

                {/* Scan lines overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                  }}
                />

                {/* Gold tint overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-rich-black/30 via-transparent to-gold/[0.05] z-10" />

                {/* Service label on image */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="absolute bottom-6 left-6 z-20"
                >
                  <span className="font-mono text-[8px] font-700 uppercase tracking-[0.25em] text-cream/70 bg-rich-black/60 backdrop-blur-sm px-3 py-1.5">
                    {services.find((s) => s.id === hoveredService)?.name}
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border border-border flex items-center justify-center">
                    <span className="font-mono text-[18px] text-warm-gray/30">&larr;</span>
                  </div>
                  <span className="font-mono text-[9px] font-600 uppercase tracking-[0.25em] text-warm-gray">
                    Hover a service
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
