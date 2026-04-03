'use client';

import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Fingerprint, Search, FileCheck, Shield, BadgeCheck, Navigation, Camera, Award, Lock, Users } from 'lucide-react';

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      start = Math.floor(eased * value);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {value === 4.9 ? display.toFixed(1) : display.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Trust() {
  const trustStack = [
    { icon: Fingerprint, title: 'Verified Identity', desc: 'Government ID verified for every provider on the platform' },
    { icon: Search, title: 'CPIC Background Check', desc: 'Criminal record check via Certn, renewed annually' },
    { icon: FileCheck, title: 'Trade Licence Verification', desc: 'Licence numbers verified with Skilled Trades Ontario' },
    { icon: Shield, title: '$2M Liability Insurance', desc: 'Every provider carries minimum $2M coverage' },
    { icon: BadgeCheck, title: 'WSIB Compliance', desc: 'Workplace safety clearance certificates on file' },
    { icon: Navigation, title: 'Real-Time GPS Tracking', desc: 'Know exactly when your professional arrives' },
    { icon: Camera, title: 'Before/After Photos', desc: 'Every job documented with photo evidence' },
    { icon: Award, title: 'Satisfaction Guarantee', desc: 'Re-do within 48 hours or full refund' },
    { icon: Lock, title: '$10K Property Protection', desc: 'Damage coverage beyond provider insurance' },
    { icon: Users, title: 'Two-Way Ratings', desc: 'Both parties are held accountable' },
  ];

  const stats = [
    { value: 4.9, display: '4.9', suffix: '\u2605', label: 'AVG RATING' },
    { value: 50000, display: '50,000+', suffix: '+', label: 'BOOKINGS' },
    { value: 0, display: '$0', suffix: '', label: 'CLAIMS PAID' },
    { value: 100, display: '100%', suffix: '%', label: 'CPIC CHECKED' },
  ];

  const testimonials = [
    {
      quote: "I've tried every service in Toronto. Taskly is the first time I felt completely comfortable leaving someone alone in my condo.",
      author: 'Sarah Johnson',
      initials: 'SJ',
      location: 'King West, Toronto',
      service: 'Deep Cleaning',
      rating: 5,
      bookings: 24,
      color: 'bg-amber-800',
    },
    {
      quote: 'The level of transparency is unmatched. Real-time GPS tracking and the background check clearance completely changes the game.',
      author: 'Michael Torres',
      initials: 'MT',
      location: 'The Annex, Toronto',
      service: 'Emergency Plumbing',
      rating: 5,
      bookings: 8,
      color: 'bg-emerald-800',
    },
    {
      quote: "They don't just send anyone. You can tell these are vetted professionals. The $10K property protection sealed the deal for me.",
      author: 'Elena Rossi',
      initials: 'ER',
      location: 'Leslieville, Toronto',
      service: 'Move-in Cleaning',
      rating: 5,
      bookings: 12,
      color: 'bg-sky-800',
    },
    {
      quote: "We switched our entire building's maintenance to Taskly. The property management portal alone saves us 20 hours a month.",
      author: 'David Park',
      initials: 'DP',
      location: 'Liberty Village',
      service: 'Property Management',
      rating: 5,
      bookings: 156,
      color: 'bg-violet-800',
    },
  ];

  return (
    <section id="trust" className="relative bg-rich-black text-cream overflow-hidden">
      {/* Subtle gold mesh on dark */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_20%,rgba(197,164,126,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_80%_80%,rgba(197,164,126,0.05),transparent)]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24 py-28 md:py-40">
        {/* Section Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <span className="font-mono text-[10px] font-600 uppercase tracking-[0.3em] text-gold">
            004 &mdash; Trust
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="font-display text-[48px] md:text-[96px] font-800 leading-[0.88] tracking-[-0.04em] uppercase text-cream">
            Someone is<br />entering your<br />home<span className="text-gold">.</span>
          </h2>
          <p className="font-sans text-[14px] font-500 text-cream/40 mt-6 italic">
            We take that seriously.
          </p>
        </motion.div>

        {/* Trust Stack — Interactive layered shield */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-cream/[0.04] mb-24">
          {trustStack.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-rich-black px-7 py-6 md:px-9 md:py-7 flex items-center gap-5 md:gap-7 group cursor-default overflow-hidden hover:bg-cream/[0.03] transition-colors duration-600"
            >
              {/* Hover gold line left */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />

              {/* Layer number watermark */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 font-display text-[80px] md:text-[100px] font-800 leading-none text-cream/[0.02] group-hover:text-gold/[0.05] select-none pointer-events-none transition-colors duration-700">
                {(i + 1).toString().padStart(2, '0')}
              </div>

              {/* Icon */}
              <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-cream/[0.04] group-hover:bg-gold/20 flex-shrink-0 transition-all duration-500">
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-cream/30 group-hover:text-gold transition-colors duration-500" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[9px] font-700 text-gold/50 group-hover:text-gold transition-colors duration-500">
                    Layer {(i + 1).toString().padStart(2, '0')}
                  </span>
                </div>
                <h4 className="font-display text-[16px] md:text-[20px] font-800 uppercase tracking-[-0.02em] text-cream/80 group-hover:text-cream transition-colors duration-500 truncate">
                  {item.title}
                </h4>
                <p className="font-sans text-[11px] md:text-[12px] font-500 text-cream/25 group-hover:text-cream/50 transition-colors duration-500 mt-1">
                  {item.desc}
                </p>
              </div>

              {/* Status indicator */}
              <div className="relative z-10 flex-shrink-0 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400/50 group-hover:bg-green-400 transition-colors duration-500" />
                <span className="hidden md:block font-mono text-[8px] font-600 uppercase tracking-[0.15em] text-cream/20 group-hover:text-green-400/70 transition-colors duration-500">
                  Active
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="border-y border-cream/[0.08] flex flex-col md:flex-row mb-24">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className={`flex-1 py-12 px-4 md:px-6 flex flex-col items-center md:items-start justify-center ${
                i !== stats.length - 1 ? 'border-b md:border-b-0 md:border-r border-cream/[0.08]' : ''
              }`}
            >
              <span className="font-display text-[52px] md:text-[68px] font-800 leading-none mb-3 tracking-[-0.03em] text-cream">
                {stat.display}
              </span>
              <span className="font-mono text-[9px] font-600 uppercase tracking-[0.3em] text-gold">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Testimonials — Full Width Featured Cards */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="font-mono text-[10px] font-700 uppercase tracking-[0.3em] text-gold block mb-4">
                What They Say
              </span>
              <h3 className="font-display text-[36px] md:text-[56px] font-800 tracking-[-0.03em] uppercase text-cream">
                Real People<span className="text-gold">.</span><br className="md:hidden" /> Real Reviews<span className="text-gold">.</span>
              </h3>
            </div>
          </motion.div>
        </div>

        {/* Featured first review — large hero card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-gradient-to-br from-gold/[0.08] to-gold/[0.02] border border-gold/[0.15] p-10 md:p-14 mb-[1px] group overflow-hidden"
        >
          {/* Giant quote watermark */}
          <div className="absolute top-4 right-8 font-display text-[200px] md:text-[300px] font-800 leading-none text-gold/[0.04] select-none pointer-events-none">
            &ldquo;
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Quote */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-6">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className="text-gold text-[18px]">&#9733;</span>
                ))}
                <span className="font-mono text-[10px] font-700 text-cream/40 ml-2">5.0</span>
              </div>
              <p className="font-sans text-[20px] md:text-[26px] font-500 leading-[1.6] text-cream/90 max-w-[600px]">
                &ldquo;{testimonials[0].quote}&rdquo;
              </p>
            </div>

            {/* Author block */}
            <div className="flex flex-col justify-end md:items-end md:text-right min-w-[200px]">
              <div className={`w-14 h-14 ${testimonials[0].color} flex items-center justify-center mb-4`}>
                <span className="font-mono text-[14px] font-700 text-cream tracking-wider">
                  {testimonials[0].initials}
                </span>
              </div>
              <p className="font-sans text-[16px] font-700 text-cream">{testimonials[0].author}</p>
              <p className="font-mono text-[10px] font-600 uppercase tracking-[0.15em] text-cream/40 mt-1">{testimonials[0].location}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="font-mono text-[8px] font-700 uppercase tracking-[0.2em] text-gold/70 border border-gold/20 px-3 py-1.5">
                  {testimonials[0].service}
                </span>
                <span className="font-mono text-[8px] font-700 uppercase tracking-[0.2em] text-cream/30 border border-cream/10 px-3 py-1.5">
                  {testimonials[0].bookings} Bookings
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Remaining reviews — bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-cream/[0.04]">
          {testimonials.slice(1).map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-rich-black p-8 md:p-9 flex flex-col justify-between min-h-[320px] group overflow-hidden hover:bg-cream/[0.02] transition-colors duration-700"
            >
              {/* Subtle quote mark */}
              <div className="absolute top-2 right-4 font-display text-[100px] font-800 leading-none text-cream/[0.03] select-none pointer-events-none group-hover:text-gold/[0.05] transition-colors duration-700">
                &ldquo;
              </div>

              <div className="relative z-10">
                {/* Stars + Service */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: test.rating }).map((_, s) => (
                      <span key={s} className="text-gold text-[12px]">&#9733;</span>
                    ))}
                  </div>
                  <span className="font-mono text-[7px] font-700 uppercase tracking-[0.2em] text-gold/50 border border-gold/15 px-2 py-1 group-hover:border-gold/30 group-hover:text-gold/70 transition-all duration-500">
                    {test.service}
                  </span>
                </div>

                {/* Quote */}
                <p className="font-sans text-[14px] md:text-[15px] font-500 leading-[1.75] text-cream/60 group-hover:text-cream/85 transition-colors duration-500">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="relative z-10 flex items-center gap-3.5 mt-8 pt-6 border-t border-cream/[0.05] group-hover:border-gold/[0.1] transition-colors duration-500">
                <div className={`w-10 h-10 ${test.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="font-mono text-[10px] font-700 text-cream/90 tracking-wider">
                    {test.initials}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] font-700 text-cream/90 truncate">{test.author}</p>
                  <p className="font-mono text-[8px] font-600 uppercase tracking-[0.15em] text-cream/30 mt-0.5">{test.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-[18px] font-800 text-cream/80 leading-none group-hover:text-gold transition-colors duration-500">{test.bookings}</p>
                  <p className="font-mono text-[7px] font-600 uppercase tracking-[0.15em] text-cream/25 mt-1">Bookings</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
