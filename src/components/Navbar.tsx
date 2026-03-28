'use client';

import { Menu, X } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCursor } from './CursorProvider';

export function Navbar() {
  const { setIsHovering } = useCursor();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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
      <div className="md:hidden flex items-center gap-3">
        <Link href="/auth/signup">
          <motion.button
            className="font-mono text-xs uppercase tracking-widest bg-[#E23232] border border-[#E23232] text-white px-4 py-2 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileTap={{ scale: 0.97 }}
          >
            Book Now
          </motion.button>
        </Link>
        <button
          className="text-white w-10 h-10 flex items-center justify-center"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {['How It Works', 'Services', 'Plans', 'Reviews'].map((item, idx) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="font-mono text-sm uppercase tracking-widest text-white/80 hover:text-[#E23232] transition-colors py-3 border-b border-white/5"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item}
                </motion.a>
              ))}

              <div className="flex flex-col gap-3 mt-4">
                <Link href="/apply" onClick={() => setMenuOpen(false)}>
                  <span className="font-mono text-sm uppercase tracking-widest text-white/70 hover:text-[#E23232] transition-colors block py-2">
                    Become a Partner
                  </span>
                </Link>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <span className="font-mono text-sm uppercase tracking-widest text-white/70 hover:text-[#E23232] transition-colors block py-2">
                    Log In
                  </span>
                </Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)}>
                  <span className="font-mono text-xs uppercase tracking-widest bg-[#E23232] border border-[#E23232] text-white px-6 py-3 rounded-full block text-center mt-2">
                    Book Your First Wash
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
