'use client';

import { MapPin, Camera, Zap, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease },
  },
};

export function USPGrid() {
  return (
    <section className="py-28 px-6 border-b border-white/10 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[#E23232]/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] bg-[#E23232]/[0.04] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] mb-4"
          >
            Why DRIVEO is different
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl lg:text-6xl font-display uppercase leading-[0.95]"
          >
            Built <span className="text-[#E23232]">different</span>
          </motion.h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          {[
            { Icon: MapPin, title: "We Come To You", sub: <>Condo underground<br />Driveway &middot; Office lot</> },
            { Icon: Camera, title: "Photo Proof", sub: <>Before &amp; after shots<br />on every single wash</> },
            { Icon: Zap, title: "Book in 30 Seconds", sub: <>No phone tag<br />No callbacks</> },
            { Icon: RefreshCw, title: "Plans That Make Sense", sub: <>Real subscriptions<br />Cancel anytime</> },
            { Icon: ShieldCheck, title: "Satisfaction Guaranteed", sub: <>Not happy? We&apos;ll<br />make it right — free</> },
          ].map(({ Icon, title, sub }, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group flex flex-col items-center text-center gap-5 p-8 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 hover:border-[#E23232]/40 transition-all duration-500 hover:shadow-lg hover:shadow-[#E23232]/5"
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <motion.div
                className="w-16 h-16 rounded-2xl border border-[#E23232]/25 flex items-center justify-center shrink-0 bg-[#E23232]/10 group-hover:bg-[#E23232]/20 group-hover:border-[#E23232]/50 transition-all duration-400 relative"
                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
              >
                <Icon className="w-7 h-7 text-[#E23232] group-hover:text-[#ff4444] transition-colors duration-300" />
                <div className="absolute inset-0 bg-[#E23232]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
              <div>
                <span className="font-display text-xl uppercase block leading-tight text-white group-hover:text-[#E23232] transition-colors duration-300">{title}</span>
                <span className="font-mono text-[12px] text-white/70 uppercase tracking-wider mt-2.5 block leading-relaxed group-hover:text-white/90 transition-colors duration-300">{sub}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
