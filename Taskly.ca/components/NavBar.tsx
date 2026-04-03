'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

const navLinks = ['Services', 'How It Works', 'Pricing', 'Trust', 'For Pros'];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.8 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'h-[64px] bg-cream/80 backdrop-blur-2xl border-b border-rich-black/5'
          : 'h-[80px] bg-gradient-to-b from-cream/70 to-transparent backdrop-blur-sm'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-[22px] font-800 tracking-tight text-rich-black">
          taskly<span className="text-gold">.</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="font-mono text-[10px] font-700 uppercase tracking-[0.18em] text-rich-black hover:text-gold transition-colors duration-300"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="hidden md:inline-flex font-mono text-[10px] font-700 uppercase tracking-[0.18em] text-rich-black hover:text-gold transition-colors duration-300"
          >
            Login
          </Link>
          <Link
            href="#book-now"
            className="hidden md:inline-flex items-center justify-center bg-rich-black text-cream font-mono text-[10px] font-700 uppercase tracking-[0.18em] px-6 py-3 hover:bg-gold hover:text-rich-black transition-all duration-400"
          >
            Book Now
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 w-full bg-cream border-b border-border px-6 py-8 flex flex-col gap-6"
        >
          {navLinks.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setMobileOpen(false)}
              className="font-mono text-[11px] font-600 uppercase tracking-[0.18em] text-warm-gray hover:text-rich-black transition-colors"
            >
              {item}
            </Link>
          ))}
          <Link
            href="#book-now"
            className="bg-rich-black text-cream font-mono text-[11px] font-700 uppercase tracking-[0.18em] px-6 py-4 text-center hover:bg-gold hover:text-rich-black transition-all duration-400"
          >
            Book Now
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
