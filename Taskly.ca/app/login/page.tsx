'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [nameValue, setNameValue] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const stagger: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-white overflow-hidden selection:bg-gold/20 selection:text-rich-black">

      {/* ——— LEFT: Light Abstract Art Canvas ——— */}
      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[48%] overflow-hidden bg-[#FAFAF8]">

        {/* Soft warm tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAF6F0] via-[#FAFAF8] to-[#F5F0E8]" />

        {/* Watercolor-style soft blobs */}
        <motion.div
          animate={{
            x: [0, 30, -15, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[8%] right-[5%] w-[45%] aspect-square rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(197,164,126,0.12) 0%, rgba(197,164,126,0.03) 50%, transparent 70%)' }}
        />
        <motion.div
          animate={{
            x: [0, -20, 10, 0],
            y: [0, 15, -10, 0],
            scale: [1, 0.95, 1.05, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[15%] left-[5%] w-[50%] aspect-square rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(197,164,126,0.1) 0%, rgba(197,164,126,0.02) 50%, transparent 70%)' }}
        />
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -12, 20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[40%] left-[30%] w-[30%] aspect-square rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(166,124,82,0.08) 0%, transparent 60%)' }}
        />

        {/* Elegant thin-line geometric art */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 800" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Large elegant arc */}
          <motion.path
            d="M 100 800 Q 100 400 300 250 Q 500 100 500 -50"
            stroke="rgba(197,164,126,0.18)" strokeWidth="0.6" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.2, ease: 'easeOut' }}
          />
          {/* Mirror arc */}
          <motion.path
            d="M 500 800 Q 500 450 350 320 Q 200 190 100 -50"
            stroke="rgba(197,164,126,0.12)" strokeWidth="0.6" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, delay: 0.5, ease: 'easeOut' }}
          />

          {/* Floating circles — like ripples on water */}
          <motion.circle
            cx="300" cy="380" r="100"
            stroke="rgba(197,164,126,0.14)" strokeWidth="0.5" fill="none"
            initial={{ pathLength: 0, scale: 0.8, opacity: 0 }}
            animate={{ pathLength: 1, scale: 1, opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.8, ease: 'easeOut' }}
            style={{ transformOrigin: '300px 380px' }}
          />
          <motion.circle
            cx="300" cy="380" r="160"
            stroke="rgba(197,164,126,0.09)" strokeWidth="0.5" fill="none"
            initial={{ pathLength: 0, scale: 0.8, opacity: 0 }}
            animate={{ pathLength: 1, scale: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 1.2, ease: 'easeOut' }}
            style={{ transformOrigin: '300px 380px' }}
          />
          <motion.circle
            cx="300" cy="380" r="230"
            stroke="rgba(197,164,126,0.06)" strokeWidth="0.5" fill="none"
            initial={{ pathLength: 0, scale: 0.85, opacity: 0 }}
            animate={{ pathLength: 1, scale: 1, opacity: 1 }}
            transition={{ duration: 3.5, delay: 1.5, ease: 'easeOut' }}
            style={{ transformOrigin: '300px 380px' }}
          />

          {/* Delicate diagonal lines */}
          <motion.line
            x1="-20" y1="200" x2="620" y2="450"
            stroke="rgba(197,164,126,0.08)" strokeWidth="0.4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, delay: 1, ease: 'easeOut' }}
          />
          <motion.line
            x1="620" y1="200" x2="-20" y2="550"
            stroke="rgba(197,164,126,0.06)" strokeWidth="0.4"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, delay: 1.3, ease: 'easeOut' }}
          />

          {/* Small accent dots — like gold leaf specks */}
          <motion.circle cx="220" cy="220" r="2.5" fill="rgba(197,164,126,0.2)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
          />
          <motion.circle cx="400" cy="320" r="2" fill="rgba(166,124,82,0.18)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.3 }}
          />
          <motion.circle cx="180" cy="480" r="2" fill="rgba(197,164,126,0.15)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.5 }}
          />
          <motion.circle cx="430" cy="520" r="1.5" fill="rgba(197,164,126,0.2)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.7 }}
          />
          <motion.circle cx="350" cy="180" r="1.5" fill="rgba(166,124,82,0.15)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.1 }}
          />

          {/* Subtle golden ratio spiral hint */}
          <motion.path
            d="M 300 380 Q 340 340 360 380 Q 380 420 340 440 Q 300 460 280 420 Q 260 380 300 340 Q 340 300 380 340 Q 420 380 380 440 Q 340 500 260 460"
            stroke="rgba(197,164,126,0.1)" strokeWidth="0.5" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 4, delay: 1.8, ease: 'easeOut' }}
          />
        </svg>

        {/* Branding at bottom */}
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold-dark/50 mb-4">
              Premium Home Services
            </p>
            <h2 className="font-sans text-4xl xl:text-5xl font-bold text-rich-black/80 uppercase tracking-tighter leading-[0.95]">
              Elevate Your{' '}
              <span className="text-gold-dark">Standard.</span>
            </h2>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.1em] text-warm-gray leading-relaxed max-w-sm">
              Vetted professionals. Fixed prices. Effortless booking across the GTA.
            </p>
          </motion.div>
        </div>

        {/* Taskly logo */}
        <div className="absolute top-8 left-12 z-10 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="font-sans text-lg font-bold tracking-tighter uppercase text-rich-black/70">Taskly</span>
        </div>
      </div>

      {/* ——— RIGHT: Form Panel ——— */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[52%] flex flex-col bg-white">
        {/* Subtle left border accent */}
        <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

        {/* Nav */}
        <nav className="flex justify-between items-center px-8 sm:px-12 py-6 shrink-0">
          <Link
            href="/"
            className="group flex items-center gap-2 text-rich-black/40 hover:text-gold-dark transition-colors duration-500"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]">Back</span>
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="font-sans text-lg font-bold tracking-tighter uppercase text-rich-black">Taskly</span>
          </div>
        </nav>

        {/* Centered Form */}
        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 md:px-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="w-full max-w-[400px]"
          >
            {/* Header */}
            <motion.div variants={fadeUp} className="mb-10">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={isLogin ? 'login' : 'signup'}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="font-sans text-3xl sm:text-4xl font-bold text-rich-black uppercase tracking-tighter leading-[1]"
                >
                  {isLogin ? (
                    <>Welcome <span className="text-gold-dark">Back</span></>
                  ) : (
                    <>Get <span className="text-gold-dark">Started</span></>
                  )}
                </motion.h1>
              </AnimatePresence>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-warm-gray">
                {isLogin ? 'Sign in to your account' : 'Create your premium account'}
              </p>
            </motion.div>

            {/* Toggle */}
            <motion.div
              variants={fadeUp}
              className="flex p-1 bg-[#F5F3EE] rounded-sm mb-8 relative"
            >
              <motion.div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                animate={{ x: isLogin ? 0 : '100%' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] relative z-10 transition-colors duration-400 ${isLogin ? 'text-rich-black' : 'text-warm-gray hover:text-rich-black/70'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-[10px] font-mono font-bold uppercase tracking-[0.18em] relative z-10 transition-colors duration-400 ${!isLogin ? 'text-rich-black' : 'text-warm-gray hover:text-rich-black/70'}`}
              >
                Create Account
              </button>
            </motion.div>

            {/* Form */}
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="relative pb-1">
                      <label
                        className={`absolute left-0 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 pointer-events-none ${
                          nameFocused || nameValue
                            ? '-top-4 text-[9px] text-gold-dark'
                            : 'top-3 text-warm-gray'
                        }`}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        className="w-full bg-transparent border-b border-rich-black/10 focus:border-gold py-3 text-rich-black font-sans text-[15px] focus:outline-none transition-colors duration-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={fadeUp} className="relative">
                <label
                  className={`absolute left-0 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 pointer-events-none ${
                    emailFocused || emailValue
                      ? '-top-4 text-[9px] text-gold-dark'
                      : 'top-3 text-warm-gray'
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="w-full bg-transparent border-b border-rich-black/10 focus:border-gold py-3 text-rich-black font-sans text-[15px] focus:outline-none transition-colors duration-500"
                />
              </motion.div>

              <motion.div variants={fadeUp} className="relative">
                <label
                  className={`absolute left-0 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 pointer-events-none ${
                    passwordFocused || passwordValue
                      ? '-top-4 text-[9px] text-gold-dark'
                      : 'top-3 text-warm-gray'
                  }`}
                >
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className="w-full bg-transparent border-b border-rich-black/10 focus:border-gold py-3 text-rich-black font-sans text-[15px] focus:outline-none transition-colors duration-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-warm-gray hover:text-gold-dark transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </motion.div>

              {isLogin && (
                <motion.div variants={fadeUp} className="flex justify-end">
                  <button
                    type="button"
                    className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-warm-gray hover:text-gold-dark transition-colors duration-300"
                  >
                    Forgot Password?
                  </button>
                </motion.div>
              )}

              <motion.div variants={fadeUp} className="pt-3">
                <button className="w-full relative overflow-hidden bg-rich-black text-cream py-4 group flex items-center justify-center gap-3 rounded-sm">
                  <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  <span className="relative z-10 font-mono text-[11px] font-bold uppercase tracking-[0.25em] group-hover:text-rich-black transition-colors duration-500">
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </span>
                  <span className="relative z-10 text-sm group-hover:translate-x-1.5 group-hover:text-rich-black transition-all duration-500">
                    &rarr;
                  </span>
                </button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div variants={fadeUp} className="mt-7 flex items-center gap-4">
              <div className="flex-1 h-px bg-rich-black/8" />
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-warm-gray">or</span>
              <div className="flex-1 h-px bg-rich-black/8" />
            </motion.div>

            {/* Social Auth */}
            <motion.div variants={fadeUp} className="mt-5 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2.5 py-3 border border-rich-black/8 hover:border-gold hover:bg-gold/[0.04] transition-all duration-500 rounded-sm group">
                <svg className="w-4 h-4 text-rich-black/40 group-hover:text-gold-dark transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rich-black/50 group-hover:text-rich-black transition-colors duration-500">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2.5 py-3 border border-rich-black/8 hover:border-gold hover:bg-gold/[0.04] transition-all duration-500 rounded-sm group">
                <svg className="w-4 h-4 text-rich-black/40 group-hover:text-gold-dark transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-rich-black/50 group-hover:text-rich-black transition-colors duration-500">Apple</span>
              </button>
            </motion.div>

            {/* Footer */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-center font-mono text-[8px] uppercase tracking-[0.18em] text-warm-gray leading-relaxed"
            >
              By continuing, you agree to our{' '}
              <a href="#" className="text-rich-black/50 hover:text-gold-dark transition-colors duration-300 underline underline-offset-2">Terms</a>
              {' & '}
              <a href="#" className="text-rich-black/50 hover:text-gold-dark transition-colors duration-300 underline underline-offset-2">Privacy</a>
            </motion.p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
