'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';

export function Pricing() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const plans = [
    { name: 'STANDARD', price: '$99', popular: false, cta: 'Book Standard', accent: 'from-blue-500/10 to-cyan-500/5' },
    { name: 'DEEP CLEAN', price: '$279', popular: true, cta: 'Book Deep Clean', accent: 'from-gold/15 to-gold/5' },
    { name: 'MOVE-IN/OUT', price: '$349', popular: false, cta: 'Book Move-In', accent: 'from-violet-500/10 to-purple-500/5' },
  ];

  const features = [
    { name: 'Kitchen & Bath', values: [true, true, true] },
    { name: 'Dusting & Vacuuming', values: [true, true, true] },
    { name: 'Mopping', values: [true, true, true] },
    { name: 'Inside Appliances', values: [false, true, true] },
    { name: 'Deep Scrub', values: [false, true, true] },
    { name: 'Inside Cabinets', values: [false, false, true] },
    { name: 'Baseboards & Fixtures', values: [false, true, true] },
  ];

  const durations = ['2\u20133 hrs', '4\u20135 hrs', '5\u20137 hrs'];

  return (
    <section id="pricing" className="px-6 md:px-16 lg:px-24 py-28 md:py-40 bg-cream text-rich-black max-w-[1600px] mx-auto">
      {/* Section Tag */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <span className="font-mono text-[10px] font-700 uppercase tracking-[0.3em] text-gold">
          005 &mdash; Pricing
        </span>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6"
      >
        <h2 className="font-display text-[52px] md:text-[100px] font-800 leading-[0.88] tracking-[-0.04em] uppercase">
          No surprises<span className="text-gold">.</span><br />
          Ever<span className="text-gold">.</span>
        </h2>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="font-sans text-[14px] font-600 text-rich-black/50 mb-24 md:mb-28"
      >
        Flat-rate pricing. What you see is what you pay.
      </motion.p>

      {/* Pricing Columns */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="min-w-[780px]">
          {/* Plan Headers + Prices */}
          <div className="grid grid-cols-4 gap-[1px]">
            <div className="col-span-1" />
            {plans.map((plan, i) => {
              const isHovered = hoveredCol === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onMouseEnter={() => setHoveredCol(i)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={`col-span-1 relative p-8 md:p-10 text-center overflow-hidden transition-all duration-600 ${
                    isHovered ? 'bg-rich-black text-cream scale-[1.02] z-10 shadow-[0_20px_60px_rgba(13,13,13,0.15)]' : 'bg-cream-dark'
                  } ${plan.popular && !isHovered ? 'border border-gold/20' : isHovered ? '' : 'border border-border'}`}
                >
                  {/* Hover gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${plan.accent} transition-opacity duration-600 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                  <div className="relative z-10">
                    {/* Plan name */}
                    <span className={`font-mono text-[10px] font-700 uppercase tracking-[0.2em] transition-colors duration-500 ${
                      isHovered ? 'text-cream/50' : 'text-warm-gray'
                    }`}>
                      {plan.name}
                    </span>

                    {/* Popular badge */}
                    {plan.popular && (
                      <span className={`inline-block ml-3 font-mono text-[8px] font-700 uppercase tracking-[0.2em] px-2.5 py-1 transition-colors duration-500 ${
                        isHovered ? 'bg-gold text-rich-black' : 'bg-gold text-rich-black'
                      }`}>
                        Popular
                      </span>
                    )}

                    {/* Price */}
                    <div className={`font-display text-[64px] md:text-[80px] font-800 leading-none tracking-[-0.04em] mt-4 mb-2 transition-colors duration-500 ${
                      isHovered ? 'text-cream' : 'text-rich-black'
                    }`}>
                      {plan.price}
                    </div>

                    <div className={`font-mono text-[10px] font-600 uppercase tracking-[0.15em] transition-colors duration-500 ${
                      isHovered ? 'text-cream/40' : 'text-warm-gray'
                    }`}>
                      /visit
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Feature Rows */}
          {features.map((feature, i) => (
            <div key={i} className="grid grid-cols-4 border-b border-border">
              <div className="col-span-1 py-5 px-2 font-mono text-[11px] font-700 uppercase tracking-[0.1em] text-rich-black flex items-center">
                {feature.name}
              </div>
              {feature.values.map((val, j) => {
                const isHovered = hoveredCol === j;
                return (
                  <div
                    key={j}
                    onMouseEnter={() => setHoveredCol(j)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className={`col-span-1 py-5 flex items-center justify-center transition-colors duration-500 ${
                      isHovered ? 'bg-rich-black/[0.03]' : ''
                    }`}
                  >
                    {val ? (
                      <motion.span
                        initial={false}
                        animate={{ scale: isHovered ? 1.3 : 1 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`text-[16px] font-700 transition-colors duration-500 ${
                          isHovered ? 'text-gold' : 'text-gold-dark'
                        }`}
                      >
                        &#10003;
                      </motion.span>
                    ) : (
                      <span className={`text-[14px] font-600 transition-colors duration-500 ${
                        isHovered ? 'text-rich-black/25' : 'text-rich-black/15'
                      }`}>
                        &mdash;
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Duration Row */}
          <div className="grid grid-cols-4 border-b border-border">
            <div className="col-span-1 py-5 px-2 font-mono text-[11px] font-700 uppercase tracking-[0.1em] text-rich-black flex items-center">
              Duration
            </div>
            {durations.map((d, j) => {
              const isHovered = hoveredCol === j;
              return (
                <div
                  key={j}
                  onMouseEnter={() => setHoveredCol(j)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={`col-span-1 py-5 flex items-center justify-center transition-colors duration-500 ${
                    isHovered ? 'bg-rich-black/[0.03]' : ''
                  }`}
                >
                  <span className={`font-mono text-[12px] font-700 uppercase tracking-[0.08em] transition-colors duration-500 ${
                    isHovered ? 'text-rich-black' : 'text-warm-gray'
                  }`}>
                    {d}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CTA Row */}
          <div className="grid grid-cols-4 pt-10">
            <div className="col-span-1" />
            {plans.map((plan, i) => {
              const isHovered = hoveredCol === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onMouseEnter={() => setHoveredCol(i)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className="col-span-1 px-4"
                >
                  <Link
                    href="#book"
                    className={`inline-flex items-center justify-center w-full py-4.5 font-mono text-[10px] font-700 uppercase tracking-[0.15em] transition-all duration-500 group ${
                      plan.popular || isHovered
                        ? 'bg-rich-black text-cream hover:bg-gold hover:text-rich-black'
                        : 'bg-transparent border border-border text-rich-black hover:border-rich-black'
                    }`}
                  >
                    <span className="mr-2">{plan.cta}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="block font-mono text-[9px] font-700 uppercase tracking-[0.3em] text-gold mb-3">
            Add-ons
          </span>
          <p className="font-mono text-[10px] font-600 uppercase tracking-[0.1em] text-rich-black/50 leading-relaxed max-w-[560px]">
            Inside Fridge +$30 &nbsp;&middot;&nbsp; Inside Oven +$30 &nbsp;&middot;&nbsp; Laundry +$25/load &nbsp;&middot;&nbsp; Balcony +$35
          </p>
        </div>
        <p className="font-mono text-[10px] font-600 uppercase tracking-[0.1em] text-rich-black/50">
          Prices for 2-bedroom.{' '}
          <Link href="#sizes" className="text-gold hover:text-gold-dark transition-colors duration-300">
            See all sizes &rarr;
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
