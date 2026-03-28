'use client';

import { motion } from 'framer-motion';
import { useCursor } from './CursorProvider';
import { pricingCards } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.93 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease },
  },
};

export function PricingCards() {
  const { setIsHovering } = useCursor();

  return (
    <section id="plans" className="py-16 md:py-32 px-6 md:px-12 border-b border-white/10">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row justify-between items-end mb-8 gap-8"
        >
          <div>
            <h2 className="text-6xl md:text-8xl font-display uppercase leading-[0.9]">Monthly<br /><span className="text-[#E23232]">Plans</span></h2>
            <p className="font-mono text-xs text-white/70 uppercase tracking-widest mt-4 max-w-md">Cancel anytime — 30-day notice, no fees, no guilt trip. We don&apos;t do contracts because we&apos;d rather earn your business every month.</p>
          </div>
          <motion.button
            className="font-mono text-xs uppercase tracking-widest border border-white/30 px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            View One-Time Prices
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-serif italic text-lg text-white/60 max-w-2xl mb-20"
        >
          Subscriptions save you 25-35% vs. booking one-time washes — and you never have to remember to book. We schedule, we show up, your car stays clean.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.15 }}
        >
          {pricingCards.map((card, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -8, transition: { duration: 0.3 } }}
              className={`${card.bg} ${card.text} p-12 rounded-3xl flex flex-col h-auto min-h-[580px] border border-white/10 cursor-default relative`}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {'popular' in card && card.popular && <span className="absolute top-6 right-6 font-mono text-[10px] uppercase tracking-widest bg-[#E23232] text-white px-4 py-1.5 rounded-full">Most Popular</span>}
              <div className="flex items-baseline gap-1 mb-6">
                <h3 className={`text-7xl font-display ${card.accent}`}>{card.price}</h3>
                <span className="font-mono text-sm opacity-80">{card.label}</span>
              </div>
              <h4 className="text-3xl font-display uppercase mb-3">{card.title}</h4>
              <span className="font-mono text-xs opacity-70 uppercase tracking-widest mb-6 block">{card.services}</span>
              <p className="font-serif italic text-lg opacity-85 mb-12 flex-grow">{card.desc}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="font-mono text-xs uppercase tracking-widest border border-white/30 hover:bg-white hover:text-black px-8 py-4 rounded-full transition-all self-start"
              >
                Start Your Plan
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Driveo Prime */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ borderColor: 'rgba(226, 50, 50, 0.5)' }}
          className="bg-[#111] border border-[#E23232]/30 p-12 rounded-3xl flex flex-col md:flex-row gap-10 items-center cursor-default relative overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-[#E23232]/5 rounded-full blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="flex-grow relative z-10">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#E23232] block mb-3">The complete package</span>
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="text-6xl font-display text-[#E23232]">$179</h3>
              <span className="font-mono text-sm text-white/80">/month</span>
            </div>
            <h4 className="text-3xl font-display uppercase mb-4">Driveo Prime</h4>
            <p className="font-serif italic text-lg text-white/80 max-w-xl mb-6">
              Everything in Driveo Full, plus a monthly salt flush in winter, priority scheduling so you always get your preferred time slot, and 15% off any add-on services. For anyone who wants their car looking showroom-clean at all times — without thinking about it.
            </p>
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest">All Driveo Full Washes + Salt Flush + Priority + 15% Off Add-Ons</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="font-mono text-xs uppercase tracking-widest border border-[#E23232] text-[#E23232] px-8 py-4 rounded-full hover:bg-[#E23232] hover:text-white transition-all shrink-0 relative z-10"
          >
            Go Prime
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-mono text-xs text-white/50 uppercase tracking-widest text-center mt-8"
        >
          Second vehicle in the same household? 20% off the second plan.
        </motion.p>
      </div>
    </section>
  );
}
