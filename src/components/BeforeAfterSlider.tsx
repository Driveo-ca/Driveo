'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(60);
  const [containerWidth, setContainerWidth] = useState(1400);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (sliderRef.current) {
      setContainerWidth(sliderRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (sliderRef.current) setContainerWidth(sliderRef.current.offsetWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <section className="relative border-b border-white/10 flex flex-col">
      <div className="text-center pt-10 pb-6 px-6 shrink-0">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] mb-3"
        >
          See the difference
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl font-display uppercase leading-[0.9]"
        >
          The DRIVEO <span className="text-[#E23232]">Effect</span>
        </motion.h2>
      </div>

      <motion.div
        className="px-4 md:px-8 pb-4 relative"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          ref={sliderRef}
          className="relative w-full rounded-2xl overflow-hidden cursor-col-resize select-none border border-white/10"
          onMouseDown={() => { isDragging.current = true; }}
          onMouseUp={() => { isDragging.current = false; }}
          onMouseLeave={() => { isDragging.current = false; }}
          onMouseMove={(e) => { if (isDragging.current) handleSliderMove(e.clientX); }}
          onTouchStart={() => { isDragging.current = true; }}
          onTouchEnd={() => { isDragging.current = false; }}
          onTouchMove={(e) => { if (isDragging.current) handleSliderMove(e.touches[0].clientX); }}
          onClick={(e) => handleSliderMove(e.clientX)}
        >
          {/* After image (full, sits behind) */}
          <img src="/Driveo Effect After.png" alt="After DRIVEO wash" className="w-full h-auto block" />

          {/* Before image (clipped) */}
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
            <img src="/Driveo Effect Before.png" alt="Before DRIVEO wash" className="h-full object-cover" style={{ width: `${containerWidth}px`, maxWidth: 'none' }} />
          </div>

          {/* Slider line */}
          <div className="absolute top-0 bottom-0 z-30 pointer-events-none" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
            <div className="w-[2px] h-full bg-white/80 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#E23232] border-4 border-white flex items-center justify-center shadow-[0_0_30px_rgba(226,50,50,0.4)] pointer-events-auto cursor-col-resize">
                <div className="flex gap-1">
                  <ChevronLeft className="w-4 h-4 text-white" />
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-6 left-6 z-20 bg-black/70 backdrop-blur-sm px-5 py-2.5 rounded-full">
            <span className="font-mono text-xs text-white/85 uppercase tracking-widest">Before</span>
          </div>
          <div className="absolute top-6 right-6 z-20 bg-black/70 backdrop-blur-sm px-5 py-2.5 rounded-full">
            <span className="font-mono text-xs text-white/85 uppercase tracking-widest">After</span>
          </div>

          {/* Bottom hint */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm px-5 py-2 rounded-full">
            <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest">Drag to compare</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
