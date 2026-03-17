'use client';

import { motion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const columnVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

export function Footer() {
  return (
    <footer className="pt-32 pb-10 px-6 md:px-12 border-t border-white/10 bg-[#0a0a0a]">
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 font-mono text-xs uppercase tracking-widest text-white/70"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div variants={columnVariants}>
            <h3 className="text-white mb-6 font-bold">Navigation</h3>
            <ul className="space-y-4">
              <li><a href="#services" className="hover:text-[#E23232] transition-colors">Services</a></li>
              <li><a href="#plans" className="hover:text-[#E23232] transition-colors">Monthly Plans</a></li>
              <li><a href="#" className="hover:text-[#E23232] transition-colors">Become a Wash Pro</a></li>
            </ul>
          </motion.div>
          <motion.div variants={columnVariants}>
            <h3 className="text-white mb-6 font-bold">Service Areas</h3>
            <ul className="space-y-4">
              <li>Etobicoke</li>
              <li>Mississauga</li>
              <li>Port Credit</li>
              <li>Greater Toronto Area</li>
            </ul>
          </motion.div>
          <motion.div variants={columnVariants}>
            <h3 className="text-white mb-6 font-bold">Contact</h3>
            <ul className="space-y-4">
              <li>hello@driveo.ca</li>
              <li>@driveogta</li>
              <li>(416) 555-DRIVEO</li>
            </ul>
          </motion.div>
          <motion.div variants={columnVariants}>
            <h3 className="text-white mb-6 font-bold">Hours</h3>
            <ul className="space-y-4">
              <li>Mon - Sat: 8AM - 7PM</li>
              <li>Sunday: 9AM - 5PM</li>
              <li className="text-[#E23232]">Now Booking Spring Washes</li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 text-center font-mono text-xs text-white/50 uppercase tracking-widest"
        >
          &copy; 2026 DRIVEO Auto Care Inc. $2M insured. Satisfaction guaranteed. Serving the Greater Toronto Area.
        </motion.div>
      </div>
    </footer>
  );
}
