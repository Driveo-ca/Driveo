'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, DollarSign, MapPin, Camera, Star } from 'lucide-react';

const usps = [
  {
    icon: ShieldCheck,
    title: '10-Layer Trust',
    sub: 'CPIC background checks, $2M insurance, trade verification. No shortcuts.',
    stat: '10',
    statLabel: 'Security Layers',
    accent: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: Clock,
    title: '30-Second Booking',
    sub: 'Pick a service, enter your address, confirm. Your pro is auto-matched instantly.',
    stat: '30s',
    statLabel: 'Average Book Time',
    accent: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    icon: DollarSign,
    title: 'Fixed Pricing',
    sub: 'Know the exact cost before you book. No surprise invoices. No hidden fees. Ever.',
    stat: '$0',
    statLabel: 'Hidden Fees',
    accent: 'from-emerald-500/20 to-green-500/10',
  },
  {
    icon: MapPin,
    title: 'Live GPS Tracking',
    sub: 'Watch your professional approach in real-time. Know exactly when they arrive.',
    stat: 'Live',
    statLabel: 'Real-Time Updates',
    accent: 'from-violet-500/20 to-purple-500/10',
  },
  {
    icon: Camera,
    title: 'Before/After Proof',
    sub: 'Every job documented with photos. See exactly what was done. Full accountability.',
    stat: '100%',
    statLabel: 'Jobs Documented',
    accent: 'from-rose-500/20 to-pink-500/10',
  },
  {
    icon: Star,
    title: 'Satisfaction Guarantee',
    sub: "Not happy? We re-do it free within 48 hours. Or full refund. Your call.",
    stat: '48h',
    statLabel: 'Free Re-Do Window',
    accent: 'from-gold/30 to-gold/10',
  },
];

export function WhyTaskly() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative bg-cream-dark text-rich-black py-28 md:py-40 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gold/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span className="font-mono text-[10px] font-700 uppercase tracking-[0.3em] text-gold">
            Why Taskly
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <h2 className="font-display text-[44px] md:text-[88px] font-800 leading-[0.88] tracking-[-0.04em] uppercase max-w-[700px]">
            Not another<br />directory<span className="text-gold">.</span>
          </h2>
          <p className="font-sans text-[13px] font-600 text-warm-gray leading-[1.7] max-w-[300px] pb-3">
            HomeStars, Kijiji, TaskRabbit — they connect you and hope for the best. We manage the entire experience.
          </p>
        </motion.div>

        {/* USP Grid — Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
          {usps.map((usp, i) => {
            const isHovered = hoveredIndex === i;
            const isAnyHovered = hoveredIndex !== null;
            const isDimmed = isAnyHovered && !isHovered;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative bg-cream-dark p-8 md:p-10 min-h-[280px] md:min-h-[320px] flex flex-col justify-between overflow-hidden cursor-default transition-all duration-700 ${
                  isDimmed ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${usp.accent} transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                {/* Watermark stat */}
                <div className={`absolute top-4 right-6 font-display text-[100px] md:text-[130px] font-800 leading-none select-none pointer-events-none transition-all duration-700 ${
                  isHovered ? 'text-rich-black/[0.08] scale-105' : 'text-rich-black/[0.025]'
                }`}>
                  {usp.stat}
                </div>

                {/* Top — Icon */}
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                    className={`w-12 h-12 flex items-center justify-center mb-6 transition-all duration-500 ${
                      isHovered ? 'bg-rich-black text-cream' : 'bg-rich-black/[0.04] text-gold'
                    }`}
                  >
                    <usp.icon className="w-5 h-5" />
                  </motion.div>

                  <h3 className={`font-display text-[22px] md:text-[26px] font-800 uppercase tracking-[-0.02em] mb-3 transition-colors duration-500 ${
                    isHovered ? 'text-rich-black' : 'text-rich-black'
                  }`}>
                    {usp.title}
                  </h3>

                  <p className={`font-sans text-[13px] font-500 leading-[1.65] max-w-[280px] transition-colors duration-500 ${
                    isHovered ? 'text-rich-black/70' : 'text-warm-gray'
                  }`}>
                    {usp.sub}
                  </p>
                </div>

                {/* Bottom — Stat label */}
                <div className={`relative z-10 flex items-center justify-between mt-8 pt-5 border-t transition-colors duration-500 ${
                  isHovered ? 'border-rich-black/10' : 'border-border'
                }`}>
                  <span className={`font-mono text-[9px] font-700 uppercase tracking-[0.2em] transition-colors duration-500 ${
                    isHovered ? 'text-rich-black/50' : 'text-warm-gray/60'
                  }`}>
                    {usp.statLabel}
                  </span>
                  <span className={`font-display text-[20px] font-800 transition-colors duration-500 ${
                    isHovered ? 'text-rich-black' : 'text-rich-black/20'
                  }`}>
                    {usp.stat}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
