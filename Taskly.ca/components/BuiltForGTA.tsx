'use client';

import { motion } from 'motion/react';
import { Building2, Home, Briefcase, Plane } from 'lucide-react';

const neighborhoods = [
  'King West', 'Liberty Village', 'The Annex', 'Yorkville',
  'Leslieville', 'Queen West', 'North York', 'Midtown',
  'Etobicoke', 'Scarborough', 'Mississauga', 'Brampton',
  'Vaughan', 'Markham', 'Richmond Hill', 'Oakville',
];

const audiences = [
  {
    icon: Building2,
    title: 'Condo Dwellers',
    stat: '30%',
    desc: 'of Toronto lives in condos. We built the booking flow for small spaces, busy schedules, and concierge access.',
  },
  {
    icon: Home,
    title: 'Homeowners',
    stat: '2.7M',
    desc: 'households in the GTA. From snow removal to deep cleaning, one platform handles your entire property.',
  },
  {
    icon: Briefcase,
    title: 'Property Managers',
    stat: '200+',
    desc: 'units managed per building. Our property portal handles maintenance requests, tenant cleanings, and vendor tracking.',
  },
  {
    icon: Plane,
    title: 'Airbnb Hosts',
    stat: '12K+',
    desc: 'active STR listings in Toronto. Automated turnover cleaning between guests with API integration.',
  },
];

export function BuiltForGTA() {
  return (
    <section className="relative bg-cream text-rich-black py-28 md:py-40 overflow-hidden">
      <div className="absolute inset-0 gold-mesh opacity-30 pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24">
        {/* Section Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span className="font-mono text-[10px] font-700 uppercase tracking-[0.3em] text-gold">
            Built for the GTA
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8"
        >
          <h2 className="font-display text-[44px] md:text-[88px] font-800 leading-[0.88] tracking-[-0.04em] uppercase max-w-[700px]">
            Your neighborhood<span className="text-gold">.</span><br />
            Your people<span className="text-gold">.</span>
          </h2>
          <p className="font-sans text-[13px] font-600 text-warm-gray leading-[1.7] max-w-[300px] pb-3">
            We don&apos;t just serve Toronto. We understand it. Every neighborhood, every building type, every season.
          </p>
        </motion.div>

        {/* Audience Cards — Interactive Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border mb-20">
          {audiences.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-cream p-8 md:p-10 min-h-[320px] flex flex-col justify-between overflow-hidden group cursor-default"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] to-gold/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Giant watermark stat */}
              <div className="absolute -top-2 -right-2 font-display text-[120px] md:text-[140px] font-800 leading-none text-rich-black/[0.03] group-hover:text-gold/[0.08] select-none pointer-events-none transition-colors duration-700">
                {item.stat}
              </div>

              {/* Top */}
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                  className="w-12 h-12 flex items-center justify-center mb-8 bg-rich-black/[0.04] group-hover:bg-rich-black text-gold group-hover:text-cream transition-all duration-500"
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-[44px] md:text-[52px] font-800 tracking-[-0.04em] text-rich-black group-hover:text-gold-dark transition-colors duration-500">
                    {item.stat}
                  </span>
                </div>

                <h3 className="font-display text-[18px] md:text-[20px] font-800 uppercase tracking-[-0.02em] text-rich-black mb-3">
                  {item.title}
                </h3>
              </div>

              {/* Bottom */}
              <div className="relative z-10 pt-5 border-t border-border group-hover:border-gold/20 transition-colors duration-500">
                <p className="font-sans text-[12px] font-500 text-warm-gray group-hover:text-rich-black/60 leading-[1.6] transition-colors duration-500">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Neighborhood Map — Interactive coverage visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-rich-black p-8 md:p-12 overflow-hidden"
        >
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-[120px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono text-[9px] font-700 uppercase tracking-[0.3em] text-green-400/80">
                  Live Coverage
                </span>
              </div>
              <h3 className="font-display text-[28px] md:text-[40px] font-800 tracking-[-0.03em] uppercase text-cream">
                16 Neighborhoods<span className="text-gold">.</span> Growing<span className="text-gold">.</span>
              </h3>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gold" />
                <span className="font-mono text-[8px] font-600 uppercase tracking-[0.2em] text-cream/40">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-cream/20" />
                <span className="font-mono text-[8px] font-600 uppercase tracking-[0.2em] text-cream/40">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Neighborhood pills — flowing layout */}
          <div className="relative z-10 flex flex-wrap gap-2 md:gap-2.5">
            {neighborhoods.map((hood, i) => (
              <motion.div
                key={hood}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="relative bg-gold/[0.08] border border-gold/20 px-5 py-3 md:px-6 md:py-3.5 group cursor-default hover:bg-gold hover:border-gold transition-all duration-400 overflow-hidden"
              >
                {/* Shine sweep on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cream/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <span className="relative z-10 font-display text-[13px] md:text-[15px] font-700 text-cream/80 group-hover:text-rich-black transition-colors duration-400 whitespace-nowrap">
                  {hood}
                </span>
              </motion.div>
            ))}

            {/* Coming soon pills */}
            {['Hamilton', 'Kitchener', 'Ottawa'].map((hood, i) => (
              <motion.div
                key={hood}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="relative border border-dashed border-cream/15 px-5 py-3 md:px-6 md:py-3.5 cursor-default"
              >
                <span className="font-display text-[13px] md:text-[15px] font-700 text-cream/20 whitespace-nowrap">
                  {hood}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Bottom stat strip */}
          <div className="relative z-10 flex flex-wrap items-center gap-8 mt-10 pt-8 border-t border-cream/[0.06]">
            {[
              { val: '7M+', label: 'Population Served' },
              { val: '2.7M', label: 'GTA Households' },
              { val: '15 min', label: 'Avg Response Time' },
              { val: '24/7', label: 'Emergency Coverage' },
            ].map((s, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <span className="font-display text-[22px] md:text-[28px] font-800 text-cream tracking-[-0.02em]">{s.val}</span>
                <span className="font-mono text-[8px] font-600 uppercase tracking-[0.2em] text-cream/30">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
