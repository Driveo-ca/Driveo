'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export function CursorProvider() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const dotX = useSpring(cursorX, springConfig);
  const dotY = useSpring(cursorY, springConfig);

  const ringConfig = { damping: 20, stiffness: 200, mass: 0.8 };
  const ringX = useSpring(cursorX, ringConfig);
  const ringY = useSpring(cursorY, ringConfig);

  const onMouseMove = useCallback((e: MouseEvent) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
    if (!isVisible) setIsVisible(true);
  }, [cursorX, cursorY, isVisible]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(hover: none)').matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', () => setIsVisible(false));
    document.addEventListener('mouseenter', () => setIsVisible(true));

    const interactiveElements = () => document.querySelectorAll('a, button, [role="button"], input, textarea, select, [data-cursor-hover]');

    const addHoverListeners = () => {
      interactiveElements().forEach(el => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });
    };

    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
    };
  }, [isMobile, onMouseMove]);

  if (isMobile) return null;

  return (
    <>
      {/* Hide default cursor */}
      <style jsx global>{`
        @media (hover: hover) {
          * { cursor: none !important; }
        }
      `}</style>

      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <div className="w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 1.8 : 1,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-300 ${
            isHovering ? 'border-gold bg-gold/10' : 'border-rich-black/30'
          }`}
        />
      </motion.div>
    </>
  );
}
