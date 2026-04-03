'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';

export function HowItWorks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const steps = [
    {
      id: '01',
      number: '1',
      title: 'Choose',
      body: 'Pick your service. See the exact price. No quotes, no callbacks, no waiting.',
      bottomLabel: '30 SECONDS',
      image: '/assets/CHOOSE.jpg',
    },
    {
      id: '02',
      number: '2',
      title: 'Book',
      body: 'Instantly matched with a vetted, background-checked professional near you.',
      bottomLabel: 'AUTO-MATCHED',
      image: '/assets/BOOK.jpg',
    },
    {
      id: '03',
      number: '3',
      title: 'Done',
      body: 'Track in real-time. Review before/after photos. Pay only when satisfied.',
      bottomLabel: 'GUARANTEED',
      image: '/assets/DONE.jpg',
    },
  ];

  return (
    <section id="how-it-works" className="px-6 md:px-16 lg:px-24 py-28 md:py-40 bg-cream text-rich-black max-w-[1600px] mx-auto">
      {/* Section Identifier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-8"
      >
        <span className="font-mono text-[10px] font-600 uppercase tracking-[0.3em] text-gold">
          003 &mdash; How It Works
        </span>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-24 md:mb-32 flex flex-col md:flex-row md:items-end justify-between gap-8"
      >
        <h2 className="font-display text-[52px] md:text-[100px] font-800 leading-[0.88] tracking-[-0.04em] uppercase">
          Three steps<span className="text-gold">.</span><br />
          That&apos;s it<span className="text-gold">.</span>
        </h2>
        <p className="font-sans text-[13px] font-600 text-rich-black/50 leading-[1.7] max-w-[280px] pb-3">
          We engineered the friction out of home services. Experience the new standard.
        </p>
      </motion.div>

      {/* Three Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border relative">
        {steps.map((step, index) => {
          const isHovered = hoveredIndex === index;
          const isAnyHovered = hoveredIndex !== null;
          const isDimmed = isAnyHovered && !isHovered;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative p-8 md:p-12 min-h-[480px] md:min-h-[620px] flex flex-col justify-between overflow-hidden border-b border-border cursor-crosshair transition-all duration-700 ${
                index !== steps.length - 1 ? 'md:border-r' : ''
              } ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100 grayscale-0'}`}
            >
              {/* Background Image Reveal */}
              <div
                className={`absolute inset-0 z-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isHovered ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
                }`}
              >
                <Image src={step.image} alt={step.title} fill className="object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-rich-black/50" />
              </div>

              {/* Watermark Number */}
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-800 leading-none pointer-events-none select-none z-0 transition-all duration-700 text-[280px] md:text-[360px] ${
                  isHovered ? 'text-cream/[0.06] scale-110' : 'text-rich-black/[0.025] scale-100'
                }`}
              >
                {step.number}
              </div>

              {/* Content */}
              <div className={`relative z-10 transition-transform duration-700 ${isHovered ? '-translate-y-1' : ''}`}>
                <span className="font-mono text-[10px] font-600 text-gold block mb-5">{step.id}</span>
                <h3
                  className={`font-display text-[40px] md:text-[52px] font-800 mb-5 uppercase tracking-[-0.03em] transition-colors duration-700 ${
                    isHovered ? 'text-cream' : 'text-rich-black'
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`font-sans text-[13px] font-600 leading-[1.7] max-w-[260px] transition-colors duration-700 ${
                    isHovered ? 'text-cream/80' : 'text-rich-black/50'
                  }`}
                >
                  {step.body}
                </p>
              </div>

              {/* Bottom */}
              <div className={`relative z-10 flex items-center justify-between transition-all duration-700 ${isHovered ? 'translate-y-1' : ''}`}>
                <span
                  className={`font-mono text-[9px] font-600 uppercase tracking-[0.25em] transition-colors duration-700 ${
                    isHovered ? 'text-gold' : 'text-warm-gray'
                  }`}
                >
                  {step.bottomLabel}
                </span>
                <div className={`overflow-hidden transition-all duration-700 ${isHovered ? 'w-6 opacity-100' : 'w-0 opacity-0'}`}>
                  <span className={`text-gold text-lg block transition-transform duration-500 ${isHovered ? 'translate-x-0' : '-translate-x-full'}`}>
                    &rarr;
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 flex flex-col items-center text-center"
      >
        <Link
          href="#book"
          className="inline-flex items-center justify-center bg-rich-black text-cream font-mono text-[11px] font-700 uppercase tracking-[0.18em] px-10 py-5 hover:bg-gold hover:text-rich-black transition-all duration-500 group"
        >
          <span className="mr-3">Experience It Now</span>
          <span className="group-hover:translate-x-1.5 transition-transform duration-400">&rarr;</span>
        </Link>
        <p className="font-mono text-[10px] font-600 uppercase tracking-[0.12em] text-warm-gray mt-5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          First standard cleaning free
        </p>
      </motion.div>
    </section>
  );
}
