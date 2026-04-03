'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  const footerLinks = [
    { title: 'SERVICES', links: ['Cleaning', 'Emergency', 'Maintenance', 'Seasonal'] },
    { title: 'COMPANY', links: ['About', 'Careers', 'Blog', 'Press', 'Contact'] },
    { title: 'LEGAL', links: ['Terms', 'Privacy', 'Provider Agreement', 'Insurance'] },
  ];

  const socials = [
    { name: 'Instagram', handle: '@tasklyca' },
    { name: 'Twitter', handle: '@tasklyca' },
    { name: 'LinkedIn', handle: '/taskly' },
    { name: 'TikTok', handle: '@taskly.ca' },
  ];

  return (
    <footer className="relative bg-rich-black text-cream w-full overflow-hidden">
      {/* Large CTA banner inside footer */}
      <div className="relative border-b border-cream/[0.06] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/[0.04] rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24 py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="font-mono text-[9px] font-700 uppercase tracking-[0.3em] text-gold block mb-5">
                Ready?
              </span>
              <h3 className="font-display text-[48px] md:text-[80px] font-800 leading-[0.88] tracking-[-0.04em] uppercase text-cream">
                Let&apos;s make your<br />home shine<span className="text-gold">.</span>
              </h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="#book"
                className="relative overflow-hidden inline-flex items-center justify-center bg-gold text-rich-black font-mono text-[11px] font-700 uppercase tracking-[0.15em] px-10 py-5 group"
              >
                <div className="absolute inset-0 bg-cream translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative z-10 mr-3">Book Now</span>
                <ArrowUpRight className="relative z-10 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </Link>
              <Link
                href="#provider"
                className="inline-flex items-center justify-center border border-cream/15 text-cream font-mono text-[11px] font-700 uppercase tracking-[0.15em] px-10 py-5 hover:border-gold hover:text-gold transition-all duration-400"
              >
                Become a Pro
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24">
        <div className="py-16 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

          {/* Brand column — spans 5 cols */}
          <div className="md:col-span-5 flex flex-col">
            <Link href="/" className="font-display text-[32px] font-800 tracking-tight text-cream inline-block mb-4">
              taskly<span className="text-gold">.</span>
            </Link>
            <p className="font-sans text-[13px] font-500 text-cream/60 max-w-[280px] leading-[1.7] mb-10">
              The premium managed marketplace for home services. Vetted professionals. Fixed prices. Toronto & the GTA.
            </p>

            {/* Social links — styled as interactive pills */}
            <div className="flex flex-wrap gap-2">
              {socials.map((social) => (
                <Link
                  key={social.name}
                  href={`#${social.name.toLowerCase()}`}
                  className="group flex items-center gap-2.5 bg-cream/[0.04] border border-cream/[0.06] px-4 py-2.5 hover:bg-gold hover:border-gold transition-all duration-400"
                >
                  <span className="font-mono text-[9px] font-700 uppercase tracking-[0.15em] text-cream/70 group-hover:text-rich-black transition-colors duration-400">
                    {social.name}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-cream/20 group-hover:text-rich-black transition-colors duration-400" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns — spans 7 cols */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
            {footerLinks.map((column) => (
              <div key={column.title} className="flex flex-col gap-4">
                <h4 className="font-mono text-[9px] font-700 uppercase tracking-[0.25em] text-gold mb-2">
                  {column.title}
                </h4>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link
                        href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                        className="group inline-flex items-center gap-2 font-sans text-[13px] font-500 text-cream/70 hover:text-cream transition-colors duration-300"
                      >
                        {link}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter / Contact strip */}
        <div className="border-t border-cream/[0.06] py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="font-mono text-[9px] font-700 uppercase tracking-[0.25em] text-gold block mb-2">
              Stay Updated
            </span>
            <p className="font-sans text-[12px] font-500 text-cream/60">
              Get notified when we launch new services and neighborhoods.
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-cream/[0.04] border border-cream/[0.08] border-r-0 px-5 py-3.5 font-mono text-[12px] text-cream placeholder:text-cream/20 outline-none focus:border-gold/30 transition-colors w-full md:w-[280px]"
            />
            <button className="bg-cream/[0.08] border border-cream/[0.08] px-6 py-3.5 font-mono text-[10px] font-700 uppercase tracking-[0.15em] text-cream/70 hover:bg-gold hover:text-rich-black hover:border-gold transition-all duration-400 flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream/[0.04] py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[9px] font-500 uppercase tracking-[0.12em] text-cream/50">
              &copy; 2026 Taskly.ca
            </span>
            <span className="font-mono text-[9px] font-500 text-cream/40">&middot;</span>
            <span className="font-mono text-[9px] font-500 uppercase tracking-[0.12em] text-cream/50">
              Toronto, Ontario
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-[9px] font-600 uppercase tracking-[0.12em] text-cream/50">
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
