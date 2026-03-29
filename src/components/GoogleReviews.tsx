'use client';

import { ShieldCheck, Camera, Clock, Redo2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const promises = [
  {
    icon: Camera,
    title: 'Photo Proof on Every Wash',
    text: 'Before & after photos sent straight to your phone. You see exactly what was done — no guesswork.',
  },
  {
    icon: ShieldCheck,
    title: '$2M Insured. Background Checked.',
    text: 'Every pro carries $2M liability insurance and passes a background check before touching your car.',
  },
  {
    icon: Clock,
    title: 'Book in 30 Seconds',
    text: 'Pick your car, pick your plan, confirm. Instant SMS confirmation. No phone tag. No callbacks.',
  },
  {
    icon: Redo2,
    title: 'Not Happy? Free Re-do or Refund.',
    text: "If your wash doesn't meet your expectations, we'll send someone back or refund you. No questions.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease },
  },
};

export function GoogleReviews() {
  return (
    <section id="reviews" className="py-16 px-6 border-b border-white/10 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-[#E23232] uppercase tracking-[0.3em]">Our Promise</span>
          </div>
          <span className="font-[family-name:var(--font-poppins)] text-[10px] text-white/50 uppercase tracking-widest hidden md:block">What you get with every wash</span>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.12 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {promises.map((promise, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -6, borderColor: 'rgba(226, 50, 50, 0.3)', transition: { duration: 0.25 } }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
                <promise.icon className="w-5 h-5 text-[#E23232]" />
              </div>
              <h3 className="font-mono text-sm text-white/90 uppercase tracking-wider">{promise.title}</h3>
              <p className="font-[family-name:var(--font-poppins)] text-sm text-white/60 leading-relaxed">{promise.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
