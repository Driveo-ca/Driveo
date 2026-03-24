'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Database, MapPin, CreditCard, Camera, Bell, Lock, UserX, Mail } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const sections: { icon: React.ComponentType<{ className?: string }>; title: string; content: { subtitle?: string; text: string }[] }[] = [
  {
    icon: Database,
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you create a Driveo account, we collect your name, email address, phone number, and authentication credentials. If you sign in via Google, we receive your basic profile information from Google.',
      },
      {
        subtitle: 'Vehicle Information',
        text: 'We collect details about your vehicles including make, model, year, color, license plate number, and vehicle type to provide accurate service pricing and identification.',
      },
      {
        subtitle: 'Booking & Service Data',
        text: 'We store your booking history, service preferences, subscription plan details, wash frequency, dirt level assessments, and before/after photos taken during each service.',
      },
      {
        subtitle: 'Payment Information',
        text: 'Payment processing is handled securely by Stripe. We do not store your full credit card number. Stripe retains your payment method tokens, billing address, and transaction history on our behalf.',
      },
    ],
  },
  {
    icon: MapPin,
    title: '2. Location Data',
    content: [
      {
        subtitle: 'Service Location',
        text: 'We collect the address where you request car wash services. This is necessary to dispatch wash professionals to your location and determine service zone availability across the Greater Toronto Area.',
      },
      {
        subtitle: 'Washer Location',
        text: 'For wash professionals, we collect real-time GPS location data during active service hours to enable nearest-available-washer assignment and provide customers with arrival estimates.',
      },
    ],
  },
  {
    icon: Camera,
    title: '3. Photos & Media',
    content: [
      {
        subtitle: 'Before & After Photos',
        text: 'Our wash professionals capture before and after photos of every job as proof of service quality. These photos are stored securely and associated with your booking record. Photos are retained for 90 days after service completion.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: '4. How We Use Your Information',
    content: [
      {
        text: 'We use your information to: process and fulfill your car wash bookings; calculate pricing based on vehicle type and dirt level; manage your subscription and membership benefits (up to 8 washes per month); process payments and washer payouts via Stripe Connect; send booking confirmations, washer arrival notifications, and service updates; improve our service quality and customer experience; comply with legal obligations and resolve disputes.',
      },
    ],
  },
  {
    icon: Shield,
    title: '5. Data Sharing & Third Parties',
    content: [
      {
        subtitle: 'Service Providers',
        text: 'We share necessary information with: Stripe (payment processing and washer payouts), Google Maps (location services and routing), Twilio (SMS notifications), Resend (email communications), Supabase (database hosting and authentication), Sentry (error monitoring — no personal data), and Vercel (application hosting).',
      },
      {
        subtitle: 'Wash Professionals',
        text: 'When you book a service, your assigned washer receives your name, vehicle details, service location, and booking instructions. They do not receive your payment information.',
      },
      {
        subtitle: 'We Never Sell Your Data',
        text: 'Driveo does not sell, rent, or trade your personal information to third parties for marketing purposes. Ever.',
      },
    ],
  },
  {
    icon: Lock,
    title: '6. Data Security',
    content: [
      {
        text: 'Your data is protected with industry-standard encryption in transit (TLS 1.3) and at rest. We use Supabase Row Level Security (RLS) to ensure users can only access their own data. Payment information is handled entirely by Stripe, a PCI DSS Level 1 certified payment processor. Access to administrative functions is restricted and audited.',
      },
    ],
  },
  {
    icon: UserX,
    title: '7. Your Rights & Choices',
    content: [
      {
        text: 'You have the right to: access and download your personal data; correct inaccurate information via your profile settings; delete your account and all associated data; opt out of non-essential communications; request restriction of data processing. To exercise these rights, use the Privacy & Security section in your account settings or contact us at privacy@driveo.ca.',
      },
    ],
  },
  {
    icon: Bell,
    title: '8. Cookies & Analytics',
    content: [
      {
        text: 'We use Google Analytics to understand how visitors interact with our website. This helps us improve the user experience. We use essential cookies for authentication and session management. We do not use third-party advertising cookies or trackers.',
      },
    ],
  },
  {
    icon: Mail,
    title: '9. Contact & Updates',
    content: [
      {
        text: 'We may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notification. Continued use of Driveo after changes constitutes acceptance of the updated policy.',
      },
      {
        subtitle: 'Contact Us',
        text: 'For privacy-related inquiries: privacy@driveo.ca. TASKLY Technology, Greater Toronto Area, Ontario, Canada.',
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="dark bg-[#050505] text-white min-h-screen selection:bg-[#E23232] selection:text-white">
      {/* Subtle grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="fixed top-0 left-0 w-full z-40 px-6 py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            </div>
            <Image src="/Driveo-logo.png" alt="DRIVEO" width={90} height={30} className="opacity-80 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/terms"
            className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 hover:text-[#E23232] transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#E23232]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E23232]">Legal</span>
            </div>
            <h1 className="font-[var(--font-anton)] text-5xl md:text-7xl tracking-tight leading-[0.95] uppercase">
              Privacy<br />
              <span className="text-white/20">Policy</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mt-8 flex flex-wrap items-center gap-6 text-[11px] font-mono uppercase tracking-[0.1em] text-white/30"
          >
            <span>Effective: March 25, 2026</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>TASKLY Technology</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Ontario, Canada</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-8 text-[15px] leading-relaxed text-white/50 max-w-[600px]"
          >
            At Driveo, we take your privacy seriously. This policy explains what data we collect,
            why we collect it, and how we protect it when you use our mobile car detailing platform.
          </motion.p>
        </div>
      </div>

      {/* Sections */}
      <div className="px-6 pb-32">
        <div className="max-w-[900px] mx-auto space-y-2">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.03, ease }}
              className="group"
            >
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.035] hover:border-white/[0.1] transition-all duration-500 p-6 md:p-8">
                {/* Section Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center shrink-0 group-hover:bg-[#E23232]/15 transition-colors">
                    <section.icon className="w-4.5 h-4.5 text-[#E23232]/70" />
                  </div>
                  <h2 className="font-[var(--font-anton)] text-xl md:text-2xl uppercase tracking-tight text-white/90 pt-1.5">
                    {section.title}
                  </h2>
                </div>

                {/* Section Content */}
                <div className="space-y-4 pl-14">
                  {section.content.map((block, j) => (
                    <div key={j}>
                      {block.subtitle && (
                        <h3 className="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-white/50 mb-2">
                          {block.subtitle}
                        </h3>
                      )}
                      <p className="text-[14px] leading-[1.8] text-white/40">
                        {block.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25">
            &copy; 2026 TASKLY Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25 hover:text-[#E23232] transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25 hover:text-[#E23232] transition-colors">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
