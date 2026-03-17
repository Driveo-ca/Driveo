'use client';

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { reviews } from '@/lib/data';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

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
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <Star className="w-5 h-5 fill-[#E23232] text-[#E23232]" />
                </motion.div>
              ))}
            </div>
            <span className="font-[family-name:var(--font-poppins)] text-sm text-white/70 uppercase tracking-widest">4.9 on Google</span>
          </div>
          <span className="font-[family-name:var(--font-poppins)] text-[10px] text-white/50 uppercase tracking-widest hidden md:block">Real reviews from real customers</span>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.12 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {reviews.map((review, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover={{ y: -6, borderColor: 'rgba(226, 50, 50, 0.3)', transition: { duration: 0.25 } }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 transition-colors"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#E23232] text-[#E23232]" />
                ))}
              </div>
              <p className="font-[family-name:var(--font-poppins)] italic text-sm text-white/80 leading-relaxed line-clamp-4">{review.text}</p>
              <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="font-[family-name:var(--font-poppins)] text-xs text-white/70 uppercase tracking-wider">{review.name}</span>
                <span className="font-[family-name:var(--font-poppins)] text-[10px] text-white/50">{review.time}</span>
              </div>
              <svg className="w-14 h-5 mt-1" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
                <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335" />
                <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C119.25 34.32 129.24 25 141.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05" />
                <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4" />
                <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
                <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335" />
                <path d="M35.29 41.19V32H68c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 33.91.36 13.93 16.32-1.53 36.3-1.53c11.01 0 18.82 4.3 24.68 9.99l-6.95 6.95c-4.21-3.95-9.92-7.03-17.73-7.03-14.48 0-25.81 11.68-25.81 25.52s11.33 25.52 25.81 25.52c9.41 0 14.78-3.78 18.22-7.23 2.78-2.78 4.6-6.75 5.32-12.18H35.29z" fill="#4285F4" />
              </svg>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
