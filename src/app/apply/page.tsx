'use client';

import { ArrowRight, Clock, DollarSign, Calendar, Shield, Star, CheckCircle2, TrendingUp, Users, Award, Play, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { CursorProvider } from '@/components/CursorProvider';
import { NoiseOverlay } from '@/components/NoiseOverlay';
import { useState } from 'react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const benefits = [
  { Icon: DollarSign, title: 'Earn $800–$1,200/week', desc: 'Average partners make $3,200+/month. Top performers earn $5K+.', highlight: '$1,200/wk' },
  { Icon: Clock, title: 'True Flexibility', desc: 'Work 3–7 days/week. Morning, afternoon, or evening. You decide.', highlight: '3–7 days' },
  { Icon: Calendar, title: 'Zero Marketing Stress', desc: 'We send customers directly to you. No cold calls. No door knocking.', highlight: '100% booked' },
  { Icon: Shield, title: '$2M Liability Coverage', desc: 'Fully insured on every job. You and your customers are protected.', highlight: '$2M' },
];

const testimonials = [
  { name: 'Marcus T.', role: 'DRIVEO Partner since 2024', earnings: '$4,800/mo', quote: 'I left my 9-to-5 and never looked back. DRIVEO bookings are consistent, payments are on time, and I control my schedule.', rating: 5 },
  { name: 'Sarah L.', role: 'Former retail manager', earnings: '$3,600/mo', quote: 'Started part-time while working retail. Within 3 months I was full-time with DRIVEO making double my old salary.', rating: 5 },
  { name: 'David K.', role: 'DRIVEO Partner since 2025', earnings: '$5,200/mo', quote: 'Best decision I ever made. The training was solid, support is always there, and the money speaks for itself.', rating: 5 },
];

const faqs = [
  { q: 'Do I need my own car detailing business?', a: 'No! You can start completely fresh. We provide training, customers, and support. Just bring your skills and tools.' },
  { q: 'How quickly can I start earning?', a: 'Most partners complete onboarding in 3–5 days and take their first booking within a week of approval.' },
  { q: 'What if I have no experience?', a: "We welcome beginners! Our training program teaches you the DRIVEO standard. If you're willing to learn, we'll teach you." },
  { q: 'How do I get paid?', a: 'Direct deposit within 48 hours of completing each job. No waiting, no hassle.' },
  { q: 'Can I work part-time?', a: 'Absolutely. Many partners start part-time (3 days/week) and scale up as they see results.' },
  { q: 'What areas do you serve?', a: 'Currently serving the Greater Toronto Area (GTA). Expanding to more cities in 2026.' },
];

const benefitVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export default function ApplyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <CursorProvider>
      <div className="bg-[#050505] text-white min-h-screen overflow-x-clip selection:bg-[#E23232] selection:text-white">
        <NoiseOverlay />
        {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-5 flex justify-between items-center bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
        <Link href="/">
          <Image src="/Driveo-logo.png" alt="DRIVEO" width={120} height={40} className="h-8 w-auto" priority />
        </Link>
        <Link href="/" className="font-mono text-xs text-white/60 uppercase tracking-widest hover:text-white transition-colors">
          Back to Home
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 md:px-12 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover scale-105"
          >
            <source src="/DRIVEO_Partner_Background.mp4" type="video/mp4" />
          </video>
          {/* Left-to-right fade: dark on left, clear on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
        </div>

        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 -left-40 w-[600px] h-[600px] bg-[#E23232]/[0.06] rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#E23232]/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="max-w-3xl">
            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 bg-[#E23232]/10 border border-[#E23232]/20 rounded-full px-5 py-2.5 mb-6"
            >
              <Users className="w-4 h-4 text-[#E23232]" />
              <span className="font-mono text-[11px] text-white uppercase tracking-wider">
                Join <span className="text-[#E23232] font-bold">500+</span> active partners
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease }}
              className="text-5xl md:text-7xl lg:text-8xl font-display uppercase leading-[0.9] mb-8"
            >
              Earn Up To<br /><span className="text-[#E23232]">$5,000/Month</span><br />Detailing Cars
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif italic text-xl md:text-2xl text-white/70 leading-relaxed mb-6 max-w-xl"
            >
              Earn instantly. No training required.
            </motion.p>

            {/* Key Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-6 mb-10"
            >
              {[
                { icon: DollarSign, label: '$800–$1,200/wk avg' },
                { icon: TrendingUp, label: '48hr payout' },
                { icon: Award, label: '$2M insured' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <stat.icon className="w-5 h-5 text-[#E23232]" />
                  <span className="font-mono text-sm text-white/80">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/auth/signup?role=washer&redirect=/apply/onboarding">
                <motion.span
                  className="inline-flex items-center gap-3 bg-[#E23232] text-white font-display text-xl uppercase tracking-wider px-10 py-5 rounded-xl hover:bg-white hover:text-black transition-all group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Apply Now — Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.span>
              </Link>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-mono text-[10px] text-white/40 uppercase tracking-widest self-center"
              >
                ⚡ 5-min application · Approved in 48hrs
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-16 px-6 md:px-12 border-y border-white/10">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '500+', label: 'Active Partners', icon: Users },
              { value: '$4.2K', label: 'Avg Monthly Earnings', icon: DollarSign },
              { value: '15K+', label: 'Jobs Completed', icon: CheckCircle2 },
              { value: '4.9★', label: 'Partner Rating', icon: Star },
            ].map((stat, i) => (
              <motion.div key={i} variants={benefitVariants} className="text-center">
                <div className="flex justify-center mb-3">
                  <stat.icon className="w-8 h-8 text-[#E23232]/60" />
                </div>
                <div className="font-display text-4xl md:text-5xl text-[#E23232] mb-2">{stat.value}</div>
                <div className="font-mono text-[10px] text-white/50 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="text-4xl md:text-6xl font-display uppercase leading-[0.9] mb-4 text-center"
          >
            Real Partners,<br />Real <span className="text-[#E23232]">Results</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center font-serif italic text-lg text-white/60 mb-16 max-w-2xl mx-auto"
          >
            See how DRIVEO partners transformed their income and lifestyle
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.15 }}
          >
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                variants={benefitVariants}
                whileHover={{ y: -6, borderColor: 'rgba(226, 50, 50, 0.3)', transition: { duration: 0.25 } }}
                className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-4 transition-colors"
              >
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#E23232] text-[#E23232]" />
                  ))}
                </div>
                <p className="font-[family-name:var(--font-poppins)] italic text-sm text-white/80 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-[family-name:var(--font-poppins)] text-xs text-white/70 uppercase tracking-wider block">{t.name}</span>
                    <span className="font-[family-name:var(--font-poppins)] text-[10px] text-white/40 uppercase tracking-wider">{t.role}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl text-[#E23232]">{t.earnings}</div>
                    <div className="font-[family-name:var(--font-poppins)] text-[9px] text-white/40 uppercase tracking-wider">Avg earnings</div>
                  </div>
                </div>
                <svg className="w-14 h-5 mt-1" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
                  <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335" />
                  <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C119.25 34.32 129.24 25 141.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05" />
                  <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4" />
                  <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
                  <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335" />
                  <path d="M35.29 41.19V32H68c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 33.91.36 13.93 16.32-1.53 36.3-1.53c11.01 0 18.82 4.3 24.68 9.99l-6.95 6.95c-4.21-3.95-9.92-7.03-17.73-7.03-14.48 0-25.81 11.68-25.81 25.52s11.33 25.52 25.81 25.52c9.41 0 14.78-3.78 18.22-7.23 2.78-2.78 4.6-6.75 5.32-12.18H35.29z" fill="#4285F4" />
                </svg>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-[1200px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="text-4xl md:text-6xl font-display uppercase leading-[0.9] mb-4 text-center"
          >
            Why Top Earners<br />Choose <span className="text-[#E23232]">DRIVEO</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center font-serif italic text-lg text-white/60 mb-16 max-w-2xl mx-auto"
          >
            We don't just connect you with customers — we set you up for long-term success
          </motion.p>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ staggerChildren: 0.12 }}
          >
            {benefits.map((b, idx) => (
              <motion.div
                key={idx}
                variants={benefitVariants}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/10 hover:border-[#E23232]/50 transition-all duration-500 p-8 shadow-lg shadow-black/30 hover:shadow-[#E23232]/10"
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#E23232] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500 absolute top-0 left-0" />
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E23232]/15 group-hover:bg-[#E23232]/25 flex items-center justify-center transition-all duration-500 ring-1 ring-[#E23232]/20 group-hover:ring-[#E23232]/40">
                    <b.Icon className="w-6 h-6 text-[#E23232] transition-all duration-500" />
                  </div>
                  <span className="font-display text-2xl text-[#E23232]">{b.highlight}</span>
                </div>
                <h3 className="font-display text-2xl uppercase mb-3 text-white group-hover:text-[#E23232] transition-colors duration-300">{b.title}</h3>
                <p className="font-mono text-[13px] text-white/70 tracking-wide leading-[1.8] group-hover:text-white/90 transition-colors duration-300">{b.desc}</p>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#E23232]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-6 md:px-12 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#E23232]/[0.05] rounded-full blur-[120px]" />
        </div>
        <div className="max-w-[900px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="inline-flex items-center gap-2 bg-[#E23232]/10 border border-[#E23232]/20 rounded-full px-5 py-2.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E23232] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E23232]"></span>
              </span>
              <span className="font-mono text-[11px] text-white uppercase tracking-wider">
                Limited spots · Apply before they're gone
              </span>
            </div>
            <div className="flex justify-center mb-6 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-[#E23232] fill-[#E23232]" />
              ))}
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display uppercase leading-[0.9] mb-6">
              Start Earning<br /><span className="text-[#E23232]">This Week</span>
            </h2>
            <p className="font-serif italic text-xl text-white/70 leading-relaxed mb-4 max-w-2xl mx-auto">
              500+ partners already earning $800–$1,200/week. Join them today.
            </p>
            <p className="font-mono text-sm text-white/50 mb-10">
              ✓ No fees to join &nbsp;·&nbsp; ✓ Get approved in 48hrs &nbsp;·&nbsp; ✓ Start earning immediately
            </p>
            <Link href="/auth/signup?role=washer&redirect=/apply/onboarding">
              <motion.span
                className="inline-flex items-center gap-3 bg-[#E23232] text-white font-display text-xl uppercase tracking-wider px-12 py-6 rounded-xl hover:bg-white hover:text-black transition-all group shadow-2xl shadow-[#E23232]/20"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Start My Application
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </Link>
            <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mt-6">
              Free to apply · No credit card · Approval in 48 hours
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 px-6 md:px-12 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#E23232]/[0.05] rounded-full blur-[150px]" />
        </div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-mono text-[11px] text-[#E23232] uppercase tracking-[0.3em] mb-4"
            >
              3 steps. That&apos;s it.
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="text-4xl md:text-6xl font-display uppercase leading-[0.9]"
            >
              How It <span className="text-[#E23232]">Works</span>
            </motion.h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.15 }}
          >
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-[2px] bg-gradient-to-r from-[#E23232]/30 via-[#E23232]/60 to-[#E23232]/30 z-0" />

            {[
              { num: '01', title: 'Apply Online', desc: 'Fill out a quick 5-step form. No experience needed. Takes about 5 minutes.', icon: '📋' },
              { num: '02', title: 'We Review', desc: 'Our team reviews your application within 48 hours and reaches out directly.', icon: '🔍' },
              { num: '03', title: 'Start Earning', desc: 'Get approved, complete onboarding, and start taking bookings immediately.', icon: '💰' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                variants={benefitVariants}
                className="group relative bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/10 hover:border-[#E23232]/40 rounded-2xl p-8 text-center transition-all duration-500 hover:shadow-lg hover:shadow-[#E23232]/10 z-10"
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                {/* Top accent bar */}
                <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-[#E23232] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500 absolute top-0 left-0 rounded-t-2xl" />

                {/* Step number circle */}
                <div className="w-14 h-14 rounded-full bg-[#E23232]/15 border border-[#E23232]/30 group-hover:bg-[#E23232]/25 group-hover:border-[#E23232]/60 flex items-center justify-center mx-auto mb-6 transition-all duration-500 relative">
                  <span className="font-display text-xl text-[#E23232]">{step.num}</span>
                  <div className="absolute inset-0 bg-[#E23232]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <h3 className="font-display text-2xl uppercase mb-3 text-white group-hover:text-[#E23232] transition-colors duration-300">{step.title}</h3>
                <p className="font-mono text-[13px] text-white/70 leading-[1.8] tracking-wide group-hover:text-white/90 transition-colors duration-300">{step.desc}</p>

                {/* Bottom corner glow */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#E23232]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-[900px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="text-4xl md:text-6xl font-display uppercase leading-[0.9] mb-4 text-center"
          >
            Questions?<br /><span className="text-[#E23232]">Answered.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center font-serif italic text-lg text-white/60 mb-16"
          >
            Everything you need to know before applying
          </motion.p>

          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.08 }}
          >
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                variants={benefitVariants}
                className="border border-white/[0.06] rounded-xl bg-[#0a0a0a] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-display text-lg uppercase pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#E23232] shrink-0 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === idx ? 'auto' : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 font-mono text-sm text-white/60 leading-relaxed border-t border-white/[0.06] pt-6">
                    {faq.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center">
        <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
          &copy; 2026 DRIVEO Auto Care Inc. All rights reserved.
        </p>
      </footer>
      </div>
    </CursorProvider>
  );
}
