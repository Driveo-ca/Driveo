'use client';

import { Menu } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCursor } from './CursorProvider';

export function Navbar() {
  const { setIsHovering } = useCursor();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 px-6 flex justify-between items-center transition-all duration-500 ${
        scrolled
          ? 'py-3 bg-[#050505]/90 backdrop-blur-xl border-b border-white/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'py-6 bg-black/30 backdrop-blur-md border-b border-white/10'
      }`}
    >
      <div className="flex items-center gap-6">
        <motion.div
          className="relative cursor-pointer"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/Driveo-logo.png"
            alt="DRIVEO"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </motion.div>
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block font-mono text-[10px] text-white/60 uppercase tracking-widest border-l border-white/10 pl-6"
        >
          Serving Etobicoke &amp; Mississauga
        </motion.span>
      </div>

      <div className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-widest">
        {['How It Works', 'Services', 'Plans', 'Reviews'].map((item, idx) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
            className="hover:text-[#E23232] transition-colors relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + idx * 0.08 }}
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#E23232] group-hover:w-full transition-all duration-300" />
          </motion.a>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Link href="/apply">
          <motion.span
            className="font-mono text-xs uppercase tracking-widest text-white/70 hover:text-[#E23232] transition-colors relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            Become a Partner
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#E23232] group-hover:w-full transition-all duration-300" />
          </motion.span>
        </Link>
        <Link href="/auth/login">
          <motion.span
            className="font-mono text-xs uppercase tracking-widest text-white/70 hover:text-[#E23232] transition-colors relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38 }}
          >
            Log In
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#E23232] group-hover:w-full transition-all duration-300" />
          </motion.span>
        </Link>
        <Link href="/auth/signup">
          <motion.button
            className={`font-mono text-xs uppercase tracking-widest border px-6 py-3 rounded-full transition-all duration-300 ${
              scrolled
                ? 'bg-[#E23232] border-[#E23232] text-white hover:bg-white hover:text-black hover:border-white'
                : 'border-white/30 hover:bg-[#E23232] hover:border-[#E23232] hover:text-white'
            }`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Book Your First Wash
          </motion.button>
        </Link>
      </div>
      <button className="md:hidden text-white"><Menu /></button>
    </motion.nav>
  );
}
