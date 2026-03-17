'use client';

import { Car, CalendarCheck, Navigation, BadgeCheck, MessageSquareHeart } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    num: "01",
    Icon: Car,
    label: "Pick Your Car",
    sub: "Select your vehicle type and drop location. Sedan, SUV, truck — we handle them all.",
  },
  {
    num: "02",
    Icon: CalendarCheck,
    label: "Book a Wash",
    sub: "30 seconds to book. Pick your time slot and get instant confirmation to your phone.",
  },
  {
    num: "03",
    Icon: Navigation,
    label: "Track Your Pro",
    sub: "Real-time updates straight to your phone. Know exactly when your pro arrives.",
  },
  {
    num: "04",
    Icon: BadgeCheck,
    label: "Approve Photos",
    sub: "10 before & after shots sent directly to you. Full transparency, zero guesswork.",
  },
  {
    num: "05",
    Icon: MessageSquareHeart,
    label: "Rate & Review",
    sub: "Tell us how we did. Your feedback keeps our wash pros at their absolute best.",
  },
];

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 md:px-12 border-b border-white/10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#E23232]/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] mb-4"
          >
            5 steps. That&apos;s it.
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-display uppercase leading-[0.9]"
          >
            How <span className="text-[#E23232]">DRIVEO</span> Works
          </motion.h2>
        </div>

        {/* Top row — 3 cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.12 }}
        >
          {steps.slice(0, 3).map((step, idx) => (
            <StepCard key={idx} step={step} idx={idx} />
          ))}
        </motion.div>

        {/* Bottom row — 2 cards centered */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[930px] mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          transition={{ staggerChildren: 0.12, delayChildren: 0.3 }}
        >
          {steps.slice(3).map((step, idx) => (
            <StepCard key={idx + 3} step={step} idx={idx + 3} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function StepCard({ step, idx }: { step: typeof steps[number]; idx: number }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/10 hover:border-[#E23232]/50 transition-all duration-500 shadow-lg shadow-black/30 hover:shadow-[#E23232]/10"
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Top gradient accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#E23232] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-8 md:p-10 relative">
        {/* Large watermark number */}
        <span className="absolute top-2 right-4 font-display text-[110px] leading-none text-white/[0.06] group-hover:text-[#E23232]/15 transition-colors duration-700 select-none pointer-events-none">
          {step.num}
        </span>

        {/* Icon with glow */}
        <div className="relative mb-7 inline-flex">
          <div className="w-14 h-14 rounded-2xl bg-[#E23232]/15 group-hover:bg-[#E23232]/25 flex items-center justify-center transition-all duration-500 relative z-10 ring-1 ring-[#E23232]/20 group-hover:ring-[#E23232]/40">
            <step.Icon className="w-7 h-7 text-[#E23232] group-hover:text-[#ff4444] transition-all duration-500" />
          </div>
          <div className="absolute inset-0 bg-[#E23232]/25 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Step label */}
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] font-medium">Step {step.num}</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/15 to-transparent" />
        </div>

        {/* Title */}
        <h3 className="font-display text-2xl uppercase mb-3 text-white group-hover:text-[#E23232] transition-colors duration-300">
          {step.label}
        </h3>

        {/* Description */}
        <p className="font-mono text-[13px] text-white/80 leading-[1.8] tracking-wide group-hover:text-white/95 transition-colors duration-500">
          {step.sub}
        </p>
      </div>

      {/* Bottom corner glow on hover */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#E23232]/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
}
