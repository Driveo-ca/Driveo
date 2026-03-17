'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BlobThankYou } from '@/components/apply/GradientBlobs';
import { CursorProvider } from '@/components/CursorProvider';
import { NoiseOverlay } from '@/components/NoiseOverlay';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function ThankYouPage() {
  return (
    <CursorProvider>
      <div className="bg-[#050505] text-white min-h-screen flex flex-col selection:bg-[#E23232] selection:text-white">
        <NoiseOverlay />
        {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-5 flex justify-between items-center bg-[#050505]/90 backdrop-blur-xl border-b border-white/10">
        <Link href="/">
          <Image src="/Driveo-logo.png" alt="DRIVEO" width={120} height={40} className="h-7 w-auto" priority />
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#E23232]/[0.05] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#E23232]/[0.03] rounded-full blur-[100px]" />
        </div>

        {/* Illustration */}
        <motion.div
          className="w-64 h-64 mb-8 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease }}
        >
          <BlobThankYou />
        </motion.div>

        {/* Text */}
        <motion.div
          className="text-center max-w-lg relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
        >
          <span className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] mb-4 block">
            Application received
          </span>
          <h1 className="text-5xl md:text-7xl font-display uppercase leading-[0.9] mb-6">
            Thank <span className="text-[#E23232]">You!</span>
          </h1>
          <p className="font-serif italic text-xl text-white/60 leading-relaxed mb-4">
            Your application has been submitted successfully. Our team will review it and get back to you within 48 hours.
          </p>
          <p className="font-mono text-[11px] text-white/40 tracking-wider mb-10">
            We&apos;ve sent a confirmation to your email. Check your inbox (and spam folder, just in case).
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <motion.span
                className="inline-flex items-center gap-2 bg-[#E23232] text-white font-mono text-xs uppercase tracking-widest px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Back to Homepage
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </Link>
          </div>
        </motion.div>

        {/* Bottom info */}
        <motion.div
          className="mt-16 mb-8 text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
            Questions? Reach out to <span className="text-white/50">hello@driveo.ca</span>
          </p>
        </motion.div>
      </div>
      </div>
    </CursorProvider>
  );
}
