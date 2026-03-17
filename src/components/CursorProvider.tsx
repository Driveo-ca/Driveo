'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CursorContextType {
  isHovering: boolean;
  setIsHovering: (v: boolean) => void;
}

const CursorContext = createContext<CursorContextType>({
  isHovering: false,
  setIsHovering: () => {},
});

export const useCursor = () => useContext(CursorContext);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <CursorContext.Provider value={{ isHovering, setIsHovering }}>
      {/* Custom Cursor */}
      <motion.div
        className="cursor-dot hidden md:block"
        style={{
          left: mousePosition.x - 4,
          top: mousePosition.y - 4,
        }}
        animate={{ scale: isHovering ? 0 : 1 }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      <motion.div
        className="cursor-outline hidden md:block"
        style={{
          left: mousePosition.x - 20,
          top: mousePosition.y - 20,
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? "#E23232" : "rgba(255,255,255,0.5)",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
      />
      {children}
    </CursorContext.Provider>
  );
}
