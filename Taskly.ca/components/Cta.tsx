'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export function Cta() {
  return (
    <section className="relative min-h-[80vh] md:min-h-screen flex flex-col items-center justify-center bg-cream-dark text-rich-black px-6 text-center overflow-hidden">
      {/* Atmospheric gold mesh */}
      <div className="absolute inset-0 gold-mesh opacity-50 pointer-events-none" />

      {/* Decorative lines */}
      <div className="absolute top-1/4 left-8 md:left-16 w-[1px] h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-1/4 right-8 md:right-16 w-[1px] h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

      <div className="relative z-10">
        {/* Section Tag */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <span className="font-mono text-[10px] font-600 uppercase tracking-[0.3em] text-gold">
            006 &mdash; Get Started
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-[52px] md:text-[110px] lg:text-[140px] font-800 leading-[0.85] tracking-[-0.04em] uppercase">
            Your home<br />
            deserves<br />
            better<span className="text-gold">.</span>
          </h2>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-sans text-[13px] md:text-[15px] font-600 text-rich-black/50 mt-10 max-w-[480px] mx-auto leading-[1.7]"
        >
          Join 3,000+ GTA homeowners who stopped settling for unreliable service.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-10 justify-center"
        >
          <Link
            href="#book"
            className="inline-flex items-center justify-center bg-rich-black text-cream font-mono text-[11px] font-700 uppercase tracking-[0.15em] px-9 py-5 hover:bg-gold hover:text-rich-black transition-all duration-500 group"
          >
            <span className="mr-3">Book Your First Clean</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-400">&rarr;</span>
          </Link>
          <Link
            href="#provider"
            className="inline-flex items-center justify-center bg-transparent border border-border text-rich-black font-mono text-[11px] font-700 uppercase tracking-[0.15em] px-9 py-5 hover:border-gold hover:text-gold transition-all duration-400"
          >
            Become a Provider
          </Link>
        </motion.div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="font-mono text-[9px] font-500 uppercase tracking-[0.12em] text-gold/60 mt-6"
        >
          First clean free for new customers
        </motion.p>
      </div>
    </section>
  );
}
