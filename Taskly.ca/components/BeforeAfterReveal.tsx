'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function BeforeAfterReveal() {
  const [sliderPos, setSliderPos] = useState(55);
  const isDragging = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleSliderMove(e.clientX); };
  const onTouchMove = (e: React.TouchEvent) => { handleSliderMove(e.touches[0].clientX); };
  const onClick = (e: React.MouseEvent) => { handleSliderMove(e.clientX); };

  return (
    <section className="relative bg-rich-black text-cream py-24 md:py-32 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gold/[0.04] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="font-mono text-[10px] font-700 uppercase tracking-[0.3em] text-gold block mb-6">
            The Taskly Effect
          </span>
          <h2 className="font-display text-[48px] md:text-[80px] font-800 leading-[0.88] tracking-[-0.04em] uppercase text-cream">
            See the<br />difference<span className="text-gold">.</span>
          </h2>
          <p className="font-sans text-[14px] font-600 text-cream/50 mt-6 max-w-[400px] mx-auto">
            Drag the slider to reveal the transformation. This is what professional cleaning looks like.
          </p>
        </motion.div>

        {/* Slider Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          ref={sliderRef}
          className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden cursor-col-resize select-none border border-cream/10 group"
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onMouseMove={onMouseMove}
          onTouchStart={onMouseDown}
          onTouchEnd={onMouseUp}
          onTouchMove={onTouchMove}
          onClick={onClick}
        >
          {/* AFTER image (full background — the clean result) */}
          <Image
            src="/assets/DONE.jpg"
            alt="After — Pristine clean"
            fill
            className="object-cover pointer-events-none"
            priority
          />

          {/* BEFORE image (clipped to slider position) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <Image
              src="/assets/CHOOSE.jpg"
              alt="Before — Needs cleaning"
              fill
              className="object-cover pointer-events-none"
              style={{ minWidth: sliderRef.current ? `${sliderRef.current.offsetWidth}px` : '100vw', maxWidth: 'none' }}
              priority
            />
          </div>

          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-cream/80 z-20 pointer-events-none"
            style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
          >
            {/* Glow effect on line */}
            <div className="absolute inset-0 w-[4px] -translate-x-[1px] bg-gold/20 blur-sm" />
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-1/2 z-30 pointer-events-none"
            style={{ left: `${sliderPos}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-14 h-14 rounded-full bg-gold border-4 border-cream flex items-center justify-center shadow-[0_0_40px_rgba(197,164,126,0.5)] group-hover:scale-110 transition-transform duration-300">
              <ChevronLeft className="w-4 h-4 text-rich-black -mr-1" />
              <ChevronRight className="w-4 h-4 text-rich-black -ml-1" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-6 left-6 z-10 bg-rich-black/70 backdrop-blur-sm px-4 py-2 pointer-events-none">
            <span className="font-mono text-[10px] font-700 uppercase tracking-[0.2em] text-cream">Before</span>
          </div>
          <div className="absolute top-6 right-6 z-10 bg-gold/90 backdrop-blur-sm px-4 py-2 pointer-events-none">
            <span className="font-mono text-[10px] font-700 uppercase tracking-[0.2em] text-rich-black">After</span>
          </div>

          {/* Hint */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isDragging.current ? 0 : 0.7 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-rich-black/60 backdrop-blur-sm px-5 py-2.5 pointer-events-none"
          >
            <span className="font-mono text-[9px] font-600 uppercase tracking-[0.25em] text-cream flex items-center gap-2">
              <ChevronLeft className="w-3 h-3" />
              Drag to compare
              <ChevronRight className="w-3 h-3" />
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
