'use client';

import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const marqueeItems = [
  'WE COME TO YOU',
  'CONDO. HOUSE. OFFICE. ANYWHERE.',
  'VETTED & INSURED PROS',
  'FIXED PRICES. NO SURPRISES.',
  'BOOK IN 30 SECONDS',
  '$10K PROPERTY PROTECTION',
];

export function MarqueeBanner() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative bg-gold text-rich-black py-6 md:py-7 overflow-hidden border-y-2 border-gold-dark/20"
    >
      {/* Noise texture on gold */}
      <div className="absolute inset-0 opacity-[0.06] bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')] bg-repeat bg-[length:256px_256px]" />

      <div className="flex">
        {/* Two copies for seamless loop */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex items-center gap-8 md:gap-12 animate-marquee whitespace-nowrap flex-shrink-0 min-w-full"
            aria-hidden={copy === 1}
          >
            {marqueeItems.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-8 md:gap-12">
                <span className="font-display text-[24px] md:text-[36px] font-800 uppercase tracking-[-0.02em] whitespace-nowrap">
                  {item}
                </span>
                <Star className="w-5 h-5 md:w-6 md:h-6 fill-rich-black text-rich-black flex-shrink-0" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </motion.section>
  );
}
