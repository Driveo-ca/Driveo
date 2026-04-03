'use client';

import { motion } from 'motion/react';
import { Clock, Ghost, Star, AlertTriangle, X, PhoneOff, Ban, MessageSquareX } from 'lucide-react';

const painPoints = [
  {
    stat: '6.2',
    unit: 'hrs',
    label: 'Average time wasted finding a reliable cleaner in the GTA',
    icon: Clock,
  },
  {
    stat: '43',
    unit: '%',
    label: 'Of Torontonians have been ghosted by a service provider',
    icon: Ghost,
  },
  {
    stat: '3.1',
    unit: '★',
    label: 'Average rating of home service providers on Google',
    icon: Star,
  },
  {
    stat: '$340',
    unit: '',
    label: 'Average cost of damage from unvetted service providers',
    icon: AlertTriangle,
  },
];

const horrorStories = [
  { text: 'Booked a cleaner on Kijiji. They never showed up. No refund.', source: 'Reddit r/Toronto', upvotes: '2.4k' },
  { text: 'The handyman scratched our hardwood floors. No insurance. $1,800 in damage.', source: 'Google Review', upvotes: '847' },
  { text: 'Got quoted $80 on the phone, charged $240 at the door. Zero recourse.', source: 'Reddit r/askTO', upvotes: '1.9k' },
  { text: 'Three different plumbers from HomeStars. Three no-shows in one week.', source: 'Twitter/X', upvotes: '3.1k' },
  { text: 'Found my cleaner going through my drawers on my security camera.', source: 'Reddit r/Toronto', upvotes: '5.7k' },
  { text: 'Hired from Facebook marketplace. They used bleach on my marble counters.', source: 'Google Review', upvotes: '412' },
];

export function TheProblem() {
  return (
    <section className="relative bg-rich-black text-cream py-28 md:py-40 overflow-hidden">
      {/* Red danger ambient glow */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-red-500/[0.04] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-red-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24">
        {/* Section Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span className="font-mono text-[10px] font-700 uppercase tracking-[0.3em] text-red-400/80">
            The Problem
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 md:mb-24"
        >
          <h2 className="font-display text-[44px] md:text-[88px] font-800 leading-[0.88] tracking-[-0.04em] uppercase max-w-[900px]">
            Finding reliable<br />home help shouldn&apos;t<br />feel like{' '}
            <span className="relative inline-block">
              <span className="text-red-400">gambling</span>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-[0.15em] left-0 right-0 h-[3px] bg-red-400/50 origin-left"
              />
            </span>
            <span className="text-gold">.</span>
          </h2>
          <p className="font-sans text-[14px] font-600 text-cream/40 mt-8 max-w-[500px]">
            The GTA home services market is broken. Unvetted providers, surprise pricing, and zero accountability. Sound familiar?
          </p>
        </motion.div>

        {/* Pain Stats — Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-cream/[0.04] mb-20">
          {painPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-rich-black p-8 md:p-10 min-h-[240px] flex flex-col justify-between overflow-hidden group cursor-default"
            >
              {/* Hover red wash */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Watermark number */}
              <div className="absolute -top-2 -right-2 font-display text-[130px] md:text-[150px] font-800 leading-none text-cream/[0.03] group-hover:text-red-400/[0.06] select-none pointer-events-none transition-colors duration-700">
                {point.stat}
              </div>

              {/* Top */}
              <div className="relative z-10">
                <div className="w-10 h-10 flex items-center justify-center bg-cream/[0.04] group-hover:bg-red-500/20 mb-6 transition-colors duration-500">
                  <point.icon className="w-4 h-4 text-cream/30 group-hover:text-red-400 transition-colors duration-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-[48px] md:text-[60px] font-800 tracking-[-0.04em] text-cream group-hover:text-red-400 transition-colors duration-500">
                    {point.stat}
                  </span>
                  <span className="font-display text-[24px] md:text-[32px] font-800 text-red-400/60 group-hover:text-red-400 transition-colors duration-500">
                    {point.unit}
                  </span>
                </div>
              </div>

              {/* Bottom */}
              <div className="relative z-10 pt-5 border-t border-cream/[0.06] group-hover:border-red-400/20 transition-colors duration-500">
                <p className="font-sans text-[12px] font-600 text-cream/40 group-hover:text-cream/60 leading-[1.5] transition-colors duration-500">
                  {point.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Horror Stories — Scrolling wall of real complaints */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-[9px] font-700 uppercase tracking-[0.3em] text-red-400/70">
              Real stories from GTA residents
            </span>
          </div>

          {/* Two-row scrolling horror wall */}
          <div className="space-y-[1px] overflow-hidden">
            {/* Row 1 — scrolls left */}
            <div className="flex overflow-hidden">
              <div className="flex gap-[1px] animate-marquee">
                {[...horrorStories.slice(0, 3), ...horrorStories.slice(0, 3)].map((story, i) => (
                  <div key={i} className="flex-shrink-0 w-[400px] md:w-[500px] bg-cream/[0.03] border-l-2 border-red-500/30 px-7 py-6 group hover:bg-red-500/[0.06] transition-colors duration-500">
                    <p className="font-sans text-[15px] md:text-[16px] font-500 text-cream/90 leading-[1.6] mb-4 group-hover:text-cream transition-colors duration-500">
                      &ldquo;{story.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-600 uppercase tracking-[0.15em] text-cream/50">
                        {story.source}
                      </span>
                      <span className="font-mono text-[9px] font-700 text-red-400/80 flex items-center gap-1">
                        &#9650; {story.upvotes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 — scrolls right (reverse) */}
            <div className="flex overflow-hidden">
              <div className="flex gap-[1px] animate-marquee [animation-direction:reverse] [animation-duration:50s]">
                {[...horrorStories.slice(3), ...horrorStories.slice(3)].map((story, i) => (
                  <div key={i} className="flex-shrink-0 w-[400px] md:w-[500px] bg-cream/[0.03] border-l-2 border-red-500/30 px-7 py-6 group hover:bg-red-500/[0.06] transition-colors duration-500">
                    <p className="font-sans text-[15px] md:text-[16px] font-500 text-cream/90 leading-[1.6] mb-4 group-hover:text-cream transition-colors duration-500">
                      &ldquo;{story.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-600 uppercase tracking-[0.15em] text-cream/50">
                        {story.source}
                      </span>
                      <span className="font-mono text-[9px] font-700 text-red-400/80 flex items-center gap-1">
                        &#9650; {story.upvotes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-display text-[28px] md:text-[44px] font-800 tracking-[-0.03em] uppercase text-cream">
            There&apos;s a better way<span className="text-gold">.</span>
          </p>
          <p className="font-sans text-[13px] font-500 text-cream/30 mt-3">
            Keep scrolling.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
