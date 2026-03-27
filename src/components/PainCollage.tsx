'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function PainCollage() {
  const collageRef = useRef(null);

  const { scrollYProgress: collageScroll } = useScroll({
    target: collageRef,
    offset: ["start end", "center center"],
  });

  const x1 = useTransform(collageScroll, [0, 1], ["-200%", "-120%"]);
  const x2 = useTransform(collageScroll, [0, 1], ["-80%", "-40%"]);
  const x3 = useTransform(collageScroll, [0, 1], ["80%", "40%"]);
  const x4 = useTransform(collageScroll, [0, 1], ["200%", "120%"]);

  const imgClass = "absolute w-[160px] lg:w-[280px] h-[220px] lg:h-[380px] object-cover border-[4px] border-[#222] lg:grayscale lg:hover:grayscale-0 hover:z-50 transition-all duration-500";

  return (
    <section className="pt-32 pb-16 px-6 overflow-hidden relative border-b border-white/10">
      <div className="max-w-[1600px] mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-[8rem] font-display uppercase leading-[0.9] mb-24"
        >
          Your Car Wash Is<br />Destroying <span className="text-[#E23232]">Your Paint.</span>
        </motion.h2>

        <div ref={collageRef} className="flex justify-center items-center h-[300px] lg:h-[450px] relative mb-24 w-full max-w-5xl mx-auto">
          <motion.img style={{ x: x1 }} src="/swirl-marks.jpeg" alt="Swirl marks from automated wash" width={280} height={380} loading="lazy" className={`${imgClass} -rotate-[15deg] z-10`} />
          <motion.img style={{ x: x2 }} src="/automated-brush.jpeg" alt="Automated brush damage" width={280} height={380} loading="lazy" className={`${imgClass} -rotate-[5deg] z-20`} />
          <motion.img style={{ x: x3 }} src="/deep-scratch.jpeg" alt="Deep scratch and clear coat failure" width={280} height={380} loading="lazy" className={`${imgClass} rotate-[5deg] z-40`} />
          <motion.img style={{ x: x4 }} src="/water-spot.jpeg" alt="Water spot etching damage" width={280} height={380} loading="lazy" className={`${imgClass} rotate-[15deg] z-30`} />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif italic text-2xl md:text-3xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Automated brushes grind dirt into your paint. Mobile guys never call back.<br className="hidden md:block" /> <span className="text-white/90 font-medium">You deserve better.</span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-x-8 gap-y-4 font-mono text-sm md:text-base uppercase tracking-widest"
        >
          <span className="text-white/50">No spinning brushes</span>
          <span className="text-[#E23232]">Hand wash only</span>
          <span className="text-white/50">No scratches</span>
          <span className="text-[#E23232]">Photo proof</span>
          <span className="text-white/50">No wasted Saturdays</span>
        </motion.div>
      </div>
    </section>
  );
}
