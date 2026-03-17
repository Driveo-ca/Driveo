'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCursor } from './CursorProvider';
import { faqItems } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const faqItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export function FAQAccordion() {
  const { setIsHovering } = useCursor();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-32 px-6 md:px-12 border-b border-white/10">
      <div className="max-w-[1000px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-display uppercase leading-[0.9] mb-6 text-center"
        >
          Questions?<br /><span className="text-[#E23232]">Answers.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-mono text-xs text-white/60 uppercase tracking-widest text-center mb-20"
        >
          Everything you&apos;d want to know before booking
        </motion.p>

        <motion.div
          className="flex flex-col gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.08 }}
        >
          {faqItems.map((item, idx) => (
            <motion.div
              key={idx}
              variants={faqItemVariants}
              className="border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-8 text-left cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="font-mono text-sm uppercase tracking-widest pr-8">{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#E23232] shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-8 pb-8 font-sans text-white/80 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
