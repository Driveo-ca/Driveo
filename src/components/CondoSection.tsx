'use client';

import { Droplets, MapPin, Camera, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildings } from '@/lib/data';
import { useCountUp } from '@/lib/useCountUp';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const featureVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease },
  },
};

const buildingVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease },
  },
};

export function CondoSection() {
  const { count: washCount, ref: washRef } = useCountUp(500, 2000);

  return (
    <section className="py-16 md:py-32 px-6 md:px-12 border-b border-white/10 relative">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-10 md:gap-20 items-center">
        {/* Left — text content slides from left */}
        <motion.div
          className="lg:w-1/2"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-mono text-xs text-[#E23232] uppercase tracking-widest mb-6 block"
          >
            Toronto&apos;s #1 condo car wash problem, solved
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-7xl lg:text-8xl font-display uppercase leading-[0.9] mb-6 md:mb-10"
          >
            Live In A Condo?<br /><span className="text-[#E23232]">We Built This<br />For You.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-serif italic text-xl md:text-2xl text-white/80 leading-relaxed mb-10 max-w-lg"
          >
            <span className="text-white/90">30% of Toronto homes are condos.</span> Other guys show up with a hose and leave. We show up with waterless products — built for underground parking.
          </motion.p>

          <motion.div
            className="space-y-4 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.12, delayChildren: 0.3 }}
          >
            {[
              { Icon: Droplets, text: "100% waterless — zero building violations" },
              { Icon: MapPin, text: "P1, P2, P3 — we find your car" },
              { Icon: Camera, text: "Done while you work — photos sent" },
            ].map(({ Icon, text }, idx) => (
              <motion.div key={idx} variants={featureVariants} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-[#E23232]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#E23232]" />
                </div>
                <span className="font-mono text-sm uppercase tracking-widest">{text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="font-mono text-xs uppercase tracking-widest border border-[#E23232] text-[#E23232] px-8 py-4 rounded-full hover:bg-[#E23232] hover:text-white transition-all"
          >
            Book a Condo Wash
          </motion.button>
        </motion.div>

        {/* Right — cards slide from right */}
        <motion.div
          className="lg:w-1/2 flex flex-col gap-5"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Hero stat card */}
          <motion.div
            className="bg-gradient-to-br from-[#E23232] to-[#b91c1c] rounded-3xl p-6 md:p-10 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span ref={washRef as React.Ref<HTMLSpanElement>} className="font-display text-5xl md:text-8xl text-white leading-none block">{washCount}+</span>
                <span className="font-mono text-[10px] md:text-xs text-white/70 uppercase tracking-widest mt-2 block">Condo washes completed</span>
              </div>
              <div className="text-right">
                <span className="font-display text-5xl md:text-8xl text-white/20 leading-none block">0</span>
                <span className="font-mono text-xs text-white/70 uppercase tracking-widest mt-2 block">Complaints filed</span>
              </div>
            </div>
          </motion.div>

          {/* Buildings grid */}
          <motion.div
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className="font-mono text-[10px] text-[#E23232] uppercase tracking-[0.3em] block mb-5">Buildings we&apos;ve serviced</span>
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.5 }}
            >
              {buildings.map((building) => (
                <motion.div
                  key={building}
                  variants={buildingVariants}
                  className="group flex items-center gap-3 bg-[#111] border border-white/5 rounded-xl px-4 py-3 hover:border-[#E23232]/30 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-[#E23232]/40 group-hover:bg-[#E23232] transition-colors shrink-0" />
                  <span className="font-mono text-[11px] text-white/85 uppercase tracking-wider group-hover:text-white/95 transition-colors">{building}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ y: -4, borderColor: 'rgba(226, 50, 50, 0.3)' }}
              className="flex-1 bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center gap-4 group transition-colors"
            >
              <ShieldCheck className="w-6 h-6 text-[#E23232] shrink-0" />
              <div>
                <span className="font-mono text-xs text-white/80 uppercase tracking-wider block">$2M Insured</span>
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Every pro, every wash</span>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, borderColor: 'rgba(226, 50, 50, 0.3)' }}
              className="flex-1 bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center gap-4 group transition-colors"
            >
              <Sparkles className="w-6 h-6 text-[#E23232] shrink-0" />
              <div>
                <span className="font-mono text-xs text-white/80 uppercase tracking-wider block">Waterless</span>
                <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">Zero runoff, zero mess</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
